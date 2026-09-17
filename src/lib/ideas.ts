import type { Competitor, GrowthMetric, Idea, InputType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { generateResearchPacket } from "@/lib/generate-research";

export type IdeaRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  short_description: string;
  tags: string[] | null;
  status: Idea["status"];
  input_type: InputType;
  readiness_score: number;
  market_size: string;
  target_audience: string;
  top_competitor: Idea["topCompetitor"] | null;
  key_trend: string;
  competitors: Competitor[] | null;
  growth_metrics: GrowthMetric[] | null;
  action_plan: string[] | null;
  media_path: string | null;
  created_at: string;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function fail(fallback: string, error: unknown): never {
  console.error(fallback, error);
  throw new Error(fallback);
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
    createdAt: row.created_at,
  };
}

export async function fetchIdeas(): Promise<Idea[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) fail("Couldn't load your ideas. Please try again.", error);
  return (data ?? []).map((row) => mapIdea(row as IdeaRow));
}

export async function createTextIdea(
  title: string,
  description: string
): Promise<Idea> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    fail("Sign in to capture an idea.", userError ?? "No signed-in user");
  }

  const shortDescription =
    description.length > 80 ? `${description.slice(0, 77)}...` : description;

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      user_id: user.id,
      title,
      description,
      short_description: shortDescription,
      tags: [],
      status: "analyzing",
      input_type: "text",
      readiness_score: 0,
      market_size: "—",
      target_audience: "—",
      top_competitor: { name: "—", strength: "—" },
      key_trend: "—",
      competitors: [],
      growth_metrics: [],
      action_plan: [],
    })
    .select("*")
    .single();

  if (error) fail("Couldn't save this idea. Please try again.", error);
  return mapIdea(data as IdeaRow);
}

export async function completeIdeaResearch(idea: Idea): Promise<Idea> {
  const research = generateResearchPacket(
    idea.title,
    idea.description,
    idea.inputType
  );
  const supabase = createClient();
  const { data, error } = await supabase
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
    .eq("id", idea.id)
    .select("*")
    .single();

  if (error) {
    fail("Your idea was saved, but research couldn't finish. Please try again.", error);
  }
  return mapIdea(data as IdeaRow);
}
