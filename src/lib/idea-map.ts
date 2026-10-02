import type { Competitor, GrowthMetric, Idea, IdeaRow } from "@/lib/types";

export const IDEA_MEDIA_BUCKET = "idea-media";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function asCompetitors(value: unknown): Competitor[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Competitor =>
      item !== null &&
      typeof item === "object" &&
      typeof (item as Competitor).name === "string" &&
      typeof (item as Competitor).strength === "string" &&
      typeof (item as Competitor).weakness === "string"
  );
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
    mediaPath: row.media_path,
    extractedText: row.extracted_text ?? "",
    createdAt: row.created_at,
    archivedAt: row.archived_at ?? null,
  };
}
