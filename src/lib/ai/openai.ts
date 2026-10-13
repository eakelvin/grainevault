import OpenAI, { toFile } from "openai";
import { openaiApiKey, openaiExtractModel, openaiTextModel, openaiTranscribeModel } from "@/lib/ai/env";
import {
  IMAGE_PROMPT,
  PDF_PROMPT,
  researchInstructionsFor,
  researchWebSearchInstructionsFor,
} from "@/lib/ai/prompts";
import { parseResearchPacket, researchSchemaFor } from "@/lib/ai/research";
import type { AiProvider, ExtractMediaInput, ResearchInput, ResearchPacket } from "@/lib/ai/types";

function client() {
  return new OpenAI({ apiKey: openaiApiKey() });
}

async function extractAudio(input: ExtractMediaInput): Promise<string> {
  const file = await toFile(input.bytes, input.filename, { type: input.mimeType });
  const result = await client().audio.transcriptions.create({
    file,
    model: openaiTranscribeModel(),
  });
  return result.text.trim();
}

async function extractImage(input: ExtractMediaInput): Promise<string> {
  const dataUrl = `data:${input.mimeType};base64,${Buffer.from(input.bytes).toString("base64")}`;
  const result = await client().chat.completions.create({
    model: openaiExtractModel(),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: IMAGE_PROMPT },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  });
  return result.choices[0]?.message?.content?.trim() ?? "";
}

async function extractPdf(input: ExtractMediaInput): Promise<string> {
  const fileData = `data:application/pdf;base64,${Buffer.from(input.bytes).toString("base64")}`;
  const result = await client().responses.create({
    model: openaiExtractModel(),
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_file",
            filename: input.filename,
            file_data: fileData,
          },
          { type: "input_text", text: PDF_PROMPT },
        ],
      },
    ],
  });
  return result.output_text.trim();
}

async function runResearch(input: ResearchInput): Promise<ResearchPacket> {
  const extracted = input.extractedText.trim().slice(0, 8000);
  const depth = input.depth === "pro" ? "pro" : "free";
  const result = await client().responses.create({
    model: openaiTextModel(),
    instructions: `${researchInstructionsFor(depth)}\n\n${researchWebSearchInstructionsFor(depth)}`,
    tools: [
      {
        type: "web_search",
        search_context_size: depth === "pro" ? "high" : "low",
      },
    ],
    tool_choice: "required",
    text: {
      format: {
        type: "json_schema",
        name: depth === "pro" ? "research_packet_pro" : "research_packet_free",
        strict: true,
        schema: researchSchemaFor(depth),
      },
    },
    input: `Title: ${input.title}\n\nDescription:\n${input.description}\n\nExtracted source text:\n${extracted || "(none)"}`,
  });
  return parseResearchPacket(result.output_text, depth);
}

export const openaiProvider: AiProvider = {
  async extractText(input) {
    if (input.kind === "audio") return extractAudio(input);
    if (input.kind === "pdf") return extractPdf(input);
    return extractImage(input);
  },
  runResearch,
};
