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

const SYNC_STORAGE_KEY = "soroban_quest_cloud_sync";
const SYNC_DEBOUNCE_MS = 800;

function getSyncStorageKey() {
  const user = authService.getCurrentUser();
  if (user?.id) {
    return `${SYNC_STORAGE_KEY}_${user.id}`;
  }

  return SYNC_STORAGE_KEY;
}

function readStorageState() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(getSyncStorageKey());
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeStorageState(state) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getSyncStorageKey(), JSON.stringify(state));
}

function createPayload() {
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

function mergeState(localState, cloudState) {
  if (!localState) return cloudState;
  if (!cloudState) return localState;
  if (!cloudState.data) return localState;
  if (!localState.data) return cloudState;

  const winner = cloudState.timestamp >= localState.timestamp ? cloudState : localState;

  return {
    timestamp: Math.max(localState.timestamp || 0, cloudState.timestamp || 0),
    data: {
      progress: winner.data?.progress || localState.data?.progress || cloudState.data?.progress,
      profile: winner.data?.profile || localState.data?.profile || cloudState.data?.profile,
      profiles: winner.data?.profiles || localState.data?.profiles || cloudState.data?.profiles,
      activeProfileId: winner.data?.activeProfileId || localState.data?.activeProfileId || cloudState.data?.activeProfileId,
    },
  };
}

export const cloudSyncService = {
  isEnabled() {
    if (!authService.isAuthenticated()) {
      return false;
    }

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return navigator.onLine;
    }

    return true;
  },

  getStatus() {
    const state = readStorageState();
    return state?.status || "idle";
  },

  setStatus(status) {
    const state = readStorageState() || {};
    const nextState = { ...state, status };
    writeStorageState(nextState);
    return nextState;
  },

  async syncFromCloud() {
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

  async pushToCloud() {
    if (!this.isEnabled()) {
      this.setStatus("offline");
      return null;
    }

    const payload = createPayload();
    writeStorageState({ status: "synced", ...payload });
    return payload;
  },

  async syncLocalToCloud() {
    if (!this.isEnabled()) {
      this.setStatus("offline");
      return null;
    }

    this.setStatus("syncing");
    const payload = await this.pushToCloud();
    this.setStatus("synced");
    return payload;
  },

  async migrateLocalData() {
    if (!this.isEnabled()) {
      this.setStatus("offline");
      return null;
    }

    const payload = createPayload();
    writeStorageState({ status: "synced", ...payload });
    return payload;
  },
};

let syncTimer = null;

export function scheduleCloudSync() {
  if (typeof window === "undefined") return;

  if (syncTimer) {
    window.clearTimeout(syncTimer);
  }

  syncTimer = window.setTimeout(() => {
    cloudSyncService.syncLocalToCloud();
  }, SYNC_DEBOUNCE_MS);
}

export function getCloudSyncStatus() {
  return cloudSyncService.getStatus();
}

export function resetCloudSyncStatus() {
  return cloudSyncService.setStatus("idle");
}
