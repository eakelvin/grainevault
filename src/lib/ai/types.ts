import type { Idea, MediaKind } from "@/lib/types";

export type ExtractMediaInput = {
  kind: MediaKind;
  bytes: Uint8Array;
  mimeType: string;
  filename: string;
};

export type ResearchInput = {
  title: string;
  description: string;
  extractedText: string;
};

export type ResearchPacket = Pick<
  Idea,
  | "shortDescription"
  | "tags"
  | "readinessScore"
  | "marketSize"
  | "targetAudience"
  | "topCompetitor"
  | "keyTrend"
  | "competitors"
  | "growthMetrics"
  | "actionPlan"
>;

export interface AiProvider {
  extractText(input: ExtractMediaInput): Promise<string>;
  runResearch(input: ResearchInput): Promise<ResearchPacket>;
}
