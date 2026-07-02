import { getDefaultState } from "./gameEngine";
export { getDefaultState };

/* =========================
   KEYS
========================= */
const PROGRESS_KEY = "soroban_quest_progress";
const PROFILE_KEY = "soroban_quest_profile";
const PROFILES_KEY = "soroban_quest_profiles";
const ACTIVE_PROFILE_KEY = "soroban_quest_active_profile";
export const MAX_PROFILES = 5;

function createDefaultProfileSlot(index = 0, overrides = {}) {
  const id = overrides.id || `player-${index + 1}`;
  return {
    id,
    profile: {
      ...defaultProfile,
      name: index === 0 ? defaultProfile.name : `Player ${index + 1}`,
      ...(overrides.profile || {}),
    },
    progress: {
      ...getDefaultState(),
      ...(overrides.progress || {}),
    },
  };
}

function sanitizeProfileSlot(slot, index) {
  return createDefaultProfileSlot(index, {
    id: slot?.id || `player-${index + 1}`,
    profile: slot?.profile,
    progress: slot?.progress,
  });
}

function readLegacySlot() {
  let legacyProfile = null;
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

function readLegacyProgress() {
  try {
    const progressData = localStorage.getItem(PROGRESS_KEY);
    if (!progressData) return null;
    return { ...getDefaultState(), ...JSON.parse(progressData) };
  } catch {
    return null;
  }
}

function persistProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles.slice(0, MAX_PROFILES)));
}

function mirrorActiveProfileLegacy(slot) {
  const progressCopy = cleanProgress(slot.progress);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressCopy));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(slot.profile));
}

function cleanProgress(state) {
  const copy = { ...state };
  delete copy.leveledUp;
  delete copy.alreadyCompleted;
  delete copy.newBadges;
  return copy;
}

function progressSignature(state) {
  return JSON.stringify(cleanProgress({ ...getDefaultState(), ...state }));
}

function syncActiveProgressFromLegacy(progress) {
  const activeProfileId = getActiveProfileId();
  const profiles = loadProfiles();
  const updated = profiles.map((slot) =>
    slot.id === activeProfileId
      ? { ...slot, progress: { ...getDefaultState(), ...cleanProgress(progress) } }
      : slot
  );
  persistProfiles(updated);
  return updated.find((slot) => slot.id === activeProfileId)?.progress || progress;
}

export function loadProfiles() {
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

export function saveProfiles(profiles) {
  const sanitized = profiles
    .slice(0, MAX_PROFILES)
    .map((slot, index) => sanitizeProfileSlot(slot, index));
  persistProfiles(sanitized);

  const activeSlot = sanitized.find((slot) => slot.id === getActiveProfileId()) || sanitized[0];
  if (activeSlot) mirrorActiveProfileLegacy(activeSlot);
  return sanitized;
}

export function getActiveProfileId() {
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
    const fallbackId = profiles[0]?.id || "player-1";
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || fallbackId;
  } catch {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || "player-1";
  }
}

export function setActiveProfileId(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
}

export function getActiveProfileSlot() {
  const profiles = loadProfiles();
  const activeProfileId = getActiveProfileId();
  const activeSlot = profiles.find((slot) => slot.id === activeProfileId) || profiles[0];

  if (activeSlot && activeSlot.id !== activeProfileId) {
    setActiveProfileId(activeSlot.id);
  }

  return activeSlot || createDefaultProfileSlot();
}

export function addProfile(profile = {}) {
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
async function compressData(data) {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataArray = encoder.encode(jsonString);
  
  const blob = new Blob([dataArray]);
  const compressedStream = new CompressionStream('gzip');
  const compressedStreamResponse = new Response(blob.stream().pipeThrough(compressedStream));
  const compressedBlob = await compressedStreamResponse.blob();
  
  return compressedBlob;
}

async function decompressData(blob) {
  const decompressedStream = new DecompressionStream('gzip');
  const decompressedStreamResponse = new Response(blob.stream().pipeThrough(decompressedStream));
  const decompressedBlob = await decompressedStreamResponse.blob();
  const decompressedText = await decompressedBlob.text();
  
  return JSON.parse(decompressedText);
}

/* =========================
   VALIDATION
========================= */
export function validateImportData(data) {
  const errors = [];
  
  if (!data) {
    errors.push("Data is empty or null");
    return { isValid: false, errors };
  }
  
  if (!data.state && !data.profile) {
    errors.push("File must contain either state or profile data");
  }
  
  if (data.state) {
    if (!Array.isArray(data.state.completedMissions)) {
      errors.push("state.completedMissions must be an array");
    }
    if (!Array.isArray(data.state.badges)) {
      errors.push("state.badges must be an array");
    }
    if (typeof data.state.xp !== "number") {
      errors.push("state.xp must be a number");
    }
    if (typeof data.state.level !== "number") {
      errors.push("state.level must be a number");
    }
    if (!Array.isArray(data.state.skillPoints)) {
      errors.push("state.skillPoints must be an array");
    }
  }
  
  if (data.profile) {
    if (typeof data.profile.name !== "string") {
      errors.push("profile.name must be a string");
    }
    if (typeof data.profile.avatar !== "string") {
      errors.push("profile.avatar must be a string");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/* =========================
   PROGRESS
========================= */
export function loadProgress() {
  const activeSlot = getActiveProfileSlot();
  const legacyProgress = readLegacyProgress();

  if (
    legacyProgress &&
    progressSignature(legacyProgress) !== progressSignature(activeSlot.progress)
  ) {
    return syncActiveProgressFromLegacy(legacyProgress);
  }

  return activeSlot.progress;
}

export function saveProgress(state) {
  try {
    const activeProfileId = getActiveProfileId();
    const profiles = loadProfiles();
    const updated = profiles.map((slot) =>
      slot.id === activeProfileId
        ? { ...slot, progress: { ...getDefaultState(), ...cleanProgress(state) } }
        : slot
    );
    saveProfiles(updated);
  } catch (e) {
    console.error(e);
  }
}

export function resetProgress() {
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
export const defaultProfile = {
  name: "Stellar Guardian",
  avatar: "🛡️",
};

export function loadProfile() {
  return getActiveProfileSlot().profile;
}

export function saveProfile(profile) {
  const activeProfileId = getActiveProfileId();
  const profiles = loadProfiles();
  const updated = profiles.map((slot) =>
    slot.id === activeProfileId
      ? { ...slot, profile: { ...defaultProfile, ...profile } }
      : slot
  );
  saveProfiles(updated);
}

export function resetProfile() {
  localStorage.removeItem(PROFILE_KEY);
  const activeProfileId = getActiveProfileId();
  const profiles = loadProfiles().map((slot) =>
    slot.id === activeProfileId ? { ...slot, profile: defaultProfile } : slot
  );
  saveProfiles(profiles);
  return defaultProfile;
}

/* =========================
   EXPORT / IMPORT
========================= */
export async function exportProgress() {
  const state = loadProgress();
  const profile = loadProfile();

  const compressedBlob = await compressData({ state, profile });

  const url = URL.createObjectURL(compressedBlob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `soroban-quest-${new Date().toISOString().split("T")[0]}.json.gz`;
  a.click();

  URL.revokeObjectURL(url);
}

export async function importProgress(data) {
  if (data.state) {
    saveProgress({ ...getDefaultState(), ...data.state });
  }

  if (data.profile) {
    saveProfile({
      ...defaultProfile,
      ...data.profile,
    });
  }

  return data;
}

export async function readAndValidateFile(file) {
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
      errors: validation.errors
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: [error.message || "Failed to read or parse file"]
    };
  }
}
