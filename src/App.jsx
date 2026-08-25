import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import useScrollToTop from './hooks/useScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './systems/ToastContext';
import { GameStateProvider } from './systems/GameStateContext';
import LoadingScreen from './components/LoadingScreen';
import { loadProgress, saveProgress } from './systems/storage';
import { updateStreak } from './systems/gameEngine';
import { scheduleCloudSync } from './systems/cloudSync';
import { useKeyboardShortcuts } from './systems/useKeyboardShortcuts';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import './systems/Toast.css';

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const MissionMap = lazy(() => import('./pages/MissionMap'));
const MissionDetail = lazy(() => import('./pages/MissionDetail'));
const Quests = lazy(() => import('./pages/Quests')); // Added Quests page
const Profile = lazy(() => import('./pages/Profile'));
const Journal = lazy(() => import('./pages/Journal'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const SkillTree = lazy(() => import('./pages/SkillTree'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Shop = lazy(() => import('./pages/Shop'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AppContent() {
  const navigate = useNavigate();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global React Router navigation scroll management
  useScrollToTop();

  useEffect(() => {
    const state = loadProgress();
    const newState = updateStreak(state);
    saveProgress(newState);
    scheduleCloudSync();
  }, []);

  // Register global keyboard shortcuts handler
  useKeyboardShortcuts({
    isOpen: isShortcutsOpen,
    setIsOpen: setIsShortcutsOpen,
    onAction: (action) => {
      switch (action) {
        case 'home':
          navigate('/');
          break;
        case 'campaigns':
          navigate('/campaigns');
          break;
        case 'missions':
          navigate('/missions');
          break;
        case 'profile':
          navigate('/profile');
          break;
        case 'journal':
          navigate('/journal');
          break;
        default:
          // Editor & mission specific actions can be dispatched or listened to via custom events if needed
          window.dispatchEvent(new CustomEvent('soroban:shortcut', { detail: { action } }));
          break;
      }
    },
  });

  return (
    <div className="app">
      <Navbar onOpenShortcuts={() => setIsShortcutsOpen(true)} />
      <main className="main-content">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/missions" element={<MissionMap />} />
            <Route path="/quests" element={<Quests />} />
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
      <KeyboardShortcuts isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <GameStateProvider>
          <AppContent />
        </GameStateProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
