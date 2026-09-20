import type {
  CaptureInput,
  IdeaDraft,
  IdeaDraftMedia,
  InputType,
  MediaKind,
} from "@/lib/types";

export const MAX_MEDIA_BYTES = 6 * 1024 * 1024;
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1920;
const PDF_MIME = "application/pdf";
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
]);

export const SNAPSHOT_FILE_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export class CaptureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaptureError";
  }
}

function audioExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

function cleanMime(blob: Blob, fallback: string): string {
  return (blob.type || fallback).split(";")[0]?.trim() || fallback;
}

export function isPdfPath(path: string): boolean {
  return path.toLowerCase().split("?")[0]?.endsWith(".pdf") ?? false;
}

export function isPdfFile(file: File): boolean {
  return cleanMime(file, "") === PDF_MIME || file.name.toLowerCase().endsWith(".pdf");
}

export function mediaKindFromIdea(
  inputType: InputType,
  mediaPath: string | null
): MediaKind | null {
  if (!mediaPath) return null;
  if (inputType === "voice") return "audio";
  if (inputType === "image") return isPdfPath(mediaPath) ? "pdf" : "image";
  return null;
}

export function mimeFromMediaPath(path: string, fallback: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".pdf")) return PDF_MIME;
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".webm")) return "audio/webm";
  if (lower.endsWith(".m4a") || lower.endsWith(".mp4")) return "audio/mp4";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  return fallback;
}

async function hasPdfMagic(blob: Blob): Promise<boolean> {
  const header = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
  return (
    header.length >= 4 &&
    header[0] === 0x25 &&
    header[1] === 0x50 &&
    header[2] === 0x44 &&
    header[3] === 0x46
  );
}

function normalizeAudio(blob: Blob): IdeaDraftMedia {
  if (blob.size === 0) {
    throw new CaptureError("Record a voice note first.");
  }
  if (blob.size > MAX_MEDIA_BYTES) {
    throw new CaptureError("That recording is too long. Try a shorter clip.");
  }

  const mimeType = cleanMime(blob, "audio/webm");
  const allowedType = ALLOWED_AUDIO_TYPES.has(mimeType) ? mimeType : "audio/webm";
  const normalized =
    blob.type === allowedType ? blob : new Blob([blob], { type: allowedType });

  return {
    kind: "audio",
    blob: normalized,
    mimeType: allowedType,
    extension: audioExtension(allowedType),
  };
}

async function blobFromCanvas(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((next) => resolve(next), "image/jpeg", quality);
  });
  if (!blob) {
    throw new CaptureError("Couldn't read that image. Try a JPEG, PNG, WebP, or PDF.");
  }
  return blob;
}

async function normalizePdf(file: Blob): Promise<IdeaDraftMedia> {
  if (file.size === 0) {
    throw new CaptureError("Add a snapshot first.");
  }
  if (file.size > MAX_MEDIA_BYTES) {
    throw new CaptureError("That PDF is too large. Try a smaller file.");
  }
  if (!(await hasPdfMagic(file))) {
    throw new CaptureError("Use a simple PDF, or a JPEG, PNG, or WebP image.");
  }

  const blob =
    file.type === PDF_MIME ? file : new Blob([file], { type: PDF_MIME });

  return {
    kind: "pdf",
    blob,
    mimeType: PDF_MIME,
    extension: "pdf",
  };
}

async function normalizeSnapshot(file: Blob): Promise<IdeaDraftMedia> {
  const mimeType = cleanMime(file, "");
  const name = file instanceof File ? file.name : "";
  if (mimeType === PDF_MIME || name.toLowerCase().endsWith(".pdf")) {
    return normalizePdf(file);
  }
  return normalizeImage(file);
}

async function normalizeImage(file: Blob): Promise<IdeaDraftMedia> {
  if (file.size === 0) {
    throw new CaptureError("Add a snapshot first.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new CaptureError("That image is too large. Try a smaller snapshot.");
  }

  const sourceType = cleanMime(file, "");
  if (sourceType && !ALLOWED_IMAGE_TYPES.has(sourceType)) {
    throw new CaptureError("Use a JPEG, PNG, WebP, or PDF.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new CaptureError("Couldn't read that image. Try a JPEG, PNG, WebP, or PDF.");
  }

  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new CaptureError("Couldn't prepare that snapshot. Please try again.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await blobFromCanvas(canvas, 0.85);
  if (blob.size > MAX_MEDIA_BYTES) {
    blob = await blobFromCanvas(canvas, 0.7);
  }
  if (blob.size > MAX_MEDIA_BYTES) {
    throw new CaptureError("That image is too large. Try a smaller snapshot.");
  }

  return {
    kind: "image",
    blob,
    mimeType: "image/jpeg",
    extension: "jpg",
  };
}

export async function toIdeaDraft(input: CaptureInput): Promise<IdeaDraft> {
  const title = input.title.trim();
  const description = input.description.trim();

  if (!title || !description) {
    throw new CaptureError("Add a title and description.");
  }

  if (input.inputType === "text") {
    return { title, description, inputType: "text" };
  }

  if (input.inputType === "voice") {
    if (!input.file) {
      throw new CaptureError("Record a voice note first.");
    }
    return {
      title,
      description,
      inputType: "voice",
      media: normalizeAudio(input.file),
    };
  }

  if (input.inputType === "image") {
    if (!input.file) {
      throw new CaptureError("Add a snapshot first.");
    }
    return {
      title,
      description,
      inputType: "image",
      media: await normalizeSnapshot(input.file),
    };
  }

  throw new CaptureError("Couldn't save this idea. Please try again.");
}
