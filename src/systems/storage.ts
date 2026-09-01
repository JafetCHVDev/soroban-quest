import { getDefaultState, GameState } from "./gameEngine";
export { getDefaultState };

/* =========================
   KEYS
========================= */
const PROGRESS_KEY = "soroban_quest_progress";
const PROFILE_KEY = "soroban_quest_profile";
const PROFILES_KEY = "soroban_quest_profiles";
const ACTIVE_PROFILE_KEY = "soroban_quest_active_profile";
export const MAX_PROFILES = 5;

interface Profile {
  name: string;
  avatar: string;
}

interface ProfileSlot {
  id: string;
  profile: Profile;
  progress: GameState;
}

interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ReadFileResult {
  success: boolean;
  data: unknown;
  errors: string[];
}

function createDefaultProfileSlot(index = 0, overrides: Record<string, unknown> = {}): ProfileSlot {
  const id = (overrides as Record<string, unknown>).id || `player-${index + 1}`;
  return {
    id: id as string,
    profile: {
      ...defaultProfile,
      name: index === 0 ? defaultProfile.name : `Player ${index + 1}`,
      ...((overrides as Record<string, unknown>).profile || {}),
    },
    progress: {
      ...getDefaultState(),
      ...((overrides as Record<string, unknown>).progress || {}),
    },
  };
}

function sanitizeProfileSlot(slot: unknown, index: number): ProfileSlot {
  const slotObj = slot as Record<string, unknown>;
  return createDefaultProfileSlot(index, {
    id: (slotObj?.id as string) || `player-${index + 1}`,
    profile: slotObj?.profile,
    progress: slotObj?.progress,
  });
}

function readLegacySlot(): ProfileSlot {
  let legacyProfile: Profile | null = null;
  const legacyProgress = readLegacyProgress();

  try {
    const profileData = localStorage.getItem(PROFILE_KEY);
    if (profileData) legacyProfile = JSON.parse(profileData);
  } catch {
    legacyProfile = null;
  }

  return createDefaultProfileSlot(0, {
    profile: legacyProfile || undefined,
    progress: legacyProgress || undefined,
  });
}

function readLegacyProgress(): GameState | null {
  try {
    const progressData = localStorage.getItem(PROGRESS_KEY);
    if (!progressData) return null;
    return { ...getDefaultState(), ...JSON.parse(progressData) };
  } catch {
    return null;
  }
}

function persistProfiles(profiles: ProfileSlot[]): void {
  localStorage.setItem(
    PROFILES_KEY,
    JSON.stringify(profiles.slice(0, MAX_PROFILES))
  );
}

function mirrorActiveProfileLegacy(slot: ProfileSlot): void {
  const progressCopy = cleanProgress(slot.progress);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressCopy));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(slot.profile));
}

function cleanProgress(state: GameState): Partial<GameState> {
  const copy = { ...state };
  delete copy.leveledUp;
  delete copy.alreadyCompleted;
  delete copy.newBadges;
  return copy;
}

function progressSignature(state: GameState): string {
  return JSON.stringify(
    cleanProgress({ ...getDefaultState(), ...state })
  );
}

function syncActiveProgressFromLegacy(progress: GameState): GameState {
  const activeProfileId = getActiveProfileId();
  const profiles = loadProfiles();
  const updated = profiles.map((slot) =>
    slot.id === activeProfileId
      ? {
          ...slot,
          progress: { ...getDefaultState(), ...cleanProgress(progress) },
        }
      : slot
  );
  persistProfiles(updated);
  return updated.find((slot) => slot.id === activeProfileId)?.progress ||
    progress;
}

export function loadProfiles(): ProfileSlot[] {
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    if (!data) {
      const migrated = [readLegacySlot()];
      persistProfiles(migrated);
      setActiveProfileId(migrated[0].id);
      mirrorActiveProfileLegacy(migrated[0]);
      return migrated;
    }

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createDefaultProfileSlot()];
    }

    return parsed
      .slice(0, MAX_PROFILES)
      .map((slot, index) => sanitizeProfileSlot(slot, index));
  } catch {
    return [createDefaultProfileSlot()];
  }
}

export function saveProfiles(profiles: ProfileSlot[]): ProfileSlot[] {
  const sanitized = profiles
    .slice(0, MAX_PROFILES)
    .map((slot, index) => sanitizeProfileSlot(slot, index));
  persistProfiles(sanitized);

  const activeSlot =
    sanitized.find((slot) => slot.id === getActiveProfileId()) ||
    sanitized[0];
  if (activeSlot) mirrorActiveProfileLegacy(activeSlot);
  return sanitized;
}

export function getActiveProfileId(): string {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
    const fallbackId = profiles[0]?.id || "player-1";
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || fallbackId;
  } catch {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || "player-1";
  }
}

export function setActiveProfileId(profileId: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
}

export function getActiveProfileSlot(): ProfileSlot {
  const profiles = loadProfiles();
  const activeProfileId = getActiveProfileId();
  const activeSlot =
    profiles.find((slot) => slot.id === activeProfileId) || profiles[0];

  if (activeSlot && activeSlot.id !== activeProfileId) {
    setActiveProfileId(activeSlot.id);
  }

  return activeSlot || createDefaultProfileSlot();
}

export function addProfile(profile: Partial<Profile> = {}): ProfileSlot[] {
  const profiles = loadProfiles();
  if (profiles.length >= MAX_PROFILES) return profiles;

  const nextIndex = profiles.length;
  const nextSlot = createDefaultProfileSlot(nextIndex, {
    id: `player-${Date.now()}`,
    profile,
  });
  const updated = [...profiles, nextSlot];
  persistProfiles(updated);
  return updated;
}

