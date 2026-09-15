"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { INITIAL_IDEAS } from "@/lib/constants";
import { generateResearchPacket } from "@/lib/generate-research";
import { Idea, InputType } from "@/lib/types";

interface AppContextValue {
  ideas: Idea[];
  captureOpen: boolean;
  sidebarOpen: boolean;
  setCaptureOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  addIdea: (
    title: string,
    description: string,
    inputType: InputType
  ) => Promise<void>;
  getIdea: (id: string) => Idea | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addIdea = useCallback(
    async (title: string, description: string, inputType: InputType) => {
      const tempId = `idea-${Date.now()}`;
      const placeholder: Idea = {
        id: tempId,
        title,
        description,
        shortDescription:
          description.length > 80
            ? description.slice(0, 77) + "..."
            : description,
        tags: [],
        status: "analyzing",
        inputType,
        readinessScore: 0,
        marketSize: "—",
        targetAudience: "—",
        topCompetitor: { name: "—", strength: "—" },
        keyTrend: "—",
        competitors: [],
        growthMetrics: [],
        actionPlan: [],
        createdAt: new Date().toISOString(),
      };

      setIdeas((prev) => [placeholder, ...prev]);
      setCaptureOpen(false);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const research = generateResearchPacket(title, description, inputType);
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === tempId
            ? {
                ...research,
                id: tempId,
                status: "ready",
                createdAt: idea.createdAt,
              }
            : idea
        )
      );
    },
    []
  );

  const getIdea = useCallback(
    (id: string) => ideas.find((i) => i.id === id),
    [ideas]
  );

  const value = useMemo(
    () => ({
      ideas,
      captureOpen,
      sidebarOpen,
      setCaptureOpen,
      setSidebarOpen,
      addIdea,
      getIdea,
    }),
    [ideas, captureOpen, sidebarOpen, addIdea, getIdea]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
