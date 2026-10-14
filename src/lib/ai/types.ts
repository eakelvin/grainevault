import type { Plan } from "@/lib/billing";
import type { Idea, MediaKind, QuestionFinding } from "@/lib/types";

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
  depth: Plan;
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
  | "risks"
  | "customerSegments"
  | "whyNow"
  | "researchQuestions"
  | "researchAreas"
  | "opportunities"
  | "assumptions"
  | "sources"
>;

export type ProSynthesizeInput = ResearchInput & {
  plan: ResearchPacket;
  findings: QuestionFinding[];
};

export interface AiProvider {
  extractText(input: ExtractMediaInput): Promise<string>;
  runResearch(input: ResearchInput): Promise<ResearchPacket>;
  planProResearch(input: ResearchInput): Promise<ResearchPacket>;
  synthesizeProResearch(input: ProSynthesizeInput): Promise<ResearchPacket>;
}
