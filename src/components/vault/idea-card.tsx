"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Mic, ImageIcon } from "lucide-react";
import { Idea, InputType, routes } from "@/lib/types";
import { StatusBadge } from "@/components/vault/status-badge";
import { DeleteIdeaButton } from "@/components/vault/delete-idea-button";
import { cn } from "@/lib/utils";

const inputIcons: Record<InputType, typeof FileText> = {
  text: FileText,
  voice: Mic,
  image: ImageIcon,
};

interface IdeaCardProps {
  idea: Idea;
  index?: number;
}

export function IdeaCard({ idea, index = 0 }: IdeaCardProps) {
  const InputIcon = inputIcons[idea.inputType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <div
        className={cn(
          "group relative rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm",
          "transition-all hover:border-slate-600 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-indigo-500/5",
          idea.status === "analyzing" && "opacity-90"
        )}
      >
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <StatusBadge status={idea.status} />
          <DeleteIdeaButton idea={idea} iconOnly />
        </div>
        <Link href={routes.idea(idea.id)} className="block p-5 pr-36 text-left">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700/50 text-slate-400 group-hover:bg-indigo-500/15 group-hover:text-indigo-400">
            <InputIcon className="h-4 w-4" />
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
        </Link>
      </div>
    </motion.div>
  );
}
