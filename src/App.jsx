
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

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

import { ErrorBoundary } from "./components/ErrorBoundary";

import { ToastProvider } from "./systems/ToastContext";
import "./systems/Toast.css";

import {
  GameProvider,
  gameActions,
  useGameDispatch,
} from "./systems/GameContext";

function DailyStreakBootstrap() {
  const dispatch = useGameDispatch();
  useEffect(() => {
    dispatch(gameActions.updateStreak());
  }, [dispatch]);
  return null;
}

export default function App() {
  // useLocation gives us a stable key that changes on every navigation.
  const location = useLocation();

  return (
    <ErrorBoundary>
      <GameProvider>
        <ToastProvider>
          <DailyStreakBootstrap />
          <div className="app">
            <Navbar />
            <main className="main-content">
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
      </GameProvider>
    </ErrorBoundary>
  );
}
