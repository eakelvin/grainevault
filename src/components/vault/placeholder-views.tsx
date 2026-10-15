"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { Mail, TrendingUp, Lightbulb } from "lucide-react";
import { useApp } from "@/context/app-context";
import type { Idea } from "@/lib/types";
import { StatusBadge } from "@/components/vault/status-badge";
import { BillingReturn } from "@/components/billing/billing-return";
import { PortalButton } from "@/components/billing/portal-button";
import { FREE_IDEA_LIMIT } from "@/lib/billing";
import { legalLinks } from "@/lib/legal";
import { routes } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function weekOfSubmission(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysFromMonday);
  return start;
}

function weekLabel(start: Date): string {
  return `Week of ${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function WeeklyDigest() {
  const { ideas } = useApp();
  const weeks = useMemo(() => {
    const groups = new Map<number, { start: Date; ideas: Idea[] }>();
    for (const idea of ideas) {
      const start = weekOfSubmission(idea.createdAt);
      if (!start) continue;
      const key = start.getTime();
      const group = groups.get(key);
      if (group) group.ideas.push(idea);
      else groups.set(key, { start, ideas: [idea] });
    }
    return [...groups.values()].sort((a, b) => b.start.getTime() - a.start.getTime());
  }, [ideas]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Weekly Digest
        </h1>
        <p className="mt-1 text-slate-400">
          Your AI research summary for the week
        </p>
      </div>

      {weeks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-700/60 px-6 py-16 text-center text-sm text-slate-400">
          Ideas you capture show up here, grouped by the week you submitted them.
        </p>
      ) : (
        <div className="space-y-8">
          {weeks.map((week) => {
            const ready = week.ideas.filter((idea) => idea.status === "ready").length;
            const analyzing = week.ideas.filter((idea) => idea.status === "analyzing").length;
            return (
              <section key={week.start.getTime()}>
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">
                  <Mail className="h-8 w-8 shrink-0 text-indigo-400" />
                  <div>
                    <p className="font-medium text-white">{weekLabel(week.start)}</p>
                    <p className="text-sm text-slate-400">
                      {ready} ideas analyzed · {analyzing} in progress
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {week.ideas.map((idea) => (
                    <div
                      key={idea.id}
                      className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-white">{idea.title}</h3>
                        <StatusBadge status={idea.status} />
                      </div>
                      <p className="mb-3 text-sm text-slate-400">{idea.shortDescription}</p>
                      {idea.status === "ready" && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <TrendingUp className="h-4 w-4" />
                            Score: {idea.readinessScore}
                          </span>
                          <span className="text-slate-500">TAM: {idea.marketSize}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BoardView() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Board</h1>
        <p className="mt-1 text-slate-400">Collaborate with your team on ideas</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60">
          <Lightbulb className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">Team Board</h3>
        <p className="max-w-sm text-sm text-slate-400">
          Invite teammates to review and vote on ideas. Coming soon in the full
          release.
        </p>
      </div>
    </div>
  );
}

export function SettingsView() {
  const { ideaSlotCount, plan, billingInterval } = useApp();
  const used = ideaSlotCount;
  const atLimit = plan === "free" && used >= FREE_IDEA_LIMIT;
  const intervalLabel =
    billingInterval === "year"
      ? "Billed yearly."
      : billingInterval === "month"
        ? "Billed monthly."
        : "";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Settings</h1>
        <p className="mt-1 text-slate-400">Plan and vault preferences</p>
      </div>

      <Suspense fallback={null}>
        <BillingReturn />
      </Suspense>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-300">
              {plan === "pro" ? "Pro" : "Free"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">Your plan</h2>
            <p className="mt-2 text-sm text-slate-400">
              {plan === "pro"
                ? `Unlimited ideas.${intervalLabel ? ` ${intervalLabel}` : ""} Change or cancel anytime in the billing portal.`
                : `${used} of ${FREE_IDEA_LIMIT} free ideas used (including archived). Upgrade for unlimited ideas and detailed research.`}
            </p>
          </div>
          {plan === "pro" ? (
            <PortalButton className="border-slate-600 bg-transparent text-white hover:bg-slate-800">
              Manage billing
            </PortalButton>
          ) : (
            <Link
              href={routes.pricing}
              className={cn(
                buttonVariants(),
                "rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700"
              )}
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
        {plan === "free" && (
          <div className="mt-5">
            <div className="h-2 overflow-hidden rounded-full bg-slate-700">
              <div
                className={cn(
                  "h-full rounded-full",
                  atLimit ? "bg-amber-400" : "bg-indigo-400"
                )}
                style={{
                  width: `${Math.min(100, (used / FREE_IDEA_LIMIT) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white">Policies</h2>
        <p className="mt-2 text-sm text-slate-400">
          How the product works, and how your account and ideas are handled.
        </p>
        <nav aria-label="Policies" className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-indigo-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
