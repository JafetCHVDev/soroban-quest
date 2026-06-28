import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MissionMap from "./pages/MissionMap";
import MissionDetail from "./pages/MissionDetail";
import Profile from "./pages/Profile";
import Journal from "./pages/Journal";
import Campaigns from "./pages/Campaigns";
import SkillTree from "./pages/SkillTree";
import Leaderboard from "./pages/Leaderboard";
import Achievements from "./pages/Achievements";
import Footer from "./components/Footer";

import useScrollToTop from "./hooks/useScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./systems/ToastContext";
import { GameStateProvider } from "./systems/GameStateContext";
import LoadingScreen from "./components/LoadingScreen";
import { loadProgress, saveProgress } from "./systems/storage";
import { updateStreak } from "./systems/gameEngine";
import "./systems/Toast.css";

// Lazy load page components
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  // Global React Router navigation scroll management
  useScrollToTop();

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
            <Navbar />
            <main className="main-content">
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </GameStateProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
