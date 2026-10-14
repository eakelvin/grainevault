import OpenAI from "openai";
import { openaiApiKey, openaiAstraModel } from "@/lib/ai/env";
import {
  ASTRA_INVESTIGATE_INSTRUCTIONS,
  ASTRA_WEB_SEARCH_INSTRUCTIONS,
} from "@/lib/ai/prompts";
import {
  ASTRA_FINDINGS_JSON_SCHEMA,
  ideaResearchPrompt,
  parseAstraFindings,
} from "@/lib/ai/research";
import type { ResearchInput, ResearchPacket } from "@/lib/ai/types";
import type { QuestionFinding } from "@/lib/types";

function client() {
  return new OpenAI({ apiKey: openaiApiKey() });
}

export async function investigateWithAstra(
  input: ResearchInput,
  plan: ResearchPacket
): Promise<QuestionFinding[]> {
  const result = await client().responses.create({
    model: openaiAstraModel(),
    instructions: `${ASTRA_INVESTIGATE_INSTRUCTIONS}\n\n${ASTRA_WEB_SEARCH_INSTRUCTIONS}`,
    tools: [{ type: "web_search", search_context_size: "high" }],
    tool_choice: "required",
    text: {
      format: {
        type: "json_schema",
        name: "astra_findings_v1",
        strict: true,
        schema: ASTRA_FINDINGS_JSON_SCHEMA,
      },
    },
    input: `${ideaResearchPrompt(input)}

Research plan to investigate:
Questions:
${plan.researchQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n")}

Areas:
${plan.researchAreas.map((area) => `- ${area}`).join("\n")}`,
  });
  return parseAstraFindings(result.output_text);
}
