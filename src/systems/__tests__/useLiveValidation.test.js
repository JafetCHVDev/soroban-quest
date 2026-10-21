/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import {
  useLiveValidation,
  LIVE_MARKER_OWNER,
  SECURITY_MARKER_OWNER,
} from "../useLiveValidation";
import { getMissionById } from "../missionLoader";
import { SECURITY_MARKER_SOURCE } from "../liveValidator";

const mission = getMissionById("greetings-protocol", "en");

const INSECURE_CODE = `pub fn transfer(env: Env, from: Address, amount: i128) {
    env.storage().instance().set(&from, &amount);
}`;

describe("useLiveValidation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  function render(code, loading = false) {
    const setMarkers = vi.fn();
    const hook = renderHook(
      (props) =>
        useLiveValidation({ code: props.code, mission, loading: props.loading, setMarkers }),
      { initialProps: { code, loading } },
    );
    return { ...hook, setMarkers };
  }

  it("reports pass and total counts after the debounce", () => {
    const { result } = render(mission.solution);
    expect(result.current.liveTotalCount).toBe(0);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.liveTotalCount).toBeGreaterThan(0);
    expect(result.current.livePassCount).toBe(result.current.liveTotalCount);
  });

  it("splits security findings from live check markers", () => {
    const { result, setMarkers } = render(INSECURE_CODE);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.securityNotes.length).toBeGreaterThan(0);
    const calls = new Map(setMarkers.mock.calls.map(([owner, markers]) => [owner, markers]));
    const live = calls.get(LIVE_MARKER_OWNER);
    const security = calls.get(SECURITY_MARKER_OWNER);
    expect(security.length).toBeGreaterThan(0);
    expect(security.every((m) => m.source === SECURITY_MARKER_SOURCE)).toBe(true);
    expect(live.every((m) => m.source !== SECURITY_MARKER_SOURCE)).toBe(true);
  });

  it("does not validate while the mission is loading", () => {
    const { result, setMarkers } = render(mission.solution, true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.liveTotalCount).toBe(0);
    expect(setMarkers).not.toHaveBeenCalled();
  });

  it("validates once the mission finishes loading", () => {
    const { result, rerender } = render(mission.solution, true);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.liveTotalCount).toBe(0);

    rerender({ code: mission.solution, loading: false });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.liveTotalCount).toBeGreaterThan(0);
  });

  it("keeps resetLiveValidation stable across renders", () => {
    // MissionDetail's load effect depends on this identity.
    const { result } = render(mission.solution);
    const first = result.current.resetLiveValidation;
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.liveTotalCount).toBeGreaterThan(0);
    expect(result.current.resetLiveValidation).toBe(first);
  });

  it("resets the counts and security notes", () => {
    const { result } = render(INSECURE_CODE);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current.resetLiveValidation();
    });

    expect(result.current.livePassCount).toBe(0);
    expect(result.current.liveTotalCount).toBe(0);
    expect(result.current.securityNotes).toEqual([]);
  });

  it("cancels pending validation and clears both marker owners on unmount", () => {
    const { unmount, setMarkers } = render(mission.solution);

    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(setMarkers.mock.calls).toEqual([
      [LIVE_MARKER_OWNER, []],
      [SECURITY_MARKER_OWNER, []],
    ]);
  });
});
