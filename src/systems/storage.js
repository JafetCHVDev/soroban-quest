/* ==========================================
   Storage — localStorage persistence + export/import
   ========================================== */

import { getDefaultState } from './gameEngine';

const STORAGE_KEY = 'soroban_quest_progress';

export function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultState();
    const parsed = JSON.parse(data);
    return { ...getDefaultState(), ...parsed };
  } catch {
    return getDefaultState();
  }
}

export function saveProgress(state) {
  try {
    const toSave = { ...state };
    delete toSave.leveledUp;
    delete toSave.alreadyCompleted;
    delete toSave.newBadges;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaultState();
}

export function exportProgress() {
  const state = loadProgress();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `soroban-quest-progress-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProgress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const state = { ...getDefaultState(), ...data };
        saveProgress(state);
        resolve(state);
      } catch {
        reject(new Error('Invalid progress file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
