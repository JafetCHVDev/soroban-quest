import { getDefaultState } from "./gameEngine";

/* =========================
   KEYS
========================= */
const PROGRESS_KEY = "soroban_quest_progress";
const PROFILE_KEY = "soroban_quest_profile";

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
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) return getDefaultState();

    return { ...getDefaultState(), ...JSON.parse(data) };
  } catch {
    return getDefaultState();
  }
}

export function saveProgress(state) {
  try {
    const copy = { ...state };
    delete copy.leveledUp;
    delete copy.alreadyCompleted;
    delete copy.newBadges;

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(copy));
  } catch (e) {
    console.error(e);
  }
}

export function resetProgress() {
  localStorage.removeItem(PROGRESS_KEY);
  return getDefaultState();
}

/* =========================
   PROFILE
========================= */
export const defaultProfile = {
  name: "Stellar Guardian",
  avatar: "🛡️",
};

export function loadProfile() {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) return defaultProfile;

    return { ...defaultProfile, ...JSON.parse(data) };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function resetProfile() {
  localStorage.removeItem(PROFILE_KEY);
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