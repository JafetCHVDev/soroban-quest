/* ==========================================
   useMissionCompileRunner: the run-tests and compile-and-run
   loops that stream results into the mission terminal
   ========================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { runTests } from "./testRunner";
import { loadProgress, saveProgress } from "./storage";
import { recordAttempt } from "./gameEngine";
import { playSound, SOUND_TYPES } from "./soundManager";
import { getWasmCompiler, WasmCompiler, COMPILE_MARKER_OWNER } from "./wasmCompiler";
import { completeMissionWithDailyBonus } from "./missionCompletion";
import type { SetEditorMarkers } from "./useMonacoMarkers";
import type { ToastContextValue } from "./ToastContext";

/** One line in the mission terminal. */
export interface TerminalLine {
  phase: string;
  message: string;
  passed?: boolean;
  label?: string;
}

export interface VictoryData {
  xp: number;
  leveledUp: boolean;
  newLevel: number;
  newBadges: string[];
}

export interface RunnableMission {
  xpReward: number;
}

type Translate = (_key: string, _vars?: Record<string, unknown>) => string;

export interface UseMissionCompileRunnerOptions {
  code: string;
  mission: RunnableMission | null;
  missionId: string | undefined;
  language: string;
  t: Translate;
  showToast: ToastContextValue["showToast"] | undefined;
  setActiveTab: (_tab: string) => void;
  setMarkers: SetEditorMarkers;
  onVictory: (_victory: VictoryData) => void;
}

export interface UseMissionCompileRunnerReturn {
  testResults: TerminalLine[];
  isRunning: boolean;
  isCompiling: boolean;
  terminalBodyRef: MutableRefObject<HTMLDivElement | null>;
  handleRunTests: () => Promise<void>;
  handleCompileAndRun: () => Promise<void>;
  clearTestResults: () => void;
}

export function useMissionCompileRunner({
  code,
  mission,
  missionId,
  language,
  t,
  showToast,
  setActiveTab,
  setMarkers,
  onVictory,
}: UseMissionCompileRunnerOptions): UseMissionCompileRunnerReturn {
  const [testResults, setTestResults] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement | null>(null);
  const compilerRef = useRef<WasmCompiler | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [testResults]);

  // Set up the WASM compiler (lazy worker) and tear it down on unmount.
  useEffect(() => {
    compilerRef.current = getWasmCompiler();
    // Kick off worker init in the background so the first compile is snappy.
    compilerRef.current.init?.();
    return () => {
      setMarkers(COMPILE_MARKER_OWNER, []);
    };
  }, [setMarkers]);

  const handleRunTests = useCallback(async () => {
    if (isRunning || !mission) return;
    setIsRunning(true);
    setTestResults([]);
    setActiveTab("tests");

    let state = loadProgress();
    state = missionId ? recordAttempt(state, missionId) : state;
    saveProgress(state);

    const resultCollector: TerminalLine[] = [];
    const addResult = (result: TerminalLine): void => {
      resultCollector.push(result);
      setTestResults([...resultCollector]);
    };

    addResult({ phase: "info", message: t("missionDetail.terminal.runningChecks") });
    await delay(400);

    const result = await runTests(code, mission);
    for (const r of result.results) {
      addResult(r);
      await delay(250);
    }

    await delay(300);
    addResult({ phase: "summary", message: result.summary });

    if (result.allPassed) {
      if (showToast) showToast(t("missionDetail.toasts.validated"), "success");
      await delay(500);

      const { newState, bonusXp } = completeMissionWithDailyBonus(
        missionId,
        mission.xpReward,
        language,
      );

      if (!newState.alreadyCompleted) {
        saveProgress(newState);
        onVictory({
          xp: mission.xpReward + bonusXp,
          leveledUp: Boolean(newState.leveledUp),
          newLevel: newState.level,
          newBadges: newState.newBadges || [],
        });
      } else {
        addResult({
          phase: "info",
          message: t("missionDetail.terminal.alreadyCompleted"),
        });
      }
    } else {
      playSound(SOUND_TYPES.ERROR);

      if (showToast) showToast(t("missionDetail.toasts.validationFailed"), "error");
    }

    setIsRunning(false);
  }, [code, mission, missionId, language, isRunning, showToast, t, setActiveTab, onVictory]);

  const handleCompileAndRun = useCallback(async () => {
    if (isCompiling || isRunning || !mission) return;
    setIsCompiling(true);
    setTestResults([]);
    setActiveTab("tests");
    setMarkers(COMPILE_MARKER_OWNER, []);

    const collector: TerminalLine[] = [];
    const push = (result: TerminalLine): void => {
      collector.push(result);
      setTestResults([...collector]);
    };

    push({ phase: "info", message: t("missionDetail.terminal.compiling") });

    const compiler = compilerRef.current || getWasmCompiler();
    let result;
    try {
      result = await compiler.compileAndRun(code, mission);
    } catch (err) {
      push({
        phase: "summary",
        passed: false,
        message: t("missionDetail.terminal.compileError", {
          message: (err as Error | undefined)?.message || String(err),
        }),
      });
      setIsCompiling(false);
      return;
    }

    // Surface which engine ran so users understand the guarantee level.
    if (result.engine === "wasm") {
      push({ phase: "info", message: t("missionDetail.terminal.compileEngineWasm") });
    } else {
      push({ phase: "info", message: t("missionDetail.terminal.compileFallback") });
    }

    // Stream compiler stdout/stderr into the terminal, line by line.
    for (const line of String(result.stdout || "").split("\n")) {
      if (line.trim()) push({ phase: "output", passed: true, message: line });
    }
    for (const line of String(result.stderr || "").split("\n")) {
      if (line.trim()) push({ phase: "output", passed: false, message: line });
    }

    // Publish diagnostics as Monaco markers in the editor.
    setMarkers(COMPILE_MARKER_OWNER, WasmCompiler.toMonacoMarkers(result.diagnostics));

    if (result.ok) {
      push({
        phase: "summary",
        passed: true,
        message: t("missionDetail.terminal.compileOk", { ms: result.durationMs ?? 0 }),
      });
      if (showToast) {
        showToast(t("missionDetail.terminal.compileOk", { ms: result.durationMs ?? 0 }), "success");
      }
    } else {
      push({
        phase: "summary",
        passed: false,
        message: t("missionDetail.terminal.compileFailed", { errors: result.errorCount ?? 0 }),
      });
      if (showToast) showToast(t("missionDetail.toasts.validationFailed"), "error");
    }

    setIsCompiling(false);
  }, [code, mission, isCompiling, isRunning, showToast, t, setActiveTab, setMarkers]);

  const clearTestResults = useCallback((): void => {
    setTestResults([]);
  }, []);

  return {
    testResults,
    isRunning,
    isCompiling,
    terminalBodyRef,
    handleRunTests,
    handleCompileAndRun,
    clearTestResults,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
