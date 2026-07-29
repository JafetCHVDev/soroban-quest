import React, { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import KeyboardShortcuts from "./components/KeyboardShortcuts";
import { useKeyboardShortcuts } from "./systems/useKeyboardShortcuts";

import useScrollToTop from "./hooks/useScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./systems/ToastContext";
import { GameStateProvider } from "./systems/GameStateContext";
import LoadingScreen from "./components/LoadingScreen";
import { loadProgress, saveProgress } from "./systems/storage";
import { updateStreak } from "./systems/gameEngine";
import "./systems/Toast.css";

// Lazy load page components
const Home = lazy(() => import("./pages/Home"));
const MissionMap = lazy(() => import("./pages/MissionMap"));
const MissionDetail = lazy(() => import("./pages/MissionDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Journal = lazy(() => import("./pages/Journal"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const SkillTree = lazy(() => import("./pages/SkillTree"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Shop = lazy(() => import("./pages/Shop"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  useScrollToTop();

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  useKeyboardShortcuts(isShortcutsOpen, setIsShortcutsOpen);

  useEffect(() => {
    const state = loadProgress();
    const newState = updateStreak(state);
    saveProgress(newState);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <GameStateProvider>
          <div className="app">
            <Navbar onOpenShortcuts={() => setIsShortcutsOpen(true)} />
            <main className="main-content" id="main-content">
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/missions" element={<MissionMap />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/mission/:missionId" element={<MissionDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/skills" element={<SkillTree />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />

            <KeyboardShortcuts
              isOpen={isShortcutsOpen}
              onClose={() => setIsShortcutsOpen(false)}
            />
          </div>
        </GameStateProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}