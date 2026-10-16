import type { Plan } from "@/lib/billing";
import {
  EXTRACTED_TEXT_PROMPT_MAX,
  IDEA_DESCRIPTION_MAX,
  IDEA_TITLE_MAX,
} from "@/lib/idea-limits";
import { parseIdeaFit } from "@/lib/idea-fit";
import type {
  Competitor,
  GrowthMetric,
  QuestionFinding,
  ResearchSource,
} from "@/lib/types";
import type { ResearchInput, ResearchPacket } from "@/lib/ai/types";

const DEMAND_ITEM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["needed", "note"],
  properties: {
    needed: { type: "boolean" },
    note: { type: "string" },
  },
} as const;

const REALITY_AND_DEMANDS = {
  reality: {
    type: "object",
    additionalProperties: false,
    required: ["firstRevenueEstimate", "capitalIn", "difficulty", "difficultyNote"],
    properties: {
      firstRevenueEstimate: { type: "string" },
      capitalIn: { type: "string" },
      difficulty: { type: "string", enum: ["low", "medium", "high"] },
      difficultyNote: { type: "string" },
    },
  },
  demands: {
    type: "object",
    additionalProperties: false,
    required: ["distribution", "domain", "depth", "sales", "content", "capital"],
    properties: {
      distribution: DEMAND_ITEM_SCHEMA,
      domain: DEMAND_ITEM_SCHEMA,
      depth: DEMAND_ITEM_SCHEMA,
      sales: DEMAND_ITEM_SCHEMA,
      content: DEMAND_ITEM_SCHEMA,
      capital: DEMAND_ITEM_SCHEMA,
    },
  },
} as const;

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
  ...REALITY_AND_DEMANDS,
} as const;

export const PRO_PLAN_JSON_SCHEMA = {
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
    "reality",
    "demands",
    "researchQuestions",
    "researchAreas",
  ],
  properties: {
    ...SNAPSHOT_PROPERTIES,
    researchQuestions: { type: "array", items: { type: "string" } },
    researchAreas: { type: "array", items: { type: "string" } },
  },
} as const;

export const ASTRA_FINDINGS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["findings"],
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answer", "sources"],
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
          sources: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "url"],
              properties: {
                title: { type: "string" },
                url: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
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
    "reality",
    "demands",
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
    "reality",
    "demands",
    "competitors",
    "growthMetrics",
    "risks",
    "customerSegments",
    "whyNow",
    "researchQuestions",
    "researchAreas",
    "opportunities",
    "assumptions",
    "sources",
  ],
  properties: {
    ...SNAPSHOT_PROPERTIES,
    competitors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "strength", "weakness", "evidence"],
        properties: {
          name: { type: "string" },
          strength: { type: "string" },
          weakness: { type: "string" },
          evidence: { type: "string" },
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
    researchQuestions: { type: "array", items: { type: "string" } },
    researchAreas: { type: "array", items: { type: "string" } },
    opportunities: { type: "array", items: { type: "string" } },
    assumptions: { type: "array", items: { type: "string" } },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "url"],
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
      },
    },
  },
} as const;

export function emptyProExtras(): Pick<
  ResearchPacket,
  | "competitors"
  | "growthMetrics"
  | "risks"
  | "customerSegments"
  | "whyNow"
  | "opportunities"
  | "assumptions"
  | "sources"
