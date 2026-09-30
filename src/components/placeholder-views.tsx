"use client";

import Link from "next/link";
import { Mail, TrendingUp, Lightbulb } from "lucide-react";
import { useApp } from "@/context/app-context";
import { StatusBadge } from "@/components/vault/status-badge";
import { FREE_IDEA_LIMIT } from "@/lib/billing";
import { routes } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WeeklyDigest() {
  const { ideas } = useApp();
  const readyIdeas = ideas.filter((i) => i.status === "ready");

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

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">
        <Mail className="h-8 w-8 shrink-0 text-indigo-400" />
        <div>
          <p className="font-medium text-white">Week of Aug 11, 2025</p>
          <p className="text-sm text-slate-400">
            {readyIdeas.length} ideas analyzed · {ideas.filter((i) => i.status === "analyzing").length} in progress
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {ideas.slice(0, 3).map((idea) => (
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
  const { ideas, plan } = useApp();
  const used = ideas.length;
  const atLimit = plan === "free" && used >= FREE_IDEA_LIMIT;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Settings</h1>
        <p className="mt-1 text-slate-400">Plan and vault preferences</p>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-300">
              {plan === "pro" ? "Pro" : "Free"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">Your plan</h2>
            <p className="mt-2 text-sm text-slate-400">
              {plan === "pro"
                ? "Unlimited active ideas."
                : `${used} of ${FREE_IDEA_LIMIT} active ideas used. Delete an idea to free a slot, or upgrade.`}
            </p>
          </div>
          {plan === "free" && (
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
        <p className="mt-4 text-xs text-slate-500">
          Stripe checkout for monthly and yearly Pro is next. The 3-idea free
          limit is already enforced.
        </p>
      </div>
    </div>
  );
}
