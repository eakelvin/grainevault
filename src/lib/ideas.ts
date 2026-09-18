import type {
  Competitor,
  GrowthMetric,
  Idea,
  IdeaDraft,
  IdeaRow,
  MediaKind,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { generateResearchPacket } from "@/lib/helpers/generate-research";
import { MAX_MEDIA_BYTES } from "@/lib/idea-draft";

function mediaSizeMessage(kind: MediaKind): string {
  if (kind === "pdf") return "That PDF is too large. Try a smaller file.";
  if (kind === "image") return "That image is too large. Try a smaller snapshot.";
  return "That recording is too long. Try a shorter clip.";
}

function mediaSaveMessage(kind: MediaKind): string {
  if (kind === "audio") return "Couldn't save this recording. Please try again.";
  return "Couldn't save this snapshot. Please try again.";
}

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
    mediaPath: row.media_path,
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

export const IDEA_MEDIA_BUCKET = "idea-media";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    fail("Sign in to capture an idea.", userError ?? "No signed-in user");
  }

  return { supabase, user };
}

async function insertIdea(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  draft: IdeaDraft
): Promise<Idea> {
  const shortDescription =
    draft.description.length > 80
      ? `${draft.description.slice(0, 77)}...`
      : draft.description;

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      user_id: userId,
      title: draft.title,
      description: draft.description,
      short_description: shortDescription,
      tags: [],
      status: "analyzing",
      input_type: draft.inputType,
      readiness_score: 0,
      market_size: "—",
      target_audience: "—",
      top_competitor: { name: "—", strength: "—" },
      key_trend: "—",
      competitors: [],
      growth_metrics: [],
      action_plan: [],
      media_path: null,
    })
    .select("*")
    .single();

  if (error) fail("Couldn't save this idea. Please try again.", error);
  return mapIdea(data as IdeaRow);
}

async function discardIdea(
  supabase: ReturnType<typeof createClient>,
  ideaId: string,
  mediaPath?: string
) {
  if (mediaPath) {
    await supabase.storage.from(IDEA_MEDIA_BUCKET).remove([mediaPath]);
  }
  await supabase.from("ideas").delete().eq("id", ideaId);
}

export async function createIdea(draft: IdeaDraft): Promise<Idea> {
  const { supabase, user } = await requireUser();
  const idea = await insertIdea(supabase, user.id, draft);
  const media = draft.media;

  if (!media) return idea;

  if (media.blob.size === 0 || media.blob.size > MAX_MEDIA_BYTES) {
    await discardIdea(supabase, idea.id);
    fail(mediaSizeMessage(media.kind), "Media size invalid");
  }

  const path = `${user.id}/${idea.id}.${media.extension}`;
  const { error: uploadError } = await supabase.storage
    .from(IDEA_MEDIA_BUCKET)
    .upload(path, media.blob, { contentType: media.mimeType, upsert: false });

  if (uploadError) {
    await discardIdea(supabase, idea.id);
    fail(mediaSaveMessage(media.kind), uploadError);
  }

  const { data, error } = await supabase
    .from("ideas")
    .update({ media_path: path })
    .eq("id", idea.id)
    .select("*")
    .single();

  if (error) {
    await discardIdea(supabase, idea.id, path);
    fail("Couldn't save this idea. Please try again.", error);
  }

  return mapIdea(data as IdeaRow);
}

export async function getIdeaMediaUrl(path: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(IDEA_MEDIA_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    console.error("Couldn't load this file.", error);
    return null;
  }

  return data.signedUrl;
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
