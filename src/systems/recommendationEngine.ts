/* ==========================================
   Recommendation Engine — Player Performance History
   ==========================================
   Provides lightweight, explainable mission recommendations
   based on the player's performance signals:
   - High attempts on past missions (reinforce fundamentals)
   - First-try completions (nudge toward advanced/standalone challenges)
   - Unexplored chapters / topics
   - Graceful fallback for new players and completionists
   ========================================== */

import { missions as defaultMissions } from '../data/missions';
import { getActivityLog } from './activityLogger';
import type { GameState } from './gameEngine';
import type { ActivityEntry } from './activityLogger';
import type { Mission } from '../types/game';

export type RecommendableMission = Partial<Mission> & {
  id: string;
  title?: string;
  chapter?: number;
  order?: number;
  difficulty?: string;
  standalone?: boolean;
  conceptsIntroduced?: string[];
  learningGoal?: string;
  xpReward?: number;
};

export interface MissionRecommendation {
  missionId: string | null;
  mission: RecommendableMission | null;
  reasonKey: string;
  reasonParams: Record<string, string | number>;
  rule: 'struggled_topic' | 'struggled_chapter' | 'fast_learner' | 'unexplored_chapter' | 'next_campaign' | 'getting_started' | 'all_completed';
}

/**
 * Determines if a mission is unlocked for a given completedMissions list.
 * Evaluates against the provided missionsList so it works seamlessly
 * with mock test missions as well as real authored missions.
 */
export function checkMissionUnlocked(
  mission: RecommendableMission,
  completedMissions: string[],
  allMissions: RecommendableMission[] = defaultMissions
): boolean {
  if (!mission) return false;
  if (mission.standalone) return true;

  const campaignMissions = allMissions.filter((m) => !m.standalone);
  const idx = campaignMissions.findIndex((m) => m.id === mission.id);
  if (idx === -1) return false;
  if (idx === 0) return true;

  const prevMission = campaignMissions[idx - 1];
  return completedMissions.includes(prevMission.id);
}

