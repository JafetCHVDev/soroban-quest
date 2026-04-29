import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MissionMap from "./pages/MissionMap";
import MissionDetail from "./pages/MissionDetail";
import Profile from "./pages/Profile";
import Campaigns from "./pages/Campaigns";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";

// 1. Import the ErrorBoundary
import { ErrorBoundary } from "./components/ErrorBoundary";

// 2. Import Toast Provider and Styles
import { ToastProvider } from "./systems/ToastContext";
import "./systems/Toast.css";

export default function App() {
  // useLocation gives us a stable key that changes on every navigation.
  const location = useLocation();

  return (
    <ErrorBoundary>
      {/* 3. Wraped everything in ToastProvider */}
      <ToastProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/missions" element={<MissionMap />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/mission/:missionId" element={<MissionDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
