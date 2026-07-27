import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { getMissionById, getNextMission } from "../systems/missionLoader";
import { runTests, TestResult } from "../systems/testRunner";
import { loadProgress, saveProgress } from "../systems/storage";
import { completeMission, recordAttempt } from "../systems/gameEngine";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";
import MissionDetailSkeleton from "../components/MissionDetailSkeleton";
import { useOkashi, TOAST_STATES } from "../systems/useokashi";
import { createDebouncedValidator } from "../systems/liveValidator";
import { useToast } from "../systems/ToastContext";
import { MissionErrorBoundary } from "../components/ErrorBoundary";
import Confetti from "../components/Confetti";
import CodeReplayPlayer from "../components/CodeReplayPlayer";
import CodeRecorder, { RecordingData } from "../systems/codeRecorder";
import { useTranslation } from "../i18n/useTranslation";
import useDocumentTitle from '../systems/useDocumentTitle';
import {
  EDITOR_THEMES,
  registerEditorThemes,
  loadEditorTheme,
  saveEditorTheme,
  EditorThemeId,
} from "../systems/editorThemes";
import "./MissionDetail.css";

const LIVE_MARKER_OWNER = "soroban-quest-live";
const MAX_RANK_INDEX = 10;

export default function MissionDetail() {
  useDocumentTitle('Mission Detail');
  const { missionId = "" } = useParams<{ missionId: string }>();
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
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryData, setVictoryData] = useState<any>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [showReplay, setShowReplay] = useState(false);
  const [replayData, setReplayData] = useState<RecordingData | null>(null);

  const [livePassCount, setLivePassCount] = useState(0);
  const [liveTotalCount, setLiveTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState("story");
  const [editorTheme, setEditorTheme] = useState<EditorThemeId>(() => loadEditorTheme());
  const [editorFontSize, setEditorFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('soroban_quest_editor_font_size') || '14', 10);
  });

  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const validatorRef = useRef<any>(null);
  const victoryModalRef = useRef<HTMLDivElement>(null);

  const { openInOkashi, toast } = useOkashi();

  const progressState = loadProgress();
  const isCompleted = (progressState.completedMissions || []).includes(missionId);
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
        setShowVictory(false);
        setLivePassCount(0);
        setLiveTotalCount(0);
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
    const validator = createDebouncedValidator(500, (result: any) => {
      setLivePassCount(result.passCount);
      setLiveTotalCount(result.totalCount);
      applyMonacoMarkers(result.markers);
    });
    validatorRef.current = validator;

    return () => {
      validator.cancel();
      clearMonacoMarkers();
    };
  }, []);

  const clearMonacoMarkers = () => {
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, LIVE_MARKER_OWNER, []);
      }
    }
  };

  const applyMonacoMarkers = (markers: any[]) => {
    if (!monacoRef.current || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const formattedMarkers = markers.map((m) => ({
      startLineNumber: m.line || 1,
      startColumn: 1,
      endLineNumber: m.line || 1,
      endColumn: 100,
      message: m.message,
      severity: monacoRef.current.MarkerSeverity.Error,
    }));

    monacoRef.current.editor.setModelMarkers(model, LIVE_MARKER_OWNER, formattedMarkers);
  };

  const handleRunTests = useCallback(async () => {
    if (isRunning || !mission) return;
    setIsRunning(true);
    setTestResults([]);

    let state = loadProgress();
    state = recordAttempt(state, missionId);
    saveProgress(state);

    const resultCollector: TestResult[] = [];
    const addResult = (result: TestResult) => {
      resultCollector.push(result);
      setTestResults([...resultCollector]);
    };

    const finalResults = await runTests(code, mission, addResult);
    setIsRunning(false);

    const allPassed = finalResults.allPassed;

    if (allPassed) {
      const prevState = loadProgress();
      const prevLevel = prevState.level;
      const updatedState = completeMission(
        prevState,
        missionId,
        mission.xpReward,
      );

      saveProgress(updatedState);
      logActivity(
        ACTIVITY_TYPES.MISSION_COMPLETED,
        { missionId, title: mission.title, xp: mission.xpReward },
        `Completed mission: ${mission.title} (+${mission.xpReward} XP)`,
      );

      const levelUp = updatedState.level > prevLevel;
      const rankIndex = Math.min(Math.max(updatedState.level - 1, 0), MAX_RANK_INDEX);
      const rankTitle = t(`ranks.${rankIndex}`);

      setVictoryData({
        xpEarned: mission.xpReward,
        goldEarned: Math.floor(mission.xpReward * 0.5),
        newBadges: [],
        levelUp,
        newLevel: updatedState.level,
        newRank: rankTitle,
      });

      setShowVictory(true);

      if (showToast) {
        showToast(
          t("missionDetail.toast.success", { title: mission.title }),
          "success",
        );
      }
    } else if (showToast) {
      showToast(t("missionDetail.toast.failure"), "error");
    }
  }, [isRunning, mission, missionId, code, showToast, t]);

  const handleCodeChange = (newCode?: string) => {
    const nextCode = newCode || "";
    setCode(nextCode);
    if (validatorRef.current && mission?.checks) {
      validatorRef.current.validate(nextCode, mission.checks);
    }
  };

  const handleResetCode = () => {
    if (mission) {
      setCode(mission.template || "");
      setTestResults([]);
      clearMonacoMarkers();
      setLivePassCount(0);
      setLiveTotalCount(0);
    }
  };

  const handleShowNextHint = () => {
    if (mission?.hints && hintIndex < mission.hints.length - 1) {
      const nextIndex = hintIndex + 1;
      setHintIndex(nextIndex);
      logActivity(
        ACTIVITY_TYPES.HINT_USED,
        { missionId, hintIndex: nextIndex },
        `Used hint ${nextIndex + 1} on mission: ${mission.title}`,
      );
    }
  };

  const handleOpenInOkashi = () => {
    if (!mission) return;
    openInOkashi(code, mission.title);
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    registerEditorThemes(monaco);
    monaco.editor.setTheme(editorTheme);
  };

  const handleThemeChange = (newTheme: EditorThemeId) => {
    setEditorTheme(newTheme);
    saveEditorTheme(newTheme);
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(newTheme);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    setEditorFontSize((prev) => {
      const next = Math.max(10, Math.min(24, prev + delta));
      localStorage.setItem('soroban_quest_editor_font_size', String(next));
      return next;
    });
  };

  const handleViewReplay = () => {
    const recording = CodeRecorder.loadRecording(missionId);
    if (recording) {
      setReplayData(recording);
      setShowReplay(true);
    }
  };

  if (loading) {
    return <MissionDetailSkeleton />;
  }

  if (!mission) {
    return (
      <div className="mission-not-found">
        <h2>{t("missionDetail.notFound.title")}</h2>
        <p>{t("missionDetail.notFound.body", { id: missionId })}</p>
        <button className="btn btn-primary" onClick={() => navigate("/missions")}>
          {t("missionDetail.notFound.button")}
        </button>
      </div>
    );
  }

  return (
    <MissionErrorBoundary>
      <div className="mission-detail-container">
        {/* Navigation bar */}
        <div className="mission-nav-bar">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/missions")}>
            ← {t("missionDetail.nav.allMissions")}
          </button>
          <span className="mission-nav-chapter">
            {t("missionDetail.nav.chapter", { number: mission.chapter })}
          </span>
          {previousMissionItem && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/mission/${previousMissionItem.id}`)}
            >
              ← {previousMissionItem.title}
            </button>
          )}
          {nextMissionItem && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/mission/${nextMissionItem.id}`)}
            >
              {nextMissionItem.title} →
            </button>
          )}
        </div>

        {/* Victory Modal */}
        {showVictory && victoryData && (
          <div className="victory-overlay">
            <Confetti />
            <div className="victory-modal card" ref={victoryModalRef}>
              <h2>🎉 {t("missionDetail.victory.title")}</h2>
              <p>{t("missionDetail.victory.body", { title: mission.title })}</p>

              <div className="victory-rewards">
                <div className="reward-item">
                  <span className="reward-icon">✨</span>
                  <span>+{victoryData.xpEarned} XP</span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">🪙</span>
                  <span>+{victoryData.goldEarned} Gold</span>
                </div>
              </div>

              {victoryData.levelUp && (
                <div className="level-up-banner">
                  <span>🚀 {t("missionDetail.victory.levelUp", { level: victoryData.newLevel })}</span>
                  <span className="rank-title">{victoryData.newRank}</span>
                </div>
              )}

              {victoryData.newBadges?.length > 0 && (
                <div className="new-badges-section">
                  <h3>🏅 {t("missionDetail.victory.badgeUnlocked")}</h3>
                  <div className="badges-list">
                    {victoryData.newBadges.map((badge: any) => (
                      <div key={badge.id} className="badge-item">
                        <span>{badge.icon}</span>
                        <span>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="victory-actions">
                {nextMissionItem ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowVictory(false);
                      navigate(`/mission/${nextMissionItem.id}`);
                    }}
                  >
                    {t("missionDetail.victory.nextMission")} →
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowVictory(false);
                      navigate("/missions");
                    }}
                  >
                    {t("missionDetail.victory.returnMap")}
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowVictory(false)}
                >
                  {t("missionDetail.victory.stay")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Code Replay Overlay */}
        {showReplay && (
          <div className="replay-overlay">
            <div className="replay-modal">
              <CodeReplayPlayer
                missionId={missionId}
                recording={replayData}
                onClose={() => setShowReplay(false)}
              />
            </div>
          </div>
        )}

        {/* Main 2-column layout */}
        <div className="mission-content-grid">
          {/* Left panel: Story & Instructions */}
          <div className="mission-left-panel">
            <div className="panel-tabs">
              <button
                className={`tab-btn ${activeTab === "story" ? "active" : ""}`}
                onClick={() => setActiveTab("story")}
              >
                📖 {t("missionDetail.tabs.story")}
              </button>
              <button
                className={`tab-btn ${activeTab === "instructions" ? "active" : ""}`}
                onClick={() => setActiveTab("instructions")}
              >
                📋 {t("missionDetail.tabs.instructions")}
              </button>
              <button
                className={`tab-btn ${activeTab === "hints" ? "active" : ""}`}
                onClick={() => setActiveTab("hints")}
              >
                💡 {t("missionDetail.tabs.hints")}{" "}
                {hintIndex >= 0 && `(${hintIndex + 1}/${mission.hints?.length || 0})`}
              </button>
            </div>

            <div className="panel-body">
              {activeTab === "story" && (
                <div className="markdown-content">
                  <h1>{mission.title}</h1>
                  <div className="mission-tags">
                    <span className={`diff-tag ${mission.difficulty}`}>{mission.difficulty}</span>
                    <span className="reward-tag">+{mission.xpReward} XP</span>
                    {isCompleted && (
                      <span className="completed-tag">✓ {t("missionDetail.status.completed")}</span>
                    )}
                  </div>
                  <ReactMarkdown>{mission.story || mission.learningGoal}</ReactMarkdown>
                </div>
              )}

              {activeTab === "instructions" && (
                <div className="markdown-content">
                  <h2>{t("missionDetail.instructions.title")}</h2>
                  <ReactMarkdown>{(mission as any).instructions || mission.learningGoal}</ReactMarkdown>

                  {mission.conceptsIntroduced?.length > 0 && (
                    <div className="concepts-section">
                      <h3>{t("missionDetail.instructions.concepts")}</h3>
                      <div className="concepts-list">
                        {mission.conceptsIntroduced.map((c: string) => (
                          <span key={c} className="concept-chip">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "hints" && (
                <div className="hints-content">
                  <h2>💡 {t("missionDetail.hints.title")}</h2>
                  {hintIndex < 0 ? (
                    <div className="hints-empty">
                      <p>{t("missionDetail.hints.empty")}</p>
                      <button className="btn btn-secondary" onClick={handleShowNextHint}>
                        {t("missionDetail.hints.showFirst")}
                      </button>
                    </div>
                  ) : (
                    <div className="hints-list">
                      {mission.hints?.slice(0, hintIndex + 1).map((h: string, i: number) => (
                        <div key={i} className="hint-card">
                          <strong>{t("missionDetail.hints.hintNumber", { number: i + 1 })}</strong>
                          <p>{h}</p>
                        </div>
                      ))}
                      {hintIndex < (mission.hints?.length || 0) - 1 && (
                        <button className="btn btn-secondary btn-sm" onClick={handleShowNextHint}>
                          {t("missionDetail.hints.showNext")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Editor & Terminal */}
          <div className="mission-right-panel">
            <div className="editor-header">
              <div className="editor-controls">
                <span className="editor-lang-tag">Rust</span>
                <select
                  value={editorTheme}
                  onChange={(e) => handleThemeChange(e.target.value as EditorThemeId)}
                  className="theme-select"
                >
                  {EDITOR_THEMES.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>

                <div className="font-size-controls">
                  <button
                    className="btn-icon"
                    onClick={() => handleFontSizeChange(-1)}
                    title={t("missionDetail.editor.decreaseFont")}
                  >
                    A-
                  </button>
                  <span>{editorFontSize}px</span>
                  <button
                    className="btn-icon"
                    onClick={() => handleFontSizeChange(1)}
                    title={t("missionDetail.editor.increaseFont")}
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="editor-actions">
                {hasReplay && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleViewReplay}
                    title={t("missionDetail.editor.viewReplay")}
                  >
                    📹 {t("missionDetail.editor.replay")}
                  </button>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleResetCode}
                  title={t("missionDetail.editor.resetCode")}
                >
                  🔄 {t("missionDetail.editor.reset")}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleOpenInOkashi}
                  title={t("missionDetail.editor.openOkashi")}
                >
                  ⚡ {t("missionDetail.editor.okashi")}
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="editor-wrapper">
              <Editor
                height="100%"
                defaultLanguage="rust"
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorMount}
                options={{
                  fontSize: editorFontSize,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  wordWrap: "on",
                  tabSize: 4,
                }}
              />
            </div>

            {/* Terminal / Live Validation Status Bar */}
            <div className="terminal-panel">
              <div className="terminal-header">
                <div className="terminal-title">
                  <span>🧪 {t("missionDetail.terminal.title")}</span>
                  {liveTotalCount > 0 && (
                    <span className="live-status">
                      Live: {livePassCount}/{liveTotalCount} passed
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleRunTests}
                  disabled={isRunning}
                >
                  {isRunning ? t("missionDetail.terminal.running") : t("missionDetail.terminal.runTests")}
                </button>
              </div>

              <div className="terminal-body" ref={terminalBodyRef}>
                {testResults.length === 0 ? (
                  <div className="terminal-placeholder">
                    {t("missionDetail.terminal.placeholder")}
                  </div>
                ) : (
                  testResults.map((res, index) => (
                    <div
                      key={index}
                      className={`test-result-line ${res.passed ? "passed" : "failed"}`}
                    >
                      <span className="result-icon">{res.passed ? "✓" : "✗"}</span>
                      <span className="result-message">{res.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MissionErrorBoundary>
  );
}
