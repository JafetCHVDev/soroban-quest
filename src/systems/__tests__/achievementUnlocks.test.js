import { describe, it, expect, vi } from "vitest";

// Keep the activity log and sounds out of the way; everything else is real.
vi.mock("../activityLogger", () => ({
  logActivity: () => {},
  ACTIVITY_TYPES: {
    LEVEL_UP: "LEVEL_UP",
    MISSION_COMPLETED: "MISSION_COMPLETED",
    BADGE_EARNED: "BADGE_EARNED",
    STREAK: "STREAK",
    GOLD_EARNED: "GOLD_EARNED",
  },
}));

import { completeMission, getDefaultState } from "../gameEngine";
import { getAllMissions, getMissionCatalog } from "../missionLoader";

function completeAll(state, missionIds) {
  return missionIds.reduce((s, id) => completeMission(s, id, 100), state);
}

describe("achievement unlocks against the real mission catalog", () => {
  it("uses the real mission count", () => {
    expect(getMissionCatalog().totalMissions).toBe(getAllMissions("en").length);
    expect(getMissionCatalog().totalMissions).toBe(22);
  });

  it("unlocks a chapter achievement only after every mission of that chapter", () => {
    const chapterOne = getMissionCatalog().chapters[1];
    expect(chapterOne.length).toBeGreaterThan(1);

    const almost = completeAll(getDefaultState(), chapterOne.slice(0, -1));
    expect(almost.badges).not.toContain("chapter_1");

    const done = completeMission(almost, chapterOne[chapterOne.length - 1], 100);
    expect(done.badges).toContain("chapter_1");
    expect(done.newBadges).toContain("chapter_1");
  });

  it("unlocks completionist only after all 22 missions", () => {
    const allIds = getAllMissions("en").map((m) => m.id);

    const almost = completeAll(getDefaultState(), allIds.slice(0, -1));
    expect(almost.badges).not.toContain("completionist");

    const done = completeMission(almost, allIds[allIds.length - 1], 100);
    expect(done.badges).toContain("completionist");
    for (let chapter = 1; chapter <= 7; chapter += 1) {
      expect(done.badges).toContain(`chapter_${chapter}`);
    }
  });
});
