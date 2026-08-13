export type InputType = "text" | "voice" | "image";
export type IdeaStatus = "ready" | "analyzing";

export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

export interface GrowthMetric {
  year: string;
  value: number;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  tags: string[];
  status: IdeaStatus;
  inputType: InputType;
  readinessScore: number;
  marketSize: string;
  targetAudience: string;
  topCompetitor: { name: string; strength: string };
  keyTrend: string;
  competitors: Competitor[];
  growthMetrics: GrowthMetric[];
  actionPlan: string[];
  createdAt: string;
}

export type AppView = "vault" | "digest" | "board" | "settings";
