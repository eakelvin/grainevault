"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IdeaDetail } from "@/components/vault/idea-detail";
import { useApp } from "@/context/app-context";
import { fetchIdeaById } from "@/lib/ideas";
import { routes } from "@/lib/types";
import type { Idea } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getIdea, ideasLoading } = useApp();
  const fromContext = getIdea(id);
  const [idea, setIdea] = useState<Idea | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (fromContext) {
        setIdea(fromContext);
        setLoading(false);
        return;
      }
      if (ideasLoading) return;

      setLoading(true);
      try {
        const row = await fetchIdeaById(id);
        if (!cancelled) setIdea(row);
      } catch {
        if (!cancelled) setIdea(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [fromContext, id, ideasLoading]);

  if (ideasLoading || loading || idea === undefined) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
        <h1 className="mb-2 text-xl font-semibold text-white">Idea not found</h1>
        <p className="mb-6 text-sm text-slate-400">
          This idea may have been removed or the link is invalid.
        </p>
        <Button
          onClick={() => router.push(routes.vault)}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
        >
          Back to Vault
        </Button>
      </div>
    );
  }

  const backHref = idea.archivedAt ? routes.archive : routes.vault;

  return (
    <IdeaDetail
      idea={idea}
      onBack={() => router.push(backHref)}
      onArchived={() => router.push(routes.vault)}
      onRestored={() => router.push(routes.vault)}
    />
  );
}
