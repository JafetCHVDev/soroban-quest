/**
 * TypeScript declarations for missionLoader.js
 */
export interface MissionCatalog {
  /** Ids of every mission (campaign + standalone). */
  missionIds: string[];
  /** Number of missions in the catalog. */
  totalMissions: number;
  /** Campaign mission ids grouped by chapter number. */
  chapters: Record<number, string[]>;
}

// Mission objects are still authored in untyped JS; keep them `any` (as they
// were before this declaration existed) so existing consumers are not forced
// through a typing migration here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseMission = any;

export function getMissionCatalog(): MissionCatalog;
/** Loads (once) and caches the mission narrative for a non-English locale. */
export function loadMissionLocale(_language: string): Promise<unknown>;
export function localizeMission(_mission: LooseMission, _language?: string): LooseMission;
export function localizeMissions(_list: LooseMission[], _language?: string): LooseMission[];
export function getAllMissions(_lang?: string): LooseMission[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAllTheoryQuests(_lang?: string): any[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTheoryQuestById(_id: string, _lang?: string): any;
export function getMissionById(_id: string, _lang?: string): LooseMission | null;
export function getMissionsByChapter(_lang?: string): Record<number, LooseMission[]>;
export function getStandaloneMissions(_lang?: string): LooseMission[];
export function getCampaignMissions(_lang?: string): LooseMission[];
export function getNextMission(_currentId: string, _lang?: string): LooseMission | null;
export function getPreviousMission(_currentId: string, _lang?: string): LooseMission | null;
export function isMissionUnlocked(_missionId: string, _completedMissions: string[]): boolean;
