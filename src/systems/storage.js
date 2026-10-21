import { BADGES, getDefaultState, getLevelFromXP, xpForLevel } from "./gameEngine";
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
    const parsed = JSON.parse(progressData);
    
    // Migration: purchasedItems -> inventory
    if (!parsed.inventory) {
      parsed.inventory = {
        owned: parsed.purchasedItems || [],
        equipped: [],
      };
    }
    
    return { ...getDefaultState(), ...parsed };
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
// Upper bounds for imported progress. The level cap sits far above what the
// mission catalog can award, and the XP cap is the most XP a player can hold
// while still at that level on the curve in gameEngine.
export const MAX_IMPORT_LEVEL = 100;
export const MAX_IMPORT_XP = xpForLevel(MAX_IMPORT_LEVEL + 1) - 1;
export const MAX_IMPORT_ARRAY_LENGTH = 1000;
const MAX_IMPORT_STREAK = 3650;
const MAX_PROFILE_FIELD_LENGTH = 100;
const MAX_LISTED_UNKNOWN_IDS = 5;

function checkNumber(errors, path, value, { min, max, integer = false }) {
  const valid = integer
    ? Number.isInteger(value) && value >= min && value <= max
    : typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
  if (!valid) {
    errors.push(
      integer
        ? `${path} must be an integer between ${min} and ${max}`
        : `${path} must be a finite number between ${min} and ${max}`
    );
  }
  return valid;
}

function checkArray(errors, path, value) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return false;
  }
  if (value.length > MAX_IMPORT_ARRAY_LENGTH) {
    errors.push(`${path} must not contain more than ${MAX_IMPORT_ARRAY_LENGTH} entries`);
    return false;
  }
  return true;
}

function checkKnownIds(errors, path, ids, knownIds, label) {
  if (ids.some((id) => typeof id !== "string")) {
    errors.push(`${path} must contain only strings`);
    return;
  }
  if (new Set(ids).size !== ids.length) {
    errors.push(`${path} must not contain duplicate entries`);
  }
  if (!knownIds) return;

  const unknown = ids.filter((id) => !knownIds.has(id));
  if (unknown.length === 0) return;
  const listed = unknown.slice(0, MAX_LISTED_UNKNOWN_IDS).join(", ");
  const extra = unknown.length - MAX_LISTED_UNKNOWN_IDS;
  errors.push(
    `${path} contains unknown ${label} id(s): ${listed}${extra > 0 ? ` (and ${extra} more)` : ""}`
  );
}

function checkPlainObject(errors, path, value) {
  if (!isPlainObject(value)) {
    errors.push(`${path} must be an object`);
    return false;
  }
  if (Object.keys(value).length > MAX_IMPORT_ARRAY_LENGTH) {
    errors.push(`${path} must not contain more than ${MAX_IMPORT_ARRAY_LENGTH} entries`);
    return false;
  }
  return true;
}

