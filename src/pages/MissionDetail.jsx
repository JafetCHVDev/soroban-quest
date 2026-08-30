import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "../components/LazyMonacoEditor";
import ReactMarkdown from "react-markdown";
import { getMissionById, getNextMission } from "../systems/missionLoader";
import { runTests } from "../systems/testRunner";
import { loadProgress, saveProgress } from "../systems/storage";
import { completeMission, recordAttempt, spendGoldForHint, isHintGoldUnlocked, HINT_GOLD_COST } from "../systems/gameEngine";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";
import MissionDetailSkeleton from "../components/MissionDetailSkeleton";
import { useOkashi, TOAST_STATES } from "../systems/useokashi";
import { createDebouncedValidator, SECURITY_MARKER_SOURCE } from "../systems/liveValidator";
import SecurityNotes from "../components/SecurityNotes";
import { getWasmCompiler, WasmCompiler, COMPILE_MARKER_OWNER } from "../systems/wasmCompiler";
import { useToast } from "../systems/ToastContext";
import { MissionErrorBoundary } from "../components/ErrorBoundary";
import Confetti from "../components/Confetti";
import CodeReplayPlayer from "../components/CodeReplayPlayer";
import CodeRecorder from "../systems/codeRecorder";
import { useTranslation } from "../i18n/useTranslation";
import useDocumentTitle from '../systems/useDocumentTitle';
import { measureRender } from "../systems/performanceMonitor";
import {
  EDITOR_THEMES,
  registerEditorThemes,
  loadEditorTheme,
  saveEditorTheme,
} from "../systems/editorThemes";
import "./MissionDetail.css"

const LIVE_MARKER_OWNER = "soroban-quest-live";
const SECURITY_MARKER_OWNER = "soroban-quest-security";
const MAX_RANK_INDEX = 10;

