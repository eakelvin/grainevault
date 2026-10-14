import OpenAI, { toFile } from "openai";
import { openaiApiKey, openaiExtractModel, openaiTextModel, openaiTranscribeModel } from "@/lib/ai/env";
import {
  FREE_RESEARCH_INSTRUCTIONS,
  FREE_RESEARCH_WEB_SEARCH_INSTRUCTIONS,
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
  const result = await client().responses.create({
    model: openaiTextModel(),
    instructions: `${FREE_RESEARCH_INSTRUCTIONS}\n\n${FREE_RESEARCH_WEB_SEARCH_INSTRUCTIONS}`,
    tools: [{ type: "web_search", search_context_size: "low" }],
    tool_choice: "required",
    text: {
      format: {
        type: "json_schema",
        name: "research_packet_free",
        strict: true,
        schema: FREE_RESEARCH_JSON_SCHEMA,
      },
    },
    input: ideaResearchPrompt(input),
  });
  return parseResearchPacket(result.output_text, "free");
}

async function planProResearch(input: ResearchInput): Promise<ResearchPacket> {
  const result = await client().responses.create({
    model: openaiTextModel(),
    instructions: PRO_PLAN_INSTRUCTIONS,
    text: {
      format: {
        type: "json_schema",
        name: "research_plan_v1",
        strict: true,
        schema: PRO_PLAN_JSON_SCHEMA,
      },
    },
    input: ideaResearchPrompt(input),
  });
  return parseResearchPlan(result.output_text);
}

async function synthesizeProResearch(
  input: ProSynthesizeInput
): Promise<ResearchPacket> {
  const result = await client().responses.create({
    model: openaiTextModel(),
    instructions: PRO_SYNTHESIZE_INSTRUCTIONS,
    text: {
      format: {
        type: "json_schema",
        name: "research_packet_pro_v2",
        strict: true,
        schema: PRO_RESEARCH_JSON_SCHEMA,
      },
    },
    input: proSynthesizePrompt(input, input.plan, input.findings),
  });
  return applyPlanQuestions(parseResearchPacket(result.output_text, "pro"), input.plan);
}

export const openaiProvider: AiProvider = {
  async extractText(input) {
    if (input.kind === "audio") return extractAudio(input);
    if (input.kind === "pdf") return extractPdf(input);
    return extractImage(input);
  },
  runResearch,
  planProResearch,
  synthesizeProResearch,
};
