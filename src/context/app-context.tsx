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
import { AppView, Idea, InputType } from "@/lib/types";

interface AppContextValue {
  isInApp: boolean;
  enterApp: () => void;
  logout: () => void;
  ideas: Idea[];
  selectedIdeaId: string | null;
  currentView: AppView;
  captureOpen: boolean;
  sidebarOpen: boolean;
  setCurrentView: (view: AppView) => void;
  setSelectedIdeaId: (id: string | null) => void;
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
  const [isInApp, setIsInApp] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("vault");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const enterApp = useCallback(() => setIsInApp(true), []);
  const logout = useCallback(() => {
    setIsInApp(false);
    setSelectedIdeaId(null);
    setCurrentView("vault");
    setCaptureOpen(false);
    setSidebarOpen(false);
  }, []);

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
            ? { ...research, id: tempId, status: "ready", createdAt: idea.createdAt }
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
      isInApp,
      enterApp,
      logout,
      ideas,
      selectedIdeaId,
      currentView,
      captureOpen,
      sidebarOpen,
      setCurrentView,
      setSelectedIdeaId,
      setCaptureOpen,
      setSidebarOpen,
      addIdea,
      getIdea,
    }),
    [
      isInApp,
      enterApp,
      logout,
      ideas,
      selectedIdeaId,
      currentView,
      captureOpen,
      sidebarOpen,
      addIdea,
      getIdea,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