export default function MissionDetail() {
  useDocumentTitle('Mission Detail');
  useEffect(() => {
    const stop = measureRender('MissionDetail');
    stop();
  });
  const { missionId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const mission = useMemo(
    () => getMissionById(missionId, language),
    [missionId, language],
  );

  const toastContext = useToast();
  const showToast = toastContext?.showToast;

  // --------------------------- States ---------------------------
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryData, setVictoryData] = useState(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [goldBalance, setGoldBalance] = useState(() => loadProgress().gold || 0);
  const [goldUnlockedHints, setGoldUnlockedHints] = useState(() => loadProgress().goldUnlockedHints || {});
  const [showReplay, setShowReplay] = useState(false);
  const [replayData, setReplayData] = useState(null);

  const [livePassCount, setLivePassCount] = useState(0);
  const [liveTotalCount, setLiveTotalCount] = useState(0);
  const [securityNotes, setSecurityNotes] = useState([]);
  const [activeTab, setActiveTab] = useState("story");
  const [editorTheme, setEditorTheme] = useState(() => loadEditorTheme());
  const [editorFontSize, setEditorFontSize] = useState(() => {
    return parseInt(localStorage.getItem('soroban_quest_editor_font_size') || '14', 10);
  });

  const terminalBodyRef = useRef(null);
  const editorRef = useRef(null);      
  const monacoRef = useRef(null);      
  const validatorRef = useRef(null);
  const victoryModalRef = useRef(null);
  const compilerRef = useRef(null);

  const { openInOkashi, toast } = useOkashi();

  const progressState = loadProgress();
  const isCompleted = progressState.completedMissions.includes(missionId);
  const hasReplay = CodeRecorder.hasRecording(missionId);

  const nextMissionItem = useMemo(
    () => getNextMission(missionId, language),
    [missionId, language],
  );
  const previousMissionItem = useMemo(
    () => getMissionById(String(Number(missionId) - 1), language),
    [missionId, language],
  );

  // --------------------------- Load Mission ---------------------------
  useEffect(() => {
    setLoading(true);
    if (mission) {
      setTimeout(() => {
        setCode(mission.template || "");
        setTestResults([]);
        setHintIndex(-1);
        {
          const freshProgress = loadProgress();
          setGoldBalance(freshProgress.gold || 0);
          setGoldUnlockedHints(freshProgress.goldUnlockedHints || {});
        }
        setShowVictory(false);
        setLivePassCount(0);
        setLiveTotalCount(0);
        setSecurityNotes([]);
        setActiveTab("story");
        setLoading(false);
        logActivity(
          ACTIVITY_TYPES.MISSION_STARTED,
          { missionId, title: mission.title },
          `Started mission: ${mission.title}`,
        );
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [missionId, mission]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [testResults]);

  // Set up debounced validator once
  useEffect(() => {
    const validator = createDebouncedValidator(500, (result) => {
      setLivePassCount(result.passCount);
      setLiveTotalCount(result.totalCount);
      setSecurityNotes(result.securityNotes || []);
      const allMarkers = result.markers || [];
      applyMonacoMarkers(allMarkers.filter((m) => m.source !== SECURITY_MARKER_SOURCE));
      applySecurityMarkers(allMarkers.filter((m) => m.source === SECURITY_MARKER_SOURCE));
    });
    validatorRef.current = validator;

    return () => {
      validator.cancel();
      clearMonacoMarkers();
      clearSecurityMarkers();
    };
  }, []);

  // Set up the WASM compiler (lazy worker) and tear it down on unmount.
  useEffect(() => {
    compilerRef.current = getWasmCompiler();
    // Kick off worker init in the background so the first compile is snappy.
    compilerRef.current.init?.();
    return () => {
      clearCompileMarkers();
    };
  }, []);

  const handleRunTests = useCallback(async () => {
    if (isRunning || !mission) return;
    setIsRunning(true);
    setTestResults([]);
    setActiveTab("tests");

    let state = loadProgress();
    state = recordAttempt(state, missionId);
    saveProgress(state);

    const resultCollector = [];
    const addResult = (result) => {
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
      state = loadProgress();
      const newState = completeMission(state, missionId, mission.xpReward);

      if (!newState.alreadyCompleted) {
        saveProgress(newState);
        setVictoryData({
          xp: mission.xpReward,
          leveledUp: newState.leveledUp,
          newLevel: newState.level,
          newBadges: newState.newBadges || [],
        });
        setShowVictory(true);
      } else {
        addResult({
          phase: "info",
          message: t("missionDetail.terminal.alreadyCompleted"),
        });
      }
    } else {
      if (showToast) showToast(t("missionDetail.toasts.validationFailed"), "error");
    }

    setIsRunning(false);
  }, [code, mission, missionId, isRunning, showToast, t]);

  const handleCompileAndRun = useCallback(async () => {
    if (isCompiling || isRunning || !mission) return;
    setIsCompiling(true);
    setTestResults([]);
    setActiveTab("tests");
    clearCompileMarkers();

    const collector = [];
    const push = (result) => {
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
          message: err?.message || String(err),
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
    applyCompileMarkers(WasmCompiler.toMonacoMarkers(result.diagnostics));

    if (result.ok) {
      push({
        phase: "summary",
        passed: true,
        message: t("missionDetail.terminal.compileOk", { ms: result.durationMs ?? 0 }),
      });
      if (showToast) showToast(t("missionDetail.terminal.compileOk", { ms: result.durationMs ?? 0 }), "success");
    } else {
      push({
        phase: "summary",
        passed: false,
        message: t("missionDetail.terminal.compileFailed", { errors: result.errorCount ?? 0 }),
      });
      if (showToast) showToast(t("missionDetail.toasts.validationFailed"), "error");
    }

    setIsCompiling(false);
  }, [code, mission, isCompiling, isRunning, showToast, t]);

  const handleNextMission = useCallback(() => {
    if (nextMissionItem) navigate(`/mission/${nextMissionItem.id}`);
    else navigate("/missions");
  }, [nextMissionItem, navigate]);

  const handlePreviousMission = useCallback(() => {
    if (previousMissionItem) navigate(`/mission/${previousMissionItem.id}`);
  }, [previousMissionItem, navigate]);

  // --------------------------- Keyboard Shortcuts Hook ---------------------------
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // Ctrl+Enter / Cmd+Enter always runs tests (even from Monaco)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunTests();
        return;
      }

      // Prevent running if user is typing inside code fields or inputs
      const targetTag = document.activeElement?.tagName.toLowerCase();
      const isMonacoFocused = document.activeElement?.closest('.monaco-editor');
      
      if (
        targetTag === "input" || 
        targetTag === "textarea" || 
        document.activeElement?.isContentEditable ||
        isMonacoFocused
      ) {
        return; 
      }

      const key = e.key.toLowerCase();
      if (key === 'r') {
        e.preventDefault();
        handleRunTests();
      } else if (key === 'n') {
        e.preventDefault();
        handleNextMission();
      } else if (key === 'p') {
        e.preventDefault();
        handlePreviousMission();
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [handleRunTests, handleNextMission, handlePreviousMission]);

  // Focus Trapping for the Victory Modal
  useEffect(() => {
    if (!showVictory || !victoryModalRef.current) return;

    const modalElement = victoryModalRef.current;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modalElement.querySelectorAll(focusableSelectors);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowVictory(false);
        return;
      }
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalElement.addEventListener("keydown", handleKeyDown);
    return () => modalElement.removeEventListener("keydown", handleKeyDown);
  }, [showVictory]);

  // Re-run live validation when code or mission changes
  useEffect(() => {
    if (!mission || loading) return;
    validatorRef.current?.call(code, mission);
  }, [code, mission, loading]);

  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    // Register custom themes so the stored selection applies on first paint.
    registerEditorThemes(monaco);
    monaco.editor.setTheme(editorTheme);
  }, [editorTheme]);

  const handleThemeChange = useCallback((event) => {
    const nextTheme = event.target.value;
    setEditorTheme(nextTheme);
    saveEditorTheme(nextTheme);
    monacoRef.current?.editor.setTheme(nextTheme);
  }, []);

  function applyMonacoMarkers(markers) {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(model, LIVE_MARKER_OWNER, markers);
  }

  function clearMonacoMarkers() {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (model) monaco.editor.setModelMarkers(model, LIVE_MARKER_OWNER, []);
  }

  function applySecurityMarkers(markers) {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(model, SECURITY_MARKER_OWNER, markers);
  }

  function clearSecurityMarkers() {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (model) monaco.editor.setModelMarkers(model, SECURITY_MARKER_OWNER, []);
  }

  function applyCompileMarkers(markers) {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(model, COMPILE_MARKER_OWNER, markers);
  }

  function clearCompileMarkers() {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (model) monaco.editor.setModelMarkers(model, COMPILE_MARKER_OWNER, []);
  }

  function statusBarState() {
    if (liveTotalCount === 0) {
      return {
        label: t("missionDetail.status.checking"),
        color: "var(--text-muted)",
        background: "rgba(255,255,255,0.08)",
        pct: 0,
      };
    }
    const pct = Math.round((livePassCount / liveTotalCount) * 100);
    if (livePassCount === liveTotalCount) {
      return {
        label: t("missionDetail.status.allPassing", {
          passed: livePassCount,
          total: liveTotalCount,
        }),
        color: "#34d399",
        background: "#059669",
        pct,
      };
    }

    if (livePassCount === 0) {
      return {
        label: t("missionDetail.status.passing", {
          passed: livePassCount,
          total: liveTotalCount,
        }),
        color: "#f87171",
        background: "#dc2626",
        pct,
      };
    }
    return {
      label: t("missionDetail.status.passing", {
        passed: livePassCount,
        total: liveTotalCount,
      }),
      color: "#fbbf24",
      background: "#d97706",
      pct,
    };
  }

  const handleHint = () => {
    if (mission?.hints && hintIndex < mission.hints.length - 1) {
      const nextIndex = hintIndex + 1;
      setHintIndex(nextIndex);
      if (showToast) {
        showToast(
          t("missionDetail.toasts.hintUnlocked", { index: nextIndex + 1 }),
          "info",
        );
      }
      logActivity(
        ACTIVITY_TYPES.HINT_USED,
        { missionId, hintIndex: nextIndex, title: mission.title },
        `Used hint ${nextIndex + 1} for ${mission.title}`,
      );
    }
  };

  const handleGoldHint = () => {
    if (!mission?.hints) return;
    const nextIndex = hintIndex + 1;
    if (nextIndex >= mission.hints.length) return;

    const current = loadProgress();

    // Already gold-unlocked on a previous visit — reveal for free, don't re-charge.
    if (isHintGoldUnlocked(current, missionId, nextIndex)) {
      setHintIndex(nextIndex);
      return;
    }

    if ((current.gold || 0) < HINT_GOLD_COST) {
      if (showToast) {
        showToast(
          t("missionDetail.toasts.hintInsufficientGold", { cost: HINT_GOLD_COST }),
          "error",
        );
      }
      return;
    }

    const updated = spendGoldForHint(current, missionId, nextIndex, HINT_GOLD_COST);
    saveProgress(updated);
    setGoldBalance(updated.gold || 0);
    setGoldUnlockedHints(updated.goldUnlockedHints || {});
    setHintIndex(nextIndex);

    if (showToast) {
      showToast(
        t("missionDetail.toasts.hintGoldUnlocked", { index: nextIndex + 1, cost: HINT_GOLD_COST }),
        "success",
      );
    }
    logActivity(
      ACTIVITY_TYPES.HINT_USED,
      { missionId, hintIndex: nextIndex, title: mission.title, gold: HINT_GOLD_COST },
      `Spent ${HINT_GOLD_COST} gold to unlock hint ${nextIndex + 1} for ${mission.title}`,
    );
  };

  const handleReset = () => {
    if (mission?.template) {
      setCode(mission.template);
      setTestResults([]);
      setHintIndex(-1);
      if (showToast) showToast(t("missionDetail.toasts.codeReset"), "warning");
    }
  };

  const handleShowSolution = () => {
    if (mission?.solution) {
      setCode(mission.solution);
      if (showToast) showToast(t("missionDetail.toasts.solutionLoaded"), "info");
    }
  };

  const handleWatchReplay = () => {
    const recording = CodeRecorder.loadRecording(missionId);
    if (recording) {
      setReplayData(recording);
      setShowReplay(true);
    }
  };

  const handleCloseReplay = () => {
    setShowReplay(false);
    setReplayData(null);
  };

  if (loading) return <MissionDetailSkeleton />;

  if (!mission) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <h2>{t("missionDetail.notFound.title")}</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
          {t("missionDetail.notFound.body", { id: missionId })}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/missions")}
          style={{ marginTop: "1.5rem" }}
        >
          {t("missionDetail.notFound.back")}
        </button>
      </div>
    );
  }

  const sbState = statusBarState();
  const victoryRank = victoryData
    ? t(`ranks.${Math.min(Math.max(victoryData.newLevel - 1, 0), MAX_RANK_INDEX)}`)
    : "";

  if (showReplay) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <CodeReplayPlayer
          missionId={missionId}
          recording={replayData}
          onClose={handleCloseReplay}
        />
      </div>
    );
  }

  return (
    <MissionErrorBoundary>
      {/* Shortcut Indicator Legend Bar */}
      <div className="shortcut-legend-bar" style={{ display: 'flex', gap: '1rem', padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
        <span>Hotkeys: <kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '3px', color: '#fff' }}>Ctrl+Enter</kbd> Run Tests</span>
        {previousMissionItem && <span><kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '3px', color: '#fff' }}>P</kbd> Prev Mission</span>}
        {nextMissionItem && <span><kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '3px', color: '#fff' }}>N</kbd> Next Mission</span>}
      </div>

      {/* Tabs */}
      <div className="mobile-tabs" role="tablist" aria-label={t("missionDetail.tabs.ariaLabel")}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "story"}
          className={`tab-btn ${activeTab === "story" ? "active" : ""}`}
          onClick={() => setActiveTab("story")}
        >
          {t("missionDetail.tabs.story")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "editor"}
          className={`tab-btn ${activeTab === "editor" ? "active" : ""}`}
          onClick={() => setActiveTab("editor")}
        >
          {t("missionDetail.tabs.editor")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tests"}
          className={`tab-btn ${activeTab === "tests" ? "active" : ""}`}
          onClick={() => setActiveTab("tests")}
        >
          {t("missionDetail.tabs.tests")}
        </button>
        {(isCompleted || showVictory) && hasReplay && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "replay"}
            className={`tab-btn ${activeTab === "replay" ? "active" : ""}`}
            onClick={() => setActiveTab("replay")}
          >
            📹 {t("missionDetail.tabs.replay")}
          </button>
        )}
      </div>

      <div id="main-content" className={`mission-detail active-tab-${activeTab}`}>
        {/* ---------------- Story Panel ---------------- */}
        <div 
          className="mission-story" 
          role="region" 
          aria-label="Mission briefing and story description"
        >
          <div style={{ marginBottom: "var(--space-md)" }}>
            <span className={`badge badge-${mission.difficulty}`}>
              <span className="sr-only">{t("missionDetail.difficultyLabel")} </span>
              {t(`difficulty.${mission.difficulty}`)}
            </span>
            <span className="mission-card-xp" style={{ marginLeft: "0.5rem" }}>
              {t("missionMap.card.xp", { xp: mission.xpReward })}
            </span>
          </div>
          <ReactMarkdown>{mission.story}</ReactMarkdown>

          {hintIndex >= 0 && (
            <div
              role="alert"
              style={{
                marginTop: "var(--space-lg)",
                padding: "var(--space-md)",
                background: "var(--gold-dim)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <strong style={{ color: "var(--gold)" }}>
                {t("missionDetail.hint.label", { index: hintIndex + 1 })}
              </strong>
              <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "0.85rem" }}>
                {mission.hints[hintIndex]}
              </p>
            </div>
          )}
        </div>

        {/* ---------------- Editor Panel ---------------- */}
        <div 
          className="mission-editor-panel" 
          role="region" 
          aria-label="Code submission workspace"
        >
          <div className="mission-editor-toolbar">
            <div className="mission-editor-toolbar-left">
              <div className="editor-file-tab" aria-label="Active context tab file: lib.rs">
                <span className="dot" aria-hidden="true" /> lib.rs
              </div>
            </div>
            <div className="mission-editor-toolbar-right">
              <label className="editor-theme-select" aria-label={t("missionDetail.editor.themeLabel")}>
                <span className="editor-theme-select-label">{t("missionDetail.editor.themeLabel")}</span>
                <select
                  className="editor-theme-select-input"
                  value={editorTheme}
                  onChange={handleThemeChange}
                >
                  {EDITOR_THEMES.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                A
                <input
                  type="range"
                  min="10"
                  max="24"
                  step="1"
                  value={editorFontSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value, 10);
                    setEditorFontSize(size);
                    localStorage.setItem('soroban_quest_editor_font_size', String(size));
                  }}
                  style={{ width: '56px', accentColor: 'var(--cyan)' }}
                  aria-label="Editor font size"
                />
                A
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleReset}
                disabled={isRunning}
                aria-label="Reset working environment code to template state"
              >
                {t("missionDetail.editor.reset")}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleHint}
                disabled={!mission.hints || hintIndex >= mission.hints.length - 1}
                aria-label="Unlock contextual hint description asset"
              >
                {t("missionDetail.editor.hint")}
              </button>
              {(() => {
                const nextHintIdx = hintIndex + 1;
                const noMoreHints = !mission.hints || hintIndex >= mission.hints.length - 1;
                const nextAlreadyGold = (goldUnlockedHints[missionId] || []).includes(nextHintIdx);
                const canAfford = goldBalance >= HINT_GOLD_COST;
                const disabled = noMoreHints || (!nextAlreadyGold && !canAfford);
                return (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleGoldHint}
                    disabled={disabled}
                    title={
                      nextAlreadyGold
                        ? t("missionDetail.editor.goldHintUnlocked")
                        : canAfford
                          ? t("missionDetail.editor.goldHintTitle", { cost: HINT_GOLD_COST })
                          : t("missionDetail.editor.goldHintInsufficient", { cost: HINT_GOLD_COST })
                    }
                    aria-label="Spend gold to instantly reveal the next hint"
                  >
                    {nextAlreadyGold
                      ? t("missionDetail.editor.goldHintUnlocked")
                      : t("missionDetail.editor.goldHint", { cost: HINT_GOLD_COST })}
                  </button>
                );
              })()}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleShowSolution}
                aria-label="Overwrite active workspace with solution code blueprint"
              >
                {t("missionDetail.editor.solution")}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleCompileAndRun}
                disabled={isCompiling || isRunning}
                aria-label="Compile and run the contract in a sandboxed Soroban VM"
                title="Compile & Run"
              >
                {isCompiling ? t("missionDetail.editor.compiling") : t("missionDetail.editor.compile")}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleRunTests}
                disabled={isRunning}
              >
                {isRunning ? t("missionDetail.editor.running") : t("missionDetail.editor.run")}
              </button>
            </div>
          </div>

          <div className="editor-wrapper" aria-label="Monaco code compilation editor interface">
            <Editor
              height="100%"
              defaultLanguage="rust"
              value={code}
              onChange={(v) => setCode(v || "")}
              theme={editorTheme}
              onMount={handleEditorMount}
              options={{
                fontSize: editorFontSize,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
                lineNumbers: "on",
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                wordWrap: "on",
                tabSize: 4,
                suggestOnTriggerCharacters: true,
                glyphMargin: true,
              }}
            />
          </div>

          {/* Live Validation Status Bar */}
          {liveTotalCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 14px",
                background: "rgba(0,0,0,0.35)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: "11.5px",
                fontFamily: "'JetBrains Mono', monospace",
                userSelect: "none",
              }}
              role="status"
              aria-label="Live typing test checker tracker status panel"
            >
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  maxWidth: "120px",
                }}
                aria-hidden="true"
              >
                <div
                  style={{
                    height: "100%",
                    width: `${sbState.pct}%`,
                    background: sbState.background,
                    borderRadius: "2px",
                    transition: "width 0.3s ease, background 0.3s ease",
                  }}
                />
              </div>
              <span style={{ color: sbState.color, transition: "color 0.3s" }}>
                {sbState.label}
              </span>
              <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }} aria-hidden="true">
                |
              </span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10.5px" }}>
                {t("missionDetail.status.note")}
              </span>
            </div>
          )}
          <SecurityNotes notes={securityNotes} t={t} />
        </div>

        {/* ---------------- Terminal Panel ---------------- */}
        <div 
          className="mission-terminal-panel" 
          role="region" 
          aria-label="Validation execution test terminal log terminal"
        >
          <div className="terminal" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div className="terminal-header">
              <span className="terminal-dot red" aria-hidden="true" />
              <span className="terminal-dot yellow" aria-hidden="true" />
              <span className="terminal-dot green" aria-hidden="true" />
              <span className="terminal-title">{t("missionDetail.terminal.title")}</span>
            </div>
            <div className="terminal-body" ref={terminalBodyRef} style={{ flex: 1 }}>
              {testResults.length === 0 ? (
                <span className="terminal-line info" style={{ color: "var(--text-muted)" }}>
                  {t("missionDetail.terminal.placeholder")}
                </span>
              ) : (
                testResults.map((r, i) => (
                  <span
                    key={i}
                    className={`terminal-line ${
                      r.passed === true ? "pass" : r.passed === false ? "fail" : "info"
                    }`}
                  >
                    {r.message}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ---------------- Replay Panel ---------------- */}
        {(isCompleted || showVictory) && hasReplay && (
          <div 
            className="mission-replay-panel" 
            style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-subtle)'
            }} 
            role="region" 
            aria-label="Problem solving archive replay tools"
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
              📹 {t("missionDetail.replay.header")}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {t("missionDetail.replay.body")}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleWatchReplay}
              style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
            >
              ▶️ {t("missionDetail.replay.start")}
            </button>
          </div>
        )}
      </div>

      {/* Victory Modal */}
      {showVictory && victoryData && (
        <div className="modal-overlay" onClick={() => setShowVictory(false)}>
          <Confetti />
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            ref={victoryModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="victory-modal-heading"
          >
            <div className="modal-icon" role="img" aria-label={t("missionDetail.victory.iconLabel")}>🏆</div>
            <h2 id="victory-modal-heading" className="modal-title">{t("missionDetail.victory.title")}</h2>
            <p className="modal-message">
              {t("missionDetail.victory.youCompleted")} <strong>{mission.title}</strong>
            </p>
            <div className="modal-xp" style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center" }}>
              <span style={{ color: "var(--cyan)", fontSize: "1.5rem", fontWeight: 700, textShadow: "0 0 20px rgba(6, 214, 160, 0.5)" }}>
                +{victoryData.xp} XP
              </span>
              <span style={{ color: "var(--gold)", fontSize: "1.5rem", fontWeight: 700, textShadow: "0 0 20px rgba(245, 158, 11, 0.5)" }}>
                +{Math.floor(victoryData.xp * 0.5)} Gold
              </span>
            </div>

            {victoryData.leveledUp && (
              <p style={{ color: "var(--purple)", fontFamily: "var(--font-display)", marginBottom: "1rem" }}>
                {t("missionDetail.victory.levelUp", {
                  level: victoryData.newLevel,
                  rank: victoryRank,
                })}
              </p>
            )}

            {victoryData.newBadges?.length > 0 && (
              <p style={{ color: "var(--gold)", marginBottom: "1rem" }}>
                🏅 {victoryData.newBadges.length > 1
                  ? t("missionDetail.victory.badgeEarnedMany")
                  : t("missionDetail.victory.badgeEarnedOne")}
              </p>
            )}

            {/* Victory CodeReplay Integration Trigger Trigger Button */}
            {hasReplay && (
              <div style={{ marginBottom: "1.25rem" }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowVictory(false);
                    handleWatchReplay();
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  📹 {t("missionDetail.victory.watchReplay") || "Watch Session Replay"}
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={handleNextMission}>
                {t("missionDetail.victory.next")}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/missions")}>
                {t("missionDetail.victory.map")}
              </button>
            </div>

            {/* Okashi Section */}
            <div
              style={{
                marginTop: "1.25rem",
                padding: "1.25rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <button type="button" onClick={() => openInOkashi(code)} className="okashi-btn">
                {t("missionDetail.okashi.button")}
              </button>

              <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", maxWidth: "300px", margin: 0, lineHeight: "1.5" }}>
                {t("missionDetail.okashi.help")}
              </p>

              {toast?.state !== TOAST_STATES.IDLE && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "500",
                    background: toast.state === TOAST_STATES.SUCCESS ? "#064e3b" : "#4c0519",
                    color: toast.state === TOAST_STATES.SUCCESS ? "#6ee7b7" : "#fda4af",
                    border: toast.state === TOAST_STATES.SUCCESS ? "1px solid #065f46" : "1px solid #881337",
                    maxWidth: "340px",
                    textAlign: "center",
                    lineHeight: "1.5",
                  }}
                >
                  {toast.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MissionErrorBoundary>
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
