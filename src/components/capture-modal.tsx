"use client";

import { useState } from "react";
import { FileText, Mic, ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";

export function CaptureModal() {
  const { captureOpen, setCaptureOpen, addIdea } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setIsSubmitting(false);
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setCaptureOpen(false);
    reset();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await addIdea(title.trim(), description.trim());
      reset();
    } catch (submitError) {
      setIsSubmitting(false);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Couldn't save this idea. Please try again."
      );
    }
  };

  return (
    <Dialog open={captureOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700/60 bg-slate-900/95 text-slate-200 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Capture New Idea
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="text">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/60">
            <TabsTrigger
              value="text"
              className="gap-1.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
            >
              <FileText className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger
              value="voice"
              disabled
              className="gap-1.5"
            >
              <Mic className="h-4 w-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger
              value="snapshot"
              disabled
              className="gap-1.5"
            >
              <ImageIcon className="h-4 w-4" />
              Snapshot
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="idea-title"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Title
              </label>
              <Input
                id="idea-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your idea a name..."
                className="border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500"
              />
            </div>

            <TabsContent value="text" className="mt-0">
              <label
                htmlFor="idea-description"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Description
              </label>
              <Textarea
                id="idea-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your startup idea in detail..."
                rows={5}
                className="border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500"
              />
            </TabsContent>
          </div>
        </Tabs>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim() || isSubmitting}
          className="mt-2 w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-5 text-white hover:from-indigo-600 hover:to-violet-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending to Vault…
            </>
          ) : (
            "Send to Vault"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
