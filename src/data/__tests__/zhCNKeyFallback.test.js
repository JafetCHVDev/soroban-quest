import { describe, it, expect, vi } from "vitest";

// Give the English locale a mission key so the fallback lookup can be checked.
vi.mock("../../i18n/locales/en.json", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    default: {
      ...actual.default,
      missions: { keyed: { title: "Keyed English Title" } },
    },
  };
});

const { localizeMission } = await import("../missions");

describe("localizeMission zh-CN fallback to an English locale key", () => {
  it("resolves the English key when the zh-CN field is missing", () => {
    const mission = {
      id: "keyed",
      i18n: {
        en: { title: "missions.keyed.title", story: "s", learningGoal: "g", hints: ["h"] },
        "zh-CN": { story: "故事", learningGoal: "目标", hints: ["提示"] },
      },
    };

    const result = localizeMission(mission, "zh-CN");
    expect(result.title).toBe("Keyed English Title");
    expect(result.story).toBe("故事");
  });
});
