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
  return process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-4o-mini";
}

export function openaiTranscribeModel(): string {
  return process.env.OPENAI_TRANSCRIBE_MODEL?.trim() || "whisper-1";
}
