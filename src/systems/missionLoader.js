/* ==========================================
   Mission Loader — Fetches and parses mission data
   ========================================== */

import { missions } from '../data/missions';

export const chapterTitles = {
    0: 'Rust Fundamentals',
    1: 'First Contracts',
    2: 'State and Access',
    3: 'Advanced Contracts',
};

export function getAllMissions() {
    return missions;
}

export function getMissionById(id) {
    return missions.find(m => m.id === id) || null;
}

export function getMissionsByChapter() {
    const chapters = {};
    for (const mission of missions) {
        const ch = mission.chapter ?? 1;
        if (!chapters[ch]) chapters[ch] = [];
        chapters[ch].push(mission);
    }
    return chapters;
}

export function getChapterTitle(chapter) {
    return chapterTitles[chapter] || `Chapter ${chapter}`;
}

export function getNextMission(currentId) {
    const idx = missions.findIndex(m => m.id === currentId);
    if (idx === -1 || idx === missions.length - 1) return null;
    return missions[idx + 1];
}

export function getPreviousMission(currentId) {
    const idx = missions.findIndex(m => m.id === currentId);
    if (idx <= 0) return null;
    return missions[idx - 1];
}

export function isMissionUnlocked(missionId, completedMissions) {
    const mission = getMissionById(missionId);
    if (!mission) return false;

    if (mission.chapter === 0) return true;

    const coreMissions = missions.filter(m => (m.chapter ?? 1) > 0);
    const idx = coreMissions.findIndex(m => m.id === missionId);
    if (idx <= 0) return true;

    return completedMissions.includes(coreMissions[idx - 1].id);
}
