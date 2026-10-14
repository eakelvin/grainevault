"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/landing/brand-logo";
import { SiteFooter } from "@/components/landing/site-footer";
import { routes } from "@/lib/types";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  backHref?: string;
}

export function AuthShell({
  title,
  description,
  children,
  backHref = routes.home,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        <aside className="relative hidden w-full flex-col justify-between border-r border-slate-700/60 bg-slate-900/40 p-10 backdrop-blur-sm lg:flex lg:max-w-md xl:max-w-lg xl:p-14">
          <Link
            href={backHref}
            className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div>
            <div className="mb-8">
              <BrandLogo size={44} wordmarkClassName="text-xl" />
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
              {title}
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-slate-400">
              {description}
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Research on autopilot · Secure idea repository
          </p>
        </aside>

        <div className="relative flex flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 md:px-10">
          <div className="mb-8 flex items-center justify-between lg:mb-0 lg:justify-end">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="lg:hidden">
              <BrandLogo size={32} />
            </div>
            <div className="w-14 lg:hidden" />
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            {children}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
