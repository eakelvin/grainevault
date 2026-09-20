"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
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

export function DeleteIdeaButton({
  idea,
  onDeleted,
  iconOnly = false,
  className,
}: {
  idea: Idea;
  onDeleted?: () => void;
  iconOnly?: boolean;
  className?: string;
}) {
  const { removeIdea } = useApp();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      await removeIdea(idea);
      setOpen(false);
      onDeleted?.();
    } catch {
      setError("Couldn't delete this idea. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={iconOnly ? "outline" : "destructive"}
        size={iconOnly ? "icon" : "default"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setError(null);
          setOpen(true);
        }}
        className={cn(
          iconOnly
            ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-red-300"
            : "gap-2",
          className
        )}
        aria-label="Delete idea"
      >
        <Trash2 className="h-4 w-4" />
        {iconOnly ? null : "Delete"}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(open) => {
          if (deleting) return;
          if (!open) setOpen(false);
        }}
      >
        <DialogContent
          showCloseButton={!deleting}
          className="border-slate-700/60 bg-slate-900/95 text-slate-200 backdrop-blur-xl sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Delete this idea?</DialogTitle>
            <DialogDescription className="text-slate-400">
              {idea.title} will be removed from your vault. This cannot be undone.
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
              disabled={deleting}
              onClick={() => setOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleDelete()}
              className="gap-2"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
