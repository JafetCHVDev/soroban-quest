/* ==========================================
   Mission Loader — language-neutral definitions
   and cached, on-demand localized content
   ========================================== */

import { missions } from '../data/missions';
import { missionLocale as englishMissionLocale } from '../data/missions/i18n/en';
import { theoryQuests, localizeTheoryQuest } from '../data/theoryQuests';
import { getActiveLanguage } from '../i18n/languageBridge';

const localeLoaders = {
    es: () => import('../data/missions/i18n/es.js'),
    fr: () => import('../data/missions/i18n/fr.js'),
    ja: () => import('../data/missions/i18n/ja.js'),
};

const authoredLocaleModules = {
    en: import.meta.glob('../data/missions/authored/i18n/en/*.json', {
        eager: true,
        import: 'default',
    }),
    es: import.meta.glob('../data/missions/authored/i18n/es/*.json', {
        import: 'default',
    }),
    fr: import.meta.glob('../data/missions/authored/i18n/fr/*.json', {
        import: 'default',
    }),
    ja: import.meta.glob('../data/missions/authored/i18n/ja/*.json', {
        import: 'default',
    }),
};

const DEFAULT_MISSION_LANG = 'en';
const localeCache = new Map([
    [DEFAULT_MISSION_LANG, {
        ...englishMissionLocale,
        ...loadEagerAuthoredLocale('en'),
    }],
]);
const localePromises = new Map();

function missionIdFromPath(filePath) {
    return filePath.slice(filePath.lastIndexOf('/') + 1).replace(/\.json$/, '');
}

function loadEagerAuthoredLocale(language) {
    return Object.fromEntries(
        Object.entries(authoredLocaleModules[language] || {}).map(([filePath, content]) => [
            missionIdFromPath(filePath),
            content,
        ]),
    );
}

async function loadAuthoredLocale(language) {
    const modules = authoredLocaleModules[language] || {};
    const entries = await Promise.all(
        Object.entries(modules).map(async ([filePath, load]) => [
            missionIdFromPath(filePath),
            await load(),
        ]),
    );
    return Object.fromEntries(entries);
}

function normalizeMissionLanguage(language) {
    return typeof language === 'string' ? language.toLowerCase() : DEFAULT_MISSION_LANG;
}

/**
 * Loads and caches one non-English mission locale and any authored content.
 * The English content is statically available as the synchronous fallback.
 */
export function loadMissionLocale(language) {
    const locale = normalizeMissionLanguage(language);
    if (!localeLoaders[locale]) return Promise.resolve(localeCache.get(DEFAULT_MISSION_LANG));
    if (localeCache.has(locale)) return Promise.resolve(localeCache.get(locale));
    if (localePromises.has(locale)) return localePromises.get(locale);

    const promise = Promise.all([
        localeLoaders[locale](),
        loadAuthoredLocale(locale),
    ])
        .then(([module, authoredContent]) => {
            const content = {
                ...module.missionLocale,
                ...authoredContent,
            };
            localeCache.set(locale, content);
            return content;
        })
        .finally(() => localePromises.delete(locale));
    localePromises.set(locale, promise);
    return promise;
}

/**
 * Returns a render-ready mission; if the requested locale has not loaded yet,
 * English is returned until the caller rerenders after loadMissionLocale.
 */
export function localizeMission(mission, language = DEFAULT_MISSION_LANG) {
    if (!mission) return mission;

    const neutral = { ...mission };
    delete neutral.i18n;
    const locale = localeCache.get(normalizeMissionLanguage(language)) || localeCache.get(DEFAULT_MISSION_LANG);
    const localized = locale[mission.id] || localeCache.get(DEFAULT_MISSION_LANG)[mission.id] || {};
    return { ...neutral, ...localized };
}

/** Localizes an array of missions. */
export function localizeMissions(list, language = DEFAULT_MISSION_LANG) {
    return (list || []).map((mission) => localizeMission(mission, language));
}

/** @param {import('../types/game').Language} [language] @returns {import('../types/game').LocalizedMission[]} */
export function getAllMissions(language = getActiveLanguage()) {
    return localizeMissions(missions, language);
}

/** @returns {import('../data/theoryQuests').LocalizedTheoryQuest[]} */
export function getAllTheoryQuests(language = getActiveLanguage()) {
    return theoryQuests
        .map((quest) => localizeTheoryQuest(quest, language))
        .filter((quest) => quest != null);
}

export function getTheoryQuestById(id, language = getActiveLanguage()) {
    const quest = theoryQuests.find((item) => item.id === id);
    return quest ? localizeTheoryQuest(quest, language) : null;
}

export function getMissionById(id, language = getActiveLanguage()) {
    const mission = missions.find((item) => item.id === id);
    return mission ? localizeMission(mission, language) : null;
}

export function getMissionsByChapter(language = getActiveLanguage()) {
    const chapters = {};
    for (const mission of missions) {
        if (mission.standalone) continue;
        const chapter = mission.chapter || 1;
        if (!chapters[chapter]) chapters[chapter] = [];
        chapters[chapter].push(localizeMission(mission, language));
    }
    return chapters;
}

export function getStandaloneMissions(language = getActiveLanguage()) {
    return missions
        .filter((mission) => mission.standalone)
        .map((mission) => localizeMission(mission, language));
}

export function getCampaignMissions(language = getActiveLanguage()) {
    return missions
        .filter((mission) => !mission.standalone)
        .map((mission) => localizeMission(mission, language));
}

export function getNextMission(currentId, language = getActiveLanguage()) {
    const campaignMissions = missions.filter((mission) => !mission.standalone);
    const missionIndex = campaignMissions.findIndex((mission) => mission.id === currentId);
    if (missionIndex === -1 || missionIndex === campaignMissions.length - 1) return null;
    return localizeMission(campaignMissions[missionIndex + 1], language);
}

export function getPreviousMission(currentId, language = getActiveLanguage()) {
    const campaignMissions = missions.filter((mission) => !mission.standalone);
    const missionIndex = campaignMissions.findIndex((mission) => mission.id === currentId);
    if (missionIndex <= 0) return null;
    return localizeMission(campaignMissions[missionIndex - 1], language);
}

export function isMissionUnlocked(missionId, completedMissions) {
    const mission = missions.find((item) => item.id === missionId);
    if (!mission) return false;
    if (mission.standalone) return true;

    const campaignMissions = missions.filter((item) => !item.standalone);
    const index = campaignMissions.findIndex((item) => item.id === missionId);
    if (index === -1) return false;
    if (index === 0) return true;

    return completedMissions.includes(campaignMissions[index - 1].id);
}
