import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  FC,
} from 'react';
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
  type ProfileSlot,
  type Profile,
} from './storage';
import { authService } from './authService';
import { cloudSyncService, scheduleCloudSync } from './cloudSync';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useTranslation } from '../i18n/useTranslation';
import { type GameState } from '../types/game';

/**
 * Game state context value type
 */
export interface GameStateContextValue {
  progress: GameState;
  profile: Profile;
  profiles: ProfileSlot[];
  activeProfileId: string;
  maxProfiles: number;
  updateProgress: (newProgress: Partial<GameState>) => void;
  updateProfile: (newProfile: Partial<Profile>) => void;
  switchProfile: (profileId: string) => void;
  createProfile: (profileData: Partial<Profile>) => ProfileSlot | undefined;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  resetProgress: () => Promise<boolean>;
}

/**
 * Game state context
 */
const GameStateContext = createContext<GameStateContextValue | null>(null);

/**
 * GameStateProvider component manages global game state and persistence.
 * @param props - Component props
 * @param props.children - Child components
 * @returns Game state provider element
 */
export const GameStateProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation();
  const [progress, setProgressState] = useState<GameState>(() =>
    loadProgress(),
  );
  const [profile, setProfileState] = useState<Profile>(() => loadProfile());
  const [profiles, setProfiles] = useState<ProfileSlot[]>(() =>
    loadProfiles(),
  );
  const [activeProfileId, setActiveProfileState] = useState<string>(() =>
    getActiveProfileId(),
  );
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmResolve, setResetConfirmResolve] = useState<
    ((value: boolean) => void) | null
  >(null);

  useEffect(() => {
    authService.initialize();
    if (authService.isAuthenticated()) {
      cloudSyncService.syncFromCloud();
    }
  }, []);

  const refreshActiveState = useCallback((): void => {
    setProgressState(loadProgress());
    setProfileState(loadProfile());
    setProfiles(loadProfiles());
    setActiveProfileState(getActiveProfileId());
  }, []);

  const updateProgress = useCallback(
    (newProgress: Partial<GameState>): void => {
      const merged = { ...progress, ...newProgress };
      saveProgress(merged);
      setProgressState(merged);
      setProfiles(loadProfiles());
      scheduleCloudSync();
    },
    [progress],
  );

  const updateProfile = useCallback(
    (newProfile: Partial<Profile>): void => {
      const merged = { ...profile, ...newProfile };
      saveProfile(merged);
      setProfileState(merged);
      setProfiles(loadProfiles());
      scheduleCloudSync();
    },
    [profile],
  );

  const switchProfile = useCallback(
    (profileId: string): void => {
      setActiveProfileId(profileId);
      refreshActiveState();
      scheduleCloudSync();
    },
    [refreshActiveState],
  );

  const createProfile = useCallback(
    (profileData: Partial<Profile>): ProfileSlot | undefined => {
      const updatedProfiles = addProfile(profileData);
      const nextProfile = updatedProfiles[updatedProfiles.length - 1];
      if (nextProfile) {
        setActiveProfileId(nextProfile.id);
      }
      refreshActiveState();
      scheduleCloudSync();
      return nextProfile;
    },
    [refreshActiveState],
  );

  const equipItem = useCallback(
    (itemId: string): void => {
      const owned = progress.inventory?.owned ?? [];
      if (!owned.includes(itemId)) return;

      const equipped = progress.inventory?.equipped ?? [];
      if (!equipped.includes(itemId)) {
        updateProgress({
          inventory: { owned, equipped: [...equipped, itemId] },
        });
      }
    },
    [progress, updateProgress],
  );

  const unequipItem = useCallback(
    (itemId: string): void => {
      const owned = progress.inventory?.owned ?? [];
      const equipped = progress.inventory?.equipped ?? [];
      updateProgress({
        inventory: { owned, equipped: equipped.filter((id) => id !== itemId) },
      });
    },
    [progress, updateProgress],
  );

  const resetProgress = useCallback((): Promise<boolean> => {
    setIsResetConfirmOpen(true);
    return new Promise((resolve) => {
      setResetConfirmResolve(() => resolve);
    });
  }, []);

  const handleConfirmReset = useCallback((): void => {
    const defaultState = resetProgressStorage();
    setProgressState(defaultState);
    setProfiles(loadProfiles());
    setIsResetConfirmOpen(false);
    scheduleCloudSync();

    if (resetConfirmResolve) {
      resetConfirmResolve(true);
      setResetConfirmResolve(null);
    }
  }, [resetConfirmResolve]);

  const handleCancelReset = useCallback((): void => {
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
        equipItem,
        unequipItem,
        resetProgress,
      }}
    >
      {children}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        title={t('profile.data.reset')}
        message={t('profile.data.confirmReset')}
        confirmText={t('common.confirm') || 'Confirm'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
    </GameStateContext.Provider>
  );
};

/**
 * Hook to access game state from anywhere in the app.
 * Throws an error if used outside GameStateProvider.
 * @returns Game state context value
 * @throws Error if used outside GameStateProvider
 */
export const useGameState = (): GameStateContextValue => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
