import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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

// Import infrastructure components eagerly
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./systems/ToastContext";
import LoadingScreen from "./components/LoadingScreen"; // New file fallback
import "./systems/Toast.css";

// ✅ Convert Page imports to use React.lazy() dynamic imports
const Home = lazy(() => import("./pages/Home"));
const MissionMap = lazy(() => import("./pages/MissionMap"));
const MissionDetail = lazy(() => import("./pages/MissionDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {

  useEffect(() => {
    const state = loadProgress();
    const newState = updateStreak(state);
    saveProgress(newState);
  }, []);

  // useLocation gives us a stable key that changes on every navigation.
  const location = useLocation();


  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            {/* ✅ Wrap with Suspense pointing to our LoadingScreen design system skeleton */}
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/missions" element={<MissionMap />} />
                <Route path="/mission/:missionId" element={<MissionDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
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
