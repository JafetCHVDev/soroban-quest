/* ==========================================
   Mission Loader — Fetches and parses mission data

   Phase 3 (i18n): All getters return language-localized mission
   objects. The language is read from the i18n language bridge, with
   an optional explicit `lang` override for callers that already know
   the active language (e.g. a component using useTranslation()).
   ========================================== */

import { missions } from '../data/missions';
import { theoryQuests, localizeTheoryQuest } from '../data/theoryQuests';
import { getActiveLanguage } from '../i18n/languageBridge';
import { registerMissionCatalog } from './achievements';
import { missionLocale as englishMissionLocale } from '../data/missions/i18n/en';

const localeCache = new Map([['en', englishMissionLocale]]);
const localePromises = new Map();

export function loadMissionLocale(language) {
    const locale = typeof language === 'string'
        ? (language.toLowerCase() === 'zh-cn' ? 'zh-CN' : language.toLowerCase())
        : 'en';
    if (localeCache.has(locale)) return Promise.resolve(localeCache.get(locale));
    if (localePromises.has(locale)) return localePromises.get(locale);
    const loaders = {
        es: () => import('../data/missions/i18n/es.js'),
        fr: () => import('../data/missions/i18n/fr.js'),
        ja: () => import('../data/missions/i18n/ja.js'),
        'zh-CN': () => import('../data/missions/i18n/zh-CN.js'),
    };
    if (!loaders[locale]) return Promise.resolve(locale);
    const promise = loaders[locale]()
        .then((module) => {
            localeCache.set(locale, module.missionLocale);
            return module.missionLocale;
        })
        .finally(() => localePromises.delete(locale));
    localePromises.set(locale, promise);
    return promise;
}

export function localizeMission(mission, language = 'en') {
    if (!mission) return mission;
    const locale = typeof language === 'string'
        ? (language.toLowerCase() === 'zh-cn' ? 'zh-CN' : language.toLowerCase())
        : 'en';
    const localized = localeCache.get(locale)?.[mission.id]
        || localeCache.get('en')?.[mission.id]
        || {};
    const { i18n: _i18n, ...neutral } = mission;
    return { ...neutral, ...localized };
}

export function getAllMissions(lang = getActiveLanguage()) {
    return missions.map((m) => localizeMission(m, lang));
}

/**
 * Language-neutral summary of the mission catalog, used by systems that
 * only need ids/counts (e.g. achievement conditions) instead of
 * hard-coding the number of missions or chapter membership.
 */
export function getMissionCatalog() {
    const chapters = {};
    for (const mission of missions) {
        if (mission.standalone) continue;
        const ch = mission.chapter || 1;
        if (!chapters[ch]) chapters[ch] = [];
        chapters[ch].push(mission.id);
    }
    return {
        missionIds: missions.map((m) => m.id),
        totalMissions: missions.length,
        chapters,
    };
}

// Give the achievement system the real mission count and chapter lists.
registerMissionCatalog(getMissionCatalog());

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
