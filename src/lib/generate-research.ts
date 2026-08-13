import {
  AUDIENCES,
  COMPETITOR_NAMES,
  TAG_POOL,
  TRENDS,
} from "./constants";
import { Idea, InputType } from "./types";

function pick<T>(arr: T[], count = 1): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomMarketSize(): string {
  const sizes = ["$420M", "$780M", "$1.2B", "$2.4B", "$3.8B", "$5.1B"];
  return pick(sizes)[0];
}

function randomGrowthBase(): number {
  return Math.round((Math.random() * 4 + 0.8) * 10) / 10;
}

export function generateResearchPacket(
  title: string,
  description: string,
  inputType: InputType
): Omit<Idea, "id" | "createdAt" | "status"> {
  const tags = pick(TAG_POOL, 3);
  const competitors = pick(COMPETITOR_NAMES, 3).map((name) => ({
    name,
    strength: pick([
      "Strong brand recognition",
      "Large existing user base",
      "Deep vertical expertise",
      "Aggressive pricing strategy",
      "Excellent customer support",
    ])[0],
    weakness: pick([
      "Legacy technology stack",
      "Poor mobile experience",
      "Limited API capabilities",
      "Slow feature release cycle",
      "High churn in SMB segment",
    ])[0],
  }));

  const base = randomGrowthBase();
  const growthMetrics = ["2025", "2026", "2027", "2028"].map((year, i) => ({
    year,
    value: Math.round((base + i * (0.5 + Math.random() * 0.8)) * 10) / 10,
  }));

  const readinessScore = Math.floor(Math.random() * 35) + 55;
  const shortDescription =
    description.length > 80 ? description.slice(0, 77) + "..." : description;

  return {
    title,
    description,
    shortDescription,
    tags,
    inputType,
    readinessScore,
    marketSize: randomMarketSize(),
    targetAudience: pick(AUDIENCES)[0],
    topCompetitor: {
      name: competitors[0].name,
      strength: competitors[0].strength,
    },
    keyTrend: pick(TRENDS)[0],
    competitors,
    growthMetrics,
    actionPlan: [
      "Conduct 15 customer discovery interviews",
      "Build a clickable prototype and run usability tests",
      "Define MVP scope and secure 2 design partner commitments",
    ],
  };
}
