"use client";

import { useState } from "react";
import { Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/context/app-context";
import type { Idea } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ArchiveIdeaButton({
  idea,
  onArchived,
  iconOnly = false,
  className,
}: {
  idea: Idea;
  onArchived?: () => void;
  iconOnly?: boolean;
  className?: string;
}) {
  const { archiveIdea, plan } = useApp();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArchive = async () => {
    setError(null);
    setPending(true);
    try {
      await archiveIdea(idea);
      setOpen(false);
      onArchived?.();
    } catch {
      setError("Couldn't archive this idea. Please try again.");
      setPending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={iconOnly ? "outline" : "secondary"}
        size={iconOnly ? "icon" : "default"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setError(null);
          setOpen(true);
        }}
        className={cn(
          iconOnly
            ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-indigo-300"
            : "gap-2 border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-white",
          className
        )}
        aria-label="Archive idea"
      >
        <Archive className="h-4 w-4" />
        {iconOnly ? null : "Archive"}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (pending) return;
          if (!nextOpen) setOpen(false);
        }}
      >
        <DialogContent
          showCloseButton={!pending}
          className="border-slate-700/60 bg-slate-900/95 text-slate-200 backdrop-blur-xl sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Archive this idea?</DialogTitle>
            <DialogDescription className="text-slate-400">
              {idea.title} will move out of your vault
              {plan === "free"
                ? ". On Free, archived ideas still count toward your 3-idea limit."
                : ". You can restore it from Archive anytime."}
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          ) : null}
          <DialogFooter className="border-slate-700/60 bg-transparent">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => void handleArchive()}
              className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
