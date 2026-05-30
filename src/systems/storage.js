import { getDefaultState } from "./gameEngine";

/* =========================
   KEYS
========================= */
const PROGRESS_KEY = "soroban_quest_progress";
const PROFILE_KEY = "soroban_quest_profile";

/* =========================
   PROGRESS — pure load/save
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
   Pure serializers — no business logic, no implicit reads. Callers pass in
   the live in-memory state (from GameContext) and profile.
========================= */
export function exportProgress(state, profile) {
  const blob = new Blob(
    [JSON.stringify({ state, profile }, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `soroban-quest-${new Date().toISOString().split("T")[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

export function importProgress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve({
          state: data.state ? { ...getDefaultState(), ...data.state } : null,
          profile: data.profile
            ? { ...defaultProfile, ...data.profile }
            : null,
        });
      } catch {
        reject(new Error("Invalid file"));
      }
    };

    reader.readAsText(file);
  });
}
