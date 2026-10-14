export type AiProviderName = "openai" | "gemini";

export function aiProviderName(): AiProviderName {
  const value = (process.env.AI_PROVIDER ?? "openai").trim().toLowerCase();
  if (value === "gemini") return "gemini";
  return "openai";
}

export function openaiApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim() ?? "";
  if (!key) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  return key;
}

export function openaiTextModel(): string {
  return process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-6-luna";
}

/** Pro investigation only. Never used for extract, Free research, or the research plan. */
export function openaiAstraModel(): string {
  return process.env.OPENAI_ASTRA_MODEL?.trim() || "gpt-6-astra";
}

export function openaiExtractModel(): string {
  return process.env.OPENAI_EXTRACT_MODEL?.trim() || "gpt-6-luna";
}

export function openaiTranscribeModel(): string {
  return process.env.OPENAI_TRANSCRIBE_MODEL?.trim() || "whisper-1";
}

export function geminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim() ?? "";
  if (!key) {
    throw new Error("GEMINI_API_KEY is missing.");
  }
  return key;
}

export function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
}