/* =========================
   COMPRESSION / DECOMPRESSION
========================= */
async function compressData(data: unknown): Promise<Blob> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataArray = encoder.encode(jsonString);

  const blob = new Blob([dataArray]);
  const compressedStream = new (window as Record<string, unknown>).CompressionStream("gzip");
  const compressedStreamResponse = new Response(blob.stream().pipeThrough(compressedStream as unknown as TransformStream<Uint8Array, Uint8Array>));
  const compressedBlob = await compressedStreamResponse.blob();

  return compressedBlob;
}

async function decompressData(blob: Blob): Promise<unknown> {
  const decompressedStream = new (window as Record<string, unknown>).DecompressionStream("gzip");
  const decompressedStreamResponse = new Response(
    blob.stream().pipeThrough(decompressedStream as unknown as TransformStream<Uint8Array, Uint8Array>)
  );
  const decompressedBlob =
    await decompressedStreamResponse.blob();
  const decompressedText = await decompressedBlob.text();

  return JSON.parse(decompressedText);
}

/* =========================
   VALIDATION
========================= */
export function validateImportData(data: unknown): ImportValidationResult {
  const dataObj = data as Record<string, unknown>;
  const errors: string[] = [];

  if (!dataObj) {
    errors.push("Data is empty or null");
    return { isValid: false, errors };
  }

  if (!dataObj.state && !dataObj.profile) {
    errors.push("File must contain either state or profile data");
  }

  if (dataObj.state) {
    const state = dataObj.state as Record<string, unknown>;
    if (!Array.isArray(state.completedMissions)) {
      errors.push("state.completedMissions must be an array");
    }
    if (!Array.isArray(state.badges)) {
      errors.push("state.badges must be an array");
    }
    if (typeof state.xp !== "number") {
      errors.push("state.xp must be a number");
    }
    if (typeof state.level !== "number") {
      errors.push("state.level must be a number");
    }
    if (!Array.isArray(state.skillPoints)) {
      errors.push("state.skillPoints must be an array");
    }
  }

  if (dataObj.profile) {
    const profile = dataObj.profile as Record<string, unknown>;
    if (typeof profile.name !== "string") {
      errors.push("profile.name must be a string");
    }
    if (typeof profile.avatar !== "string") {
      errors.push("profile.avatar must be a string");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/* =========================
   PROGRESS
========================= */
export function loadProgress(): GameState {
  const activeSlot = getActiveProfileSlot();
  const legacyProgress = readLegacyProgress();

  if (
    legacyProgress &&
    progressSignature(legacyProgress) !==
      progressSignature(activeSlot.progress)
  ) {
    return syncActiveProgressFromLegacy(legacyProgress);
  }

  return activeSlot.progress;
}

export function saveProgress(state: GameState): void {
  try {
    const activeProfileId = getActiveProfileId();
    const profiles = loadProfiles();
    const updated = profiles.map((slot) =>
      slot.id === activeProfileId
        ? {
            ...slot,
            progress: {
              ...getDefaultState(),
              ...cleanProgress(state),
            },
          }
        : slot
    );
    saveProfiles(updated);
  } catch (e) {
    console.error("Failed to save progress:", e);
  }
}

export function resetProgress(): GameState {
  localStorage.removeItem(PROGRESS_KEY);
  const activeProfileId = getActiveProfileId();
  const defaultState = getDefaultState();
  const profiles = loadProfiles().map((slot) =>
    slot.id === activeProfileId ? { ...slot, progress: defaultState } : slot
  );
  saveProfiles(profiles);
  localStorage.removeItem(PROGRESS_KEY);
  return defaultState;
}

/* =========================
   PROFILE
========================= */
export const defaultProfile: Profile = {
  name: "Stellar Guardian",
  avatar: "🛡️",
};

export function loadProfile(): Profile {
  return getActiveProfileSlot().profile;
}

export function saveProfile(profile: Partial<Profile>): void {
  const activeProfileId = getActiveProfileId();
  const profiles = loadProfiles();
  const updated = profiles.map((slot) =>
    slot.id === activeProfileId
      ? { ...slot, profile: { ...defaultProfile, ...profile } }
      : slot
  );
  saveProfiles(updated);
}

export function resetProfile(): Profile {
  localStorage.removeItem(PROFILE_KEY);
  const activeProfileId = getActiveProfileId();
  const profiles = loadProfiles().map((slot) =>
    slot.id === activeProfileId
      ? { ...slot, profile: defaultProfile }
      : slot
  );
  saveProfiles(profiles);
  return defaultProfile;
}

/* =========================
   EXPORT / IMPORT
========================= */
export async function exportProgress(): Promise<void> {
  const state = loadProgress();
  const profile = loadProfile();

  const compressedBlob = await compressData({ state, profile });

  const url = URL.createObjectURL(compressedBlob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `soroban-quest-${new Date()
    .toISOString()
    .split("T")[0]}.json.gz`;
  a.click();

  URL.revokeObjectURL(url);
}

export async function importProgress(data: unknown): Promise<Record<string, unknown> | null> {
  const dataObj = data as Record<string, unknown>;
  if (dataObj.state) {
    saveProgress({ ...getDefaultState(), ...(dataObj.state as Record<string, unknown>) });
  }

  if (data.profile) {
    saveProfile({
      ...defaultProfile,
      ...data.profile,
    });
  }

  return data;
}

export async function readAndValidateFile(
  file: Blob
): Promise<ReadFileResult> {
  try {
    let data;

    try {
      data = await decompressData(file);
    } catch {
      const text = await file.text();
      data = JSON.parse(text);
    }

    const validation = validateImportData(data);

    return {
      success: validation.isValid,
      data,
      errors: validation.errors,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: [
        (error as Record<string, unknown>)?.message || "Failed to read or parse file",
      ],
    };
  }
}
