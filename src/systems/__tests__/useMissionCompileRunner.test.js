/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";

const compiler = vi.hoisted(() => ({
  init: vi.fn(),
  compileAndRun: vi.fn(),
}));

vi.mock("../wasmCompiler", () => ({
  COMPILE_MARKER_OWNER: "soroban-quest-compile",
  getWasmCompiler: () => compiler,
  WasmCompiler: {
    toMonacoMarkers: (diagnostics = []) => diagnostics.map(() => ({ message: "diag" })),
  },
}));

vi.mock("../soundManager", () => ({
  playSound: vi.fn(),
  SOUND_TYPES: { ERROR: "error", MISSION_COMPLETE: "complete", XP_GAINED: "xp", LEVEL_UP: "level" },
}));

import { useMissionCompileRunner } from "../useMissionCompileRunner";
import { getMissionById } from "../missionLoader";
import { loadProgress, saveProgress } from "../storage";
import { getDefaultState } from "../gameEngine";

const mission = getMissionById("hello-soroban", "en");
const t = (key, vars) => (vars ? `${key} ${JSON.stringify(vars)}` : key);

function render(code) {
  const options = {
    code,
    mission,
    missionId: mission.id,
    language: "en",
    t,
    showToast: vi.fn(),
    setActiveTab: vi.fn(),
    setMarkers: vi.fn(),
    onVictory: vi.fn(),
  };
  const hook = renderHook(() => useMissionCompileRunner(options));
  return { ...hook, options };
}

async function settle() {
  await act(async () => {
    await vi.runAllTimersAsync();
  });
}

describe("useMissionCompileRunner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    saveProgress(getDefaultState());
    compiler.init.mockReset();
    compiler.compileAndRun.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("starts the compiler worker on mount and clears compile markers on unmount", () => {
    const { unmount, options } = render(mission.template);
    expect(compiler.init).toHaveBeenCalledTimes(1);

    unmount();

    expect(options.setMarkers).toHaveBeenCalledWith("soroban-quest-compile", []);
  });

  it("streams passing results, saves the completion and opens the victory modal", async () => {
    const { result, options } = render(mission.solution);

    act(() => {
      void result.current.handleRunTests();
    });
    expect(result.current.isRunning).toBe(true);
    expect(options.setActiveTab).toHaveBeenCalledWith("tests");
    await settle();

    expect(result.current.isRunning).toBe(false);
    expect(result.current.testResults[0].message).toBe("missionDetail.terminal.runningChecks");
    expect(result.current.testResults.at(-1)?.phase).toBe("summary");
    expect(options.showToast).toHaveBeenCalledWith("missionDetail.toasts.validated", "success");
    expect(loadProgress().completedMissions).toContain(mission.id);
    expect(loadProgress().missionAttempts[mission.id]).toBe(1);
    expect(options.onVictory).toHaveBeenCalledTimes(1);
    expect(options.onVictory.mock.calls[0][0].xp).toBeGreaterThanOrEqual(mission.xpReward);
  });

  it("reports a failing run without completing the mission", async () => {
    const { result, options } = render(mission.template);

    act(() => {
      void result.current.handleRunTests();
    });
    await settle();

    expect(options.showToast).toHaveBeenCalledWith("missionDetail.toasts.validationFailed", "error");
    expect(options.onVictory).not.toHaveBeenCalled();
    expect(loadProgress().completedMissions).not.toContain(mission.id);
  });

  it("notes an already completed mission instead of opening the victory modal", async () => {
    saveProgress({ ...getDefaultState(), completedMissions: [mission.id], xp: 100 });
    const { result, options } = render(mission.solution);

    act(() => {
      void result.current.handleRunTests();
    });
    await settle();

    expect(options.onVictory).not.toHaveBeenCalled();
    expect(result.current.testResults.at(-1)?.message).toBe("missionDetail.terminal.alreadyCompleted");
  });

  it("streams compiler output and publishes diagnostics as markers", async () => {
    compiler.compileAndRun.mockResolvedValue({
      engine: "wasm",
      ok: true,
      stdout: "line one\nline two",
      stderr: "",
      diagnostics: [{}],
      durationMs: 12,
    });
    const { result, options } = render(mission.solution);

    act(() => {
      void result.current.handleCompileAndRun();
    });
    await settle();

    expect(result.current.isCompiling).toBe(false);
    expect(result.current.testResults.map((r) => r.message)).toEqual([
      "missionDetail.terminal.compiling",
      "missionDetail.terminal.compileEngineWasm",
      "line one",
      "line two",
      'missionDetail.terminal.compileOk {"ms":12}',
    ]);
    expect(options.setMarkers).toHaveBeenCalledWith("soroban-quest-compile", [{ message: "diag" }]);
    expect(options.showToast).toHaveBeenCalledWith('missionDetail.terminal.compileOk {"ms":12}', "success");
  });

  it("reports a compiler crash as a failed summary", async () => {
    compiler.compileAndRun.mockRejectedValue(new Error("worker died"));
    const { result } = render(mission.solution);

    act(() => {
      void result.current.handleCompileAndRun();
    });
    await settle();

    expect(result.current.isCompiling).toBe(false);
    expect(result.current.testResults.at(-1)).toEqual({
      phase: "summary",
      passed: false,
      message: 'missionDetail.terminal.compileError {"message":"worker died"}',
    });
  });

  it("ignores a second run while tests are already running", async () => {
    const { result } = render(mission.template);

    act(() => {
      void result.current.handleRunTests();
    });
    act(() => {
      void result.current.handleRunTests();
      void result.current.handleCompileAndRun();
    });
    await settle();

    const starts = result.current.testResults.filter(
      (r) => r.message === "missionDetail.terminal.runningChecks",
    );
    expect(starts).toHaveLength(1);
    expect(compiler.compileAndRun).not.toHaveBeenCalled();
  });

  it("reports the fallback engine and failed compiles", async () => {
    compiler.compileAndRun.mockResolvedValue({
      engine: "fallback",
      ok: false,
      stdout: "",
      stderr: "error[E0425]: cannot find value",
      diagnostics: [],
      errorCount: 1,
    });
    const { result, options } = render(mission.template);

    act(() => {
      void result.current.handleCompileAndRun();
    });
    await settle();

    expect(result.current.testResults).toEqual([
      { phase: "info", message: "missionDetail.terminal.compiling" },
      { phase: "info", message: "missionDetail.terminal.compileFallback" },
      { phase: "output", passed: false, message: "error[E0425]: cannot find value" },
      { phase: "summary", passed: false, message: 'missionDetail.terminal.compileFailed {"errors":1}' },
    ]);
    expect(options.showToast).toHaveBeenCalledWith("missionDetail.toasts.validationFailed", "error");
  });

  it("keeps clearTestResults stable across renders", async () => {
    // MissionDetail's load effect depends on this identity.
    const { result } = render(mission.template);
    const first = result.current.clearTestResults;
    act(() => {
      void result.current.handleRunTests();
    });
    await settle();
    expect(result.current.clearTestResults).toBe(first);
  });

  it("clears the terminal on demand", async () => {
    const { result } = render(mission.template);
    act(() => {
      void result.current.handleRunTests();
    });
    await settle();

    act(() => {
      result.current.clearTestResults();
    });

    expect(result.current.testResults).toEqual([]);
  });
});
