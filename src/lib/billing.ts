export const FREE_IDEA_LIMIT = 3;
export const PRO_MONTHLY_USD = 29;
export const PRO_YEARLY_USD = PRO_MONTHLY_USD * 12;

export type Plan = "free" | "pro";
export type BillingInterval = "month" | "year";

export function canCaptureIdea(plan: Plan, ideaCount: number): boolean {
  return plan === "pro" || ideaCount < FREE_IDEA_LIMIT;
}

export function freeIdeaLimitMessage(): string {
  return `Free accounts can keep ${FREE_IDEA_LIMIT} active ideas. Delete one or upgrade for unlimited research.`;
}

export function isFreeIdeaLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String(error.message) : "";
  const code = "code" in error ? String(error.code) : "";
  return message.includes("FREE_IDEA_LIMIT") || code === "P0001";
}

export function formatUsd(amount: number): string {
  return `$${amount}`;
}
