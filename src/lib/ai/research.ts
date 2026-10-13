import type { Plan } from "@/lib/billing";
import type { Competitor, GrowthMetric } from "@/lib/types";
import type { ResearchPacket } from "@/lib/ai/types";

const SNAPSHOT_PROPERTIES = {
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
  actionPlan: { type: "array", items: { type: "string" } },
} as const;

export const FREE_RESEARCH_JSON_SCHEMA = {
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
    "actionPlan",
  ],
  properties: SNAPSHOT_PROPERTIES,
} as const;

export const PRO_RESEARCH_JSON_SCHEMA = {
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
    "actionPlan",
    "competitors",
    "growthMetrics",
    "risks",
    "customerSegments",
    "whyNow",
  ],
  properties: {
    ...SNAPSHOT_PROPERTIES,
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
    risks: { type: "array", items: { type: "string" } },
    customerSegments: { type: "array", items: { type: "string" } },
    whyNow: { type: "string" },
  },
} as const;

export function researchSchemaFor(depth: Plan) {
  return depth === "pro" ? PRO_RESEARCH_JSON_SCHEMA : FREE_RESEARCH_JSON_SCHEMA;
}

function asNonEmpty(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
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

function asCompetitors(value: unknown, limit: number): Competitor[] {
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
    .slice(0, limit);
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

export function parseResearchPacket(raw: string, depth: Plan): ResearchPacket {
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
  const actionPlan = asStringList(row.actionPlan, depth === "pro" ? 7 : 3);
  const top = row.topCompetitor;
  const topCompetitor =
    top && typeof top === "object"
      ? {
          name: asNonEmpty((top as Record<string, unknown>).name),
          strength: asNonEmpty((top as Record<string, unknown>).strength),
        }
      : { name: "", strength: "" };

  const competitors = depth === "pro" ? asCompetitors(row.competitors, 5) : [];
  const growthMetrics = depth === "pro" ? asGrowthMetrics(row.growthMetrics) : [];
  const risks = depth === "pro" ? asStringList(row.risks, 5) : [];
  const customerSegments =
    depth === "pro" ? asStringList(row.customerSegments, 4) : [];
  const whyNow = depth === "pro" ? asNonEmpty(row.whyNow) : "";

  if (
    !shortDescription ||
    !Number.isFinite(score) ||
    !marketSize ||
    !targetAudience ||
    !topCompetitor.name ||
    !topCompetitor.strength ||
    !keyTrend ||
    tags.length === 0 ||
    actionPlan.length === 0
  ) {
    throw new Error("Research packet was incomplete.");
  }

  if (
    depth === "pro" &&
    (competitors.length === 0 ||
      growthMetrics.length === 0 ||
      risks.length === 0 ||
      customerSegments.length === 0 ||
      !whyNow)
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
    risks,
    customerSegments,
    whyNow,
  };
}