function validateImportState(state, errors, missionIds, badgeIds) {
  const xpValid = checkNumber(errors, "state.xp", state.xp, { min: 0, max: MAX_IMPORT_XP });
  const levelValid = checkNumber(errors, "state.level", state.level, {
    min: 1,
    max: MAX_IMPORT_LEVEL,
    integer: true,
  });
  if (xpValid && levelValid) {
    const earnedLevel = getLevelFromXP(state.xp);
    if (state.level > earnedLevel) {
      errors.push(
        `state.level (${state.level}) is higher than the level earned by state.xp (${earnedLevel})`
      );
    }
  }
  if (state.gold !== undefined) {
    checkNumber(errors, "state.gold", state.gold, { min: 0, max: MAX_IMPORT_XP });
  }
  if (state.streak !== undefined) {
    checkNumber(errors, "state.streak", state.streak, {
      min: 0,
      max: MAX_IMPORT_STREAK,
      integer: true,
    });
  }

  if (checkArray(errors, "state.completedMissions", state.completedMissions)) {
    checkKnownIds(
      errors,
      "state.completedMissions",
      state.completedMissions,
      missionIds,
      "mission"
    );
  }
  if (
    state.firstTryMissions !== undefined &&
    checkArray(errors, "state.firstTryMissions", state.firstTryMissions)
  ) {
    checkKnownIds(errors, "state.firstTryMissions", state.firstTryMissions, missionIds, "mission");
  }
  if (checkArray(errors, "state.badges", state.badges)) {
    checkKnownIds(errors, "state.badges", state.badges, badgeIds, "badge");
  }

  // skillPoints is not part of the default state, so exports may omit it.
  for (const field of ["skillPoints", "purchasedItems", "dailyChallengeCompletedDates"]) {
    if (state[field] !== undefined) checkArray(errors, `state.${field}`, state[field]);
  }
  // The shop and Profile page read both inventory lists unguarded, and only
  // owned items may be equipped (an equipped xp-boost doubles XP awards).
  const { inventory } = state;
  if (inventory !== undefined && checkPlainObject(errors, "state.inventory", inventory)) {
    const ownedValid = checkArray(errors, "state.inventory.owned", inventory.owned);
    const equippedValid = checkArray(errors, "state.inventory.equipped", inventory.equipped);
    if (ownedValid && equippedValid) {
      const owned = new Set(inventory.owned);
      const unowned = inventory.equipped.filter((item) => !owned.has(item));
      if (unowned.length > 0) {
        errors.push(
          `state.inventory.equipped contains item(s) not in state.inventory.owned: ${unowned
            .slice(0, MAX_LISTED_UNKNOWN_IDS)
            .join(", ")}`
        );
      }
    }
  }
  for (const field of ["missionAttempts", "goldUnlockedHints"]) {
    if (state[field] !== undefined) checkPlainObject(errors, `state.${field}`, state[field]);
  }
}

/**
 * Validate a parsed import file before it is written to persisted state.
 * `options.missionIds` (missions and theory quests) enables the completed
 * mission id check; `options.badgeIds` defaults to the badges in gameEngine.
 */
