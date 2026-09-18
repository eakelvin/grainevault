"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { IdeaAudioPlayer } from "@/components/vault/idea-audio-player";
import { getIdeaMediaUrl } from "@/lib/ideas";
import { isPdfPath } from "@/lib/idea-draft";
import type { InputType } from "@/lib/types";

export function IdeaMedia({
  path,
  inputType,
}: {
  path: string;
  inputType: InputType;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const isPdf = isPdfPath(path);

  useEffect(() => {
    if (inputType !== "image") return;

    let cancelled = false;
    setUrl(null);
    setFailed(false);

    getIdeaMediaUrl(path).then((signed) => {
      if (cancelled) return;
      if (signed) setUrl(signed);
      else setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [path, inputType]);

  if (inputType !== "image") {
    return <IdeaAudioPlayer path={path} />;
  }

  return (
    <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Snapshot
      </h2>
      {failed ? (
        <p className="text-sm text-slate-400">
          {isPdf ? "Couldn't load this PDF." : "Couldn't load this snapshot."}
        </p>
      ) : url ? (
        isPdf ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/40 bg-slate-950/50 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="h-5 w-5 shrink-0 text-indigo-400" />
              <p className="text-sm font-medium text-slate-200">PDF document</p>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          </div>
        ) : (
          <img
            src={url}
            alt="Idea snapshot"
            className="max-h-96 w-full rounded-xl object-contain bg-slate-950/50"
          />
        )
      ) : (
        <p className="text-sm text-slate-500">
          {isPdf ? "Loading PDF…" : "Loading snapshot…"}
        </p>
      )}
    </section>
  );
}
