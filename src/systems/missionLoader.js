/* ==========================================
   Mission Loader — Fetches and parses mission data

   Phase 3 (i18n): All getters return language-localized mission
   objects. The language is read from the i18n language bridge, with
   an optional explicit `lang` override for callers that already know
   the active language (e.g. a component using useTranslation()).
   ========================================== */

import { missions, localizeMission } from '../data/missions';
import { theoryQuests, localizeTheoryQuest } from '../data/theoryQuests';
import { getActiveLanguage } from '../i18n/languageBridge';

export function getAllMissions(lang = getActiveLanguage()) {
    return missions.map((m) => localizeMission(m, lang));
}

export function getAllTheoryQuests(lang = getActiveLanguage()) {
    return theoryQuests.map((q) => localizeTheoryQuest(q, lang));
}

export function getTheoryQuestById(id, lang = getActiveLanguage()) {
    const quest = theoryQuests.find((item) => item.id === id);
    return quest ? localizeTheoryQuest(quest, lang) : null;
}

export function getMissionById(id, lang = getActiveLanguage()) {
    const mission = missions.find(m => m.id === id);
    return mission ? localizeMission(mission, lang) : null;
}

export function getMissionsByChapter(lang = getActiveLanguage()) {
    const chapters = {};
    for (const mission of missions) {
        if (mission.standalone) continue;
        const ch = mission.chapter || 1;
        if (!chapters[ch]) chapters[ch] = [];
        chapters[ch].push(localizeMission(mission, lang));
    }
    return chapters;
}

export function getStandaloneMissions(lang = getActiveLanguage()) {
    return missions.filter((m) => m.standalone).map((m) => localizeMission(m, lang));
}

export function getCampaignMissions(lang = getActiveLanguage()) {
    return missions.filter((m) => !m.standalone).map((m) => localizeMission(m, lang));
}

export function getNextMission(currentId, lang = getActiveLanguage()) {
    const campaignMissions = missions.filter((m) => !m.standalone);
    const mission = missions.find((m) => m.id === currentId);
    if (!mission) return null;
    // For standalone missions, next is null (no campaign sequence)
    if (mission.standalone) return null;
    const idx = campaignMissions.findIndex((m) => m.id === currentId);
    if (idx === -1 || idx === campaignMissions.length - 1) return null;
    return localizeMission(campaignMissions[idx + 1], lang);
}

export function getPreviousMission(currentId, lang = getActiveLanguage()) {
    const campaignMissions = missions.filter((m) => !m.standalone);
    const mission = missions.find((m) => m.id === currentId);
    if (!mission) return null;
    if (mission.standalone) return null;
    const idx = campaignMissions.findIndex((m) => m.id === currentId);
    if (idx <= 0) return null;
    return localizeMission(campaignMissions[idx - 1], lang);
}

export function isMissionUnlocked(missionId, completedMissions) {
    // Language-neutral: relies only on ids and order.
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return false;

    // Standalone missions are always unlocked — no campaign gating
    if (mission.standalone) return true;

    // Campaign progression: only consider non-standalone missions in sequence
    const campaignMissions = missions.filter((m) => !m.standalone);
    const idx = campaignMissions.findIndex((m) => m.id === missionId);
    if (idx === -1) return false;

    // First campaign mission is always unlocked
    if (idx === 0) return true;

    // Subsequent campaign missions require the previous campaign mission to be completed
    const prevMission = campaignMissions[idx - 1];
    return completedMissions.includes(prevMission.id);
}