export function validateImportData(data, options = {}) {
  const errors = [];
  const missionIds = options.missionIds ? new Set(options.missionIds) : null;
  const badgeIds = new Set(options.badgeIds ?? BADGES.map((badge) => badge.id));

  if (!data) {
    errors.push("Data is empty or null");
    return { isValid: false, errors };
  }
  
  if (!data.state && !data.profile) {
    errors.push("File must contain either state or profile data");
  }
  
  // Check presence rather than truthiness so `state: null` is reported
  // instead of silently importing only the profile.
  if (data.state !== undefined) {
    if (isPlainObject(data.state)) {
      validateImportState(data.state, errors, missionIds, badgeIds);
    } else {
      errors.push("state must be an object");
    }
  }
  
  if (data.profile !== undefined && !isPlainObject(data.profile)) {
    errors.push("profile must be an object");
  } else if (data.profile !== undefined) {
    for (const field of ["name", "avatar"]) {
      const value = data.profile[field];
      if (typeof value !== "string" || value.length > MAX_PROFILE_FIELD_LENGTH) {
        errors.push(
          `profile.${field} must be a string of at most ${MAX_PROFILE_FIELD_LENGTH} characters`
        );
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// The mission catalog is loaded lazily so it stays out of the app shell
// bundle; only the import flow needs it.
async function loadKnownMissionIds() {
  const { getAllMissions, getAllTheoryQuests } = await import("./missionLoader");
  return [...getAllMissions(), ...getAllTheoryQuests()].map((item) => item.id);
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
    console.error('Failed to save progress:', e);
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
   SMART MERGE
========================= */
// Numeric fields where the higher value wins (progress only ever grows).
const MERGE_MAX_FIELDS = ["xp", "gold", "level", "streak"];
// Set-like fields that should be unioned (order preserved, duplicates removed).
const MERGE_UNION_FIELDS = [
  "completedMissions",
  "badges",
  "firstTryMissions",
  "purchasedItems",
  "skillPoints",
];
// Boolean flags: treated as "sticky" — true if either side is true.
const MERGE_OR_FIELDS = ["xpBoostActive", "streakFreezeUsed"];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Derive a stable identity for de-duplication. Objects are keyed by their
// natural id/timestamp so append-only logs merge-and-dedupe correctly.
function mergeKeyOf(item) {
  if (item !== null && typeof item === "object") {
    return item.id ?? item.timestamp ?? JSON.stringify(item);
  }
  return item;
}

function unionArray(local, imported) {
  const a = Array.isArray(local) ? local : [];
  const b = Array.isArray(imported) ? imported : [];
  const seen = new Set();
  const result = [];
  for (const item of [...a, ...b]) {
    const key = mergeKeyOf(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

function maxNumber(a, b) {
  const x = typeof a === "number" && Number.isFinite(a) ? a : 0;
  const y = typeof b === "number" && Number.isFinite(b) ? b : 0;
  return Math.max(x, y);
}

// Per-mission attempt counts: keep the higher count for each mission id.
function mergeAttempts(local, imported) {
  const a = isPlainObject(local) ? local : {};
  const b = isPlainObject(imported) ? imported : {};
  const result = { ...a };
  for (const [key, value] of Object.entries(b)) {
    result[key] = maxNumber(result[key], value);
  }
  return result;
}

function latestDate(a, b) {
  const ta = a ? Date.parse(a) : NaN;
  const tb = b ? Date.parse(b) : NaN;
  if (Number.isNaN(ta)) return b ?? null;
  if (Number.isNaN(tb)) return a ?? null;
  return tb > ta ? b : a;
}

/**
 * Pure smart-merge of two progress states. `local` is the current on-device
 * progress, `imported` is the progress from a backup file. Neither argument is
 * mutated. Each field uses an explicit strategy: numeric fields take the max,
 * set-like fields union, boolean flags OR, per-mission attempts take the max,
 * and dates take the most recent — so no earned progress is ever lost.
 */
export function mergeProgress(local, imported) {
  const base = getDefaultState();
  const a = { ...base, ...cleanProgress(local || {}) };
  const b = { ...base, ...cleanProgress(imported || {}) };

  const merged = { ...a };

  for (const field of MERGE_MAX_FIELDS) {
    merged[field] = maxNumber(a[field], b[field]);
  }
  // Keep level consistent with the merged XP total.
  merged.level = Math.max(merged.level, getLevelFromXP(merged.xp));

  for (const field of MERGE_UNION_FIELDS) {
    merged[field] = unionArray(a[field], b[field]);
  }

  for (const field of MERGE_OR_FIELDS) {
    merged[field] = Boolean(a[field]) || Boolean(b[field]);
  }

  merged.missionAttempts = mergeAttempts(a.missionAttempts, b.missionAttempts);
  merged.lastLogin = latestDate(a.lastLogin, b.lastLogin);
  merged.currentMission = a.currentMission ?? b.currentMission ?? null;

  // Handle any extra fields not part of the known default shape (e.g.
  // journal/activity logs), so future additions still merge sensibly instead
  // of being dropped or silently taken from only one side.
  const handled = new Set([
    ...MERGE_MAX_FIELDS,
    ...MERGE_UNION_FIELDS,
    ...MERGE_OR_FIELDS,
    "missionAttempts",
    "lastLogin",
    "currentMission",
  ]);
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (handled.has(key)) continue;
    if (Array.isArray(a[key]) || Array.isArray(b[key])) {
      merged[key] = unionArray(a[key], b[key]);
    } else if (typeof a[key] === "number" || typeof b[key] === "number") {
      merged[key] = maxNumber(a[key], b[key]);
    } else {
      merged[key] = a[key] ?? b[key];
    }
  }

  return merged;
}

/**
 * Build a human-readable diff of what a merge would change, for the import
 * preview UI. Returns before/after values (and count deltas for set-like
 * fields) so the player sees the combined result before committing.
 */
export function summarizeMerge(local, imported) {
  const before = { ...getDefaultState(), ...cleanProgress(local || {}) };
  const after = mergeProgress(local, imported);

  const countField = (field) => {
    const b = Array.isArray(before[field]) ? before[field].length : 0;
    const aft = Array.isArray(after[field]) ? after[field].length : 0;
    return { before: b, after: aft, added: aft - b };
  };

  return {
    xp: { before: before.xp, after: after.xp },
    gold: { before: before.gold, after: after.gold },
    level: { before: before.level, after: after.level },
    completedMissions: countField("completedMissions"),
    badges: countField("badges"),
    skillPoints: countField("skillPoints"),
  };
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

export async function importProgress(data, options = {}) {
  const { mode = "overwrite" } = options;

  if (data.state) {
    if (mode === "merge") {
      saveProgress(mergeProgress(loadProgress(), data.state));
    } else {
      saveProgress({ ...getDefaultState(), ...data.state });
    }
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
    
    const validation = validateImportData(data, { missionIds: await loadKnownMissionIds() });
    
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
