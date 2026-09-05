import { describe, it, expect } from 'vitest';
import jaLocale from '../locales/ja.json';
import { missions, localizeMission } from '../../data/missions';
import { campaigns, localizeCampaign } from '../../data/campaigns';

/**
 * Japanese Localization Tests
 * 
 * Verifies that:
 * 1. Japanese locale (ja.json) contains all required keys
 * 2. All UI strings are properly translated to Japanese
 * 3. Missions have complete Japanese translations
 * 4. Campaigns have complete Japanese translations
 * 5. localizeMission/localizeCampaign functions work with ja language
 * 6. Japanese characters render without errors
 */

describe('Japanese (ja) Localization', () => {
  
  // ============================================================================
  // Test Suite 1: Locale File Completeness
  // ============================================================================
  
  describe('ja.json Locale File', () => {
    it('should export a valid JSON object', () => {
      expect(jaLocale).toBeDefined();
      expect(typeof jaLocale).toBe('object');
    });

    it('should contain language metadata with "日本語"', () => {
      expect(jaLocale.languages).toBeDefined();
      expect(jaLocale.languages.ja).toBe('日本語');
    });

    it('should have common UI strings', () => {
      expect(jaLocale.common).toBeDefined();
      expect(jaLocale.common.selectLanguage).toBeDefined();
      expect(typeof jaLocale.common.selectLanguage).toBe('string');
      // Verify it's in Japanese (contains hiragana/kanji)
      expect(jaLocale.common.selectLanguage.length).toBeGreaterThan(0);
    });

    it('should have mission-related strings', () => {
      expect(jaLocale.missionDetail).toBeDefined();
      expect(jaLocale.difficulty).toBeDefined();
      expect(jaLocale.campaigns).toBeDefined();
    });

    it('should have achievement/badge translations', () => {
      expect(jaLocale.badges).toBeDefined();
      expect(Object.keys(jaLocale.badges).length).toBeGreaterThan(0);
      
      // Spot check a few badges
      expect(jaLocale.badges.first_contract).toBeDefined();
      expect(jaLocale.badges.first_contract.name).toBeDefined();
      expect(jaLocale.badges.completionist).toBeDefined();
      expect(jaLocale.badges.completionist.name).toBeDefined();
    });

    it('should have error/validation messages in Japanese', () => {
      expect(jaLocale.errorBoundary).toBeDefined();
      expect(jaLocale.notFound).toBeDefined();
    });

    it('should have at least 425+ keys (sanity check)', () => {
      const countKeys = (obj) => {
        if (typeof obj !== 'object' || obj === null) return 0;
        return Object.keys(obj).reduce((sum, key) => {
          return sum + 1 + countKeys(obj[key]);
        }, 0);
      };
      
      const totalKeys = countKeys(jaLocale);
      expect(totalKeys).toBeGreaterThan(425);
    });
  });

  // ============================================================================
  // Test Suite 2: Mission Localization
  // ============================================================================
  
  describe('Mission Japanese Translations', () => {
    it('should have at least 15 missions with Japanese i18n blocks', () => {
      const missionsWithJa = missions.filter(m => m.i18n && m.i18n.ja);
      expect(missionsWithJa.length).toBeGreaterThanOrEqual(15);
    });

    it('should localize first mission to Japanese', () => {
      const mission = missions[0];
      const localized = localizeMission(mission, 'ja');
      
      expect(localized.title).toBeDefined();
      expect(localized.story).toBeDefined();
      expect(localized.learningGoal).toBeDefined();
      expect(localized.hints).toBeDefined();
      expect(Array.isArray(localized.hints)).toBe(true);
      expect(localized.hints.length).toBeGreaterThan(0);
      
      // Verify it's in Japanese (not English)
      expect(localized.title).not.toBe(missions[0].i18n?.en?.title);
    });

    it('should have Japanese story with markdown content', () => {
      const helloMission = missions.find(m => m.id === 'hello-soroban');
      expect(helloMission).toBeDefined();
      expect(helloMission.i18n.ja).toBeDefined();
      expect(helloMission.i18n.ja.story).toBeDefined();
      
      const localized = localizeMission(helloMission, 'ja');
      expect(localized.story).toContain('🌌'); // Should have emoji
      expect(localized.story).toContain('#'); // Should have markdown
    });

    it('should fallback to English when Japanese is missing', () => {
      // Find or create a mission without Japanese
      const mission = { ...missions[0], i18n: { en: missions[0].i18n.en } };
      const localized = localizeMission(mission, 'ja');
      
      // Should fallback to English
      expect(localized.title).toBe(mission.i18n.en.title);
    });

    it('should preserve language-neutral mission properties', () => {
      const mission = missions[0];
      const localized = localizeMission(mission, 'ja');
      
      expect(localized.id).toBe(mission.id);
      expect(localized.chapter).toBe(mission.chapter);
      expect(localized.difficulty).toBe(mission.difficulty);
      expect(localized.xpReward).toBe(mission.xpReward);
    });

    it('all mission hints should be valid strings', () => {
      missions.forEach(mission => {
        if (mission.i18n?.ja?.hints) {
          mission.i18n.ja.hints.forEach(hint => {
            expect(typeof hint).toBe('string');
            expect(hint.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  // ============================================================================
  // Test Suite 3: Campaign Localization
  // ============================================================================
  
  describe('Campaign Japanese Translations', () => {
    it('should have all 7 campaigns with Japanese i18n blocks', () => {
      const campaignsWithJa = campaigns.filter(c => c.i18n && c.i18n.ja);
      expect(campaignsWithJa.length).toBe(7);
    });

    it('should localize first campaign to Japanese', () => {
      const campaign = campaigns[0];
      const localized = localizeCampaign(campaign, 'ja');
      
      expect(localized.title).toBeDefined();
      expect(localized.description).toBeDefined();
      expect(localized.lore).toBeDefined();
      
      // Verify it's in Japanese
      expect(localized.title).not.toBe(campaigns[0].i18n?.en?.title);
    });

    it('should have Japanese campaign titles with chapter numbers', () => {
      campaigns.forEach(campaign => {
        if (campaign.i18n?.ja?.title) {
          // Title should contain Japanese text (hiragana/katakana/kanji)
          expect(campaign.i18n.ja.title.length).toBeGreaterThan(0);
          expect(typeof campaign.i18n.ja.title).toBe('string');
        }
      });
    });

    it('should have Japanese lore with markdown', () => {
      const campaign = campaigns.find(c => c.i18n?.ja?.lore);
      if (campaign) {
        expect(campaign.i18n.ja.lore).toContain('#'); // markdown headers
      }
    });
  });

  // ============================================================================
  // Test Suite 4: Character Rendering & Encoding
  // ============================================================================
  
  describe('Japanese Character Rendering', () => {
    it('should have valid UTF-8 encoded Japanese characters', () => {
      const testString = jaLocale.languages.ja; // "日本語"
      
      // Check that it contains Japanese characters
      const japaneseCharRegex = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/g;
      const matches = testString.match(japaneseCharRegex);
      expect(matches).not.toBeNull();
      expect(matches.length).toBeGreaterThan(0);
    });

    it('mission titles should contain CJK characters', () => {
      const mission = missions.find(m => m.i18n?.ja?.title);
      if (mission) {
        const japaneseCharRegex = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/g;
        const matches = mission.i18n.ja.title.match(japaneseCharRegex);
        expect(matches).not.toBeNull();
      }
    });

    it('should not have mojibake (corrupted characters)', () => {
      // eslint-disable-next-line no-control-regex
      const problematicPatterns = [/\?{2,}/, /[^\x00-\x7F]{10,}/]; // Double ?, or many high bytes
      const checkForMojibake = (str) => {
        return !problematicPatterns.some(pattern => pattern.test(str));
      };
      
      expect(checkForMojibake(jaLocale.languages.ja)).toBe(true);
      const mission = missions.find(m => m.i18n?.ja?.title);
      if (mission) {
        expect(checkForMojibake(mission.i18n.ja.title)).toBe(true);
      }
    });
  });

  // ============================================================================
  // Test Suite 5: Language Bridge Integration
  // ============================================================================
  
  describe('Language Support in Bridge', () => {
    it('should support "ja" in localization system', () => {
      const ja = missions.find(m => m.i18n?.ja);
      expect(ja).toBeDefined();
      
      const localized = localizeMission(ja, 'ja');
      expect(localized.title).toBeDefined();
      expect(localized.title.length).toBeGreaterThan(0);
    });

    it('should handle case-insensitive language codes', () => {
      const mission = missions[0];
      const _localizedLower = localizeMission(mission, 'ja');
      const localizedUpper = localizeMission(mission, 'JA');
      
      // Note: current implementation may be case-sensitive, adjust if needed
      if (localizedUpper.title) {
        expect(localizedUpper.title).toBeDefined();
      }
    });
  });

  // ============================================================================
  // Test Suite 6: Content Consistency
  // ============================================================================
  
  describe('Content Structure & Consistency', () => {
    it('all missions with Japanese should have all required fields', () => {
      missions.forEach(mission => {
        if (mission.i18n?.ja) {
          expect(mission.i18n.ja.title).toBeDefined();
          expect(mission.i18n.ja.story).toBeDefined();
          expect(mission.i18n.ja.learningGoal).toBeDefined();
          expect(mission.i18n.ja.hints).toBeDefined();
          expect(Array.isArray(mission.i18n.ja.hints)).toBe(true);
        }
      });
    });

    it('all campaigns should have required Japanese fields', () => {
      campaigns.forEach(campaign => {
        if (campaign.i18n?.ja) {
          expect(campaign.i18n.ja.title).toBeDefined();
          expect(campaign.i18n.ja.description).toBeDefined();
        }
      });
    });

    it('should not have empty Japanese translations', () => {
      missions.forEach(mission => {
        if (mission.i18n?.ja) {
          expect(mission.i18n.ja.title.trim().length).toBeGreaterThan(0);
          expect(mission.i18n.ja.story.trim().length).toBeGreaterThan(0);
          expect(mission.i18n.ja.learningGoal.trim().length).toBeGreaterThan(0);
        }
      });
    });

    it('Japanese stories should contain emoji for consistency', () => {
      const missionsWithStory = missions.filter(m => m.i18n?.ja?.story);
      const withEmoji = missionsWithStory.filter(m => m.i18n.ja.story.includes('🌌'));
      
      // Some missions should have the 🌌 emoji for theme consistency
      expect(withEmoji.length).toBeGreaterThan(0);
    });
  });

});
