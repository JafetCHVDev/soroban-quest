import { describe, it, expect } from "vitest";
import {
  getAllMissions,
  getChapterTitle,
  getMissionsByChapter,
  isMissionUnlocked,
} from "../missionLoader.js";

describe("missionLoader", () => {
  it("groups chapter 0 missions separately", () => {
    const chapters = getMissionsByChapter();

    expect(chapters[0]).toHaveLength(5);
    expect(chapters[0].every((mission) => mission.chapter === 0)).toBe(true);
    expect(getChapterTitle(0)).toBe("Rust Fundamentals");
  });

  it("adds 450 XP across the Rust fundamentals chapter", () => {
    const chapterZeroXP = getAllMissions()
      .filter((mission) => mission.chapter === 0)
      .reduce((total, mission) => total + mission.xpReward, 0);

    expect(chapterZeroXP).toBe(450);
  });

  it("unlocks all chapter 0 missions by default", () => {
    expect(isMissionUnlocked("rust-variables-and-types", [])).toBe(true);
    expect(isMissionUnlocked("rust-error-handling", [])).toBe(true);
  });

  it("keeps the original chapter 1 progression intact", () => {
    expect(isMissionUnlocked("hello-soroban", [])).toBe(true);
    expect(isMissionUnlocked("greetings-protocol", [])).toBe(false);
    expect(isMissionUnlocked("greetings-protocol", ["hello-soroban"])).toBe(true);
  });
});
