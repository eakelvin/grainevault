"use client";

import { Mail, TrendingUp, Lightbulb } from "lucide-react";
import { useApp } from "@/context/app-context";
import { StatusBadge } from "@/components/status-badge";

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
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Settings</h1>
        <p className="mt-1 text-slate-400">Manage your vault preferences</p>
      </div>
      <div className="space-y-4">
        {[
          { label: "Email Notifications", desc: "Weekly digest and research updates" },
          { label: "AI Research Depth", desc: "Standard market analysis" },
          { label: "Export Format", desc: "PDF reports" },
        ].map((setting) => (
          <div
            key={setting.label}
            className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm"
          >
            <div>
              <p className="font-medium text-white">{setting.label}</p>
              <p className="text-sm text-slate-400">{setting.desc}</p>
            </div>
            <div className="h-6 w-11 rounded-full bg-indigo-500/30 p-0.5">
              <div className="h-5 w-5 translate-x-5 rounded-full bg-indigo-400 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
