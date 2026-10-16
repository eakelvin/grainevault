import type {
  DifficultyLevel,
  IdeaDemand,
  IdeaDemands,
  IdeaReality,
} from "@/lib/types";

export const DEMAND_FIELDS = [
  ["distribution", "Distribution"],
  ["domain", "Domain"],
  ["depth", "Depth"],
  ["sales", "Sales"],
  ["content", "Content"],
  ["capital", "Capital"],
] as const satisfies ReadonlyArray<readonly [keyof IdeaDemands, string]>;

const DIFFICULTY_LEVELS = new Set<DifficultyLevel>(["low", "medium", "high"]);

export function difficultyLabel(level: DifficultyLevel): string {
  if (level === "low") return "Low";
  if (level === "medium") return "Medium";
  return "High";
}

function asNote(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 180) : "";
}

function asRevenueEstimate(value: unknown): string {
  const text = typeof value === "string" ? value.trim().slice(0, 40) : "";
  if (!text) return "";
  if (/\d{4}/.test(text) || /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text)) {
    return "60–90 days";
  }
  return text;
}

function asDemand(value: unknown): IdeaDemand | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const note = asNote(row.note);
  if (typeof row.needed !== "boolean" || !note) return null;
  return { needed: row.needed, note };
}

export function parseIdeaFit(
  value: unknown
): { reality: IdeaReality; demands: IdeaDemands } | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const realityRow =
    row.reality && typeof row.reality === "object"
      ? (row.reality as Record<string, unknown>)
      : null;
  const demandsRow =
    row.demands && typeof row.demands === "object"
      ? (row.demands as Record<string, unknown>)
      : null;
  if (!realityRow || !demandsRow) return null;

  const firstRevenueEstimate = asRevenueEstimate(realityRow.firstRevenueEstimate);
  const capitalIn = asNote(realityRow.capitalIn);
  const difficulty = realityRow.difficulty;
  const difficultyNote = asNote(realityRow.difficultyNote);
  if (
    !firstRevenueEstimate ||
    !capitalIn ||
    typeof difficulty !== "string" ||
    !DIFFICULTY_LEVELS.has(difficulty as DifficultyLevel) ||
    !difficultyNote
  ) {
    return null;
  }

  const demands = {} as IdeaDemands;
  for (const [key] of DEMAND_FIELDS) {
    const demand = asDemand(demandsRow[key]);
    if (!demand) return null;
    demands[key] = demand;
  }

  return {
    reality: {
      firstRevenueEstimate,
      capitalIn,
      difficulty: difficulty as DifficultyLevel,
      difficultyNote,
    },
    demands,
  };
}
