import type {
  Competitor,
  GrowthMetric,
  Idea,
  IdeaRow,
  InvestigationStatus,
  QuestionFinding,
  ResearchSource,
} from "@/lib/types";

export const IDEA_MEDIA_BUCKET = "idea-media";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function asCompetitors(value: unknown): Competitor[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Competitor =>
        item !== null &&
        typeof item === "object" &&
        typeof (item as Competitor).name === "string" &&
        typeof (item as Competitor).strength === "string" &&
        typeof (item as Competitor).weakness === "string"
    )
    .map((item) => {
      const evidence =
        typeof item.evidence === "string" ? item.evidence.trim() : "";
      return evidence ? { ...item, evidence } : { ...item, evidence: undefined };
    });
}

function asSources(value: unknown): ResearchSource[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ResearchSource =>
      item !== null &&
      typeof item === "object" &&
      typeof (item as ResearchSource).title === "string" &&
      typeof (item as ResearchSource).url === "string" &&
      /^https?:\/\//i.test((item as ResearchSource).url)
  );
}

function asQuestionFindings(value: unknown): QuestionFinding[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (typeof row.question !== "string" || typeof row.answer !== "string") {
        return null;
      }
      return {
        question: row.question,
        answer: row.answer,
        sources: asSources(row.sources),
      };
    })
    .filter((item): item is QuestionFinding => item !== null);
}

function asInvestigationStatus(value: unknown): InvestigationStatus {
  if (value === "investigating" || value === "complete" || value === "failed") {
    return value;
  }
  return "none";
}

function asGrowthMetrics(value: unknown): GrowthMetric[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is GrowthMetric =>
      item !== null &&
      typeof item === "object" &&
      typeof (item as GrowthMetric).year === "string" &&
      typeof (item as GrowthMetric).value === "number"
  );
}

export function mapIdea(row: IdeaRow): Idea {
  const top = row.top_competitor;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    shortDescription: row.short_description,
    tags: asStringArray(row.tags),
    status: row.status,
    inputType: row.input_type,
    readinessScore: row.readiness_score,
    marketSize: row.market_size,
    targetAudience: row.target_audience,
    topCompetitor:
      top && typeof top.name === "string" && typeof top.strength === "string"
        ? top
        : { name: "—", strength: "—" },
    keyTrend: row.key_trend,
    competitors: asCompetitors(row.competitors),
    growthMetrics: asGrowthMetrics(row.growth_metrics),
    actionPlan: asStringArray(row.action_plan),
    risks: asStringArray(row.risks),
    customerSegments: asStringArray(row.customer_segments),
    whyNow: row.why_now ?? "",
    researchQuestions: asStringArray(row.research_questions),
    researchAreas: asStringArray(row.research_areas),
    opportunities: asStringArray(row.opportunities),
    assumptions: asStringArray(row.assumptions),
    sources: asSources(row.sources),
    questionFindings: asQuestionFindings(row.question_findings),
    investigationStatus: asInvestigationStatus(row.investigation_status),
    researchDepth: row.research_depth === "pro" ? "pro" : "free",
    mediaPath: row.media_path,
    extractedText: row.extracted_text ?? "",
    createdAt: row.created_at,
    archivedAt: row.archived_at ?? null,
  };
}
