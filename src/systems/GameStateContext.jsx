import React, { createContext, useContext, useState, useCallback } from "react";
import {
  loadProgress,
  saveProgress,
  resetProgress as resetProgressStorage,
  loadProfile,
  saveProfile,
  loadProfiles,
  addProfile,
  getActiveProfileId,
  setActiveProfileId,
  MAX_PROFILES
} from "./storage";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { useTranslation } from "../i18n/useTranslation";

const GameStateContext = createContext(null);

export const GameStateProvider = ({ children }) => {
  const { t } = useTranslation();
  const [progress, setProgressState] = useState(() => loadProgress());
  const [profile, setProfileState] = useState(() => loadProfile());
  const [profiles, setProfiles] = useState(() => loadProfiles());
  const [activeProfileId, setActiveProfileState] = useState(() => getActiveProfileId());
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmResolve, setResetConfirmResolve] = useState(null);

  const refreshActiveState = useCallback(() => {
    setProgressState(loadProgress());
    setProfileState(loadProfile());
    setProfiles(loadProfiles());
    setActiveProfileState(getActiveProfileId());
  }, []);

  const updateProgress = useCallback((newProgress) => {
    saveProgress(newProgress);
    setProgressState(newProgress);
    setProfiles(loadProfiles());
  }, []);

  const updateProfile = useCallback((newProfile) => {
    saveProfile(newProfile);
    setProfileState(newProfile);
    setProfiles(loadProfiles());
  }, []);

  const switchProfile = useCallback((profileId) => {
    setActiveProfileId(profileId);
    refreshActiveState();
  }, [refreshActiveState]);

  const createProfile = useCallback((profileData) => {
    const updatedProfiles = addProfile(profileData);
    const nextProfile = updatedProfiles[updatedProfiles.length - 1];
    if (nextProfile) {
      setActiveProfileId(nextProfile.id);
    }
    refreshActiveState();
    return nextProfile;
  }, [refreshActiveState]);

  const resetProgress = useCallback(() => {
    setIsResetConfirmOpen(true);
    return new Promise((resolve) => {
      setResetConfirmResolve(() => resolve);
    });
  }, []);

  const handleConfirmReset = useCallback(() => {
    const defaultState = resetProgressStorage();
    setProgressState(defaultState);
    setProfiles(loadProfiles());
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
        profiles,
        activeProfileId,
        maxProfiles: MAX_PROFILES,
        updateProgress,
        updateProfile,
        switchProfile,
        createProfile,
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
