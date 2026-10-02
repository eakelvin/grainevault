"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Archive } from "lucide-react";
import { IdeaCard } from "@/components/vault/idea-card";
import { RestoreIdeaButton } from "@/components/vault/restore-idea-button";
import { fetchArchivedIdeas } from "@/lib/ideas";
import { FREE_IDEA_LIMIT } from "@/lib/billing";
import { useApp } from "@/context/app-context";
import type { Idea } from "@/lib/types";
import { routes } from "@/lib/types";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ArchiveView() {
  const router = useRouter();
  const { plan, ideaSlotCount } = useApp();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setIdeas(await fetchArchivedIdeas());
    } catch {
      setIdeas([]);
      setError("Couldn't load your archive. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleRestored = (idea: Idea) => {
    setIdeas((prev) => prev.filter((item) => item.id !== idea.id));
    router.push(routes.vault);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Archive</h1>
        <p className="mt-1 text-slate-400">
          {plan === "free"
            ? `Archived ideas still count toward your ${FREE_IDEA_LIMIT} free slots (${ideaSlotCount} used).`
            : "Ideas you’ve moved out of the vault. Restore any of them anytime."}
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
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
            <Archive className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">
            Nothing archived yet
          </h3>
          <p className="mb-6 max-w-sm text-sm text-slate-400">
            Archive ideas from your vault to tidy up without freeing a free-plan
            slot.
          </p>
          <Link
            href={routes.vault}
            className={cn(
              buttonVariants(),
              "rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700"
            )}
          >
            Back to vault
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea, index) => (
            <div key={idea.id} className="relative">
              <IdeaCard idea={idea} index={index} archived />
              <div className="mt-3 flex justify-end">
                <RestoreIdeaButton
                  idea={idea}
                  onRestored={() => handleRestored(idea)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {plan === "free" && ideaSlotCount >= FREE_IDEA_LIMIT ? (
        <p className="mt-8 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
          You’ve used all {FREE_IDEA_LIMIT} free ideas.{" "}
          <Link href={routes.pricing} className="font-medium underline-offset-2 hover:underline">
            Upgrade to Pro
          </Link>{" "}
          to research more.
        </p>
      ) : null}
    </div>
  );
}
