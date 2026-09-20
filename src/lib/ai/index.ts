import { openaiProvider } from "@/lib/ai/openai";
import { aiProviderName } from "@/lib/ai/env";
import type { AiProvider } from "@/lib/ai/types";

export function getAiProvider(): AiProvider {
  const name = aiProviderName();
  if (name === "openai") return openaiProvider;
  throw new Error(`AI provider "${name}" is not implemented yet.`);
}

export function extractFailMessage(kind: "audio" | "image" | "pdf"): string {
  return kind === "audio"
    ? "Couldn't read this recording."
    : "Couldn't read this snapshot.";
}
