"use client";

import { useEffect, useState } from "react";
import { getIdeaMediaUrl } from "@/lib/ideas";

export function IdeaAudioPlayer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getIdeaMediaUrl(path).then((signed) => {
      if (cancelled) return;
      if (signed) setUrl(signed);
      else setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <section className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Voice note
      </h2>
      {failed ? (
        <p className="text-sm text-slate-400">Couldn't load this recording.</p>
      ) : url ? (
        <audio controls src={url} className="w-full" />
      ) : (
        <p className="text-sm text-slate-500">Loading recording…</p>
      )}
    </section>
  );
}
