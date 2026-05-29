
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { loadProgress, saveProgress } from "./systems/storage";
import { updateStreak } from "./systems/gameEngine";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MissionMap from "./pages/MissionMap";
import MissionDetail from "./pages/MissionDetail";
import Profile from "./pages/Profile";

import Journal from "./pages/Journal";

import Campaigns from "./pages/Campaigns";
import SkillTree from "./pages/SkillTree";

import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

// 1. Import the ErrorBoundary
import { ErrorBoundary } from "./components/ErrorBoundary";

// 2. Import Toast Provider and Styles
import { ToastProvider } from "./systems/ToastContext";
import "./systems/Toast.css";

export default function App() {

  useEffect(() => {
    const state = loadProgress();
    const newState = updateStreak(state);
    saveProgress(newState);
  }, []);

  return (
    <ErrorBoundary>
      {/* 3. Wraped everything in ToastProvider */}
      <ToastProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/missions" element={<MissionMap />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/mission/:missionId" element={<MissionDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/skills" element={<SkillTree />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
