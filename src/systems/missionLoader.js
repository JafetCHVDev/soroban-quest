/* ==========================================
   Mission Loader — Fetches and parses mission data

   Phase 3 (i18n): All getters return language-localized mission
   objects. The language is read from the i18n language bridge, with
   an optional explicit `lang` override for callers that already know
   the active language (e.g. a component using useTranslation()).
   ========================================== */

import { missions, localizeMission } from '../data/missions';
import { getActiveLanguage } from '../i18n/languageBridge';

export function getAllMissions(lang = getActiveLanguage()) {
    return missions.map((m) => localizeMission(m, lang));
}

export function getMissionById(id, lang = getActiveLanguage()) {
    const mission = missions.find(m => m.id === id);
    return mission ? localizeMission(mission, lang) : null;
}

export function getMissionsByChapter(lang = getActiveLanguage()) {
    const chapters = {};
    for (const mission of missions) {
        const ch = mission.chapter || 1;
        if (!chapters[ch]) chapters[ch] = [];
        chapters[ch].push(localizeMission(mission, lang));
    }
    return chapters;
}

export function getNextMission(currentId, lang = getActiveLanguage()) {
    const idx = missions.findIndex(m => m.id === currentId);
    if (idx === -1 || idx === missions.length - 1) return null;
    return localizeMission(missions[idx + 1], lang);
}

export function getPreviousMission(currentId, lang = getActiveLanguage()) {
    const idx = missions.findIndex(m => m.id === currentId);
    if (idx <= 0) return null;
    return localizeMission(missions[idx - 1], lang);
}

export function isMissionUnlocked(missionId, completedMissions) {
    // Language-neutral: relies only on ids and order.
    const idx = missions.findIndex(m => m.id === missionId);
    if (idx === -1) return false;

    // First mission is always unlocked
    if (idx === 0) return true;

    // Subsequent missions require the previous one to be completed
    const prevMission = missions[idx - 1];
    return completedMissions.includes(prevMission.id);
}
