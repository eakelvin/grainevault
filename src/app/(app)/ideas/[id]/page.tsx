"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { IdeaDetail } from "@/components/idea-detail";
import { useApp } from "@/context/app-context";
import { routes } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getIdea } = useApp();
  const idea = getIdea(id);

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

  return (
    <IdeaDetail idea={idea} onBack={() => router.push(routes.vault)} />
  );
}
