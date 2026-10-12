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
import { Button, buttonVariants } from "@/components/ui/button";
import { SnapshotPicker } from "@/components/vault/snapshot-picker";
import { VoiceRecorder } from "@/components/vault/voice-recorder";
import { useApp } from "@/context/app-context";
import { toIdeaDraft } from "@/lib/idea-draft";
import { FREE_IDEA_LIMIT } from "@/lib/billing";
import { routes } from "@/lib/types";
import type { InputType } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

function tabToInputType(tab: string): InputType {
  if (tab === "voice" || tab === "image") return tab;
  return "text";
}

export function CaptureModal() {
  const { captureOpen, setCaptureOpen, addIdea, canCapture, ideaSlotCount } =
    useApp();
  const [activeTab, setActiveTab] = useState("text");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setActiveTab("text");
    setTitle("");
    setDescription("");
    setAudioBlob(null);
    setImageFile(null);
    setIsSubmitting(false);
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setCaptureOpen(false);
    reset();
  };

  const inputType = tabToInputType(activeTab);
  const canSubmit =
    Boolean(title.trim()) &&
    !isSubmitting &&
    (inputType !== "text" || Boolean(description.trim())) &&
    (inputType !== "voice" || Boolean(audioBlob)) &&
    (inputType !== "image" || Boolean(imageFile));

  const handleSubmit = async () => {
    if (!canSubmit || !canCapture) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const draft = await toIdeaDraft({
        title,
        description: inputType === "text" ? description : "",
        inputType,
        file: inputType === "voice" ? audioBlob : inputType === "image" ? imageFile : null,
      });
      await addIdea(draft);
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
            {canCapture ? "Capture New Idea" : "Free vault is full"}
          </DialogTitle>
        </DialogHeader>

        {!canCapture ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              You have used {ideaSlotCount} of {FREE_IDEA_LIMIT} free ideas
              (archived ideas still count). Upgrade to Pro for unlimited
              research.
            </p>
            <Link
              href={routes.pricing}
              onClick={() => setCaptureOpen(false)}
              className={cn(
                buttonVariants(),
                "w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-5 text-white hover:from-indigo-600 hover:to-violet-700"
              )}
            >
              See Pro plans
            </Link>
          </div>
        ) : (
          <>
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                if (typeof value === "string") setActiveTab(value);
              }}
            >
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/60">
                <TabsTrigger
                  value="text"
                  disabled={isSubmitting}
                  className="gap-1.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
                >
                  <FileText className="h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger
                  value="voice"
                  disabled={isSubmitting}
                  className="gap-1.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
                >
                  <Mic className="h-4 w-4" />
                  Voice
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  disabled={isSubmitting}
                  className="gap-1.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
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
                    placeholder="Who is it for, what problem does it solve, and how does it work?"
                    rows={5}
                    className="border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500"
                  />
                </TabsContent>

                <TabsContent value="voice" className="mt-0">
                  <VoiceRecorder
                    blob={audioBlob}
                    onChange={setAudioBlob}
                    disabled={isSubmitting}
                  />
                </TabsContent>

                <TabsContent value="image" className="mt-0">
                  <SnapshotPicker
                    file={imageFile}
                    onChange={setImageFile}
                    disabled={isSubmitting}
                  />
                </TabsContent>
              </div>
            </Tabs>

            <p className="text-xs leading-relaxed text-slate-500">
              {inputType === "text"
                ? "Be specific and descriptive — who it's for, the problem, and how it works. Vague ideas get vague research."
                : inputType === "voice"
                  ? "Be specific in the recording — who it's for, the problem, and how it works. Vague ideas get vague research."
                  : "Be specific in the snapshot — who it's for, the problem, and how it works. Vague ideas get vague research."}
            </p>

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
              disabled={!canSubmit}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
