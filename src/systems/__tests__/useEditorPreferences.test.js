/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useEditorPreferences, FONT_SIZE_STORAGE_KEY } from "../useEditorPreferences";
import { EDITOR_THEMES, DEFAULT_THEME_ID, loadEditorTheme } from "../editorThemes";

function fakeMonaco() {
  return {
    editor: { setTheme: vi.fn(), defineTheme: vi.fn() },
  };
}

function render() {
  const editorRef = { current: null };
  const monacoRef = { current: null };
  const hook = renderHook(() => useEditorPreferences({ editorRef, monacoRef }));
  return { ...hook, editorRef, monacoRef };
}

const changeEvent = (value) => ({ target: { value } });

describe("useEditorPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("starts from the stored theme and the default font size", () => {
    const { result } = render();
    expect(result.current.editorTheme).toBe(DEFAULT_THEME_ID);
    expect(result.current.editorFontSize).toBe(14);
  });

  it("restores a stored font size", () => {
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, "18");
    const { result } = render();
    expect(result.current.editorFontSize).toBe(18);
  });

  it("stores the editor and monaco instances and applies the theme on mount", () => {
    const { result, editorRef, monacoRef } = render();
    const monaco = fakeMonaco();
    const editor = {};

    result.current.handleEditorMount(editor, monaco);

    expect(editorRef.current).toBe(editor);
    expect(monacoRef.current).toBe(monaco);
    expect(monaco.editor.setTheme).toHaveBeenCalledWith(DEFAULT_THEME_ID);
  });

  it("persists a theme change and applies it to the mounted editor", () => {
    const { result, monacoRef } = render();
    const monaco = fakeMonaco();
    monacoRef.current = monaco;
    const nextTheme = EDITOR_THEMES[EDITOR_THEMES.length - 1].id;

    act(() => {
      result.current.handleThemeChange(changeEvent(nextTheme));
    });

    expect(result.current.editorTheme).toBe(nextTheme);
    expect(loadEditorTheme()).toBe(nextTheme);
    expect(monaco.editor.setTheme).toHaveBeenCalledWith(nextTheme);
  });

  it("persists a font size change", () => {
    const { result } = render();

    act(() => {
      result.current.handleFontSizeChange(changeEvent("20"));
    });

    expect(result.current.editorFontSize).toBe(20);
    expect(localStorage.getItem(FONT_SIZE_STORAGE_KEY)).toBe("20");
  });
});
