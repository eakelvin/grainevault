"use client";

import { motion } from "framer-motion";
import { Plus, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdeaCard } from "@/components/vault/idea-card";
import { CaptureModal } from "@/components/vault/capture-modal";
import { useApp } from "@/context/app-context";
import { FREE_IDEA_LIMIT } from "@/lib/billing";

export function Dashboard() {
  const { ideas, ideaSlotCount, ideasLoading, ideasError, setCaptureOpen, plan } =
    useApp();
  const usageLabel =
    plan === "pro"
      ? `${ideas.length} idea${ideas.length !== 1 ? "s" : ""} in vault · unlimited Pro`
      : `${ideaSlotCount} of ${FREE_IDEA_LIMIT} free ideas used`;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">The Vault</h1>
          <p className="mt-1 text-slate-400">
            {ideasLoading
              ? "Loading your vault…"
              : `${usageLabel} · AI agents researching in the background`}
          </p>
        </div>
        <Button
          onClick={() => setCaptureOpen(true)}
          className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-5 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700"
        >
          <Plus className="h-5 w-5" />
          Capture Idea
        </Button>
      </div>

      {ideasError && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {ideasError}
        </p>
      )}

      {ideasLoading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
        </div>
      ) : ideas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 py-24 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60">
            <Lightbulb className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">No ideas yet</h3>
          <p className="mb-6 max-w-sm text-sm text-slate-400">
            Capture your first startup idea and let our AI agents research it for
            you.
          </p>
          <Button
            onClick={() => setCaptureOpen(true)}
            className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
          >
            <Plus className="h-4 w-4" />
            Capture Idea
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea, index) => (
            <IdeaCard key={idea.id} idea={idea} index={index} />
          ))}
        </div>
      )}

      <CaptureModal />
    </>
  );
}
