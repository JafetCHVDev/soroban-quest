/* ==========================================
   Mission Loader — Fetches and parses mission data
   ========================================== */

import { missions } from '../data/missions';

export function getAllMissions() {
  return missions;
}

export function getMissionById(id) {
  return missions.find((m) => m.id === id) || null;
}

export function getMissionsByChapter() {
  const chapters = {};
  for (const mission of missions) {
    const ch = mission.chapter || 1;
    if (!chapters[ch]) chapters[ch] = [];
    chapters[ch].push(mission);
  }
  return chapters;
}

export function getNextMission(currentId) {
  const idx = missions.findIndex((m) => m.id === currentId);
  if (idx === -1 || idx === missions.length - 1) return null;
  return missions[idx + 1];
}

export function getPreviousMission(currentId) {
  const idx = missions.findIndex((m) => m.id === currentId);
  if (idx <= 0) return null;
  return missions[idx - 1];
}

export function isMissionUnlocked(missionId, completedMissions) {
  const mission = getMissionById(missionId);
  if (!mission) return false;

  // First mission is always unlocked
  const idx = missions.findIndex((m) => m.id === missionId);
  if (idx === 0) return true;

  // Subsequent missions require the previous one to be completed
  const prevMission = missions[idx - 1];
  return completedMissions.includes(prevMission.id);
}
