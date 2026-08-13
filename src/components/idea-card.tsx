"use client";

import { motion } from "framer-motion";
import { FileText, Mic, ImageIcon } from "lucide-react";
import { Idea, InputType } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

const inputIcons: Record<InputType, typeof FileText> = {
  text: FileText,
  voice: Mic,
  image: ImageIcon,
};

interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
  index?: number;
}

export function IdeaCard({ idea, onClick, index = 0 }: IdeaCardProps) {
  const InputIcon = inputIcons[idea.inputType];

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "group w-full rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 text-left backdrop-blur-sm",
        "transition-all hover:border-slate-600 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-indigo-500/5",
        idea.status === "analyzing" && "opacity-90"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700/50 text-slate-400 group-hover:bg-indigo-500/15 group-hover:text-indigo-400">
          <InputIcon className="h-4 w-4" />
        </div>
        <StatusBadge status={idea.status} />
      </div>

      <h3 className="mb-1.5 line-clamp-1 font-semibold text-white">
        {idea.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-slate-400">
        {idea.shortDescription}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {idea.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
