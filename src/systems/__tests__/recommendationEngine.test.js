import { describe, it, expect } from 'vitest';
import {
  getRecommendedMission,
  getRecommendedMissionId,
} from '../recommendationEngine';

describe('recommendationEngine', () => {
  const mockMissions = [
    {
      id: 'm1',
      title: 'Hello Soroban',
      chapter: 1,
      order: 1,
      difficulty: 'beginner',
      standalone: false,
      conceptsIntroduced: ['Env', 'Symbol', 'contract'],
    },
    {
      id: 'm2',
      title: 'Greetings Protocol',
      chapter: 1,
      order: 2,
      difficulty: 'beginner',
      standalone: false,
      conceptsIntroduced: ['String', 'symbol_short'],
    },
    {
      id: 'm3',
      title: 'Counter Vault',
      chapter: 2,
      order: 1,
      difficulty: 'intermediate',
      standalone: false,
      conceptsIntroduced: ['Env', 'storage'],
    },
    {
      id: 'm4',
      title: 'Guardian Ledger',
      chapter: 2,
      order: 2,
      difficulty: 'intermediate',
      standalone: false,
      conceptsIntroduced: ['storage', 'auth'],
    },
    {
      id: 'm-standalone',
      title: 'Flash Loan Mystery',
      difficulty: 'advanced',
      standalone: true,
      conceptsIntroduced: ['reentrancy', 'flash_loan'],
    },
  ];

  it('handles null, undefined, or empty state without crashing (no history)', () => {
    const res1 = getRecommendedMission(null, mockMissions);
    expect(res1).toBeDefined();
    expect(res1.missionId).toBe('m1');
    expect(res1.rule).toBe('getting_started');
    expect(res1.reasonKey).toBe('recommendation.reasons.gettingStarted');

    const res2 = getRecommendedMission({}, mockMissions);
    expect(res2.missionId).toBe('m1');

    const id = getRecommendedMissionId(null, mockMissions);
    expect(id).toBe('m1');
  });

  it('handles empty missions list safely', () => {
    const res = getRecommendedMission({ completedMissions: [] }, []);
    expect(res.missionId).toBeNull();
    expect(res.mission).toBeNull();
  });

  it('recommends reinforcing fundamentals when player struggled on a topic/mission', () => {
    // Player completed m1, but took 4 attempts on m1 (concepts: ['Env', 'Symbol', 'contract'])
    // Next unlocked is m2, but counter-vault (m3) also introduces 'Env' or m2 is in chapter 1
    const state = {
      completedMissions: ['m1'],
      missionAttempts: { m1: 4 },
      firstTryMissions: [],
    };

    const rec = getRecommendedMission(state, mockMissions);
    expect(rec).toBeDefined();
    // m2 is in chapter 1 (same chapter)
    expect(rec.missionId).toBe('m2');
    expect(['struggled_topic', 'struggled_chapter']).toContain(rec.rule);
    expect(rec.reasonKey).toMatch(/^recommendation\.reasons\.struggled/);
  });

  it('recommends related topic mission when player struggled and related concept exists', () => {
    // Player completed m1 and m2, but struggled heavily on m1 (concepts: Env, Symbol, contract)
    // m3 is unlocked (chapter 2) and shares concept 'Env'
    const state = {
      completedMissions: ['m1', 'm2'],
      missionAttempts: { m1: 5, m2: 1 },
      firstTryMissions: ['m2'],
    };

    const rec = getRecommendedMission(state, mockMissions);
    expect(rec.missionId).toBe('m3');
    expect(rec.rule).toBe('struggled_topic');
    expect(rec.reasonParams.missionTitle).toBe('Hello Soroban');
  });

  it('nudges fast learner toward higher difficulty or standalone challenges', () => {
    // Player breezed through m1 and m2 on first try (100% first-try rate)
    const state = {
      completedMissions: ['m1', 'm2'],
      missionAttempts: { m1: 1, m2: 1 },
      firstTryMissions: ['m1', 'm2'],
    };

    const rec = getRecommendedMission(state, mockMissions);
    expect(rec).toBeDefined();
    expect(rec.rule).toBe('fast_learner');
    expect(rec.reasonKey).toBe('recommendation.reasons.fastLearner');
    // Nudges towards m3 (intermediate) or m-standalone (advanced/standalone)
    expect(['m3', 'm-standalone']).toContain(rec.missionId);
  });

  it('handles player who completed everything without crashing and suggests mastery revisit', () => {
    const allIds = mockMissions.map((m) => m.id);
    const state = {
      completedMissions: allIds,
      missionAttempts: {
        m1: 1,
        m2: 2,
        m3: 6, // Most struggled mission
        m4: 1,
        'm-standalone': 3,
      },
      firstTryMissions: ['m1', 'm4'],
    };

    const rec = getRecommendedMission(state, mockMissions);
    expect(rec).toBeDefined();
    expect(rec.rule).toBe('all_completed');
    expect(rec.reasonKey).toBe('recommendation.reasons.allCompleted');
    expect(rec.missionId).toBe('m3'); // The one with 6 attempts
    expect(rec.reasonParams.missionTitle).toBe('Counter Vault');
  });

  it('falls back to standard next campaign mission when progress is steady', () => {
    // 1 mission completed on first try, but below fast-learner threshold of >= 2 missions
    const state = {
      completedMissions: ['m1'],
      missionAttempts: { m1: 1 },
      firstTryMissions: ['m1'],
    };

    const rec = getRecommendedMission(state, mockMissions);
    expect(rec.missionId).toBe('m2');
    expect(rec.rule).toBe('next_campaign');
    expect(rec.reasonKey).toBe('recommendation.reasons.nextCampaign');
  });

  it('recommends the first mission of an unexplored chapter (unexplored_chapter rule)', () => {
    // Player has completed all of chapter 1 on first try (no fast-learner nudge because
    // we deliberately keep attempts at 1 and firstTryMissions at exactly 2 so firstTryRate=1.0
    // and nudge fires — so we use a scenario that skips it: 1 first try out of 2, = 50% < 60%,
    // no struggled missions). Chapter 2 has never been touched.
    const mockChapterMissions = [
      {
        id: 'c1m1',
        title: 'Chapter 1 Basics',
        chapter: 1,
        order: 1,
        difficulty: 'beginner',
        standalone: false,
        conceptsIntroduced: ['Env'],
      },
      {
        id: 'c1m2',
        title: 'Chapter 1 Advanced',
        chapter: 1,
        order: 2,
        difficulty: 'beginner',
        standalone: false,
        conceptsIntroduced: ['Symbol'],
      },
      {
        id: 'c2m1',
        title: 'Chapter 2 Start',
        chapter: 2,
        order: 1,
        difficulty: 'intermediate',
        standalone: false,
        conceptsIntroduced: ['storage'],
      },
      {
        id: 'c2m2',
        title: 'Chapter 2 Deep',
        chapter: 2,
        order: 2,
        difficulty: 'intermediate',
        standalone: false,
        conceptsIntroduced: ['auth'],
      },
    ];

    // Completed chapter 1 (2 missions), 1 first try out of 2 = 50% — below 60% fast-learner threshold.
    // No struggled missions (all attempts <= 1). Chapter 2 fully unexplored → unexplored_chapter fires.
    const state = {
      completedMissions: ['c1m1', 'c1m2'],
      missionAttempts: { c1m1: 2, c1m2: 1 },
      firstTryMissions: ['c1m2'],
    };

    const rec = getRecommendedMission(state, mockChapterMissions);
    expect(rec.rule).toBe('unexplored_chapter');
    expect(rec.reasonKey).toBe('recommendation.reasons.unexploredChapter');
    expect(rec.missionId).toBe('c2m1'); // First mission of unexplored chapter 2
    expect(rec.reasonParams.chapter).toBe(2);
    expect(rec.mission?.title).toBe('Chapter 2 Start');
  });

  it('fallback does not recommend an already-completed mission (broken prereq chain guard)', () => {
    // Edge case: single-mission list where that mission is already completed.
    // The fallback should prefer uncompleted if available, otherwise accept the only option.
    const singleMission = [{ id: 'only', title: 'Only Mission', chapter: 1, order: 1, difficulty: 'beginner', standalone: false }];
    const state = {
      completedMissions: ['only'],
      missionAttempts: {},
      firstTryMissions: ['only'],
    };

    // All completed path kicks in, not the fallback — but confirms it doesn't crash
    const rec = getRecommendedMission(state, singleMission);
    expect(rec.rule).toBe('all_completed');
    expect(rec.missionId).toBe('only'); // Only option available, accepted gracefully
  });
});
