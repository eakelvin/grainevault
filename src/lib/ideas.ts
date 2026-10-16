import { ideaSlug } from "@/lib/idea-slug";
import type { Idea, IdeaDraft, IdeaRow, MediaKind } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { MAX_MEDIA_BYTES } from "@/lib/idea-draft";
import { IDEA_MEDIA_BUCKET, mapIdea } from "@/lib/idea-map";
import {
  canCaptureIdea,
  freeIdeaLimitMessage,
  isFreeIdeaLimitError,
} from "@/lib/billing";
import { fetchProfile } from "@/lib/profile";

export { IDEA_MEDIA_BUCKET, mapIdea } from "@/lib/idea-map";

function mediaSizeMessage(kind: MediaKind): string {
  if (kind === "pdf") return "That PDF is too large. Try a smaller file.";
  if (kind === "image") return "That image is too large. Try a smaller snapshot.";
  return "That recording is too long. Try a shorter clip.";
}

function mediaSaveMessage(kind: MediaKind): string {
  if (kind === "audio") return "Couldn't save this recording. Please try again.";
  return "Couldn't save this snapshot. Please try again.";
}

function fail(fallback: string, error: unknown): never {
  console.error(fallback, error);
  throw new Error(fallback);
}

export async function fetchIdeas(): Promise<Idea[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) fail("Couldn't load your ideas. Please try again.", error);
  return (data ?? []).map((row) => mapIdea(row as IdeaRow));
}

export async function fetchArchivedIdeas(): Promise<Idea[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false });

  if (error) fail("Couldn't load your archive. Please try again.", error);
  return (data ?? []).map((row) => mapIdea(row as IdeaRow));
}

export async function countIdeaSlots(): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("ideas")
    .select("id", { count: "exact", head: true });

  if (error) fail("Couldn't load your ideas. Please try again.", error);
  return count ?? 0;
}

export async function fetchIdeaById(ideaId: string): Promise<Idea | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", ideaId)
    .maybeSingle();

  if (error) fail("Couldn't load this idea. Please try again.", error);
  return data ? mapIdea(data as IdeaRow) : null;
}

export async function fetchIdeaBySlug(slug: string): Promise<Idea | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("ideas").select("*");

  if (error) fail("Couldn't load this idea. Please try again.", error);
  const matches = (data ?? [])
    .map((row) => mapIdea(row as IdeaRow))
    .filter((idea) => ideaSlug(idea.title) === slug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return matches.find((idea) => !idea.archivedAt) ?? matches[0] ?? null;
}

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
      input_type: draft.inputType,
    })
    .select("*")
    .single();

  if (error) {
    if (isFreeIdeaLimitError(error)) fail(freeIdeaLimitMessage(), error);
    fail("Couldn't save this idea. Please try again.", error);
  }
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
  const [profile, slotCount] = await Promise.all([
    fetchProfile(),
    countIdeaSlots(),
  ]);
  if (!canCaptureIdea(profile?.plan ?? "free", slotCount)) {
    fail(freeIdeaLimitMessage(), "Free idea limit");
  }
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
  const response = await fetch(`/api/ideas/${idea.id}/research`, { method: "POST" });
  const body = (await response.json().catch(() => null)) as
    | { idea?: Idea; error?: string }
    | null;

  if (!response.ok || !body?.idea) {
    throw new Error(
      body?.error || "Your idea was saved, but research couldn't finish. Please try again."
    );
  }

  return body.idea;
}

export async function extractIdeaMedia(ideaId: string): Promise<Idea> {
  const response = await fetch(`/api/ideas/${ideaId}/extract`, { method: "POST" });
  const body = (await response.json().catch(() => null)) as
    | { idea?: Idea; error?: string }
    | null;

  if (!response.ok || !body?.idea) {
    throw new Error(body?.error || "Couldn't read this file.");
  }

  return body.idea;
}

export async function archiveIdea(idea: Idea): Promise<Idea> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("ideas")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", idea.id)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error || !data) {
    fail("Couldn't archive this idea. Please try again.", error ?? "No idea archived");
  }
  return mapIdea(data as IdeaRow);
}

export async function restoreIdea(idea: Idea): Promise<Idea> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("ideas")
    .update({ archived_at: null })
    .eq("id", idea.id)
    .not("archived_at", "is", null)
    .select("*")
    .single();

  if (error || !data) {
    fail("Couldn't restore this idea. Please try again.", error ?? "No idea restored");
  }
  return mapIdea(data as IdeaRow);
}

export async function deleteIdea(idea: Idea): Promise<void> {
  const { supabase } = await requireUser();

  if (idea.mediaPath) {
    const { error: storageError } = await supabase.storage
      .from(IDEA_MEDIA_BUCKET)
      .remove([idea.mediaPath]);
    if (storageError) console.error("Couldn't remove this file.", storageError);
  }

  const { data, error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", idea.id)
    .select("id");

  if (error || !data?.length) {
    fail("Couldn't delete this idea. Please try again.", error ?? "No idea deleted");
  }
}
