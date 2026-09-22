import type { Competitor, GrowthMetric } from "@/lib/types";
import type { ResearchPacket } from "@/lib/ai/types";

export const RESEARCH_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "shortDescription",
    "tags",
    "readinessScore",
    "marketSize",
    "targetAudience",
    "topCompetitor",
    "keyTrend",
    "competitors",
    "growthMetrics",
    "actionPlan",
  ],
  properties: {
    shortDescription: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    readinessScore: { type: "integer" },
    marketSize: { type: "string" },
    targetAudience: { type: "string" },
    topCompetitor: {
      type: "object",
      additionalProperties: false,
      required: ["name", "strength"],
      properties: {
        name: { type: "string" },
        strength: { type: "string" },
      },
    },
    keyTrend: { type: "string" },
    competitors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "strength", "weakness"],
        properties: {
          name: { type: "string" },
          strength: { type: "string" },
          weakness: { type: "string" },
        },
      },
    },
    growthMetrics: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["year", "value"],
        properties: {
          year: { type: "string" },
          value: { type: "number" },
        },
      },
    },
    actionPlan: { type: "array", items: { type: "string" } },
  },
} as const;

function asNonEmpty(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const tags = value
    .filter((item): item is string => typeof item === "string")
    .map((tag) => {
      const cleaned = tag.trim().replace(/\s+/g, "");
      if (!cleaned) return "";
      const withHash = cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
      return withHash.slice(0, 32);
    })
    .filter(Boolean);
  return [...new Set(tags)].slice(0, 3);
}

function asCompetitors(value: unknown): Competitor[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = asNonEmpty(row.name);
      const strength = asNonEmpty(row.strength);
      const weakness = asNonEmpty(row.weakness);
      if (!name || !strength || !weakness) return null;
      return { name, strength, weakness };
    })
    .filter((item): item is Competitor => item !== null)
    .slice(0, 3);
}

function asGrowthMetrics(value: unknown): GrowthMetric[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const year = asNonEmpty(row.year);
      const raw = row.value;
      const numeric = typeof raw === "number" ? raw : Number(raw);
      if (!year || !Number.isFinite(numeric)) return null;
      return { year, value: Math.round(numeric * 10) / 10 };
    })
    .filter((item): item is GrowthMetric => item !== null)
    .slice(0, 4);
}

export function parseResearchPacket(raw: string): ResearchPacket {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Research packet was not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Research packet was empty.");
  }

  const row = parsed as Record<string, unknown>;
  const shortDescription = asNonEmpty(row.shortDescription).slice(0, 80);
  const tags = asTags(row.tags);
  const scoreRaw = row.readinessScore;
  const score = typeof scoreRaw === "number" ? scoreRaw : Number(scoreRaw);
  const marketSize = asNonEmpty(row.marketSize);
  const targetAudience = asNonEmpty(row.targetAudience);
  const keyTrend = asNonEmpty(row.keyTrend);
  const actionPlan = Array.isArray(row.actionPlan)
    ? row.actionPlan
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];
  const competitors = asCompetitors(row.competitors);
  const growthMetrics = asGrowthMetrics(row.growthMetrics);
  const top = row.topCompetitor;
  const topCompetitor =
    top && typeof top === "object"
      ? {
          name: asNonEmpty((top as Record<string, unknown>).name),
          strength: asNonEmpty((top as Record<string, unknown>).strength),
        }
      : { name: "", strength: "" };

  if (
    !shortDescription ||
    !Number.isFinite(score) ||
    !marketSize ||
    !targetAudience ||
    !topCompetitor.name ||
    !topCompetitor.strength ||
    !keyTrend ||
    tags.length === 0 ||
    competitors.length === 0 ||
    growthMetrics.length === 0 ||
    actionPlan.length === 0
  ) {
    throw new Error("Research packet was incomplete.");
  }

  return {
    shortDescription,
    tags,
    readinessScore: Math.min(100, Math.max(0, Math.round(score))),
    marketSize,
    targetAudience,
    topCompetitor,
    keyTrend,
    competitors,
    growthMetrics,
    actionPlan,
  };
}
