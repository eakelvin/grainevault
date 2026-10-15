import type { Plan } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";

type ModelAction = "research" | "extract";

type QuotaLimits = {
  hour: number;
  day: number;
  ideaDay: number;
  concurrency: number;
};

const LIMITS: Record<ModelAction, Record<Plan, QuotaLimits>> = {
  research: {
    free: { hour: 4, day: 8, ideaDay: 3, concurrency: 1 },
    pro: { hour: 10, day: 30, ideaDay: 6, concurrency: 2 },
  },
  extract: {
    free: { hour: 6, day: 10, ideaDay: 4, concurrency: 1 },
    pro: { hour: 15, day: 40, ideaDay: 6, concurrency: 2 },
  },
};

const IN_FLIGHT_MESSAGE: Record<ModelAction, string> = {
  research: "Research is already running for this idea.",
  extract: "This file is already being read.",
};

const BUSY_MESSAGE: Record<ModelAction, string> = {
  research: "Research is already running. Wait for it to finish before starting another.",
  extract: "A file is already being read. Wait for it to finish.",
};

const HOUR_MESSAGE: Record<ModelAction, string> = {
  research: "You've run research too many times this hour. Try again later.",
  extract: "You've read too many files this hour. Try again later.",
};

const DAY_MESSAGE: Record<ModelAction, string> = {
  research: "You've reached today's research limit.",
  extract: "You've reached today's file-reading limit.",
};

const IDEA_MESSAGE: Record<ModelAction, string> = {
  research: "This idea has been researched enough times today.",
  extract: "This file has been read enough times today.",
};

const UNAVAILABLE_MESSAGE: Record<ModelAction, string> = {
  research: "Couldn't start research. Please try again.",
  extract: "Couldn't read this file. Please try again.",
};

export class ModelQuotaError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ModelQuotaError";
    this.status = status;
  }
}

function messageFor(action: ModelAction, code: string): string {
  if (code.includes("IN_FLIGHT")) return IN_FLIGHT_MESSAGE[action];
  if (code.includes("BUSY")) return BUSY_MESSAGE[action];
  if (code.includes("RATE_LIMIT_IDEA")) return IDEA_MESSAGE[action];
  if (code.includes("RATE_LIMIT_DAY")) return DAY_MESSAGE[action];
  if (code.includes("RATE_LIMIT_HOUR")) return HOUR_MESSAGE[action];
  return UNAVAILABLE_MESSAGE[action];
}

function statusFor(code: string): number {
  if (code.includes("IDEA_NOT_FOUND")) return 404;
  if (code.includes("IN_FLIGHT") || code.includes("BUSY")) return 409;
  if (code.includes("RATE_LIMIT")) return 429;
  return 503;
}

export async function claimModelCall(params: {
  userId: string;
  ideaId: string;
  action: ModelAction;
  plan: Plan;
}): Promise<void> {
  const limits = LIMITS[params.action][params.plan];
  const admin = createAdminClient();
  const { error } = await admin.rpc("claim_model_call", {
    p_user_id: params.userId,
    p_idea_id: params.ideaId,
    p_action: params.action,
    p_hour_limit: limits.hour,
    p_day_limit: limits.day,
    p_idea_day_limit: limits.ideaDay,
    p_concurrency: limits.concurrency,
  });

  if (!error) return;

  const code = error.message ?? "";
  if (
    code.includes("IN_FLIGHT") ||
    code.includes("BUSY") ||
    code.includes("RATE_LIMIT") ||
    code.includes("IDEA_NOT_FOUND")
  ) {
    const message =
      code.includes("IDEA_NOT_FOUND") ? "Idea not found." : messageFor(params.action, code);
    throw new ModelQuotaError(message, statusFor(code));
  }

  console.error("Couldn't reserve a model call.", error);
  throw new ModelQuotaError(UNAVAILABLE_MESSAGE[params.action], 503);
}

export async function releaseModelCall(
  ideaId: string,
  action: ModelAction
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("release_model_call", {
      p_idea_id: ideaId,
      p_action: action,
    });
    if (error) console.error("Couldn't release model call.", error);
  } catch (error) {
    console.error("Couldn't release model call.", error);
  }
}

export function quotaResponse(error: unknown): Response | null {
  if (!(error instanceof ModelQuotaError)) return null;
  return Response.json({ error: error.message }, { status: error.status });
}
