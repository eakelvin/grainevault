import { GoogleGenAI } from "@google/genai";
import { geminiApiKey, geminiModel } from "@/lib/ai/env";
import {
  AUDIO_PROMPT,
  FREE_RESEARCH_INSTRUCTIONS,
  IMAGE_PROMPT,
  PDF_PROMPT,
  PRO_PLAN_INSTRUCTIONS,
  PRO_SYNTHESIZE_INSTRUCTIONS,
} from "@/lib/ai/prompts";
import {
  FREE_RESEARCH_JSON_SCHEMA,
  PRO_PLAN_JSON_SCHEMA,
  PRO_RESEARCH_JSON_SCHEMA,
  applyPlanQuestions,
  ideaResearchPrompt,
  parseResearchPacket,
  parseResearchPlan,
  proSynthesizePrompt,
} from "@/lib/ai/research";
import type {
  AiProvider,
  ExtractMediaInput,
  ProSynthesizeInput,
  ResearchInput,
  ResearchPacket,
} from "@/lib/ai/types";

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

async function generateJson(systemInstruction: string, prompt: string, schema: unknown) {
  return client().models.generateContent({
    model: geminiModel(),
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseJsonSchema: jsonSchemaForGemini(schema),
    },
  });
}

async function runResearch(input: ResearchInput): Promise<ResearchPacket> {
  const result = await generateJson(
    FREE_RESEARCH_INSTRUCTIONS,
    ideaResearchPrompt(input),
    FREE_RESEARCH_JSON_SCHEMA
  );
  return parseResearchPacket(result.text?.trim() ?? "", "free");
}

async function planProResearch(input: ResearchInput): Promise<ResearchPacket> {
  const result = await generateJson(
    PRO_PLAN_INSTRUCTIONS,
    ideaResearchPrompt(input),
    PRO_PLAN_JSON_SCHEMA
  );
  return parseResearchPlan(result.text?.trim() ?? "");
}

async function synthesizeProResearch(
  input: ProSynthesizeInput
): Promise<ResearchPacket> {
  const result = await generateJson(
    PRO_SYNTHESIZE_INSTRUCTIONS,
    proSynthesizePrompt(input, input.plan, input.findings),
    PRO_RESEARCH_JSON_SCHEMA
  );
  return applyPlanQuestions(
    parseResearchPacket(result.text?.trim() ?? "", "pro"),
    input.plan
  );
}

export const geminiProvider: AiProvider = {
  async extractText(input) {
    if (input.kind === "audio") return extractWithPrompt(input, AUDIO_PROMPT);
    if (input.kind === "pdf") return extractWithPrompt(input, PDF_PROMPT);
    return extractWithPrompt(input, IMAGE_PROMPT);
  },
  runResearch,
  planProResearch,
  synthesizeProResearch,
};
