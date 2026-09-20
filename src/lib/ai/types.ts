import type { MediaKind } from "@/lib/types";

export type ExtractMediaInput = {
  kind: MediaKind;
  bytes: Uint8Array;
  mimeType: string;
  filename: string;
};

export interface AiProvider {
  extractText(input: ExtractMediaInput): Promise<string>;
}
