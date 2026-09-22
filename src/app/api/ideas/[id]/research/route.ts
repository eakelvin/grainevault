import { createClient } from "@/lib/supabase/server";
import { getAiProvider, researchFailMessage } from "@/lib/ai";
import { mapIdea } from "@/lib/idea-map";
import type { IdeaRow } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const { data, error } = await supabase.from("ideas").select("*").eq("id", id).single();
  if (error || !data) {
    return Response.json({ error: "Idea not found." }, { status: 404 });
  }

  const idea = mapIdea(data as IdeaRow);

  try {
    const research = await getAiProvider().runResearch({
      title: idea.title,
      description: idea.description,
      extractedText: idea.extractedText,
    });

    const { data: updated, error: updateError } = await supabase
      .from("ideas")
      .update({
        short_description: research.shortDescription,
        tags: research.tags,
        status: "ready",
        readiness_score: research.readinessScore,
        market_size: research.marketSize,
        target_audience: research.targetAudience,
        top_competitor: research.topCompetitor,
        key_trend: research.keyTrend,
        competitors: research.competitors,
        growth_metrics: research.growthMetrics,
        action_plan: research.actionPlan,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("Couldn't save research packet.", updateError);
      return Response.json({ error: researchFailMessage() }, { status: 422 });
    }

    return Response.json({ idea: mapIdea(updated as IdeaRow) });
  } catch (researchError) {
    console.error("Couldn't research this idea.", researchError);
    return Response.json({ error: researchFailMessage() }, { status: 422 });
  }
}
