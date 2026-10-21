import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getDefaultState,
  getLevelFromXP,
} from "../gameEngine.js";
import {
  loadProgress as load,
  saveProgress as save,
  resetProgress as reset,
  loadProfiles,
  addProfile,
  setActiveProfileId,
  loadProfile,
  saveProfile,
  mergeProgress,
  summarizeMerge,
  validateImportData,
  readAndValidateFile,
  MAX_PROFILES,
  MAX_IMPORT_LEVEL,
  MAX_IMPORT_XP,
  MAX_IMPORT_ARRAY_LENGTH,
} from "../storage.js";

describe("storage", () => {
  let storage;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key) => storage[key] || null,
      setItem: (key, value) => {
        storage[key] = value;
      },
      removeItem: (key) => {
        delete storage[key];
      },
    });
  });

  describe("saveProgress", () => {
    it("saves progress to localStorage", () => {
      const state = {
        xp: 100,
        level: 2,
        completedMissions: ["mission1"],
        badges: ["first_contract"],
        leveledUp: true, // should be excluded
        newBadges: ["test"], // should be excluded
      };
      save(state);
      const saved = JSON.parse(storage["soroban_quest_progress"]);
      expect(saved.xp).toBe(100);
      expect(saved.level).toBe(2);
      expect(saved.completedMissions).toEqual(["mission1"]);
      expect(saved.badges).toEqual(["first_contract"]);
      expect(saved.leveledUp).toBeUndefined();
      expect(saved.newBadges).toBeUndefined();
    });
  });

  describe("loadProgress", () => {
    it("returns default state when no data exists", () => {
      const state = load();
      expect(state).toEqual(getDefaultState());
    });

    it("loads and merges saved progress", () => {
      const savedState = {
        xp: 200,
        level: 3,
        completedMissions: ["mission1", "mission2"],
      };
      storage["soroban_quest_progress"] = JSON.stringify(savedState);
      const state = load();
      expect(state.xp).toBe(200);
      expect(state.level).toBe(3);
      expect(state.completedMissions).toEqual(["mission1", "mission2"]);
      // Should have default values for missing properties
      expect(state.badges).toEqual([]);
    });

    it("returns default state when data is corrupted", () => {
      storage["soroban_quest_progress"] = "invalid json";
      const state = load();
      expect(state).toEqual(getDefaultState());
    });
  });

  describe("resetProgress", () => {
    it("clears localStorage and returns default state", () => {
      storage["soroban_quest_progress"] = JSON.stringify({ xp: 1000 });
      const state = reset();
      expect(state).toEqual(getDefaultState());
      expect(storage["soroban_quest_progress"]).toBeUndefined();
    });
  });

  describe("profiles", () => {
    it("migrates legacy profile and progress into the first profile slot", () => {
      storage["soroban_quest_profile"] = JSON.stringify({
        name: "Legacy Player",
        avatar: "A",
      });
      storage["soroban_quest_progress"] = JSON.stringify({
        xp: 900,
        level: 3,
      });

      const profiles = loadProfiles();

      expect(profiles).toHaveLength(1);
      expect(profiles[0].profile.name).toBe("Legacy Player");
      expect(profiles[0].profile.avatar).toBe("A");
      expect(profiles[0].progress.xp).toBe(900);
      expect(profiles[0].progress.level).toBe(3);
    });

    it("loads and saves data for the active profile", () => {
      const profiles = loadProfiles();
      addProfile({ name: "Second Player", avatar: "B" });
      const secondProfile = loadProfiles()[1];

      setActiveProfileId(secondProfile.id);
      saveProfile({ name: "Pilot", avatar: "C" });
      save({ xp: 1200, level: 4, completedMissions: ["m1"] });

      expect(loadProfile().name).toBe("Pilot");
      expect(load().xp).toBe(1200);
      expect(load().completedMissions).toEqual(["m1"]);
      expect(loadProfiles()[0].id).toBe(profiles[0].id);
      expect(loadProfiles()[0].progress.xp).toBe(0);
    });

    it("syncs legacy progress writes after profiles have been initialized", () => {
      loadProfiles();
      storage["soroban_quest_progress"] = JSON.stringify({
        completedMissions: ["hello-soroban"],
        xp: 100,
        level: 1,
        badges: [],
        streak: 5,
        lastLogin: "2026-06-28",
      });

      const state = load();
      const activeProfile = loadProfiles()[0];

      expect(state.xp).toBe(100);
      expect(state.streak).toBe(5);
      expect(activeProfile.progress.xp).toBe(100);
      expect(activeProfile.progress.streak).toBe(5);
    });

    it("limits local profiles to five slots", () => {
      for (let i = 0; i < MAX_PROFILES + 2; i++) {
        addProfile({ name: `Player ${i}` });
      }

      expect(loadProfiles()).toHaveLength(MAX_PROFILES);
    });
  });

  describe("mergeProgress", () => {
    it("takes the max of numeric fields (xp, gold, streak)", () => {
      const local = { ...getDefaultState(), xp: 5100, gold: 300, streak: 7 };
      const imported = { ...getDefaultState(), xp: 4200, gold: 500, streak: 3 };

      const merged = mergeProgress(local, imported);

      expect(merged.xp).toBe(5100);
      expect(merged.gold).toBe(500);
      expect(merged.streak).toBe(7);
    });

    it("keeps level consistent with the merged xp total", () => {
      const local = { ...getDefaultState(), xp: 0, level: 1 };
      const imported = { ...getDefaultState(), xp: 5000, level: 4 };

      const merged = mergeProgress(local, imported);

      expect(merged.xp).toBe(5000);
      // Level must reflect the merged XP, never a stale/lower value.
      expect(merged.level).toBeGreaterThanOrEqual(4);
    });

    it("unions set-like fields without duplicates", () => {
      const local = {
        ...getDefaultState(),
        completedMissions: ["m1", "m2"],
        badges: ["b1"],
        purchasedItems: ["xp-boost"],
      };
      const imported = {
        ...getDefaultState(),
        completedMissions: ["m2", "m3"],
        badges: ["b1", "b2"],
        purchasedItems: ["streak-freeze"],
      };

      const merged = mergeProgress(local, imported);

      expect(merged.completedMissions.sort()).toEqual(["m1", "m2", "m3"]);
      expect(merged.badges.sort()).toEqual(["b1", "b2"]);
      expect(merged.purchasedItems.sort()).toEqual(["streak-freeze", "xp-boost"]);
    });

    it("takes the higher attempt count per mission", () => {
      const local = { ...getDefaultState(), missionAttempts: { m1: 3, m2: 1 } };
      const imported = { ...getDefaultState(), missionAttempts: { m1: 2, m3: 5 } };

      const merged = mergeProgress(local, imported);

      expect(merged.missionAttempts).toEqual({ m1: 3, m2: 1, m3: 5 });
    });

    it("ORs boolean flags so a used flag stays used", () => {
      const local = { ...getDefaultState(), streakFreezeUsed: false, xpBoostActive: true };
      const imported = { ...getDefaultState(), streakFreezeUsed: true, xpBoostActive: false };

      const merged = mergeProgress(local, imported);

      expect(merged.streakFreezeUsed).toBe(true);
      expect(merged.xpBoostActive).toBe(true);
    });

    it("keeps the most recent lastLogin", () => {
      const local = { ...getDefaultState(), lastLogin: "2026-08-01T00:00:00Z" };
      const imported = { ...getDefaultState(), lastLogin: "2026-08-20T00:00:00Z" };

      expect(mergeProgress(local, imported).lastLogin).toBe("2026-08-20T00:00:00Z");
      expect(mergeProgress(imported, local).lastLogin).toBe("2026-08-20T00:00:00Z");
    });

    it("dedupes append-only log entries by timestamp", () => {
      const local = {
        ...getDefaultState(),
        activityLog: [
          { timestamp: 1, message: "a" },
          { timestamp: 2, message: "b" },
        ],
      };
      const imported = {
        ...getDefaultState(),
        activityLog: [
          { timestamp: 2, message: "b" },
          { timestamp: 3, message: "c" },
        ],
      };

      const merged = mergeProgress(local, imported);

      expect(merged.activityLog.map((e) => e.timestamp)).toEqual([1, 2, 3]);
    });

    it("does not mutate its inputs", () => {
      const local = { ...getDefaultState(), xp: 100, completedMissions: ["m1"] };
      const imported = { ...getDefaultState(), xp: 200, completedMissions: ["m2"] };

      mergeProgress(local, imported);

      expect(local.xp).toBe(100);
      expect(local.completedMissions).toEqual(["m1"]);
      expect(imported.completedMissions).toEqual(["m2"]);
    });

    it("handles missing/partial inputs gracefully", () => {
      const merged = mergeProgress(null, { xp: 50 });
      expect(merged.xp).toBe(50);
      expect(merged.completedMissions).toEqual([]);
    });
  });

  describe("summarizeMerge", () => {
    it("reports before/after values and count deltas", () => {
      const local = {
        ...getDefaultState(),
        xp: 4200,
        completedMissions: ["m1", "m2"],
        badges: ["b1"],
      };
      const imported = {
        ...getDefaultState(),
        xp: 5100,
        completedMissions: ["m2", "m3", "m4"],
        badges: ["b1", "b2"],
      };

      const summary = summarizeMerge(local, imported);

      expect(summary.xp).toEqual({ before: 4200, after: 5100 });
      expect(summary.completedMissions).toEqual({ before: 2, after: 4, added: 2 });
      expect(summary.badges).toEqual({ before: 1, after: 2, added: 1 });
    });
  });
  describe("validateImportData", () => {
    const missionIds = ["hello-soroban", "greetings-protocol", "fund-account-model"];

    const validState = (overrides = {}) => ({
      ...getDefaultState(),
      xp: 600,
      level: getLevelFromXP(600),
      completedMissions: ["hello-soroban", "fund-account-model"],
      badges: ["first_contract"],
      ...overrides,
    });

    const validate = (state, options = { missionIds }) =>
      validateImportData({ state, profile: { name: "Ada", avatar: "🛡️" } }, options);

    it("accepts a well-formed state and profile", () => {
      expect(validate(validState())).toEqual({ isValid: true, errors: [] });
    });

    it("accepts progress without skillPoints", () => {
      const state = validState();
      delete state.skillPoints;
      expect(validate(state).isValid).toBe(true);
    });

    it.each([Infinity, -Infinity, NaN, -1, MAX_IMPORT_XP + 1])("rejects xp = %s", (xp) => {
      const result = validate(validState({ xp, level: 1 }));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `state.xp must be a finite number between 0 and ${MAX_IMPORT_XP}`,
      );
    });

    it.each([0, 1.5, MAX_IMPORT_LEVEL + 1, NaN])("rejects level = %s", (level) => {
      const result = validate(validState({ xp: MAX_IMPORT_XP, level }));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `state.level must be an integer between 1 and ${MAX_IMPORT_LEVEL}`,
      );
    });

    it("rejects a level that the xp total has not earned", () => {
      const result = validate(validState({ xp: 0, level: 10 }));
      expect(result.errors).toEqual([
        "state.level (10) is higher than the level earned by state.xp (1)",
      ]);
    });

    it("accepts the highest allowed xp and level together", () => {
      const level = getLevelFromXP(MAX_IMPORT_XP);
      expect(level).toBe(MAX_IMPORT_LEVEL);
      expect(validate(validState({ xp: MAX_IMPORT_XP, level })).isValid).toBe(true);
    });

    it.each([
      ["gold", -5, `state.gold must be a finite number between 0 and ${MAX_IMPORT_XP}`],
      ["gold", Infinity, `state.gold must be a finite number between 0 and ${MAX_IMPORT_XP}`],
      ["streak", 2.5, "state.streak must be an integer between 0 and 3650"],
    ])("rejects %s = %s", (field, value, message) => {
      const result = validate(validState({ [field]: value }));
      expect(result.errors).toEqual([message]);
    });

    it("rejects an oversized completedMissions array", () => {
      const completedMissions = Array.from(
        { length: MAX_IMPORT_ARRAY_LENGTH + 1 },
        () => "hello-soroban",
      );
      const result = validate(validState({ completedMissions }));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `state.completedMissions must not contain more than ${MAX_IMPORT_ARRAY_LENGTH} entries`,
      );
    });

    it.each(["purchasedItems", "dailyChallengeCompletedDates", "skillPoints"])(
      "rejects an oversized %s array",
      (field) => {
        const entries = Array.from({ length: MAX_IMPORT_ARRAY_LENGTH + 1 }, (_, i) => `x${i}`);
        const result = validate(validState({ [field]: entries }));
        expect(result.errors).toEqual([
          `state.${field} must not contain more than ${MAX_IMPORT_ARRAY_LENGTH} entries`,
        ]);
      },
    );

    it("rejects an oversized inventory", () => {
      const owned = Array.from({ length: MAX_IMPORT_ARRAY_LENGTH + 1 }, (_, i) => `item-${i}`);
      const result = validate(validState({ inventory: { owned, equipped: [] } }));
      expect(result.errors).toEqual([
        `state.inventory.owned must not contain more than ${MAX_IMPORT_ARRAY_LENGTH} entries`,
      ]);
    });

    it("rejects unknown mission ids", () => {
      const completedMissions = ["hello-soroban", "not-a-mission"];
      const result = validate(validState({ completedMissions }));
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([
        "state.completedMissions contains unknown mission id(s): not-a-mission",
      ]);
    });

    it("rejects unknown first-try mission ids", () => {
      const result = validate(validState({ firstTryMissions: ["ghost"] }));
      expect(result.errors).toEqual([
        "state.firstTryMissions contains unknown mission id(s): ghost",
      ]);
    });

    it("lists at most five unknown ids in the error message", () => {
      const ghosts = ["g1", "g2", "g3", "g4", "g5", "g6", "g7"];
      const result = validate(validState({ completedMissions: ghosts }));
      expect(result.errors).toEqual([
        "state.completedMissions contains unknown mission id(s): g1, g2, g3, g4, g5 (and 2 more)",
      ]);
    });

    it("rejects duplicate mission ids", () => {
      const completedMissions = ["hello-soroban", "hello-soroban"];
      const result = validate(validState({ completedMissions }));
      expect(result.errors).toEqual(["state.completedMissions must not contain duplicate entries"]);
    });

    it("rejects unknown badge ids", () => {
      const result = validate(validState({ badges: ["first_contract", "fake_badge"] }));
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(["state.badges contains unknown badge id(s): fake_badge"]);
    });

    it("skips the mission id check when no known ids are provided", () => {
      const result = validate(validState({ completedMissions: ["anything"] }), {});
      expect(result.isValid).toBe(true);
    });

    it("rejects a non-object missionAttempts map", () => {
      const result = validate(validState({ missionAttempts: [1, 2] }));
      expect(result.errors).toEqual(["state.missionAttempts must be an object"]);
    });

    it("rejects profile fields that are too long", () => {
      const result = validateImportData(
        { profile: { name: "x".repeat(101), avatar: "🛡️" } },
        { missionIds },
      );
      expect(result.errors).toEqual(["profile.name must be a string of at most 100 characters"]);
    });
  });

  describe("readAndValidateFile", () => {
    const toFile = (data) =>
      new File([JSON.stringify(data)], "progress.json", { type: "application/json" });

    it("round-trips a fresh export produced by the app", async () => {
      const exported = { state: load(), profile: loadProfile() };
      const result = await readAndValidateFile(toFile(exported));
      expect(result.errors).toEqual([]);
      expect(result.success).toBe(true);
    });

    it("round-trips an export with real mission, theory quest and badge progress", async () => {
      save({
        ...getDefaultState(),
        xp: 1200,
        level: getLevelFromXP(1200),
        completedMissions: ["hello-soroban", "fund-account-model"],
        firstTryMissions: ["hello-soroban"],
        badges: ["first_contract"],
        missionAttempts: { "hello-soroban": 1 },
      });
      const exported = { state: load(), profile: loadProfile() };
      const result = await readAndValidateFile(toFile(exported));
      expect(result.errors).toEqual([]);
      expect(result.success).toBe(true);
    });

    it("rejects unknown mission ids against the real mission catalog", async () => {
      const state = { ...getDefaultState(), completedMissions: ["not-a-mission"] };
      const result = await readAndValidateFile(toFile({ state }));
      expect(result.success).toBe(false);
      expect(result.errors).toEqual([
        "state.completedMissions contains unknown mission id(s): not-a-mission",
      ]);
    });
  });
});
