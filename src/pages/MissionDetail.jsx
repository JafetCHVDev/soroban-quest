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
import { useokashi } from "../systems/useokashi";

// 1. Import the toast hook
import { useToast } from "../systems/ToastContext";

// Import the specialized boundaries
import {
  EditorErrorBoundary,
  MissionErrorBoundary,
} from "../components/ErrorBoundary";

export default function MissionDetail() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const mission = getMissionById(missionId);

  // Initialize toast with a fallback to avoid crashes if context is missing
  const toastContext = useToast();
  const showToast = toastContext?.showToast;

  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryData, setVictoryData] = useState(null);
  const [hintIndex, setHintIndex] = useState(-1);

  const terminalBodyRef = useRef(null);
  const { openInOkashi } = useokashi();

  useEffect(() => {
    setLoading(true);
    if (mission) {
      setTimeout(() => {
        setCode(mission.template || "");
        setTestResults([]);
        setHintIndex(-1);
        setShowVictory(false);
        setLoading(false);
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [missionId, mission]);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [testResults]);

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

  if (loading) return <MissionDetailSkeleton />;

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

      <div className="mobile-tabs">
        <label htmlFor="tab-story">Story</label>
        <label htmlFor="tab-editor">Editor</label>
        <label htmlFor="tab-tests">Tests</label>
      </div>

      <div className="mission-detail">
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
                className="btn btn-primary btn-sm"
                onClick={handleRunTests}
                disabled={isRunning}
              >
                {isRunning ? "Running..." : "▶ Run Tests"}
              </button>
            </div>
          </div>

          <div className="editor-wrapper">
            <EditorErrorBoundary>
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
                  automaticLayout: true,
                }}
              />
            </EditorErrorBoundary>
          </div>

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
                    >
                      {r.message}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVictory && victoryData && (
        <div className="modal-overlay" onClick={() => setShowVictory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🏆</div>
            <h2 className="modal-title">Mission Complete!</h2>
            <p className="modal-message">
              You've completed <strong>{mission.title}</strong>
            </p>
            <div className="modal-xp">+{victoryData.xp} XP</div>
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
                🚀 Try on Okashi
              </button>
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
