"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Target,
  TrendingUp,
  Users,
  Building2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/vault/status-badge";
import { IdeaMedia } from "@/components/vault/idea-media";
import { ArchiveIdeaButton } from "@/components/vault/archive-idea-button";
import { RestoreIdeaButton } from "@/components/vault/restore-idea-button";
import { useApp } from "@/context/app-context";
import { isPdfPath } from "@/lib/idea-draft";
import { Idea, routes } from "@/lib/types";
import { cn } from "@/lib/utils";

interface IdeaDetailProps {
  idea: Idea;
  onBack: () => void;
  onArchived?: () => void;
  onRestored?: () => void;
}

export function IdeaDetail({ idea, onBack, onArchived, onRestored }: IdeaDetailProps) {
  const { plan } = useApp();
  const isArchived = Boolean(idea.archivedAt);
  const scoreColor =
    idea.readinessScore >= 75
      ? "text-emerald-400"
      : idea.readinessScore >= 60
        ? "text-amber-400"
        : "text-slate-400";
  const isEarlyStage =
    idea.status === "ready" && idea.readinessScore < 60;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mt-0.5 shrink-0 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                {idea.title}
              </h1>
              <StatusBadge status={idea.status} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {idea.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pl-12 sm:pl-0">
          <Button
            variant="outline"
            size="icon"
            className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Download className="h-4 w-4" />
          </Button>
          {/* {isArchived ? (
            <RestoreIdeaButton idea={idea} onRestored={onRestored} />
          ) : (
            <ArchiveIdeaButton idea={idea} onArchived={onArchived} />
          )} */}
        </div>
      </div>

      {isArchived ? (
        <p
          role="status"
          className="mb-6 rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3 text-sm text-slate-400"
        >
          This idea is archived
          {plan === "free"
            ? " and still counts toward your free idea limit."
            : "."}{" "}
          Restore it to bring it back into your vault.
        </p>
      ) : null}

      {/* Concept */}
      <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Concept
        </h2>
        <p className="leading-relaxed text-slate-300">{idea.description}</p>
      </section>

      {idea.extractedText.trim() ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            {idea.inputType === "voice"
              ? "From the voice note"
              : idea.mediaPath && isPdfPath(idea.mediaPath)
                ? "From the PDF"
                : "From the snapshot"}
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
            {idea.extractedText}
          </p>
        </section>
      ) : null}

      {idea.mediaPath && (
        <IdeaMedia path={idea.mediaPath} inputType={idea.inputType} />
      )}

      {/* Readiness Score */}
      <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Readiness Score
        </h2>
        <div className="flex items-end gap-3">
          <span className={cn("text-7xl font-bold tabular-nums", scoreColor)}>
            {idea.status === "analyzing" ? "—" : idea.readinessScore}
          </span>
          {idea.status === "ready" && (
            <span className="mb-3 text-2xl text-slate-500">/ 100</span>
          )}
        </div>
        {idea.status === "ready" && (
          <>
            <p className="mt-2 text-sm text-slate-400">
              {idea.readinessScore >= 75
                ? "Strong market signals — worth pursuing."
                : idea.readinessScore >= 60
                  ? "Promising, but validate further before committing."
                  : "Early stage — more research recommended."}
            </p>
            {isEarlyStage && plan === "free" && (
              <Link
                href={routes.pricing}
                className={cn(
                  buttonVariants(),
                  "mt-4 inline-flex rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700"
                )}
              >
                Upgrade to Pro for deeper research
              </Link>
            )}
          </>
        )}
      </section>

      {/* Key Metrics */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: Target,
            label: "Total Addressable Market",
            value: idea.marketSize,
            color: "text-indigo-400",
          },
          {
            icon: Users,
            label: "Primary Target Audience",
            value: idea.targetAudience,
            color: "text-violet-400",
          },
          {
            icon: Building2,
            label: "Top Competitor",
            value: `${idea.topCompetitor.name} — ${idea.topCompetitor.strength}`,
            color: "text-amber-400",
          },
          {
            icon: TrendingUp,
            label: "Key Market Trend",
            value: idea.keyTrend,
            color: "text-emerald-400",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center gap-2">
              <metric.icon className={cn("h-4 w-4", metric.color)} />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {metric.label}
              </span>
            </div>
            <p className="text-sm font-medium leading-snug text-slate-200">
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      {/* Growth Chart */}
      {idea.growthMetrics.length > 0 && (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Projected Market Growth ($B)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={idea.growthMetrics} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value) => [`$${value}B`, "Market Size"]}
                />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Competitors */}
      {idea.competitors.length > 0 && (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Competitor Analysis
          </h2>
          <div className="space-y-4">
            {idea.competitors.map((competitor) => (
              <div
                key={competitor.name}
                className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4"
              >
                <h3 className="mb-3 font-semibold text-white">
                  {competitor.name}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <span className="text-xs font-medium text-emerald-400">
                        Strength
                      </span>
                      <p className="text-sm text-slate-300">
                        {competitor.strength}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <div>
                      <span className="text-xs font-medium text-amber-400">
                        Weakness
                      </span>
                      <p className="text-sm text-slate-300">
                        {competitor.weakness}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Plan */}
      {idea.actionPlan.length > 0 && (
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Suggested Action Plan
          </h2>
          <ol className="space-y-3">
            {idea.actionPlan.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-400">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-sm text-slate-300">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </motion.div>
  );
}
