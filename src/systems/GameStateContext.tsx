import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
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
  MAX_PROFILES,
  ProfileData,
  ProfileSlot,
} from "./storage";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { useTranslation } from "../i18n/useTranslation";
import { GameEngineState } from "./gameEngine";

export interface GameStateContextType {
  progress: GameEngineState;
  profile: ProfileData;
  profiles: ProfileSlot[];
  activeProfileId: string;
  maxProfiles: number;
  updateProgress: (newProgress: GameEngineState) => void;
  updateProfile: (newProfile: Partial<ProfileData>) => void;
  switchProfile: (profileId: string) => void;
  createProfile: (profileData?: Partial<ProfileData>) => ProfileSlot;
  resetProgress: () => Promise<boolean>;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

export interface GameStateProviderProps {
  children?: ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [progress, setProgressState] = useState<GameEngineState>(() => loadProgress());
  const [profile, setProfileState] = useState<ProfileData>(() => loadProfile());
  const [profiles, setProfiles] = useState<ProfileSlot[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileState] = useState<string>(() => getActiveProfileId());
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmResolve, setResetConfirmResolve] = useState<((val: boolean) => void) | null>(null);

  const refreshActiveState = useCallback(() => {
    setProgressState(loadProgress());
    setProfileState(loadProfile());
    setProfiles(loadProfiles());
    setActiveProfileState(getActiveProfileId());
  }, []);

  const updateProgress = useCallback((newProgress: GameEngineState) => {
    saveProgress(newProgress);
    setProgressState(newProgress);
    setProfiles(loadProfiles());
  }, []);

  const updateProfile = useCallback((newProfile: Partial<ProfileData>) => {
    saveProfile(newProfile);
    setProfileState(loadProfile());
    setProfiles(loadProfiles());
  }, []);

  const switchProfile = useCallback((profileId: string) => {
    setActiveProfileId(profileId);
    refreshActiveState();
  }, [refreshActiveState]);

  const createProfile = useCallback((profileData?: Partial<ProfileData>) => {
    const updatedProfiles = addProfile(profileData);
    const nextProfile = updatedProfiles[updatedProfiles.length - 1];
    if (nextProfile) {
      setActiveProfileId(nextProfile.id);
    }
    refreshActiveState();
    return nextProfile;
  }, [refreshActiveState]);

  const resetProgress = useCallback((): Promise<boolean> => {
    setIsResetConfirmOpen(true);
    return new Promise<boolean>((resolve) => {
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

export const useGameState = (): GameStateContextType => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};
