// MissionDetail.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { getMissionById, getNextMission } from "../systems/missionLoader";
import { runTests } from "../systems/testRunner";
import { loadProgress, saveProgress } from "../systems/storage";
import {
  completeMission,
  recordAttempt,
  getRankTitle,
} from "../systems/gameEngine";
import MissionDetailSkeleton from "../components/MissionDetailSkeleton";
import { useokashi, TOAST_STATES } from "../systems/useokashi";
import CodeRecorder from "../systems/codeRecorder";
import CodeReplayPlayer from "../components/CodeReplayPlayer";
import SimulatorPanel from "../components/SimulatorPanel";

export default function MissionDetail() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const mission = getMissionById(missionId);

  // --------------------------- States ---------------------------
  const [loading, setLoading] = useState(true); // Show skeleton while mission loads
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryData, setVictoryData] = useState(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [showReplay, setShowReplay] = useState(false);
  const [replayData, setReplayData] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);

  const terminalBodyRef = useRef(null);
  const recorderRef = useRef(null);
  const { openInOkashi, toast } = useokashi();

  // --------------------------- Load Mission ---------------------------
  useEffect(() => {
    setLoading(true);
    if (mission) {
      // Brief delay to display skeleton
      setTimeout(() => {
        setCode(mission.template);
        setTestResults([]);
        setHintIndex(-1);
        setShowVictory(false);
        setLoading(false);
        
        // Initialize recorder
        recorderRef.current = new CodeRecorder(missionId);
        recorderRef.current.startRecording(mission.template);
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

  // --------------------------- Code Change Recording ---------------------------
  useEffect(() => {
    if (recorderRef.current) {
      recorderRef.current.recordCodeEdit(code);
    }
  }, [code]);

  // --------------------------- Cleanup Recording on Unmount ---------------------------
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.stopRecording();
      }
    };
  }, []);

  // --------------------------- Run Tests ---------------------------
  const handleRunTests = useCallback(async () => {
    if (isRunning || !mission) return;
    setIsRunning(true);
    setTestResults([]);

    // Record run tests event
    if (recorderRef.current) {
      recorderRef.current.recordRunTests();
    }

    // Record user attempt
    let state = loadProgress();
    state = recordAttempt(state, missionId);
    saveProgress(state);

    // Collect and display test results progressively
    const resultCollector = [];
    const addResult = (result) => {
      resultCollector.push(result);
      setTestResults([...resultCollector]);
    };

    // Initial info message
    addResult({ phase: "info", message: "🔍 Running validation checks..." });
    await delay(400);

    // Run mission tests
    const result = await runTests(code, mission);
    for (const r of result.results) {
      addResult(r);
      await delay(250);
    }

    await delay(300);
    addResult({ phase: "summary", message: result.summary });

    // Handle victory if all tests pass
    if (result.allPassed) {
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
    }

    setIsRunning(false);
  }, [code, mission, missionId, isRunning]);

  // --------------------------- Hints ---------------------------
  const handleHint = () => {
    if (mission && hintIndex < mission.hints.length - 1) {
      const newHintIndex = hintIndex + 1;
      setHintIndex(newHintIndex);
      
      // Record hint event
      if (recorderRef.current) {
        recorderRef.current.recordHint(newHintIndex);
      }
    }
  };

  // --------------------------- Reset ---------------------------
  const handleReset = () => {
    if (mission) {
      setCode(mission.template);
      setTestResults([]);
      setHintIndex(-1);
      
      // Record reset event
      if (recorderRef.current) {
        recorderRef.current.recordReset();
      }
    }
  };

  // --------------------------- Show Solution ---------------------------
  const handleShowSolution = () => {
    if (mission?.solution) {
      setCode(mission.solution);
    }
  };

  // --------------------------- Navigate to Next Mission ---------------------------
  const handleNextMission = () => {
    const next = getNextMission(missionId);
    if (next) navigate(`/mission/${next.id}`);
    else navigate("/missions");
  };

  // --------------------------- Replay Functions ---------------------------
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

  // --------------------------- Simulator Functions ---------------------------
  const handleOpenSimulator = () => {
    setShowSimulator(true);
  };

  const handleCloseSimulator = () => {
    setShowSimulator(false);
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

  // Check if mission is completed and has replay
  const progress = loadProgress();
  const isCompleted = progress.completedMissions.includes(missionId);
  const hasReplay = CodeRecorder.hasRecording(missionId);

  // --------------------------- Render Mission Detail ---------------------------
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

  if (showSimulator) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <SimulatorPanel
          code={code}
          onClose={handleCloseSimulator}
        />
      </div>
    );
  }

  return (
    <>
      {/* Tabs for mobile */}
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

          {/* Hints */}
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
                {isRunning ? (
                  <>
                    <span
                      className="spinner"
                      style={{ width: 14, height: 14 }}
                    />{" "}
                    Running...
                  </>
                ) : (
                  "▶ Run Tests"
                )}
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
              }}
            />
          </div>

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
                      className={`terminal-line ${r.passed === true ? "pass" : r.passed === false ? "fail" : "info"}`}
                      style={{ animationDelay: `${i * 0.05}s` }}
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
                🏅 New badge{victoryData.newBadges.length > 1 ? "s" : ""}{" "}
                earned!
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
              <button
                onClick={() => openInOkashi(code)}
                style={{
                  padding: "10px 22px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
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

              {toast.state !== TOAST_STATES.IDLE && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "500",
                    background:
                      toast.state === TOAST_STATES.SUCCESS
                        ? "#064e3b"
                        : "#4c0519",
                    color:
                      toast.state === TOAST_STATES.SUCCESS
                        ? "#6ee7b7"
                        : "#fda4af",
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
    </>
  );
}

// --------------------------- Helper: Delay ---------------------------
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
