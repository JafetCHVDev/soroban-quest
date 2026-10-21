import { describe, it, expect } from 'vitest';
import { loadCampaigns, loadMissions } from '../mission-data.mjs';
import {
  CAMPAIGN_REQUIRED_FIELDS,
  validateCampaign,
  validateCampaignCollection,
  validateMissionCollection,
} from '../mission-schema.mjs';

const MISSION_IDS = new Set(['hello-soroban', 'greetings-protocol', 'counter-vault']);

function locale(prefix) {
  return { title: `${prefix} title`, description: `${prefix} description`, lore: `${prefix} lore` };
}

function makeCampaign(overrides = {}) {
  return {
    id: 'chapter-1-awakening',
    i18n: { en: locale('en'), es: locale('es') },
    heroImage: 'linear-gradient(135deg, #06d6a0 0%, #8b5cf6 100%)',
    chapterNumber: 1,
    missionIds: ['hello-soroban', 'greetings-protocol'],
    requiredLevel: 1,
    color: 'cyan',
    ...overrides,
  };
}

function withoutField(campaign, field) {
  const copy = { ...campaign };
  delete copy[field];
  return copy;
}

describe('validateCampaign', () => {
  it('accepts a complete campaign', () => {
    expect(validateCampaign(makeCampaign(), 'campaigns[0]', MISSION_IDS)).toEqual([]);
  });

  it('rejects a non-object campaign', () => {
    expect(validateCampaign(null, 'campaigns[0]')).toEqual(['campaigns[0]: must be an object']);
  });

  it.each(CAMPAIGN_REQUIRED_FIELDS)('reports a missing required field %s', (field) => {
    const errors = validateCampaign(
      withoutField(makeCampaign(), field),
      'campaigns[2]',
      MISSION_IDS,
    );
    expect(errors).toEqual([`campaigns[2]: missing required field '${field}'`]);
  });

  it.each([
    ['id', 'Chapter One', 'must be a URL-safe kebab-case identifier'],
    ['heroImage', '   ', 'must be a non-empty string'],
    ['color', 42, 'must be a non-empty string'],
    ['chapterNumber', '1', 'must be a positive integer'],
    ['chapterNumber', 0, 'must be a positive integer'],
    ['requiredLevel', 1.5, 'must be a positive integer'],
    ['missionIds', [], 'must be a non-empty array of mission ids'],
    ['missionIds', ['hello-soroban', ''], 'must be a non-empty array of mission ids'],
  ])('rejects %s = %j', (field, value, message) => {
    const errors = validateCampaign(makeCampaign({ [field]: value }), 'campaigns[0]', MISSION_IDS);
    expect(errors).toEqual([`campaigns[0].${field}: ${message}`]);
  });

  it('reports unknown mission ids when the known ids are provided', () => {
    const campaign = makeCampaign({ missionIds: ['hello-soroban', 'ghost-mission'] });
    expect(validateCampaign(campaign, 'campaigns[0]', MISSION_IDS)).toEqual([
      "campaigns[0].missionIds: unknown mission 'ghost-mission'",
    ]);
  });

  it('requires an i18n object', () => {
    expect(
      validateCampaign(withoutField(makeCampaign(), 'i18n'), 'campaigns[0]', MISSION_IDS),
    ).toEqual(['campaigns[0].i18n: must be an object']);
  });

  it('requires every required locale block', () => {
    const campaign = makeCampaign({ i18n: { es: locale('es') } });
    expect(validateCampaign(campaign, 'campaigns[0]', MISSION_IDS)).toEqual([
      'campaigns[0].i18n.en: must be an object',
    ]);
  });

  it.each(['title', 'description', 'lore'])(
    'requires a non-empty %s in every required locale',
    (field) => {
      const campaign = makeCampaign({
        i18n: { en: locale('en'), es: { ...locale('es'), [field]: '' } },
      });
      expect(validateCampaign(campaign, 'campaigns[0]', MISSION_IDS)).toEqual([
        `campaigns[0].i18n.es.${field}: must be a non-empty string`,
      ]);
    },
  );

  it('requires optional locales to be complete when present', () => {
    const fr = withoutField(locale('fr'), 'description');
    const campaign = makeCampaign({ i18n: { en: locale('en'), es: locale('es'), fr } });
    expect(validateCampaign(campaign, 'campaigns[0]', MISSION_IDS)).toEqual([
      'campaigns[0].i18n.fr.description: must be a non-empty string',
    ]);
  });

  it('does not require optional locales that are absent', () => {
    const campaign = makeCampaign({
      i18n: { en: locale('en'), es: locale('es'), ja: locale('ja') },
    });
    expect(validateCampaign(campaign, 'campaigns[0]', MISSION_IDS)).toEqual([]);
  });
});

describe('validateCampaignCollection', () => {
  const chapter = (chapterNumber, id = `chapter-${chapterNumber}`) =>
    makeCampaign({ id, chapterNumber });

  it('accepts sequential chapters starting at 1', () => {
    expect(validateCampaignCollection([chapter(1), chapter(2), chapter(3)], MISSION_IDS)).toEqual(
      [],
    );
  });

  it('rejects a non-array input', () => {
    expect(validateCampaignCollection({}, MISSION_IDS)).toEqual(['campaigns: must be an array']);
  });

  it('reports duplicate campaign ids', () => {
    const errors = validateCampaignCollection(
      [chapter(1, 'same'), chapter(2, 'same')],
      MISSION_IDS,
    );
    expect(errors).toEqual(['campaigns[1].id: duplicates campaigns[0]']);
  });

  it('reports duplicate chapter numbers', () => {
    const errors = validateCampaignCollection([chapter(1), chapter(1, 'chapter-1b')], MISSION_IDS);
    expect(errors).toContain('campaigns[1].chapterNumber: duplicates campaigns[0]');
  });

  it('reports a gap in chapter numbers', () => {
    const errors = validateCampaignCollection([chapter(1), chapter(2), chapter(4)], MISSION_IDS);
    expect(errors).toEqual([
      'campaigns[2].chapterNumber: expected 3 (chapter numbers must be sequential starting at 1)',
    ]);
  });

  it('prefixes per-campaign errors with the campaign index', () => {
    const errors = validateCampaignCollection(
      [chapter(1), withoutField(chapter(2), 'heroImage')],
      MISSION_IDS,
    );
    expect(errors).toEqual(["campaigns[1]: missing required field 'heroImage'"]);
  });

  it('passes against the real campaign and mission data', () => {
    const { ids } = validateMissionCollection(loadMissions());
    expect(validateCampaignCollection(loadCampaigns(), ids)).toEqual([]);
  });
});
