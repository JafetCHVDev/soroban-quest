import { describe, it, expect } from "vitest";
import { missions, localizeMission } from "../missions";
import { campaigns, localizeCampaign } from "../campaigns";

const HAN = /[一-鿿]/;

describe("zh-CN content", () => {
  describe("missions", () => {
    it.each(missions.map((m) => [m.id, m]))("%s resolves to Chinese content", (_id, mission) => {
      const zh = localizeMission(mission, "zh-CN");
      const en = localizeMission(mission, "en");

      expect(zh.title).toMatch(HAN);
      expect(zh.story).toMatch(HAN);
      expect(zh.learningGoal).toMatch(HAN);
      expect(zh.hints).toHaveLength(en.hints.length);
      expect(zh.title).not.toBe(en.title);
    });

    it("falls back to English per field when a zh-CN field is missing", () => {
      const [first] = missions;
      const { hints: _omit, ...partialZh } = first.i18n["zh-CN"];
      const mission = { ...first, i18n: { ...first.i18n, "zh-CN": partialZh } };

      const result = localizeMission(mission, "zh-CN");
      expect(result.title).toBe(first.i18n["zh-CN"].title);
      expect(result.hints).toEqual(localizeMission(first, "en").hints);
    });

    it("falls back to English when there is no zh-CN entry", () => {
      const [first] = missions;
      const { "zh-CN": _omit, ...withoutZh } = first.i18n;
      const result = localizeMission({ ...first, i18n: withoutZh }, "zh-CN");
      expect(result.title).toBe(localizeMission(first, "en").title);
    });
  });

  describe("campaigns", () => {
    it.each(campaigns.map((c) => [c.id, c]))("%s resolves to Chinese content", (_id, campaign) => {
      const zh = localizeCampaign(campaign, "zh-CN");
      expect(zh.title).toMatch(HAN);
      expect(zh.description).toMatch(HAN);
      expect(zh.lore).toMatch(HAN);
    });

    it("falls back to English per field when a zh-CN field is missing", () => {
      const [first] = campaigns;
      const { lore: _omit, ...partialZh } = first.i18n["zh-CN"];
      const campaign = { ...first, i18n: { ...first.i18n, "zh-CN": partialZh } };

      const result = localizeCampaign(campaign, "zh-CN");
      expect(result.title).toBe(first.i18n["zh-CN"].title);
      expect(result.lore).toBe(first.i18n.en.lore);
    });
  });
});
