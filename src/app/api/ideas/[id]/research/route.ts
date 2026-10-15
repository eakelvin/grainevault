import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAiProvider, investigateWithAstra, researchFailMessage } from "@/lib/ai";
import { mapIdea } from "@/lib/idea-map";
import { claimModelCall, quotaResponse, releaseModelCall } from "@/lib/model-quota";
import type { ResearchPacket } from "@/lib/ai/types";
import type { Plan } from "@/lib/billing";
import type { IdeaRow, IdeaStatus, InvestigationStatus, QuestionFinding } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

async function planForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Plan> {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  return data?.plan === "pro" ? "pro" : "free";
}

function packetUpdate(
  research: ResearchPacket,
  extra: {
    status?: IdeaStatus;
    researchDepth: Plan;
    investigationStatus: InvestigationStatus;
    questionFindings?: QuestionFinding[];
  }
) {
  return {
    short_description: research.shortDescription,
    tags: research.tags,
    status: extra.status ?? "ready",
    readiness_score: research.readinessScore,
    market_size: research.marketSize,
    target_audience: research.targetAudience,
    top_competitor: research.topCompetitor,
    key_trend: research.keyTrend,
    competitors: research.competitors,
    growth_metrics: research.growthMetrics,
    action_plan: research.actionPlan,
    risks: research.risks,
    customer_segments: research.customerSegments,
    why_now: research.whyNow,
    research_questions: research.researchQuestions,
    research_areas: research.researchAreas,
    opportunities: research.opportunities,
    assumptions: research.assumptions,
    sources: research.sources,
    question_findings: extra.questionFindings ?? [],
    investigation_status: extra.investigationStatus,
    research_depth: extra.researchDepth,
  };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Sign in to capture an idea." }, { status: 401 });
  }

  const userId = user.id;
  const { data, error } = await supabase.from("ideas").select("*").eq("id", id).single();
  if (error || !data) {
    return Response.json({ error: "Idea not found." }, { status: 404 });
  }

  const idea = mapIdea(data as IdeaRow);
  const depth = await planForUser(supabase, userId);
  const provider = getAiProvider();
  const input = {
    title: idea.title,
    description: idea.description,
    extractedText: idea.extractedText,
    depth,
  };
  let claimed = false;

  async function save(
    research: ResearchPacket,
    extra: {
      status?: IdeaStatus;
      researchDepth: Plan;
      investigationStatus: InvestigationStatus;
      questionFindings?: QuestionFinding[];
    }
  ) {
    const admin = createAdminClient();
    const { data: updated, error: updateError } = await admin
      .from("ideas")
      .update(packetUpdate(research, extra))
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("Couldn't save research packet.", updateError);
      return null;
    }

    return mapIdea(updated as IdeaRow);
  }

  try {
    await claimModelCall({
      userId,
      ideaId: id,
      action: "research",
      plan: depth,
    });
    claimed = true;

    if (depth === "free") {
      const research = await provider.runResearch(input);
      const updated = await save(research, {
        researchDepth: "free",
        investigationStatus: "none",
      });
      if (!updated) {
        return Response.json({ error: researchFailMessage() }, { status: 422 });
      }
      return Response.json({ idea: updated });
    }

    const plan = await provider.planProResearch(input);
    const planned = await save(plan, {
      researchDepth: "pro",
      investigationStatus: "investigating",
    });
    if (!planned) {
      return Response.json({ error: researchFailMessage() }, { status: 422 });
    }

    let findings: QuestionFinding[];
    try {
      findings = await investigateWithAstra(input, plan);
    } catch (investigationError) {
      console.error("Astra investigation failed.", investigationError);
      const failed = await save(plan, {
        researchDepth: "pro",
        investigationStatus: "failed",
      });
      if (!failed) {
        return Response.json({ error: researchFailMessage() }, { status: 422 });
      }
      return Response.json({ idea: failed });
    }

    const investigated = await save(plan, {
      researchDepth: "pro",
      investigationStatus: "investigating",
      questionFindings: findings,
    });
    if (!investigated) {
      return Response.json({ error: researchFailMessage() }, { status: 422 });
    }

    try {
      const brief = await provider.synthesizeProResearch({
        ...input,
        plan,
        findings,
      });
      const updated = await save(brief, {
        researchDepth: "pro",
        investigationStatus: "complete",
        questionFindings: findings,
      });
      if (!updated) {
        return Response.json({ error: researchFailMessage() }, { status: 422 });
      }
      return Response.json({ idea: updated });
    } catch (synthesizeError) {
      console.error("Couldn't synthesize Pro brief.", synthesizeError);
      const failed = await save(plan, {
        researchDepth: "pro",
        investigationStatus: "failed",
        questionFindings: findings,
      });
      if (!failed) {
        return Response.json({ error: researchFailMessage() }, { status: 422 });
      }
      return Response.json({ idea: failed });
    }
  } catch (researchError) {
    const quota = quotaResponse(researchError);
    if (quota) return quota;
    console.error("Couldn't research this idea.", researchError);
    return Response.json({ error: researchFailMessage() }, { status: 422 });
  } finally {
    if (claimed) await releaseModelCall(id, "research");
  }
}
