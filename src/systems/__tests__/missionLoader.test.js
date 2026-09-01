import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getAllMissions,
  getMissionById,
  getMissionsByChapter,
  getNextMission,
  getPreviousMission,
  isMissionUnlocked,
} from '../missionLoader.js';
import { missions } from '../../data/missions.js';
import {
  getActiveLanguage,
  setActiveLanguage,
} from '../../i18n/languageBridge.js';

// The loader reads the active UI language from the language bridge, which is a
// module-level singleton. Reset it to English before and after every test so a
// localization test can never leak state into an unrelated one.
beforeEach(() => {
  setActiveLanguage('en');
});
afterEach(() => {
  setActiveLanguage('en');
});

describe('missionLoader', () => {
  describe('getAllMissions', () => {
    it('returns all missions (19 campaign + 3 standalone = 22)', () => {
      expect(getAllMissions()).toHaveLength(22);
      expect(getAllMissions()).toHaveLength(missions.length);
      const campaign = getAllMissions().filter((m) => !m.standalone);
      expect(campaign).toHaveLength(19);
    });

    it('returns render-ready (localized) objects, not raw i18n data', () => {
      for (const mission of getAllMissions('en')) {
        // Localizable fields are flattened onto the object...
        expect(typeof mission.title).toBe('string');
        expect(typeof mission.story).toBe('string');
        expect(typeof mission.learningGoal).toBe('string');
        expect(Array.isArray(mission.hints)).toBe(true);
        // ...and the raw i18n bag is stripped out.
        expect(mission.i18n).toBeUndefined();
      }
    });

    it('preserves language-neutral fields for every mission', () => {
      for (const mission of getAllMissions('en')) {
        expect(mission.id).toBeTruthy();
        if (mission.standalone) {
          expect(mission.chapter === undefined || mission.chapter === null || typeof mission.chapter === 'number').toBe(true);
        } else {
          expect(typeof mission.chapter).toBe('number');
        }
        expect(typeof mission.order).toBe('number');
        expect(typeof mission.xpReward).toBe('number');
      }
    });

    it('returns missions with unique ids', () => {
      const ids = getAllMissions().map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('localizes titles into Spanish when lang is "es"', () => {
      const en = getAllMissions('en');
      const es = getAllMissions('es');

      expect(en[0].title).toBe('The First Contract');
      expect(es[0].title).toBe('El Primer Contrato');
    });

    it('uses the active language when no explicit lang is passed', () => {
      setActiveLanguage('es');
      expect(getActiveLanguage()).toBe('es');

      expect(getAllMissions()[0].title).toBe('El Primer Contrato');
    });
  });

  describe('getMissionById', () => {
    it('returns the correct mission data for a known id', () => {
      const mission = getMissionById('hello-soroban', 'en');

      expect(mission).not.toBeNull();
      expect(mission.id).toBe('hello-soroban');
      expect(mission.title).toBe('The First Contract');
      expect(mission.chapter).toBe(1);
      expect(mission.order).toBe(1);
    });

    it('returns null for a non-existent mission id', () => {
      expect(getMissionById('does-not-exist')).toBeNull();
      expect(getMissionById('')).toBeNull();
      expect(getMissionById(undefined)).toBeNull();
    });

    it('localizes content into Spanish', () => {
      const mission = getMissionById('hello-soroban', 'es');

      expect(mission.title).toBe('El Primer Contrato');
      expect(mission.learningGoal).toContain('Crea tu primer contrato');
    });

    it('falls back to English when a translation is missing', () => {
      // A locale with no translations (e.g. "de") should resolve every
      // localizable field to the English default rather than undefined.
      const mission = getMissionById('hello-soroban', 'de');

      expect(mission.title).toBe('The First Contract');
      expect(mission.hints.length).toBeGreaterThan(0);
    });
  });

  describe('getMissionsByChapter', () => {
    it('groups every campaign mission under its chapter (standalone excluded)', () => {
      const chapters = getMissionsByChapter('en');

      // 7 chapters, 19 campaign missions total across them (standalone excluded).
      expect(Object.keys(chapters)).toHaveLength(7);
      const total = Object.values(chapters).reduce(
        (sum, list) => sum + list.length,
        0,
      );
      expect(total).toBe(19);
      // Ensure standalone missions are not present in chapter grouping
      const allIds = Object.values(chapters).flat().map((m) => m.id);
      expect(allIds).not.toContain('standalone-storage-dojo');
      expect(allIds).not.toContain('standalone-auth-guard');
      expect(allIds).not.toContain('standalone-vector-lab');
    });

    it('places the correct missions in chapter 1', () => {
      const chapters = getMissionsByChapter('en');

      expect(chapters[1].map((m) => m.id)).toEqual([
        'hello-soroban',
        'greetings-protocol',
      ]);
    });

    it('localizes the grouped missions', () => {
      const chapters = getMissionsByChapter('es');

      expect(chapters[1][0].title).toBe('El Primer Contrato');
    });
  });

  describe('getNextMission / getPreviousMission', () => {
    it('returns the mission that follows the given one', () => {
      const next = getNextMission('hello-soroban', 'en');

      expect(next.id).toBe('greetings-protocol');
      expect(next.title).toBe('Greetings Protocol');
    });

    it('returns null when asking for the mission after the last one', () => {
      const last = missions[missions.length - 1];
      expect(getNextMission(last.id)).toBeNull();
    });

    it('returns the mission that precedes the given one', () => {
      const prev = getPreviousMission('greetings-protocol', 'en');

      expect(prev.id).toBe('hello-soroban');
    });

    it('returns null when asking for the mission before the first one', () => {
      expect(getPreviousMission('hello-soroban')).toBeNull();
    });

    it('returns null for a non-existent mission id', () => {
      expect(getNextMission('nope')).toBeNull();
      expect(getPreviousMission('nope')).toBeNull();
    });

    it('localizes the returned neighbour mission', () => {
      expect(getNextMission('hello-soroban', 'es').title).toBe(
        'Protocolo de Saludos',
      );
    });
  });

  describe('isMissionUnlocked', () => {
    it('always unlocks the very first mission, even with no progress', () => {
      expect(isMissionUnlocked('hello-soroban', [])).toBe(true);
    });

    it('keeps a later mission locked until the previous one is completed', () => {
      expect(isMissionUnlocked('greetings-protocol', [])).toBe(false);
    });

    it('unlocks a mission once its immediate predecessor is completed', () => {
      expect(isMissionUnlocked('greetings-protocol', ['hello-soroban'])).toBe(
        true,
      );
    });

    it('gates progression on the immediate predecessor, not just any progress', () => {
      // 'counter-vault' (order 3) requires 'greetings-protocol' (order 2),
      // so completing only the first mission is not enough to unlock it.
      expect(isMissionUnlocked('counter-vault', ['hello-soroban'])).toBe(false);
      expect(
        isMissionUnlocked('counter-vault', [
          'hello-soroban',
          'greetings-protocol',
        ]),
      ).toBe(true);
    });

    it('returns false for a non-existent mission id', () => {
      expect(isMissionUnlocked('does-not-exist', [])).toBe(false);
      expect(
        isMissionUnlocked('does-not-exist', ['hello-soroban']),
      ).toBe(false);
    });
  });
});
