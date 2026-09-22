import { openaiProvider } from "@/lib/ai/openai";
import { geminiProvider } from "@/lib/ai/gemini";
import { aiProviderName } from "@/lib/ai/env";
import type { AiProvider } from "@/lib/ai/types";

export function getAiProvider(): AiProvider {
  return aiProviderName() === "gemini" ? geminiProvider : openaiProvider;
}

export function extractFailMessage(kind: "audio" | "image" | "pdf"): string {
  return kind === "audio"
    ? "Couldn't read this recording."
    : "Couldn't read this snapshot.";
}

export function researchFailMessage(): string {
  return "Your idea was saved, but research couldn't finish. Please try again.";
}
