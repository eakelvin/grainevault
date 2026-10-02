"use client";

import { useState } from "react";
import { ArchiveRestore, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import type { Idea } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RestoreIdeaButton({
  idea,
  onRestored,
  iconOnly = false,
  className,
}: {
  idea: Idea;
  onRestored?: () => void;
  iconOnly?: boolean;
  className?: string;
}) {
  const { restoreIdea } = useApp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRestore = async () => {
    setError(null);
    setPending(true);
    try {
      await restoreIdea(idea);
      onRestored?.();
    } catch {
      setError("Couldn't restore this idea. Please try again.");
      setPending(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <Button
        type="button"
        variant={iconOnly ? "outline" : "secondary"}
        size={iconOnly ? "icon" : "default"}
        disabled={pending}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void handleRestore();
        }}
        className={cn(
          iconOnly
            ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-indigo-300"
            : "gap-2 border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-white"
        )}
        aria-label="Restore idea"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArchiveRestore className="h-4 w-4" />
        )}
        {iconOnly ? null : "Restore"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
