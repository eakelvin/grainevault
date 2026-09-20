import { createClient } from "@/lib/supabase/server";
import { extractFailMessage, getAiProvider } from "@/lib/ai";
import { IDEA_MEDIA_BUCKET, mapIdea } from "@/lib/idea-map";
import { mediaKindFromIdea, mimeFromMediaPath } from "@/lib/idea-draft";
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
  const kind = mediaKindFromIdea(idea.inputType, idea.mediaPath);
  if (!idea.mediaPath || !kind) {
    return Response.json({ idea });
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from(IDEA_MEDIA_BUCKET)
    .download(idea.mediaPath);

  if (downloadError || !file) {
    console.error("Couldn't download idea media.", downloadError);
    return Response.json({ error: extractFailMessage(kind) }, { status: 422 });
  }

  try {
    const extractedText = await getAiProvider().extractText({
      kind,
      bytes: new Uint8Array(await file.arrayBuffer()),
      mimeType: file.type || mimeFromMediaPath(idea.mediaPath, "application/octet-stream"),
      filename: idea.mediaPath.split("/").pop() ?? `idea.${kind}`,
    });

    const { data: updated, error: updateError } = await supabase
      .from("ideas")
      .update({ extracted_text: extractedText })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("Couldn't save extracted text.", updateError);
      return Response.json({ error: extractFailMessage(kind) }, { status: 422 });
    }

    return Response.json({ idea: mapIdea(updated as IdeaRow) });
  } catch (extractError) {
    console.error("Couldn't extract idea media.", extractError);
    return Response.json({ error: extractFailMessage(kind) }, { status: 422 });
  }
}
