"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Mic,
  ImageIcon,
  Upload,
  Loader2,
} from "lucide-react";
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
import { InputType } from "@/lib/types";
import { cn } from "@/lib/utils";

const tabInputMap: Record<string, InputType> = {
  text: "text",
  voice: "voice",
  snapshot: "image",
};

export function CaptureModal() {
  const { captureOpen, setCaptureOpen, addIdea } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setActiveTab("text");
    setIsListening(false);
    setIsSubmitting(false);
    setIsDragging(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setCaptureOpen(false);
    reset();
  };

  const handleMicClick = () => {
    if (isListening) return;
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setDescription(
        "A platform that connects local farmers directly with restaurants, eliminating middlemen and ensuring fresher produce with transparent pricing and same-day delivery logistics."
      );
      if (!title) setTitle("Farm-to-Table Direct Marketplace");
    }, 2500);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await addIdea(title.trim(), description.trim(), tabInputMap[activeTab]);
    reset();
  };

  return (
    <Dialog open={captureOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700/60 bg-slate-900/95 text-slate-200 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Capture New Idea
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
              className="gap-1.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
            >
              <Mic className="h-4 w-4" />
              Voice Note
            </TabsTrigger>
            <TabsTrigger
              value="snapshot"
              className="gap-1.5 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
            >
              <ImageIcon className="h-4 w-4" />
              Snapshot
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your idea a name..."
                className="border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500"
              />
            </div>

            <TabsContent value="text" className="mt-0">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your startup idea in detail..."
                rows={5}
                className="border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500"
              />
            </TabsContent>

            <TabsContent value="voice" className="mt-0">
              <div className="flex flex-col items-center rounded-2xl border border-slate-700/60 bg-slate-800/40 p-8">
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isListening}
                  className={cn(
                    "relative flex h-20 w-20 items-center justify-center rounded-full transition-all",
                    isListening
                      ? "bg-red-500/20 text-red-400"
                      : "bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25"
                  )}
                >
                  {isListening && (
                    <>
                      <span className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
                      <span className="absolute inset-2 animate-pulse rounded-full bg-red-500/10" />
                    </>
                  )}
                  <Mic className="relative h-8 w-8" />
                </button>
                <p className="mt-4 text-sm text-slate-400">
                  {isListening
                    ? "Listening..."
                    : "Tap the mic to record your idea"}
                </p>
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 flex items-end gap-1"
                    >
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-indigo-400"
                          animate={{
                            height: [8, 24 + Math.random() * 16, 8],
                          }}
                          transition={{
                            duration: 0.5 + Math.random() * 0.3,
                            repeat: Infinity,
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {description && !isListening && (
                  <p className="mt-4 w-full rounded-xl bg-slate-800/60 p-3 text-left text-sm text-slate-300">
                    {description}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="snapshot" className="mt-0">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (!title) setTitle("Whiteboard Session Capture");
                  if (!description)
                    setDescription(
                      "Captured from a brainstorming whiteboard session — a visual collaboration tool for remote design sprints with real-time sticky notes and voting."
                    );
                }}
                className={cn(
                  "flex flex-col items-center rounded-2xl border-2 border-dashed p-10 transition-colors",
                  isDragging
                    ? "border-indigo-400 bg-indigo-500/10"
                    : "border-slate-700/60 bg-slate-800/40"
                )}
              >
                <Upload className="mb-3 h-10 w-10 text-slate-500" />
                <p className="text-sm font-medium text-slate-300">
                  Drag & drop an image here
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  or click to browse (simulated)
                </p>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context for your snapshot..."
                  rows={3}
                  className="border-slate-700 bg-slate-800/60 text-white placeholder:text-slate-500"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim() || isSubmitting}
          className="mt-2 w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-5 text-white hover:from-indigo-600 hover:to-violet-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending to Vault...
            </>
          ) : (
            "Send to Vault"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
