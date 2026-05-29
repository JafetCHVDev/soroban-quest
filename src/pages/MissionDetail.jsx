import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { getMissionById, getNextMission } from "../systems/missionLoader";
import { runTests } from "../systems/testRunner";
import { loadProgress, saveProgress } from "../systems/storage";
import { completeMission, recordAttempt } from "../systems/gameEngine";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";
import MissionDetailSkeleton from "../components/MissionDetailSkeleton";
import { useokashi, TOAST_STATES } from "../systems/useokashi";
import { createDebouncedValidator } from "../systems/liveValidator";
import { useToast } from "../systems/ToastContext";
import { MissionErrorBoundary } from "../components/ErrorBoundary";
import CodeReplayPlayer from "../components/CodeReplayPlayer";
import CodeRecorder from "../systems/codeRecorder";
import { useTranslation } from "../i18n/useTranslation";

// ─── Monaco marker model name (must be consistent across calls) ──────────────
const LIVE_MARKER_OWNER = "soroban-quest-live";
const MAX_RANK_INDEX = 10;

export default function MissionDetail() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const mission = getMissionById(missionId, language);

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

  // Live validation state
  const [livePassCount, setLivePassCount] = useState(0);
  const [liveTotalCount, setLiveTotalCount] = useState(0);

  const terminalBodyRef = useRef(null);
  const editorRef = useRef(null);       // Monaco editor instance
  const monacoRef = useRef(null);       // Monaco global (for setModelMarkers)
  const validatorRef = useRef(null);    // Debounced validator handle

  const { openInOkashi, toast } = useokashi();

  // Compute replay & completion state
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
        setLoading(false);
        // Keep stored message in English for log durability; Journal will
        // re-compose the displayed string via t() at render time using `data`.
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
        label: t("missionDetail.status.checking"),
        color: "var(--text-muted)",
        barColor: "rgba(255,255,255,0.08)",
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
        barColor: "#059669",
        pct,
      };
    }
    return {
      label: t("missionDetail.status.passing", {
        passed: livePassCount,
        total: liveTotalCount,
      }),
      color: livePassCount === 0 ? "#f87171" : "#fbbf24",
      barColor: livePassCount === 0 ? "#dc2626" : "#d97706",
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

  // --------------------------- Hints ---------------------------
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

  // --------------------------- Reset ---------------------------
  const handleReset = () => {
    if (mission?.template) {
      setCode(mission.template);
      setTestResults([]);
      setHintIndex(-1);
      if (showToast) showToast(t("missionDetail.toasts.codeReset"), "warning");
    }
  };

  // --------------------------- Show Solution ---------------------------
  const handleShowSolution = () => {
    if (mission?.solution) {
      setCode(mission.solution);
      if (showToast) showToast(t("missionDetail.toasts.solutionLoaded"), "info");
    }
  };

  // --------------------------- Navigate to Next Mission ---------------------------
  const handleNextMission = () => {
    const next = getNextMission(missionId, language);
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

  // --------------------------- Loading Skeleton ---------------------------
  if (loading) return <MissionDetailSkeleton />;

  // --------------------------- Mission Not Found ---------------------------
  if (!mission) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <h2>{t("missionDetail.notFound.title")}</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
          {t("missionDetail.notFound.body", { id: missionId })}
        </p>
        <button
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
        <label htmlFor="tab-story">{t("missionDetail.tabs.story")}</label>
        <label htmlFor="tab-editor">{t("missionDetail.tabs.editor")}</label>
        <label htmlFor="tab-tests">{t("missionDetail.tabs.tests")}</label>
        {isCompleted && hasReplay && (
          <label htmlFor="tab-replay">{t("missionDetail.tabs.replay")}</label>
        )}
      </div>

      <div className="mission-detail">
        {/* ---------------- Story Panel ---------------- */}
        <div className="mission-story">
          <div style={{ marginBottom: "var(--space-md)" }}>
            <span className={`badge badge-${mission.difficulty}`}>
              {t(`difficulty.${mission.difficulty}`)}
            </span>
            <span className="mission-card-xp" style={{ marginLeft: "0.5rem" }}>
              {t("missionMap.card.xp", { xp: mission.xpReward })}
            </span>
          </div>
          {/* Story is localized via the mission data file (Phase 3). */}
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
                {t("missionDetail.hint.label", { index: hintIndex + 1 })}
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
                {t("missionDetail.editor.reset")}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleHint}
                disabled={
                  !mission.hints || hintIndex >= mission.hints.length - 1
                }
              >
                {t("missionDetail.editor.hint")}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleShowSolution}
              >
                {t("missionDetail.editor.solution")}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRunTests}
                disabled={isRunning}
              >
                {isRunning ? t("missionDetail.editor.running") : t("missionDetail.editor.run")}
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
                {t("missionDetail.status.note")}
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
                <span className="terminal-title">{t("missionDetail.terminal.title")}</span>
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
                    {t("missionDetail.terminal.placeholder")}
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
              {t("missionDetail.replay.header")}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {t("missionDetail.replay.body")}
            </p>
            <button
              className="btn btn-primary"
              onClick={handleWatchReplay}
              style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
            >
              {t("missionDetail.replay.start")}
            </button>
          </div>
        )}
      </div>

      {/* ---------------- Victory Modal ---------------- */}
      {showVictory && victoryData && (
        <div className="modal-overlay" onClick={() => setShowVictory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🏆</div>
            <h2 className="modal-title">{t("missionDetail.victory.title")}</h2>
            <p className="modal-message">
              {t("missionDetail.victory.youCompleted")} <strong>{mission.title}</strong>
            </p>
            <div className="modal-xp">{t("missionDetail.victory.xpGained", { xp: victoryData.xp })}</div>

            {victoryData.leveledUp && (
              <p
                style={{
                  color: "var(--purple)",
                  fontFamily: "var(--font-display)",
                  marginBottom: "1rem",
                }}
              >
                {t("missionDetail.victory.levelUp", {
                  level: victoryData.newLevel,
                  rank: victoryRank,
                })}
              </p>
            )}

            {victoryData.newBadges?.length > 0 && (
              <p style={{ color: "var(--gold)", marginBottom: "1rem" }}>
                {victoryData.newBadges.length > 1
                  ? t("missionDetail.victory.badgeEarnedMany")
                  : t("missionDetail.victory.badgeEarnedOne")}
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
                {t("missionDetail.victory.next")}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/missions")}
              >
                {t("missionDetail.victory.map")}
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
                {t("missionDetail.okashi.button")}
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
                {t("missionDetail.okashi.help")}
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
