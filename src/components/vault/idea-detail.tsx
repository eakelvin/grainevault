"use client";

import { useEffect, useState } from "react";
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
  Loader2,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Link2,
  ListChecks,
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
import { DEMAND_FIELDS, difficultyLabel } from "@/lib/idea-fit";
import { Idea, routes } from "@/lib/types";
import { cn } from "@/lib/utils";

interface IdeaDetailProps {
  idea: Idea;
  onBack: () => void;
  onArchived?: () => void;
  onRestored?: () => void;
}

export function IdeaDetail({ idea, onBack, onArchived, onRestored }: IdeaDetailProps) {
  const { plan, rerunResearch } = useApp();
  const [current, setCurrent] = useState(idea);
  const [researching, setResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(idea);
  }, [idea]);

  const isArchived = Boolean(current.archivedAt);
  const isPro = plan === "pro";
  const hasDetailed = current.researchDepth === "pro";
  const showDetailed =
    isPro &&
    current.status === "ready" &&
    (hasDetailed ||
      current.competitors.length > 0 ||
      current.growthMetrics.length > 0 ||
      current.risks.length > 0 ||
      current.researchQuestions.length > 0 ||
      current.sources.length > 0);
  const retryInvestigation = current.investigationStatus === "failed";
  const investigating = current.investigationStatus === "investigating";
  const canRunDetailed =
    isPro &&
    current.status === "ready" &&
    !isArchived &&
    (!hasDetailed || retryInvestigation);
  const showProTeaser = plan === "free" && current.status === "ready";
  const actionSteps = showDetailed
    ? current.actionPlan
    : current.actionPlan.slice(0, 3);
  const scoreColor =
    current.readinessScore >= 75
      ? "text-emerald-400"
      : current.readinessScore >= 60
        ? "text-amber-400"
        : "text-slate-400";

  const handleDetailedResearch = async () => {
    setResearchError(null);
    setResearching(true);
    try {
      const next = await rerunResearch(current);
      setCurrent(next);
    } catch (error) {
      setResearchError(
        error instanceof Error
          ? error.message
          : "Couldn't run detailed research. Please try again."
      );
    } finally {
      setResearching(false);
    }
  };

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
                {current.title}
              </h1>
              <StatusBadge status={current.status} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {current.tags.map((tag) => (
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

      {current.description.trim() ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Concept
          </h2>
          <p className="leading-relaxed text-slate-300">{current.description}</p>
        </section>
      ) : null}

      {current.extractedText.trim() ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            {current.inputType === "voice"
              ? "From the voice note"
              : current.mediaPath && isPdfPath(current.mediaPath)
                ? "From the PDF"
                : "From the snapshot"}
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
            {current.extractedText}
          </p>
        </section>
      ) : null}

      {current.mediaPath && (
        <IdeaMedia path={current.mediaPath} inputType={current.inputType} />
      )}

      {/* Readiness Score */}
      <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Readiness Score
        </h2>
        <p className="mb-4 max-w-xl text-sm leading-relaxed text-slate-400">
          A research estimate of how clear, crowded, and validated this idea
          looks so far. It is not a prediction of success.
        </p>
        <div className="flex items-end gap-3">
          <span className={cn("text-7xl font-bold tabular-nums", scoreColor)}>
            {current.status === "analyzing" ? "—" : current.readinessScore}
          </span>
          {current.status === "ready" && (
            <span className="mb-3 text-2xl text-slate-500">/ 100</span>
          )}
        </div>
        {current.status === "ready" && (
          <p className="mt-2 text-sm text-slate-400">
            {current.readinessScore >= 75
              ? "Looks relatively well-formed compared with typical early ideas."
              : current.readinessScore >= 60
                ? "Some promise, with more still to validate."
                : current.readinessScore >= 50
                  ? "Formed enough to work from, with real gaps still open."
                  : "Early or under-specified — treat this as a starting point."}
          </p>
        )}
      </section>

      {/* Key Metrics */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: Target,
            label: "Total Addressable Market",
            value: current.marketSize,
            color: "text-indigo-400",
          },
          {
            icon: Users,
            label: "Primary Target Audience",
            value: current.targetAudience,
            color: "text-violet-400",
          },
          {
            icon: Building2,
            label: "Top Competitor",
            value: `${current.topCompetitor.name} — ${current.topCompetitor.strength}`,
            color: "text-amber-400",
          },
          {
            icon: TrendingUp,
            label: "Key Market Trend",
            value: current.keyTrend,
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

      {current.status === "ready" && current.reality && current.demands ? (
        <>
          <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Reality of the idea
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  First revenue
                </p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  {current.reality.firstRevenueEstimate}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Capital in
                </p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  {current.reality.capitalIn}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Difficulty
                </p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  {difficultyLabel(current.reality.difficulty)}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {current.reality.difficultyNote}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
              What this idea demands
            </h2>
            <ul className="mt-2 divide-y divide-slate-700/60">
              {DEMAND_FIELDS.map(([key, label]) => {
                const demand = current.demands?.[key];
                if (!demand) return null;
                return (
                  <li
                    key={key}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200">{label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">
                        {demand.note}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-slate-100">
                      {demand.needed ? "Yes" : "No"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      ) : null}

      {investigating && !researching ? (
        <section
          role="status"
          className="mb-8 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
            Investigating
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            GraineVault is answering the research questions. The working brief fills
            in when that investigation finishes.
          </p>
        </section>
      ) : null}

      {canRunDetailed ? (
        <section className="mb-8 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
            {retryInvestigation ? "Investigation did not finish" : "Deep research"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {retryInvestigation
              ? "The plan is saved. Retry so Astra can answer the research questions and complete the working brief."
              : "This idea has a snapshot. Run deep research for idea-specific questions, evidence-backed competitors, opportunities, risks, assumptions, sources, and a fuller action plan."}
          </p>
          {researchError ? (
            <p role="alert" className="mt-3 text-sm text-red-300">
              {researchError}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={researching}
            onClick={() => void handleDetailedResearch()}
            className="mt-4 h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700"
          >
            {researching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Researching…
              </>
            ) : retryInvestigation ? (
              "Retry investigation"
            ) : (
              "Run deep research"
            )}
          </Button>
        </section>
      ) : null}

      {showProTeaser ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Unlock the full brief
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Pro adds customized research questions, evidence-backed competitor
            comparisons, opportunities, risks, assumptions, sources, and
            actionable next steps.
          </p>
          <Link
            href={routes.pricing}
            className={cn(
              buttonVariants(),
              "mt-4 inline-flex rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700"
            )}
          >
            Upgrade to Pro
          </Link>
        </section>
      ) : null}

      {/* Growth Chart */}
      {showDetailed && current.growthMetrics.length > 0 && (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Projected Market Growth ($B)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={current.growthMetrics} barSize={40}>
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
      {showDetailed && current.competitors.length > 0 && (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Competitor Analysis
          </h2>
          <div className="space-y-4">
            {current.competitors.map((competitor) => (
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
                {competitor.evidence ? (
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    {competitor.evidence}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {showDetailed && current.researchQuestions.length > 0 ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Research questions
          </h2>
          <ul className="space-y-5">
            {current.researchQuestions.map((question) => {
              const finding = current.questionFindings.find(
                (item) => item.question.toLowerCase() === question.toLowerCase()
              );
              return (
                <li key={question}>
                  <div className="flex items-start gap-2 text-sm font-medium text-slate-200">
                    <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                    {question}
                  </div>
                  {finding ? (
                    <div className="mt-2 ml-6">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                        {finding.answer}
                      </p>
                      {finding.sources.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {finding.sources.map((source) => (
                            <li key={source.url}>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-300 hover:text-indigo-200"
                              >
                                {source.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : investigating ? (
                    <p className="mt-2 ml-6 text-xs text-slate-500">Investigating…</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {showDetailed && current.researchAreas.length > 0 ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Research areas
          </h2>
          <div className="flex flex-wrap gap-2">
            {current.researchAreas.map((area) => (
              <span
                key={area}
                className="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300"
              >
                {area}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {showDetailed && current.whyNow.trim() ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Why now
            </h2>
          </div>
          <p className="leading-relaxed text-slate-300">{current.whyNow}</p>
        </section>
      ) : null}

      {showDetailed && current.customerSegments.length > 0 ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Customer segments
          </h2>
          <ul className="space-y-2">
            {current.customerSegments.map((segment) => (
              <li key={segment} className="flex items-start gap-2 text-sm text-slate-300">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                {segment}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showDetailed && current.opportunities.length > 0 ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Market opportunities
          </h2>
          <ul className="space-y-3">
            {current.opportunities.map((opportunity) => (
              <li
                key={opportunity}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {opportunity}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showDetailed && current.risks.length > 0 ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Risks
          </h2>
          <ul className="space-y-3">
            {current.risks.map((risk) => (
              <li key={risk} className="flex items-start gap-2 text-sm text-slate-300">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                {risk}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showDetailed && current.assumptions.length > 0 ? (
        <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Assumptions to prove
          </h2>
          <ul className="space-y-3">
            {current.assumptions.map((assumption) => (
              <li
                key={assumption}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                {assumption}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Action Plan */}
      {actionSteps.length > 0 && (
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Suggested Action Plan
          </h2>
          <ol className="space-y-3">
            {actionSteps.map((step, i) => (
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

      {showDetailed && current.sources.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Sources
          </h2>
          <ul className="space-y-2">
            {current.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 text-sm text-indigo-300 hover:text-indigo-200"
                >
                  <Link2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {source.title}
                    <span className="mt-0.5 block break-all text-xs text-slate-500">
                      {source.url}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </motion.div>
  );
}
