import { describe, expect, it } from 'vitest';
import {
  campaigns,
  getCampaignProgress,
  localizeCampaign,
} from '../campaigns.js';
import { missions } from '../missions.js';

describe('campaign data', () => {
  it('defines the required fields for all seven campaigns', () => {
    expect(campaigns).toHaveLength(7);

    for (const campaign of campaigns) {
      expect(campaign).toEqual(expect.objectContaining({
        id: expect.any(String),
        missionIds: expect.any(Array),
        requiredLevel: expect.any(Number),
      }));

      for (const language of ['en', 'es']) {
        expect(campaign.i18n[language]).toEqual(expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          lore: expect.any(String),
        }));
      }
    }
  });

  it('references only missions that exist in the mission catalog', () => {
    const missionIds = new Set(missions.map((mission) => mission.id));

    for (const campaign of campaigns) {
      for (const missionId of campaign.missionIds) {
        expect(
          missionIds.has(missionId),
          `${campaign.id} references unknown mission "${missionId}"`,
        ).toBe(true);
      }
    }
  });

  it('orders campaigns by ascending required level', () => {
    const requiredLevels = campaigns.map((campaign) => campaign.requiredLevel);

    for (let index = 1; index < requiredLevels.length; index += 1) {
      expect(requiredLevels[index]).toBeGreaterThan(requiredLevels[index - 1]);
    }
  });
});

describe('localizeCampaign', () => {
  it.each(['en', 'es'])('returns the %s translation with neutral fields', (language) => {
    const campaign = campaigns[0];

    const localized = localizeCampaign(campaign, language);

    expect(localized).toMatchObject({
      id: campaign.id,
      missionIds: campaign.missionIds,
      requiredLevel: campaign.requiredLevel,
      ...campaign.i18n[language],
    });
    expect(localized).not.toHaveProperty('i18n');
  });
});

describe('getCampaignProgress', () => {
  it('calculates completed missions, total missions, and percentage', () => {
    const campaign = campaigns[2];
    const completedMissions = [campaign.missionIds[0], campaign.missionIds[2]];

    expect(getCampaignProgress(campaign.id, completedMissions)).toEqual({
      completed: 2,
      total: 3,
      percentage: (2 / 3) * 100,
    });
  });

  it('returns empty progress for an unknown campaign', () => {
    expect(getCampaignProgress('missing-campaign', [])).toEqual({
      completed: 0,
      total: 0,
    });
  });
});
