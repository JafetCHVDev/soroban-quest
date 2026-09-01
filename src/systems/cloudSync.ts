import { authService } from "./authService";
import {
  loadProgress,
  loadProfile,
  saveProgress,
  saveProfile,
  loadProfiles,
  saveProfiles,
  getActiveProfileId,
  setActiveProfileId,
} from "./storage";
import type { GameState } from "./gameEngine";

interface Profile {
  name: string;
  avatar: string;
}

const SYNC_STORAGE_KEY = "soroban_quest_cloud_sync";
const SYNC_DEBOUNCE_MS = 800;

interface SyncPayload {
  user: unknown;
  timestamp: number;
  data: {
    progress: GameState;
    profile: Profile;
    profiles: unknown[];
    activeProfileId: string;
  };
}

function getSyncStorageKey(): string {
  const user = authService.getCurrentUser();
  if (user?.id) {
    return `${SYNC_STORAGE_KEY}_${user.id}`;
  }

  return SYNC_STORAGE_KEY;
}

function readStorageState(): SyncPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(getSyncStorageKey());
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeStorageState(state: SyncPayload & { status?: string }): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getSyncStorageKey(), JSON.stringify(state));
}

function createPayload(): SyncPayload {
  const progress = loadProgress();
  const profile = loadProfile();
  const profiles = loadProfiles();
  const activeProfileId = getActiveProfileId();

  return {
    user: authService.getCurrentUser(),
    timestamp: Date.now(),
    data: {
      progress,
      profile,
      profiles,
      activeProfileId,
    },
  };
}

function mergeState(
  localState: SyncPayload | null,
  cloudState: SyncPayload | null
): SyncPayload {
  if (!localState) return cloudState!;
  if (!cloudState) return localState;
  if (!cloudState.data) return localState;
  if (!localState.data) return cloudState;

  const winner =
    cloudState.timestamp >= localState.timestamp ? cloudState : localState;

  return {
    timestamp: Math.max(localState.timestamp || 0, cloudState.timestamp || 0),
    data: {
      progress:
        winner.data?.progress ||
        localState.data?.progress ||
        cloudState.data?.progress,
      profile:
        winner.data?.profile ||
        localState.data?.profile ||
        cloudState.data?.profile,
      profiles:
        winner.data?.profiles ||
        localState.data?.profiles ||
        cloudState.data?.profiles,
      activeProfileId:
        winner.data?.activeProfileId ||
        localState.data?.activeProfileId ||
        cloudState.data?.activeProfileId,
    },
    user: winner.user,
  };
}

export const cloudSyncService = {
  isEnabled(): boolean {
    if (!authService.isAuthenticated()) {
      return false;
    }

    if (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined"
    ) {
      return navigator.onLine;
    }

    return true;
  },

  getStatus(): string {
    const state = readStorageState();
    return (state as SyncPayload & { status?: string })?.status || "idle";
  },

  setStatus(status: string): SyncPayload & { status: string } {
    const state = readStorageState() || {};
    const nextState = { ...state, status };
    writeStorageState(nextState as SyncPayload & { status: string });
    return nextState as SyncPayload & { status: string };
  },

  async syncFromCloud(): Promise<SyncPayload['data'] | null> {
    if (!this.isEnabled()) {
      this.setStatus("offline");
      return null;
    }

    this.setStatus("syncing");

    const localState = createPayload();
    const cloudState = readStorageState();
    const merged = mergeState(localState, cloudState);

    if (!merged?.data) {
      this.setStatus("idle");
      return null;
    }

    const latestData = merged.data;

    if (latestData.progress) {
      saveProgress(latestData.progress);
    }
    if (latestData.profile) {
      saveProfile(latestData.profile);
    }
    if (latestData.profiles) {
      saveProfiles(latestData.profiles);
    }
    if (latestData.activeProfileId) {
      setActiveProfileId(latestData.activeProfileId);
    }

    this.setStatus("synced");
    return latestData;
  },

  async pushToCloud(): Promise<SyncPayload> {
    if (!this.isEnabled()) {
      this.setStatus("offline");
      return null as unknown as SyncPayload;
    }

    const payload = createPayload();
    writeStorageState({ status: "synced", ...payload });
    return payload;
  },

  async syncLocalToCloud(): Promise<SyncPayload | null> {
    if (!this.isEnabled()) {
      this.setStatus("offline");
      return null;
    }

    this.setStatus("syncing");
    const payload = await this.pushToCloud();
    this.setStatus("synced");
    return payload;
  },

  async migrateLocalData(): Promise<SyncPayload> {
    if (!this.isEnabled()) {
      this.setStatus("offline");
      return null as unknown as SyncPayload;
    }

    const payload = createPayload();
    writeStorageState({ status: "synced", ...payload });
    return payload;
  },
};

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleCloudSync(): void {
  if (typeof window === "undefined") return;

  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(() => {
    cloudSyncService.syncLocalToCloud();
  }, SYNC_DEBOUNCE_MS);
}

export function getCloudSyncStatus(): string {
  return cloudSyncService.getStatus();
}

export function resetCloudSyncStatus(): SyncPayload & { status: string } {
  return cloudSyncService.setStatus("idle");
}
