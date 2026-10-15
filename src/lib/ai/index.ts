import { openaiProvider } from "@/lib/ai/openai";
import type { AiProvider } from "@/lib/ai/types";

export { investigateWithAstra } from "@/lib/ai/astra";

export function getAiProvider(): AiProvider {
  const value = (process.env.AI_PROVIDER ?? "openai").trim().toLowerCase();
  if (value && value !== "openai") {
    throw new Error("AI_PROVIDER must be openai. Gemini is not installed.");
  }
  return openaiProvider;
}

export function extractFailMessage(kind: "audio" | "image" | "pdf"): string {
  return kind === "audio"
    ? "Couldn't read this recording."
    : "Couldn't read this snapshot.";
}

export function researchFailMessage(): string {
  return "Your idea was saved, but research couldn't finish. Please try again.";
}
