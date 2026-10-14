"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { UserAvatarMenu, useCurrentUser } from "@/components/auth/user-avatar-menu";
import { BrandLogo } from "@/components/landing/brand-logo";
import { SiteFooter } from "@/components/landing/site-footer";
import { withNext } from "@/lib/auth-redirect";
import { routes } from "@/lib/types";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Sparkles,
    title: "AI Research Agent",
    description: "Passive market validation on every idea you capture.",
  },
  {
    icon: TrendingUp,
    title: "Growth Projections",
    description: "4-year Total Addressable Market (TAM) forecasts and trend analysis at a glance.",
  },
  {
    icon: Shield,
    title: "Competitor Intel",
    description: "Strengths, weaknesses, and positioning mapped automatically.",
  },
  {
    icon: Zap,
    title: "Readiness Scores",
    description:
      "A research estimate of how formed an idea looks — not a forecast of success. Know when an idea is ready to pursue — or needs more work.",
  },
];

export function LandingPage() {
  const user = useCurrentUser();
  const isSignedIn = Boolean(user);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <Link href={routes.home} className="flex items-center">
          <BrandLogo wordmarkClassName="text-lg" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={routes.pricing}
            className="text-sm text-slate-300 transition-colors hover:text-white"
          >
            Pricing
          </Link>
          {user === undefined ? (
            <div className="size-8" aria-hidden />
          ) : isSignedIn ? (
            <UserAvatarMenu compact user={user} />
          ) : (
            <Link
              href={withNext(routes.login, routes.vault)}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
              )}
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-16 text-center md:px-12 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered idea research and validation
          </span>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl md:leading-[1.1]">
            Turn Ideas Into{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Research-Backed Opportunities.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 md:text-xl">
            {/* Capture ideas by text, voice, or snapshot. Our AI agent researches */}
            {/* market size, competitors, and trends — so you can focus on building. */}

            Stop letting good ideas collect digital dust.
            Capture an idea in seconds. GraineVault researches the market, competitors, customers, trends, and risks — so you can decide what is actually worth pursuing.
          </p>

          <Link
            href={isSignedIn ? routes.vault : withNext(routes.signup, routes.vault)}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 text-base font-medium text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700"
            )}
          >
            Open Your Vault
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 text-left backdrop-blur-sm transition-colors hover:border-slate-600 hover:bg-slate-800/60"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
                <feature.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="mb-1 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </section>
      <SiteFooter />
    </div>
  );
}
