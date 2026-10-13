import { GoogleGenAI } from "@google/genai";
import { geminiApiKey, geminiModel } from "@/lib/ai/env";
import {
  AUDIO_PROMPT,
  IMAGE_PROMPT,
  PDF_PROMPT,
  researchInstructionsFor,
} from "@/lib/ai/prompts";
import { parseResearchPacket, researchSchemaFor } from "@/lib/ai/research";
import type { AiProvider, ExtractMediaInput, ResearchInput, ResearchPacket } from "@/lib/ai/types";

function client() {
  return new GoogleGenAI({ apiKey: geminiApiKey() });
}

function inlinePart(input: ExtractMediaInput) {
  return {
    inlineData: {
      mimeType: geminiMimeType(input.mimeType, input.kind),
      data: Buffer.from(input.bytes).toString("base64"),
    },
  };
}

function geminiMimeType(mimeType: string, kind: ExtractMediaInput["kind"]): string {
  const base = mimeType.split(";")[0].trim().toLowerCase();
  if (base === "audio/mpeg") return "audio/mp3";
  if (base) return base;
  if (kind === "audio") return "audio/webm";
  if (kind === "pdf") return "application/pdf";
  return "image/jpeg";
}

function jsonSchemaForGemini(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(jsonSchemaForGemini);
  if (!schema || typeof schema !== "object") return schema;

  const { additionalProperties: _ignored, ...rest } = schema as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    next[key] = jsonSchemaForGemini(value);
  }
  return next;
}

async function extractWithPrompt(input: ExtractMediaInput, prompt: string): Promise<string> {
  const result = await client().models.generateContent({
    model: geminiModel(),
    contents: [{ text: prompt }, inlinePart(input)],
  });
  return result.text?.trim() ?? "";
}

async function runResearch(input: ResearchInput): Promise<ResearchPacket> {
  const extracted = input.extractedText.trim().slice(0, 8000);
  const depth = input.depth === "pro" ? "pro" : "free";
  const result = await client().models.generateContent({
    model: geminiModel(),
    contents: `Title: ${input.title}\n\nDescription:\n${input.description}\n\nExtracted source text:\n${extracted || "(none)"}`,
    config: {
      systemInstruction: researchInstructionsFor(depth),
      responseMimeType: "application/json",
      responseJsonSchema: jsonSchemaForGemini(researchSchemaFor(depth)),
    },
  });
  return parseResearchPacket(result.text?.trim() ?? "", depth);
}

export const geminiProvider: AiProvider = {
  async extractText(input) {
    if (input.kind === "audio") return extractWithPrompt(input, AUDIO_PROMPT);
    if (input.kind === "pdf") return extractWithPrompt(input, PDF_PROMPT);
    return extractWithPrompt(input, IMAGE_PROMPT);
  },
  runResearch,
};