export function getRecommendedMission(
  state?: Partial<GameState> | null,
  missionsList: RecommendableMission[] = defaultMissions,
  _activityLog: ActivityEntry[] = getActivityLog()
): MissionRecommendation {
  const completed = Array.isArray(state?.completedMissions) ? state!.completedMissions : [];
  const attempts = state?.missionAttempts || {};
  const firstTries = Array.isArray(state?.firstTryMissions) ? state!.firstTryMissions : [];

  if (!missionsList || missionsList.length === 0) {
    return {
      missionId: null,
      mission: null,
      reasonKey: 'recommendation.reasons.gettingStarted',
      reasonParams: {},
      rule: 'getting_started',
    };
  }

  // 1. Separate completed vs uncompleted
  const uncompleted = missionsList.filter((m) => !completed.includes(m.id));

  // Determine unlocked among uncompleted
  const unlockedUncompleted = uncompleted.filter((m) =>
    checkMissionUnlocked(m, completed, missionsList)
  );

  // If player hasn't completed anything yet -> Getting Started
  if (completed.length === 0) {
    const firstMission = unlockedUncompleted[0] || missionsList[0];
    return {
      missionId: firstMission?.id || null,
      mission: firstMission || null,
      reasonKey: 'recommendation.reasons.gettingStarted',
      reasonParams: {},
      rule: 'getting_started',
    };
  }

  // If ALL missions are completed -> Practice highest attempt or first mission
  if (uncompleted.length === 0) {
    // Find mission with most attempts to suggest mastery, or fallback to first
    let highestAttemptMission = missionsList[0];
    let maxAttempts = -1;

    for (const m of missionsList) {
      const att = attempts[m.id] || 0;
      if (att > maxAttempts) {
        maxAttempts = att;
        highestAttemptMission = m;
      }
    }

    const title = highestAttemptMission?.title || highestAttemptMission?.id || 'Mission';
    return {
      missionId: highestAttemptMission?.id || null,
      mission: highestAttemptMission || null,
      reasonKey: 'recommendation.reasons.allCompleted',
      reasonParams: { missionTitle: title },
      rule: 'all_completed',
    };
  }

  // 2. Rule 1: Struggled topic or chapter
  // Find missions player struggled on (attempts >= 2, sorted by highest attempts first)
  const struggledMissionIds = Object.keys(attempts)
    .filter((id) => (attempts[id] || 0) >= 2)
    .sort((a, b) => (attempts[b] || 0) - (attempts[a] || 0));

  if (struggledMissionIds.length > 0) {
    for (const struggledId of struggledMissionIds) {
      const struggledMission = missionsList.find((m) => m.id === struggledId);
      if (!struggledMission) continue;

      const concepts = Array.isArray(struggledMission.conceptsIntroduced)
        ? struggledMission.conceptsIntroduced
        : [];

      // A) First look for an unlocked uncompleted mission that shares concepts
      if (concepts.length > 0) {
        const related = unlockedUncompleted.find((m) => {
          const otherConcepts = Array.isArray(m.conceptsIntroduced) ? m.conceptsIntroduced : [];
          return otherConcepts.some((c: string) => concepts.includes(c));
        });

        if (related) {
          const title = struggledMission.title || struggledMission.id;
          return {
            missionId: related.id,
            mission: related,
            reasonKey: 'recommendation.reasons.struggledTopic',
            reasonParams: { missionTitle: title },
            rule: 'struggled_topic',
          };
        }
      }

      // B) Or look for an uncompleted mission in the same chapter
      if (struggledMission.chapter != null) {
        const sameChapter = unlockedUncompleted.find((m) => m.chapter === struggledMission.chapter);
        if (sameChapter) {
          return {
            missionId: sameChapter.id,
            mission: sameChapter,
            reasonKey: 'recommendation.reasons.struggledChapter',
            reasonParams: { chapter: struggledMission.chapter },
            rule: 'struggled_chapter',
          };
        }
      }
    }
  }

  // 3. Rule 2: Fast learner nudge
  // If player completed at least 2 missions and has >= 60% first-try rate,
  // nudge toward intermediate/advanced or standalone challenge
  const firstTryRate = completed.length > 0 ? firstTries.length / completed.length : 0;
  if (completed.length >= 2 && firstTryRate >= 0.6) {
    // Look for unlocked advanced or intermediate uncompleted mission
    const advancedOrStandalone = unlockedUncompleted.find(
      (m) => m.difficulty === 'advanced' || m.difficulty === 'intermediate' || m.standalone
    );

    if (advancedOrStandalone) {
      return {
        missionId: advancedOrStandalone.id,
        mission: advancedOrStandalone,
        reasonKey: 'recommendation.reasons.fastLearner',
        reasonParams: { difficulty: advancedOrStandalone.difficulty || 'advanced' },
        rule: 'fast_learner',
      };
    }
  }

  // 4. Rule 3: Unexplored chapters
  // If there's an unlocked chapter with 0 completions, suggest starting it
  const unlockedChapters = Array.from(
    new Set(
      unlockedUncompleted
        .map((m) => m.chapter)
        .filter((ch): ch is number => typeof ch === 'number')
    )
  );

  for (const ch of unlockedChapters) {
    const completedInChapter = completed.filter((id) => {
      const m = missionsList.find((item) => item.id === id);
      return m && m.chapter === ch;
    });

    if (completedInChapter.length === 0) {
      const chapterMission = unlockedUncompleted.find((m) => m.chapter === ch);
      if (chapterMission) {
        return {
          missionId: chapterMission.id,
          mission: chapterMission,
          reasonKey: 'recommendation.reasons.unexploredChapter',
          reasonParams: { chapter: ch },
          rule: 'unexplored_chapter',
        };
      }
    }
  }

  // 5. Rule 4: Normal next-mission order among unlocked campaign missions
  const nextCampaignMission = unlockedUncompleted.find((m) => !m.standalone) || unlockedUncompleted[0];

  if (nextCampaignMission) {
    return {
      missionId: nextCampaignMission.id,
      mission: nextCampaignMission,
      reasonKey: 'recommendation.reasons.nextCampaign',
      reasonParams: {
        chapter: nextCampaignMission.chapter || 1,
        order: nextCampaignMission.order || 1,
      },
      rule: 'next_campaign',
    };
  }

  // Fallback if all else fails — prefer any uncompleted mission over one the
  // player already finished (broken prerequisite chain guard).
  const fallback = unlockedUncompleted[0]
    ?? uncompleted[0]
    ?? missionsList[0];
  return {
    missionId: fallback?.id || null,
    mission: fallback || null,
    reasonKey: 'recommendation.reasons.nextCampaign',
    reasonParams: { chapter: 1, order: 1 },
    rule: 'next_campaign',
  };
}

/**
 * Convenience helper that returns only the suggested mission id.
 */
export function getRecommendedMissionId(
  state?: Partial<GameState> | null,
  missionsList?: RecommendableMission[],
  activityLog?: ActivityEntry[]
): string | null {
  return getRecommendedMission(state, missionsList, activityLog).missionId;
}
