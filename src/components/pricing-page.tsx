"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { UserAvatarMenu, useCurrentUser } from "@/components/auth/user-avatar-menu";
import {
  FREE_IDEA_LIMIT,
  PRO_MONTHLY_USD,
  PRO_YEARLY_USD,
  formatUsd,
  type BillingInterval,
} from "@/lib/billing";
import { routes } from "@/lib/types";
import { cn } from "@/lib/utils";

const freeFeatures = [
  `${FREE_IDEA_LIMIT} active research projects`,
  "Text, voice, and snapshot capture",
  "AI market research on each idea",
];

const proFeatures = [
  "Unlimited active ideas",
  "Everything in Free",
  "Priority when research demand is high",
];

export function PricingPage() {
  const user = useCurrentUser();
  const isSignedIn = Boolean(user);
  const [interval, setInterval] = useState<BillingInterval>("month");
  const yearly = interval === "year";

  const proCtaHref = isSignedIn
    ? `${routes.settings}?upgrade=1`
    : `${routes.signup}?next=${encodeURIComponent(routes.pricing)}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <Link href={routes.home} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">Ideas Vault</span>
        </Link>
        {user === undefined ? (
          <div className="size-8" aria-hidden />
        ) : isSignedIn ? (
          <UserAvatarMenu compact user={user} />
        ) : (
          <Link
            href={routes.login}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
            )}
          >
            Sign In
          </Link>
        )}
      </nav>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-10 md:px-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white md:text-5xl">
            Research more ideas as you grow
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Start with {FREE_IDEA_LIMIT} active projects on us. Upgrade when the
            vault needs room for everything you want to validate.
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-xl border border-slate-700/60 bg-slate-800/60 p-1">
            <button
              type="button"
              onClick={() => setInterval("month")}
              aria-pressed={!yearly}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                interval === "month"
                  ? "bg-indigo-500 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval("year")}
              aria-pressed={yearly}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                interval === "year"
                  ? "bg-indigo-500 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm md:p-8">
            <p className="text-sm font-medium text-indigo-300">Free</p>
            <p className="mt-3 text-4xl font-bold text-white">$0</p>
            <p className="mt-1 text-sm text-slate-400">
              {FREE_IDEA_LIMIT} active ideas in your vault
            </p>
            <ul className="mt-6 space-y-3">
              {freeFeatures.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={isSignedIn ? routes.vault : routes.signup}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-8 h-11 w-full rounded-xl border-slate-600 bg-transparent text-white hover:bg-slate-800"
              )}
            >
              {isSignedIn ? "Open your vault" : "Start free"}
            </Link>
          </article>

          <article className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-6 backdrop-blur-sm md:p-8">
            <p className="text-sm font-medium text-indigo-300">Pro</p>
            <p className="mt-3 text-4xl font-bold text-white">
              {formatUsd(PRO_MONTHLY_USD)}
              <span className="text-lg font-medium text-slate-400">/mo</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {yearly
                ? `${formatUsd(PRO_YEARLY_USD)} billed yearly`
                : "Billed monthly. Unlimited active ideas."}
            </p>
            <ul className="mt-6 space-y-3">
              {proFeatures.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={proCtaHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 h-11 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700"
              )}
            >
              {isSignedIn ? "Upgrade to Pro" : "Start Pro"}
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
