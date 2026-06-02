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
import CodeReplayPlayer from "../components/CodeReplayPlayer";
import CodeRecorder from "../systems/codeRecorder";
import useDocumentTitle from '../systems/useDocumentTitle';

const LIVE_MARKER_OWNER = "soroban-quest-live";

export default function MissionDetail() {
  useDocumentTitle('Mission Detail');
  const { missionId } = useParams();
  const navigate = useNavigate();
  const mission = getMissionById(missionId);

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

  const [livePassCount, setLivePassCount] = useState(0);
  const [liveTotalCount, setLiveTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState("story"); // Handles clean custom tab interaction states safely

  const terminalBodyRef = useRef(null);
  const editorRef = useRef(null);      
  const monacoRef = useRef(null);      
  const validatorRef = useRef(null);    
  const victoryModalRef = useRef(null);

  const { openInOkashi, toast } = useokashi();

  const progressState = loadProgress();
  const isCompleted = progressState.completedMissions.includes(missionId);
  const hasReplay = CodeRecorder.hasRecording(missionId);

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
        setActiveTab("story");
        setLoading(false);
        logActivity(ACTIVITY_TYPES.MISSION_STARTED, { missionId, title: mission.title }, `Started mission: ${mission.title}`);
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
      applyMonacoMarkers(result.markers);
    });
    validatorRef.current = validator;

    return () => {
      validator.cancel();
      clearMonacoMarkers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus Trapping for the Victory Modal attached directly to Local Element Context instead of Window
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

  function statusBarState() {
    if (liveTotalCount === 0) {
      return {
        label: "Checking…",
        color: "var(--text-muted)",
        background: "rgba(255,255,255,0.08)",
        pct: 0,
      };
    }
    const pct = Math.round((livePassCount / liveTotalCount) * 100);
    if (livePassCount === liveTotalCount) {
      return {
        label: `${livePassCount}/${liveTotalCount} checks passing ✓`,
        color: "#34d399",
        background: "#059669",
        pct,
      };
    }
    if (livePassCount === 0) {
      return {
        label: `${livePassCount}/${liveTotalCount} checks passing`,
        color: "#f87171",
        background: "#dc2626",
        pct,
      };
    }
    return {
      label: `${livePassCount}/${liveTotalCount} checks passing`,
      color: "#fbbf24",
      background: "#d97706",
      pct,
    };
  }

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

  const handleHint = () => {
    if (mission?.hints && hintIndex < mission.hints.length - 1) {
      const nextIndex = hintIndex + 1;
      setHintIndex(nextIndex);
      if (showToast) showToast(`Hint ${nextIndex + 1} unlocked`, "info");
      logActivity(ACTIVITY_TYPES.HINT_USED, { missionId, hintIndex: nextIndex }, `Used hint ${nextIndex + 1} for ${mission.title}`);
    }
  };

  const handleReset = () => {
    if (mission?.template) {
      setCode(mission.template);
      setTestResults([]);
      setHintIndex(-1);
      if (showToast) showToast("Code reset to template", "warning");
    }
  };

  const handleShowSolution = () => {
    if (mission?.solution) {
      setCode(mission.solution);
      if (showToast) showToast("Solution loaded into editor", "info");
    }
  };

  const handleNextMission = () => {
    const next = getNextMission(missionId);
    if (next) navigate(`/mission/${next.id}`);
    else navigate("/missions");
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
        <h2>Mission Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
          The mission "{missionId}" doesn't exist.
        </p>
        <button
          type="button"
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
      {/* Structural view state panel mapping switches via semantic button actions */}
      <div className="mobile-tabs" role="tablist" aria-label="Mission options">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "story"}
          className={`tab-btn ${activeTab === "story" ? "active" : ""}`}
          onClick={() => setActiveTab("story")}
        >
          Story
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "editor"}
          className={`tab-btn ${activeTab === "editor" ? "active" : ""}`}
          onClick={() => setActiveTab("editor")}
        >
          Editor
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tests"}
          className={`tab-btn ${activeTab === "tests" ? "active" : ""}`}
          onClick={() => setActiveTab("tests")}
        >
          Tests
        </button>
        {isCompleted && hasReplay && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "replay"}
            className={`tab-btn ${activeTab === "replay" ? "active" : ""}`}
            onClick={() => setActiveTab("replay")}
          >
            📹 Replay
          </button>
        )}
      </div>

      <div id="main-content" className={`mission-detail active-tab-${activeTab}`}>
        {/* ---------------- Story Panel ---------------- */}
        <div 
          className="mission-story" 
          role="region" 
          aria-label="Mission briefing and story description"
          style={{ display: activeTab === "story" ? "block" : "none" }}
        >
          <div style={{ marginBottom: "var(--space-md)" }}>
            <span className={`badge badge-${mission.difficulty}`}>
              <span className="sr-only">Difficulty: </span>{mission.difficulty}
            </span>
            <span className="mission-card-xp" style={{ marginLeft: "0.5rem" }}>
              ⚡ {mission.xpReward} XP
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
        <div 
          className="mission-editor-panel" 
          role="region" 
          aria-label="Code submission workspace"
          style={{ display: activeTab === "editor" ? "flex" : "none" }}
        >
          <div className="mission-editor-toolbar">
            <div className="mission-editor-toolbar-left">
              <div className="editor-file-tab" aria-label="Active context tab file: lib.rs">
                <span className="dot" aria-hidden="true" /> lib.rs
              </div>
            </div>
            <div className="mission-editor-toolbar-right">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleReset}
                disabled={isRunning}
                aria-label="Reset working environment code to template state"
              >
                ↺ Reset
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleHint}
                disabled={
                  !mission.hints || hintIndex >= mission.hints.length - 1
                }
                aria-label="Unlock contextual hint description asset"
              >
                💡 Hint
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleShowSolution}
                aria-label="Overwrite active workspace with solution code blueprint"
              >
                👁️ Solution
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleRunTests}
                disabled={isRunning}
              >
                {isRunning ? "Running..." : "▶ Run Tests"}
              </button>
            </div>
          </div>

          <div className="editor-wrapper" aria-label="Monaco code compilation editor interface">
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
                live checks · full suite on Run Tests
              </span>
            </div>
          )}
        </div>

        {/* ---------------- Terminal Panel ---------------- */}
        <div 
          className="mission-terminal-panel" 
          role="region" 
          aria-label="Validation execution test terminal log terminal"
          style={{ display: activeTab === "tests" ? "block" : "none" }}
        >
          <div
            className="terminal"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="terminal-header">
              <span className="terminal-dot red" aria-hidden="true" />
              <span className="terminal-dot yellow" aria-hidden="true" />
              <span className="terminal-dot green" aria-hidden="true" />
              <span className="terminal-title">Test Output Log</span>
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

        {/* ---------------- Replay Panel ---------------- */}
        {isCompleted && hasReplay && (
          <div 
            className="mission-replay-panel" 
            style={{
              display: activeTab === "replay" ? "block" : "none",
              padding: '2rem',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-subtle)'
            }} 
            role="region" 
            aria-label="Problem solving archive replay tools"
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
              📹 Watch Your Solution Archive
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Review your problem-solving process step by step.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleWatchReplay}
              style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
            >
              ▶️ Start Replay Simulation
            </button>
          </div>
        )}
      </div>

      {/* Victory Modal */}
      {showVictory && victoryData && (
        <div className="modal-overlay" onClick={() => setShowVictory(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            ref={victoryModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="victory-modal-heading"
          >
            <div className="modal-icon" role="img" aria-label="Victory reward gold crown trophy">🏆</div>
            <h2 id="victory-modal-heading" className="modal-title">Mission Complete!</h2>
            <p className="modal-message">
              You&apos;ve successfully completed <strong>{mission.title}</strong>
            </p>
            <div className="modal-xp">+{victoryData.xp} XP gathered</div>

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
                🏅 New badge achievement unlocked! Check profile center logs.
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <button type="button" className="btn btn-primary" onClick={handleNextMission}>
                Next Mission Objective →
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/missions")}
              >
                Return to Mission Map
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