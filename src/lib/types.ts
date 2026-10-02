export type InputType = "text" | "voice" | "image";
export type IdeaStatus = "ready" | "analyzing";
export type AuthMode = "login" | "signup";
export type MediaKind = "audio" | "image" | "pdf";

export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

export interface GrowthMetric {
  year: string;
  value: number;
}

export interface IdeaDraftMedia {
  kind: MediaKind;
  blob: Blob;
  mimeType: string;
  extension: string;
}

export interface IdeaDraft {
  title: string;
  description: string;
  inputType: InputType;
  media?: IdeaDraftMedia;
}

export interface CaptureInput {
  title: string;
  description: string;
  inputType: InputType;
  file?: Blob | null;
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
  mediaPath: string | null;
  extractedText: string;
  createdAt: string;
  archivedAt: string | null;
}

export interface IdeaRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  short_description: string;
  tags: string[] | null;
  status: IdeaStatus;
  input_type: InputType;
  readiness_score: number;
  market_size: string;
  target_audience: string;
  top_competitor: Idea["topCompetitor"] | null;
  key_trend: string;
  competitors: Competitor[] | null;
  growth_metrics: GrowthMetric[] | null;
  action_plan: string[] | null;
  media_path: string | null;
  extracted_text: string | null;
  created_at: string;
  archived_at: string | null;
}

export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  updatePassword: "/update-password",
  checkEmail: "/check-email",
  vault: "/vault",
  archive: "/archive",
  digest: "/digest",
  board: "/board",
  settings: "/settings",
  profile: "/profile",
  pricing: "/pricing",
  idea: (id: string) => `/ideas/${id}` as const,
} as const;