> {
  return {
    competitors: [],
    growthMetrics: [],
    risks: [],
    customerSegments: [],
    whyNow: "",
    opportunities: [],
    assumptions: [],
    sources: [],
  };
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
      const evidence = asNonEmpty(row.evidence);
      return evidence ? { name, strength, weakness, evidence } : { name, strength, weakness };
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

function asSources(value: unknown): ResearchSource[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = asNonEmpty(row.title);
      const url = asNonEmpty(row.url);
      if (!title || !/^https?:\/\//i.test(url)) return null;
      return { title, url };
    })
    .filter((item): item is ResearchSource => item !== null)
    .slice(0, 8);
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
  const researchQuestions =
    depth === "pro" ? asStringList(row.researchQuestions, 8) : [];
  const researchAreas = depth === "pro" ? asStringList(row.researchAreas, 6) : [];
  const opportunities = depth === "pro" ? asStringList(row.opportunities, 5) : [];
  const assumptions = depth === "pro" ? asStringList(row.assumptions, 5) : [];
  const sources = depth === "pro" ? asSources(row.sources) : [];
  const fit = parseIdeaFit({ reality: row.reality, demands: row.demands });

  if (
    !shortDescription ||
    !Number.isFinite(score) ||
    !marketSize ||
    !targetAudience ||
    !topCompetitor.name ||
    !topCompetitor.strength ||
    !keyTrend ||
    tags.length === 0 ||
    actionPlan.length === 0 ||
    !fit
  ) {
    throw new Error("Research packet was incomplete.");
  }

  if (
    depth === "pro" &&
    (competitors.length === 0 ||
      growthMetrics.length === 0 ||
      risks.length === 0 ||
      customerSegments.length === 0 ||
      !whyNow ||
      researchQuestions.length === 0 ||
      researchAreas.length === 0 ||
      opportunities.length === 0 ||
      assumptions.length === 0 ||
      sources.length === 0)
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
    researchQuestions,
    researchAreas,
    opportunities,
    assumptions,
    sources,
    reality: fit.reality,
    demands: fit.demands,
  };
}

export function parseResearchPlan(raw: string): ResearchPacket {
  const snapshot = parseResearchPacket(raw, "free");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Research plan was not valid JSON.");
  }
  const row = parsed as Record<string, unknown>;
  const researchQuestions = asStringList(row.researchQuestions, 8);
  const researchAreas = asStringList(row.researchAreas, 6);
  if (researchQuestions.length === 0 || researchAreas.length === 0) {
    throw new Error("Research plan was incomplete.");
  }
  return {
    ...snapshot,
    ...emptyProExtras(),
    researchQuestions,
    researchAreas,
  };
}

export function parseAstraFindings(raw: string): QuestionFinding[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Astra findings were not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Astra findings were empty.");
  }
  const findings = (parsed as Record<string, unknown>).findings;
  if (!Array.isArray(findings) || findings.length === 0) {
    throw new Error("Astra findings were incomplete.");
  }
  const rows = findings
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const question = asNonEmpty(row.question);
      const answer = asNonEmpty(row.answer);
      if (!question || !answer) return null;
      return {
        question,
        answer,
        sources: asSources(row.sources),
      };
    })
    .filter((item): item is QuestionFinding => item !== null);
  if (rows.length === 0) {
    throw new Error("Astra findings were incomplete.");
  }
  return rows.slice(0, 12);
}

export function ideaResearchPrompt(input: ResearchInput): string {
  const title = input.title.trim().slice(0, IDEA_TITLE_MAX);
  const description = input.description.trim().slice(0, IDEA_DESCRIPTION_MAX);
  const extracted = input.extractedText.trim().slice(0, EXTRACTED_TEXT_PROMPT_MAX);
  return `Title: ${title}\n\nDescription:\n${description}\n\nExtracted source text:\n${extracted || "(none)"}`;
}

export function formatAstraFindings(findings: QuestionFinding[]): string {
  return findings
    .map((finding, index) => {
      const sources = finding.sources
        .map((source) => `- ${source.title}: ${source.url}`)
        .join("\n");
      return `Question ${index + 1}: ${finding.question}\nAnswer:\n${finding.answer}\nSources:\n${sources || "(none)"}`;
    })
    .join("\n\n");
}

export function proSynthesizePrompt(
  input: ResearchInput,
  plan: ResearchPacket,
  findings: QuestionFinding[]
): string {
  return `${ideaResearchPrompt(input)}

Research plan (keep these questions and areas; do not invent new ones):
Questions:
${plan.researchQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n")}

Areas:
${plan.researchAreas.map((area) => `- ${area}`).join("\n")}

Astra investigation findings:
${formatAstraFindings(findings)}`;
}

export function applyPlanQuestions(
  packet: ResearchPacket,
  plan: ResearchPacket
): ResearchPacket {
  return {
    ...packet,
    researchQuestions: plan.researchQuestions,
    researchAreas: plan.researchAreas,
  };
}
