import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  EDITOR_THEMES,
  DEFAULT_THEME_ID,
  getThemeById,
  isValidThemeId,
  registerEditorThemes,
  loadEditorTheme,
  saveEditorTheme,
} from "../editorThemes.js";

describe("editorThemes", () => {
  let storage;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key) => storage[key] ?? null,
      setItem: (key, value) => {
        storage[key] = String(value);
      },
      removeItem: (key) => {
        delete storage[key];
      },
    });
  });

  describe("definitions", () => {
    it("defines between 3 and 5 themes with unique ids", () => {
      expect(EDITOR_THEMES.length).toBeGreaterThanOrEqual(3);
      expect(EDITOR_THEMES.length).toBeLessThanOrEqual(5);
      const ids = EDITOR_THEMES.map((theme) => theme.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("ships theme data for every custom (non-builtin) theme", () => {
      for (const theme of EDITOR_THEMES) {
        if (!theme.builtin) {
          expect(theme.data).toBeTruthy();
          expect(theme.data.base).toBeTruthy();
        }
      }
    });

    it("uses a known id as the default", () => {
      expect(isValidThemeId(DEFAULT_THEME_ID)).toBe(true);
    });
  });

  describe("isValidThemeId / getThemeById", () => {
    it("accepts known ids and rejects unknown ones", () => {
      expect(isValidThemeId("vs-dark")).toBe(true);
      expect(isValidThemeId("not-a-theme")).toBe(false);
      expect(getThemeById("vs-dark")?.id).toBe("vs-dark");
      expect(getThemeById("not-a-theme")).toBeUndefined();
    });
  });

  describe("persistence", () => {
    it("returns the default when nothing is stored", () => {
      expect(loadEditorTheme()).toBe(DEFAULT_THEME_ID);
    });

    it("persists and reloads a valid theme", () => {
      saveEditorTheme("soroban-night");
      expect(storage["soroban_quest_editor_theme"]).toBe("soroban-night");
      expect(loadEditorTheme()).toBe("soroban-night");
    });

    it("ignores invalid ids on save", () => {
      saveEditorTheme("bogus-theme");
      expect(storage["soroban_quest_editor_theme"]).toBeUndefined();
    });

    it("falls back to the default when a stored value is invalid", () => {
      storage["soroban_quest_editor_theme"] = "bogus-theme";
      expect(loadEditorTheme()).toBe(DEFAULT_THEME_ID);
    });
  });

  describe("registerEditorThemes", () => {
    it("defines every custom theme on the monaco instance", () => {
      const defineTheme = vi.fn();
      registerEditorThemes({ editor: { defineTheme } });

      const customThemes = EDITOR_THEMES.filter((theme) => !theme.builtin);
      expect(defineTheme).toHaveBeenCalledTimes(customThemes.length);
      for (const theme of customThemes) {
        expect(defineTheme).toHaveBeenCalledWith(theme.id, theme.data);
      }
    });

    it("does nothing when given an unusable monaco instance", () => {
      expect(() => registerEditorThemes(null)).not.toThrow();
      expect(() => registerEditorThemes({})).not.toThrow();
    });
  });
});
