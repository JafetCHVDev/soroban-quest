import { describe, it, expect } from "vitest";
import {
  LEADERBOARD_CATEGORIES,
  DEFAULT_LEADERBOARD_CATEGORY,
  isLeaderboardCategory,
  getCategoryValue,
  rankProfiles,
} from "../leaderboard";

function slot(id, name, progress = {}) {
  return { id, profile: { name, avatar: "🛡️" }, progress };
}

const ids = (list) => list.map((s) => s.id);

// Each profile leads a different category.
const profiles = [
  slot("p-xp", "Xavier", {
    xp: 900, level: 3, gold: 10, streak: 1,
    completedMissions: ["a"], badges: ["b1"],
  }),
  slot("p-missions", "Mia", {
    xp: 300, level: 2, gold: 20, streak: 2,
    completedMissions: ["a", "b", "c", "d"], badges: ["b1"],
  }),
  slot("p-streak", "Sam", {
    xp: 200, level: 1, gold: 30, streak: 9,
    completedMissions: ["a"], badges: [],
  }),
  slot("p-badges", "Bea", {
    xp: 100, level: 1, gold: 40, streak: 0,
    completedMissions: [], badges: ["b1", "b2", "b3"],
  }),
  slot("p-gold", "Goldie", {
    xp: 50, level: 1, gold: 500, streak: 0,
    completedMissions: [], badges: [],
  }),
];

describe("leaderboard", () => {
  describe("categories", () => {
    it("offers XP, missions, streak, badges and gold", () => {
      expect(LEADERBOARD_CATEGORIES).toEqual(["xp", "missions", "streak", "badges", "gold"]);
      expect(DEFAULT_LEADERBOARD_CATEGORY).toBe("xp");
    });

    it("recognizes valid category values only", () => {
      for (const c of LEADERBOARD_CATEGORIES) expect(isLeaderboardCategory(c)).toBe(true);
      expect(isLeaderboardCategory("level")).toBe(false);
      expect(isLeaderboardCategory("")).toBe(false);
      expect(isLeaderboardCategory(null)).toBe(false);
    });
  });

  describe("rankProfiles by category", () => {
    it("ranks by XP", () => {
      expect(ids(rankProfiles(profiles, "xp"))).toEqual([
        "p-xp", "p-missions", "p-streak", "p-badges", "p-gold",
      ]);
    });

    it("ranks by missions completed", () => {
      // p-xp and p-streak tie on 1 mission -> XP breaks the tie.
      // p-badges and p-gold tie on 0 missions -> XP breaks the tie.
      expect(ids(rankProfiles(profiles, "missions"))).toEqual([
        "p-missions", "p-xp", "p-streak", "p-badges", "p-gold",
      ]);
    });

    it("ranks by current streak", () => {
      // p-badges and p-gold tie on streak 0 -> XP breaks the tie.
      expect(ids(rankProfiles(profiles, "streak"))).toEqual([
        "p-streak", "p-missions", "p-xp", "p-badges", "p-gold",
      ]);
    });

    it("ranks by badges earned", () => {
      // p-xp and p-missions tie on 1 badge; p-streak and p-gold tie on 0.
      expect(ids(rankProfiles(profiles, "badges"))).toEqual([
        "p-badges", "p-xp", "p-missions", "p-streak", "p-gold",
      ]);
    });

    it("ranks by gold", () => {
      expect(ids(rankProfiles(profiles, "gold"))).toEqual([
        "p-gold", "p-badges", "p-streak", "p-missions", "p-xp",
      ]);
    });
  });

  describe("ties", () => {
    it("breaks ties by XP, then level, then missions", () => {
      const tied = [
        slot("a", "A", { gold: 10, xp: 100, level: 1, completedMissions: [] }),
        slot("b", "B", { gold: 10, xp: 100, level: 2, completedMissions: [] }),
        slot("c", "C", { gold: 10, xp: 100, level: 2, completedMissions: ["m"] }),
        slot("d", "D", { gold: 10, xp: 200, level: 1, completedMissions: [] }),
      ];
      expect(ids(rankProfiles(tied, "gold"))).toEqual(["d", "c", "b", "a"]);
    });

    it("falls back to name, then id, for identical progress", () => {
      const same = { xp: 50, level: 1, gold: 5, streak: 2, completedMissions: ["m"], badges: ["b"] };
      const tied = [
        slot("id-2", "Zed", same),
        slot("id-3", "Amy", same),
        slot("id-1", "Amy", same),
      ];
      for (const category of LEADERBOARD_CATEGORIES) {
        expect(ids(rankProfiles(tied, category))).toEqual(["id-1", "id-3", "id-2"]);
      }
    });

    it("is deterministic regardless of input order", () => {
      const reversed = [...profiles].reverse();
      for (const category of LEADERBOARD_CATEGORIES) {
        expect(ids(rankProfiles(reversed, category))).toEqual(ids(rankProfiles(profiles, category)));
      }
    });
  });

  describe("profiles with no progress", () => {
    it("treats missing progress as zero and ranks them last", () => {
      const list = [
        slot("empty", "Empty", {}),
        { id: "bare", profile: { name: "Bare" } },
        slot("some", "Some", { xp: 1, gold: 1, streak: 1, completedMissions: ["m"], badges: ["b"] }),
      ];
      for (const category of LEADERBOARD_CATEGORIES) {
        expect(ids(rankProfiles(list, category))).toEqual(["some", "bare", "empty"]);
      }
    });

    it("returns 0 for every category value of an empty profile", () => {
      for (const category of LEADERBOARD_CATEGORIES) {
        expect(getCategoryValue({ id: "x" }, category)).toBe(0);
      }
    });

    it("returns an empty list for no profiles", () => {
      expect(rankProfiles([], "xp")).toEqual([]);
    });
  });

  it("does not mutate the input array", () => {
    const input = [...profiles];
    rankProfiles(input, "gold");
    expect(ids(input)).toEqual(ids(profiles));
  });
});
