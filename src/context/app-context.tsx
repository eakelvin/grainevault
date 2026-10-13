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
  archiveIdea as archiveIdeaRequest,
  completeIdeaResearch,
  countIdeaSlots,
  createIdea,
  deleteIdea,
  extractIdeaMedia,
  fetchIdeas,
  restoreIdea as restoreIdeaRequest,
} from "@/lib/ideas";
import { createClient } from "@/lib/supabase/client";
import type { Idea, IdeaDraft } from "@/lib/types";
import { canCaptureIdea, type BillingInterval, type Plan } from "@/lib/billing";
import { fetchProfile } from "@/lib/profile";

interface AppContextValue {
  ideas: Idea[];
  ideaSlotCount: number;
  ideasLoading: boolean;
  ideasError: string | null;
  captureOpen: boolean;
  sidebarOpen: boolean;
  plan: Plan;
  billingInterval: BillingInterval | null;
  canCapture: boolean;
  setCaptureOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  addIdea: (draft: IdeaDraft) => Promise<void>;
  archiveIdea: (idea: Idea) => Promise<void>;
  restoreIdea: (idea: Idea) => Promise<void>;
  removeIdea: (idea: Idea) => Promise<void>;
  getIdea: (id: string) => Idea | undefined;
  updateIdea: (idea: Idea) => void;
  rerunResearch: (idea: Idea) => Promise<Idea>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideaSlotCount, setIdeaSlotCount] = useState(0);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [ideasError, setIdeasError] = useState<string | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [billingInterval, setBillingInterval] = useState<BillingInterval | null>(
    null
  );

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
          setIdeaSlotCount(0);
          setIdeasError(null);
          setPlan("free");
          setBillingInterval(null);
          setIdeasLoading(false);
        }
        return;
      }

      if (!cancelled) setIdeasLoading(true);

      try {
        const [rows, slots, profile] = await Promise.all([
          fetchIdeas(),
          countIdeaSlots(),
          fetchProfile(),
        ]);
        if (!cancelled) {
          setIdeas(rows);
          setIdeaSlotCount(slots);
          setPlan(profile?.plan ?? "free");
          setBillingInterval(profile?.billingInterval ?? null);
          setIdeasError(null);
        }
      } catch {
        if (!cancelled) {
          setIdeas([]);
          setIdeaSlotCount(0);
          setPlan("free");
          setBillingInterval(null);
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
    setIdeaSlotCount((prev) => prev + 1);
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

  const archiveIdea = useCallback(async (idea: Idea) => {
    setIdeasError(null);
    await archiveIdeaRequest(idea);
    setIdeas((prev) => prev.filter((item) => item.id !== idea.id));
  }, []);

  const restoreIdea = useCallback(async (idea: Idea) => {
    setIdeasError(null);
    const restored = await restoreIdeaRequest(idea);
    setIdeas((prev) => [restored, ...prev.filter((item) => item.id !== restored.id)]);
  }, []);

  const removeIdea = useCallback(async (idea: Idea) => {
    setIdeasError(null);
    await deleteIdea(idea);
    setIdeas((prev) => prev.filter((item) => item.id !== idea.id));
    setIdeaSlotCount((prev) => Math.max(0, prev - 1));
  }, []);

  const getIdea = useCallback(
    (id: string) => ideas.find((i) => i.id === id),
    [ideas]
  );

  const updateIdea = useCallback((next: Idea) => {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === next.id ? next : idea))
    );
  }, []);

  const rerunResearch = useCallback(
    async (idea: Idea) => {
      const ready = await completeIdeaResearch(idea);
      updateIdea(ready);
      return ready;
    },
    [updateIdea]
  );

  const refreshProfile = useCallback(async () => {
    const profile = await fetchProfile();
    setPlan(profile?.plan ?? "free");
    setBillingInterval(profile?.billingInterval ?? null);
  }, []);

  const canCapture = canCaptureIdea(plan, ideaSlotCount);

  const value = useMemo(
    () => ({
      ideas,
      ideaSlotCount,
      ideasLoading,
      ideasError,
      captureOpen,
      sidebarOpen,
      plan,
      billingInterval,
      canCapture,
      setCaptureOpen,
      setSidebarOpen,
      addIdea,
      archiveIdea,
      restoreIdea,
      removeIdea,
      getIdea,
      updateIdea,
      rerunResearch,
      refreshProfile,
    }),
    [
      ideas,
      ideaSlotCount,
      ideasLoading,
      ideasError,
      captureOpen,
      sidebarOpen,
      plan,
      billingInterval,
      canCapture,
      addIdea,
      archiveIdea,
      restoreIdea,
      removeIdea,
      getIdea,
      updateIdea,
      rerunResearch,
      refreshProfile,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
