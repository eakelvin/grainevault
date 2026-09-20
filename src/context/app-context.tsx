"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  completeIdeaResearch,
  createIdea,
  deleteIdea,
  extractIdeaMedia,
  fetchIdeas,
} from "@/lib/ideas";
import { createClient } from "@/lib/supabase/client";
import type { Idea, IdeaDraft } from "@/lib/types";

interface AppContextValue {
  ideas: Idea[];
  ideasLoading: boolean;
  ideasError: string | null;
  captureOpen: boolean;
  sidebarOpen: boolean;
  setCaptureOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  addIdea: (draft: IdeaDraft) => Promise<void>;
  removeIdea: (idea: Idea) => Promise<void>;
  getIdea: (id: string) => Idea | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [ideasError, setIdeasError] = useState<string | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setIdeas([]);
          setIdeasError(null);
          setIdeasLoading(false);
        }
        return;
      }

      if (!cancelled) setIdeasLoading(true);

      try {
        const rows = await fetchIdeas();
        if (!cancelled) {
          setIdeas(rows);
          setIdeasError(null);
        }
      } catch {
        if (!cancelled) {
          setIdeas([]);
          setIdeasError("Couldn't load your ideas. Please try again.");
        }
      } finally {
        if (!cancelled) setIdeasLoading(false);
      }
    };

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const addIdea = useCallback(async (draft: IdeaDraft) => {
    setIdeasError(null);
    const placeholder = await createIdea(draft);
    setIdeas((prev) => [placeholder, ...prev]);
    setCaptureOpen(false);

    try {
      let next = placeholder;
      if (placeholder.mediaPath) {
        try {
          next = await extractIdeaMedia(placeholder.id);
          setIdeas((prev) =>
            prev.map((idea) => (idea.id === next.id ? next : idea))
          );
        } catch (extractError) {
          setIdeasError(
            extractError instanceof Error
              ? extractError.message
              : "Couldn't read this file."
          );
        }
      }
      const ready = await completeIdeaResearch(next);
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === ready.id ? ready : idea))
      );
    } catch {
      setIdeasError(
        "Your idea was saved, but research couldn't finish. Please try again."
      );
    }
  }, []);

  const removeIdea = useCallback(async (idea: Idea) => {
    setIdeasError(null);
    await deleteIdea(idea);
    setIdeas((prev) => prev.filter((item) => item.id !== idea.id));
  }, []);

  const getIdea = useCallback(
    (id: string) => ideas.find((i) => i.id === id),
    [ideas]
  );

  const value = useMemo(
    () => ({
      ideas,
      ideasLoading,
      ideasError,
      captureOpen,
      sidebarOpen,
      setCaptureOpen,
      setSidebarOpen,
      addIdea,
      removeIdea,
      getIdea,
    }),
    [ideas, ideasLoading, ideasError, captureOpen, sidebarOpen, addIdea, removeIdea, getIdea]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
