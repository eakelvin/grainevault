"use client";

import { AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/app-layout";
import { Dashboard } from "@/components/dashboard";
import { IdeaDetail } from "@/components/idea-detail";
import { LandingPage } from "@/components/landing-page";
import {
  WeeklyDigest,
  BoardView,
  SettingsView,
} from "@/components/placeholder-views";
import { useApp } from "@/context/app-context";

function AppContent() {
  const { currentView, selectedIdeaId, setSelectedIdeaId, getIdea } = useApp();
  const selectedIdea = selectedIdeaId ? getIdea(selectedIdeaId) : undefined;

  if (selectedIdea) {
    return (
      <AnimatePresence mode="wait">
        <IdeaDetail
          key={selectedIdea.id}
          idea={selectedIdea}
          onBack={() => setSelectedIdeaId(null)}
        />
      </AnimatePresence>
    );
  }

  switch (currentView) {
    case "digest":
      return <WeeklyDigest />;
    case "board":
      return <BoardView />;
    case "settings":
      return <SettingsView />;
    default:
      return <Dashboard />;
  }
}

export function IdeasVaultApp() {
  const { isInApp } = useApp();

  if (!isInApp) {
    return <LandingPage />;
  }

  return (
    <AppLayout>
      <AppContent />
    </AppLayout>
  );
}
