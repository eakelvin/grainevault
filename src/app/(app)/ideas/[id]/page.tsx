"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IdeaDetail } from "@/components/vault/idea-detail";
import { useApp } from "@/context/app-context";
import { ideaSlug } from "@/lib/idea-slug";
import { fetchIdeaById, fetchIdeaBySlug } from "@/lib/ideas";
import { routes } from "@/lib/types";
import type { Idea } from "@/lib/types";
import { Button } from "@/components/ui/button";

const IDEA_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawSlug } = use(params);
  const slug = decodeURIComponent(rawSlug);
  const router = useRouter();
  const { ideas, ideasLoading } = useApp();
  const fromContext = ideas.find((idea) => ideaSlug(idea.title) === slug);
  const [idea, setIdea] = useState<Idea | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (IDEA_ID.test(slug)) {
        setLoading(true);
        try {
          const row = await fetchIdeaById(slug);
          if (cancelled) return;
          if (row) {
            router.replace(routes.idea(row.title));
            return;
          }
          setIdea(null);
        } catch {
          if (!cancelled) setIdea(null);
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      if (fromContext) {
        setIdea(fromContext);
        setLoading(false);
        return;
      }
      if (ideasLoading) return;

      setLoading(true);
      try {
        const row = await fetchIdeaBySlug(slug);
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
  }, [fromContext, ideasLoading, router, slug]);

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
