import { describe, it, expect } from "vitest";

const { localizeMission } = await import("../missions");

describe("localizeMission zh-CN fallback to an English locale key", () => {
  it("resolves the English key when the zh-CN field is missing", () => {
    const mission = {
      id: "keyed",
      i18n: {
        en: { title: "English fallback title", story: "s", learningGoal: "g", hints: ["h"] },
        "zh-CN": { story: "故事", learningGoal: "目标", hints: ["提示"] },
      },
    };

    const result = localizeMission(mission, "zh-CN");
    expect(result.title).toBe("English fallback title");
    expect(result.story).toBe("故事");
  });
});
