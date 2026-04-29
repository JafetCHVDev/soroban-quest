import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { getMissionById, getNextMission } from "../systems/missionLoader";
import { runTests } from "../systems/testRunner";
import { loadProgress, saveProgress } from "../systems/storage";
import { completeMission, recordAttempt, getRankTitle } from "../systems/gameEngine";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";
import MissionDetailSkeleton from "../components/MissionDetailSkeleton";
import { useokashi, TOAST_STATES } from "../systems/useokashi";
import { createDebouncedValidator } from "../systems/liveValidator";
import { useToast } from "../systems/ToastContext";
import { MissionErrorBoundary } from "../components/ErrorBoundary";

// ─── Monaco marker model name (must be consistent across calls) ──────────────
const LIVE_MARKER_OWNER = "soroban-quest-live";

export default function MissionDetail() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const mission = getMissionById(missionId);

  // Safe fallback in case ToastContext is not provided
  const toastContext = useToast();
  const showToast = toastContext?.showToast;

  // --------------------------- States ---------------------------
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryData, setVictoryData] = useState(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [showReplay, setShowReplay] = useState(false);
  const [replayData, setReplayData] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);

  // Live validation state
  const [livePassCount, setLivePassCount] = useState(0);
  const [liveTotalCount, setLiveTotalCount] = useState(0);

  const terminalBodyRef = useRef(null);
  const editorRef = useRef(null);       // Monaco editor instance
  const monacoRef = useRef(null);       // Monaco global (for setModelMarkers)
  const validatorRef = useRef(null);    // Debounced validator handle

  const { openInOkashi, toast } = useokashi();

  // --------------------------- Load Mission ---------------------------
  useEffect(() => {
    setLoading(true);
    if (mission) {
      setTimeout(() => {
        setCode(mission.template || "");
        setTestResults([]);
        setHintIndex(-1);
        setShowVictory(false);
        setLivePassCount(0);
        setLiveTotalCount(0);
        setLoading(false);
        logActivity(ACTIVITY_TYPES.MISSION_STARTED, { missionId, title: mission.title }, `Started mission: ${mission.title}`);
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [missionId, mission]);

  // --------------------------- Auto-scroll terminal ---------------------------
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [testResults]);

  // ─── Set up debounced validator once ────────────────────────────────────────
  useEffect(() => {
    const validator = createDebouncedValidator(500, (result) => {
      setLivePassCount(result.passCount);
      setLiveTotalCount(result.totalCount);
      applyMonacoMarkers(result.markers);
    });
    validatorRef.current = validator;

    return () => {
      validator.cancel();
      clearMonacoMarkers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Re-run live validation when code or mission changes ────────────────────
  useEffect(() => {
    if (!mission || loading) return;
    validatorRef.current?.call(code, mission);
  }, [code, mission, loading]);

  // ─── Monaco helpers ─────────────────────────────────────────────────────────
  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
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

  // ─── Status bar helpers ──────────────────────────────────────────────────────
  function statusBarState() {
    if (liveTotalCount === 0) {
      return {
        label: "Checking…",
        color: "var(--text-muted)",
        barColor: "rgba(255,255,255,0.08)",
        pct: 0,
      };
    }
    const pct = Math.round((livePassCount / liveTotalCount) * 100);
    if (livePassCount === liveTotalCount) {
      return {
        label: `${livePassCount}/${liveTotalCount} checks passing ✓`,
        color: "#34d399",
        barColor: "#059669",
        pct,
      };
    }
    if (livePassCount === 0) {
      return {
        label: `${livePassCount}/${liveTotalCount} checks passing`,
        color: "#f87171",
        barColor: "#dc2626",
        pct,
      };
    }
    return {
      label: `${livePassCount}/${liveTotalCount} checks passing`,
      color: "#fbbf24",
      barColor: "#d97706",
      pct,
    };
  }

  // --------------------------- Run Tests ---------------------------
  const handleRunTests = useCallback(async () => {
    if (isRunning || !mission) return;
    setIsRunning(true);
    setTestResults([]);

    let state = loadProgress();
    state = recordAttempt(state, missionId);
    saveProgress(state);

    const resultCollector = [];
    const addResult = (result) => {
      resultCollector.push(result);
      setTestResults([...resultCollector]);
    };

    addResult({ phase: "info", message: "🔍 Running validation checks..." });
    await delay(400);

    const result = await runTests(code, mission);
    for (const r of result.results) {
      addResult(r);
      await delay(250);
    }

    await delay(300);
    addResult({ phase: "summary", message: result.summary });

    if (result.allPassed) {
      if (showToast) showToast("Mission Parameters Validated!", "success");
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
          message: "🏅 Already completed — no additional XP awarded.",
        });
      }
    } else {
      if (showToast) showToast("Validation failed. Check terminal.", "error");
    }

    setIsRunning(false);
  }, [code, mission, missionId, isRunning, showToast]);

  // --------------------------- Hints ---------------------------
  const handleHint = () => {
    if (mission?.hints && hintIndex < mission.hints.length - 1) {
      const nextIndex = hintIndex + 1;
      setHintIndex(nextIndex);
      if (showToast) showToast(`Hint ${nextIndex + 1} unlocked`, "info");
      logActivity(ACTIVITY_TYPES.HINT_USED, { missionId, hintIndex: nextIndex }, `Used hint ${nextIndex + 1} for ${mission.title}`);
    }
  };

  // --------------------------- Reset ---------------------------
  const handleReset = () => {
    if (mission?.template) {
      setCode(mission.template);
      setTestResults([]);
      setHintIndex(-1);
      if (showToast) showToast("Code reset to template", "warning");
    }
  };

  // --------------------------- Show Solution ---------------------------
  const handleShowSolution = () => {
    if (mission?.solution) {
      setCode(mission.solution);
      if (showToast) showToast("Solution loaded into editor", "info");
    }
  };

  // --------------------------- Navigate to Next Mission ---------------------------
  const handleNextMission = () => {
    const next = getNextMission(missionId);
    if (next) navigate(`/mission/${next.id}`);
    else navigate("/missions");
  };

  // --------------------------- Loading Skeleton ---------------------------
  if (loading) return <MissionDetailSkeleton />;

  // --------------------------- Mission Not Found ---------------------------
  if (!mission) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <h2>Mission Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
          The mission "{missionId}" doesn't exist.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/missions")}
          style={{ marginTop: "1.5rem" }}
        >
          ← Back to Mission Map
        </button>
      </div>
    );
  }

  const sbState = statusBarState();

  // --------------------------- Render Mission Detail ---------------------------
  return (
    <MissionErrorBoundary>
      <input
        type="radio"
        name="mission-tab"
        id="tab-story"
        className="tab-radio"
        defaultChecked
      />
      <input
        type="radio"
        name="mission-tab"
        id="tab-editor"
        className="tab-radio"
      />
      <input
        type="radio"
        name="mission-tab"
        id="tab-tests"
        className="tab-radio"
      />
      {isCompleted && hasReplay && (
        <input
          type="radio"
          name="mission-tab"
          id="tab-replay"
          className="tab-radio"
        />
      )}

      <div className="mobile-tabs">
        <label htmlFor="tab-story">Story</label>
        <label htmlFor="tab-editor">Editor</label>
        <label htmlFor="tab-tests">Tests</label>
        {isCompleted && hasReplay && (
          <label htmlFor="tab-replay">📹 Replay</label>
        )}
      </div>

      <div className="mission-detail">
        {/* ---------------- Story Panel ---------------- */}
        <div className="mission-story">
          <div style={{ marginBottom: "var(--space-md)" }}>
            <span className={`badge badge-${mission.difficulty}`}>
              {mission.difficulty}
            </span>
            <span className="mission-card-xp" style={{ marginLeft: "0.5rem" }}>
              ⚡ {mission.xpReward} XP
            </span>
          </div>
          <ReactMarkdown>{mission.story}</ReactMarkdown>

          {hintIndex >= 0 && (
            <div
              style={{
                marginTop: "var(--space-lg)",
                padding: "var(--space-md)",
                background: "var(--gold-dim)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <strong style={{ color: "var(--gold)" }}>
                💡 Hint {hintIndex + 1}:
              </strong>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginTop: "4px",
                  fontSize: "0.85rem",
                }}
              >
                {mission.hints[hintIndex]}
              </p>
            </div>
          )}
        </div>

        {/* ---------------- Editor Panel ---------------- */}
        <div className="mission-editor-panel">
          <div className="mission-editor-toolbar">
            <div className="mission-editor-toolbar-left">
              <div className="editor-file-tab">
                <span className="dot" /> lib.rs
              </div>
            </div>
            <div className="mission-editor-toolbar-right">
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleReset}
                disabled={isRunning}
              >
                ↺ Reset
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleHint}
                disabled={
                  !mission.hints || hintIndex >= mission.hints.length - 1
                }
              >
                💡 Hint
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleShowSolution}
              >
                👁️ Solution
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleOpenSimulator}
                style={{ background: 'var(--purple-dim)', border: '1px solid var(--purple)' }}
              >
                🔬 Simulate
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRunTests}
                disabled={isRunning}
              >
                {isRunning ? "Running..." : "▶ Run Tests"}
              </button>
            </div>
          </div>

          <div className="editor-wrapper">
            <Editor
              height="100%"
              defaultLanguage="rust"
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
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

          {/* ── Live Validation Status Bar ─────────────────────────────────── */}
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
            >
              <div
                style={{
                  flex: 1,
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  maxWidth: "120px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${sbState.pct}%`,
                    background: sbState.barColor,
                    borderRadius: "2px",
                    transition: "width 0.3s ease, background 0.3s ease",
                  }}
                />
              </div>
              <span style={{ color: sbState.color, transition: "color 0.3s" }}>
                {sbState.label}
              </span>
              <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>
                |
              </span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10.5px" }}>
                live checks · full suite on Run Tests
              </span>
            </div>
          )}

          {/* ---------------- Terminal Panel ---------------- */}
          <div className="mission-terminal-panel">
            <div
              className="terminal"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="terminal-header">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">Test Output</span>
              </div>
              <div
                className="terminal-body"
                ref={terminalBodyRef}
                style={{ flex: 1 }}
              >
                {testResults.length === 0 ? (
                  <span
                    className="terminal-line info"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Click "Run Tests" to validate your code...
                  </span>
                ) : (
                  testResults.map((r, i) => (
                    <span
                      key={i}
                      className={`terminal-line ${
                        r.passed === true
                          ? "pass"
                          : r.passed === false
                          ? "fail"
                          : "info"
                      }`}
                    >
                      {r.message}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Replay Panel ---------------- */}
        {isCompleted && hasReplay && (
          <div className="mission-replay-panel" style={{
            display: 'none',
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
              📹 Watch Your Solution
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Review your problem-solving process step by step.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleWatchReplay}
              style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
            >
              ▶️ Start Replay
            </button>
          </div>
        )}
      </div>

      {/* ---------------- Victory Modal ---------------- */}
      {showVictory && victoryData && (
        <div className="modal-overlay" onClick={() => setShowVictory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🏆</div>
            <h2 className="modal-title">Mission Complete!</h2>
            <p className="modal-message">
              You've completed <strong>{mission.title}</strong>
            </p>
            <div className="modal-xp">+{victoryData.xp} XP</div>

            {victoryData.leveledUp && (
              <p
                style={{
                  color: "var(--purple)",
                  fontFamily: "var(--font-display)",
                  marginBottom: "1rem",
                }}
              >
                🎉 Level Up! You are now Level {victoryData.newLevel} —{" "}
                {getRankTitle(victoryData.newLevel)}
              </p>
            )}

            {victoryData.newBadges?.length > 0 && (
              <p style={{ color: "var(--gold)", marginBottom: "1rem" }}>
                🏅 New badge{victoryData.newBadges.length > 1 ? "s" : ""} earned!
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <button className="btn btn-primary" onClick={handleNextMission}>
                Next Mission →
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/missions")}
              >
                Mission Map
              </button>
            </div>

            {/* Okashi Button & Toast */}
            <div
              style={{
                marginTop: "1.25rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <button onClick={() => openInOkashi(code)} className="okashi-btn">
                🚀 Try on Okashi — Compile & Deploy
              </button>

              <p
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  textAlign: "center",
                  maxWidth: "300px",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                Opens okashi.dev in a new tab. Your code is copied to clipboard
                — paste it there to compile with the real Soroban compiler and
                deploy to Testnet.
              </p>

              {toast?.state !== TOAST_STATES.IDLE && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "500",
                    background:
                      toast.state === TOAST_STATES.SUCCESS ? "#064e3b" : "#4c0519",
                    color:
                      toast.state === TOAST_STATES.SUCCESS ? "#6ee7b7" : "#fda4af",
                    border:
                      toast.state === TOAST_STATES.SUCCESS
                        ? "1px solid #065f46"
                        : "1px solid #881337",
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