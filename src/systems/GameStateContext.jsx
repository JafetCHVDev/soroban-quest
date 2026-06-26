import React, { createContext, useContext, useState, useCallback } from "react";
import {
  loadProgress,
  saveProgress,
  resetProgress as resetProgressStorage,
  loadProfile,
  saveProfile
} from "./storage";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { useTranslation } from "../i18n/useTranslation";

const GameStateContext = createContext(null);

export const GameStateProvider = ({ children }) => {
  const { t } = useTranslation();
  const [progress, setProgressState] = useState(() => loadProgress());
  const [profile, setProfileState] = useState(() => loadProfile());
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmResolve, setResetConfirmResolve] = useState(null);

  const updateProgress = useCallback((newProgress) => {
    saveProgress(newProgress);
    setProgressState(newProgress);
  }, []);

  const updateProfile = useCallback((newProfile) => {
    saveProfile(newProfile);
    setProfileState(newProfile);
  }, []);

  const resetProgress = useCallback(() => {
    setIsResetConfirmOpen(true);
    return new Promise((resolve) => {
      setResetConfirmResolve(() => resolve);
    });
  }, []);

  const handleConfirmReset = useCallback(() => {
    const defaultState = resetProgressStorage();
    setProgressState(defaultState);
    setIsResetConfirmOpen(false);

    if (resetConfirmResolve) {
      resetConfirmResolve(true);
      setResetConfirmResolve(null);
    }
  }, [resetConfirmResolve]);

  const handleCancelReset = useCallback(() => {
    setIsResetConfirmOpen(false);

    if (resetConfirmResolve) {
      resetConfirmResolve(false);
      setResetConfirmResolve(null);
    }
  }, [resetConfirmResolve]);

  return (
    <GameStateContext.Provider
      value={{
        progress,
        profile,
        updateProgress,
        updateProfile,
        resetProgress,
      }}
    >
      {children}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        title={t("profile.data.reset")}
        message={t("profile.data.confirmReset")}
        confirmText={t("common.confirm") || "Confirm"}
        cancelText={t("common.cancel") || "Cancel"}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};
