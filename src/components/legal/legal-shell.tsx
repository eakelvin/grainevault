"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { UserAvatarMenu, useCurrentUser } from "@/components/auth/user-avatar-menu";
import { BrandLogo } from "@/components/landing/brand-logo";
import { SiteFooter } from "@/components/landing/site-footer";
import { LEGAL_UPDATED } from "@/lib/legal";
import { withNext } from "@/lib/auth-redirect";
import { routes } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LegalShell({
  title,
  description,
  children,
  showUpdated = true,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  showUpdated?: boolean;
}) {
  const user = useCurrentUser();
  const isSignedIn = Boolean(user);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
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

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 pb-16 pt-8 md:px-8 md:pt-12">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
          {description}
        </p>
        {showUpdated ? (
          <p className="mt-4 text-xs text-slate-500">Last updated {LEGAL_UPDATED}</p>
        ) : null}
        <article className="mt-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm md:p-10">
          {children}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
