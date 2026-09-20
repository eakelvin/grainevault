import OpenAI, { toFile } from "openai";
import { openaiApiKey, openaiTextModel, openaiTranscribeModel } from "@/lib/ai/env";
import type { AiProvider, ExtractMediaInput } from "@/lib/ai/types";

const IMAGE_PROMPT =
  "Extract the startup idea from this snapshot. Transcribe any visible text. If it is a whiteboard, screenshot, or sketch, describe the idea in plain sentences. Do not add market research or opinions. If nothing useful is visible, reply with an empty string.";

const PDF_PROMPT =
  "Extract the written content of this PDF as plain text. Keep the meaning. Skip repeated headers and footers. Do not add market research or opinions.";

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
    model: openaiTextModel(),
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
    model: openaiTextModel(),
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

export const openaiProvider: AiProvider = {
  async extractText(input) {
    if (input.kind === "audio") return extractAudio(input);
    if (input.kind === "pdf") return extractPdf(input);
    return extractImage(input);
  },
};
