/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { TOAST_STATES, useOkashi } from "../useokashi.js";

const OKASHI_URL = "https://okashi.dev";
const OPEN_FEATURES = "noopener,noreferrer";
const TOAST_CLEAR_MS = 6000;

const SPECIAL_CODE = [
  'pub fn hello(env: Env) -> Result<(), Error> {',
  '    let msg = "quotes \\"and\\" braces {}";',
  "    Ok(())",
  "}",
].join("\n");

function mockClipboard(writeText) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

describe("useOkashi", () => {
  let openSpy;
  let writeText;

  beforeEach(() => {
    vi.useFakeTimers();
    writeText = mockClipboard(vi.fn().mockResolvedValue(undefined));
    openSpy = vi.spyOn(window, "open").mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("exports toast states consumed by MissionDetail", () => {
    expect(TOAST_STATES).toEqual({
      IDLE: "idle",
      SUCCESS: "success",
      ERROR: "error",
    });
  });

  it("returns the { openInOkashi, toast } shape MissionDetail uses", () => {
    const { result } = renderHook(() => useOkashi());

    expect(result.current.openInOkashi).toEqual(expect.any(Function));
    expect(result.current.toast).toEqual({
      state: TOAST_STATES.IDLE,
      message: "",
    });
  });

  it("opens the Okashi app URL in a new tab with noopener", async () => {
    const { result } = renderHook(() => useOkashi());

    await act(async () => {
      await result.current.openInOkashi("pub fn main() {}");
    });

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(OKASHI_URL, "_blank", OPEN_FEATURES);
  });

  it("copies mission code to the clipboard unchanged, including quotes, braces, and newlines", async () => {
    const { result } = renderHook(() => useOkashi());

    await act(async () => {
      await result.current.openInOkashi(SPECIAL_CODE);
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(SPECIAL_CODE);
    expect(writeText.mock.calls[0][0]).toBe(SPECIAL_CODE);
  });

  it("still opens Okashi and copies an empty string when code is empty", async () => {
    const { result } = renderHook(() => useOkashi());

    await act(async () => {
      await result.current.openInOkashi("");
    });

    expect(writeText).toHaveBeenCalledWith("");
    expect(openSpy).toHaveBeenCalledWith(OKASHI_URL, "_blank", OPEN_FEATURES);
    expect(result.current.toast.state).toBe(TOAST_STATES.SUCCESS);
  });

  it("does not require a mission id — openInOkashi only takes code", async () => {
    const { result } = renderHook(() => useOkashi());

    await act(async () => {
      await result.current.openInOkashi(SPECIAL_CODE);
    });

    expect(writeText.mock.calls[0]).toHaveLength(1);
    expect(openSpy.mock.calls[0][0]).toBe(OKASHI_URL);
  });

  it("sets a success toast after a successful clipboard copy", async () => {
    const { result } = renderHook(() => useOkashi());

    await act(async () => {
      await result.current.openInOkashi(SPECIAL_CODE);
    });

    expect(result.current.toast.state).toBe(TOAST_STATES.SUCCESS);
    expect(result.current.toast.message).toMatch(/copied/i);
  });

  it("still opens Okashi and sets an error toast when clipboard write fails", async () => {
    writeText.mockRejectedValue(new Error("clipboard denied"));
    const { result } = renderHook(() => useOkashi());

    await act(async () => {
      await result.current.openInOkashi(SPECIAL_CODE);
    });

    expect(openSpy).toHaveBeenCalledWith(OKASHI_URL, "_blank", OPEN_FEATURES);
    expect(result.current.toast.state).toBe(TOAST_STATES.ERROR);
    expect(result.current.toast.message).toMatch(/auto-copy failed/i);
  });

  it("clears the toast back to idle after 6 seconds", async () => {
    const { result } = renderHook(() => useOkashi());

    await act(async () => {
      await result.current.openInOkashi(SPECIAL_CODE);
    });
    expect(result.current.toast.state).toBe(TOAST_STATES.SUCCESS);

    await act(async () => {
      vi.advanceTimersByTime(TOAST_CLEAR_MS);
    });

    expect(result.current.toast).toEqual({
      state: TOAST_STATES.IDLE,
      message: "",
    });
  });
});
