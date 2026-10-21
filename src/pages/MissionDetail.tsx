import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Editor from "../components/LazyMonacoEditor";
import ReactMarkdown from "react-markdown";
import { getMissionById, getNextMission } from "../systems/missionLoader";
import { loadProgress } from "../systems/storage";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";
import MissionDetailSkeleton from "../components/MissionDetailSkeleton";
import { useOkashi } from "../systems/useokashi";
import SecurityNotes from "../components/SecurityNotes";
import { useToast } from "../systems/ToastContext";
import { MissionErrorBoundary } from "../components/ErrorBoundary";
import CodeReplayPlayer from "../components/CodeReplayPlayer";
import CodeRecorder from "../systems/codeRecorder";
import { useTranslation } from "../i18n/useTranslation";
import useDocumentTitle from '../systems/useDocumentTitle';
import { measureRender } from "../systems/performanceMonitor";
import { useMonacoMarkers } from "../systems/useMonacoMarkers";
import { useEditorPreferences } from "../systems/useEditorPreferences";
import { useLiveValidation } from "../systems/useLiveValidation";
import { useMissionCompileRunner } from "../systems/useMissionCompileRunner";
import { useVictoryModal } from "../systems/useVictoryModal";
import { useMissionShortcuts } from "../systems/useMissionShortcuts";
import MissionEditorToolbar from "../components/MissionEditorToolbar";
import LiveStatusBar from "../components/LiveStatusBar";
import MissionTerminal from "../components/MissionTerminal";
import MissionVictoryModal from "../components/MissionVictoryModal";
import "./MissionDetail.css"

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
    () => missionId ? getMissionById(missionId, language) : null,
    [missionId, language],
  );

  const toastContext = useToast();
  const showToast = toastContext?.showToast;

  // --------------------------- States ---------------------------
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [hintIndex, setHintIndex] = useState(-1);
  const [showReplay, setShowReplay] = useState(false);
  const [replayData, setReplayData] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState("story");

  const { editorRef, monacoRef, setMarkers } = useMonacoMarkers();
  const {
    editorTheme,
    editorFontSize,
    handleEditorMount,
    handleThemeChange,
    handleFontSizeChange,
  } = useEditorPreferences({ editorRef, monacoRef });
  const { livePassCount, liveTotalCount, securityNotes, resetLiveValidation } =
    useLiveValidation({ code, mission, loading, setMarkers });
  const { showVictory, victoryData, victoryModalRef, openVictory, closeVictory } =
    useVictoryModal();
  const {
    testResults,
    isRunning,
    isCompiling,
    terminalBodyRef,
    handleRunTests,
    handleCompileAndRun,
    clearTestResults,
  } = useMissionCompileRunner({
    code,
    mission,
    missionId,
    language,
    t,
    showToast,
    setActiveTab,
    setMarkers,
    onVictory: openVictory,
  });

  const { openInOkashi, toast } = useOkashi();

  const progressState = loadProgress();
  const isCompleted = missionId && progressState.completedMissions.includes(missionId);
  const hasReplay = missionId && CodeRecorder.hasRecording(missionId);

  const nextMissionItem = useMemo(
    () => missionId ? getNextMission(missionId, language) : null,
    [missionId, language],
  );
  const previousMissionItem = useMemo(
    () => missionId ? getMissionById(String(Number(missionId) - 1), language) : null,
    [missionId, language],
  );

  // --------------------------- Load Mission ---------------------------
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLoading(true);
    if (mission) {
      setTimeout(() => {
        setCode(mission.template || "");
        clearTestResults();
        setHintIndex(-1);
        closeVictory();
        resetLiveValidation();
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
  }, [missionId, mission, clearTestResults, closeVictory, resetLiveValidation]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleNextMission = useCallback(() => {
    if (nextMissionItem) navigate(`/mission/${nextMissionItem.id}`);
    else navigate("/missions");
  }, [nextMissionItem, navigate]);

  const handlePreviousMission = useCallback(() => {
    if (previousMissionItem) navigate(`/mission/${previousMissionItem.id}`);
  }, [previousMissionItem, navigate]);

  useMissionShortcuts({
    onRunTests: handleRunTests,
    onNextMission: handleNextMission,
    onPreviousMission: handlePreviousMission,
  });

  const handleHint = (): void => {
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

  const handleReset = (): void => {
    if (mission?.template) {
      setCode(mission.template);
      clearTestResults();
      setHintIndex(-1);
      if (showToast) showToast(t("missionDetail.toasts.codeReset"), "warning");
    }
  };

  const handleShowSolution = (): void => {
    if (mission?.solution) {
      setCode(mission.solution);
      if (showToast) showToast(t("missionDetail.toasts.solutionLoaded"), "info");
    }
  };

  const handleWatchReplay = (): void => {
    if (!missionId) return;
    const recording = CodeRecorder.loadRecording(missionId);
    if (recording) {
      setReplayData(recording);
      setShowReplay(true);
    }
  };

  const handleCloseReplay = (): void => {
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
          onClick={(): void => navigate("/missions")}
          style={{ marginTop: "1.5rem" }}
        >
          {t("missionDetail.notFound.back")}
        </button>
      </div>
    );
  }

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
          onClick={(): void => setActiveTab("story")}
        >
          {t("missionDetail.tabs.story")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "editor"}
          className={`tab-btn ${activeTab === "editor" ? "active" : ""}`}
          onClick={(): void => setActiveTab("editor")}
        >
          {t("missionDetail.tabs.editor")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tests"}
          className={`tab-btn ${activeTab === "tests" ? "active" : ""}`}
          onClick={(): void => setActiveTab("tests")}
        >
          {t("missionDetail.tabs.tests")}
        </button>
        {(isCompleted || showVictory) && hasReplay && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "replay"}
            className={`tab-btn ${activeTab === "replay" ? "active" : ""}`}
            onClick={(): void => setActiveTab("replay")}
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
          <MissionEditorToolbar
            t={t}
            editorTheme={editorTheme}
            editorFontSize={editorFontSize}
            onThemeChange={handleThemeChange}
            onFontSizeChange={handleFontSizeChange}
            isRunning={isRunning}
            isCompiling={isCompiling}
            hintDisabled={!mission.hints || hintIndex >= mission.hints.length - 1}
            onReset={handleReset}
            onHint={handleHint}
            onShowSolution={handleShowSolution}
            onCompileAndRun={handleCompileAndRun}
            onRunTests={handleRunTests}
          />

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
          <LiveStatusBar passCount={livePassCount} totalCount={liveTotalCount} t={t} />
          <SecurityNotes notes={securityNotes} t={t} />
        </div>

        {/* ---------------- Terminal Panel ---------------- */}
        <MissionTerminal testResults={testResults} terminalBodyRef={terminalBodyRef} t={t} />

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
        <MissionVictoryModal
          t={t}
          missionTitle={mission.title}
          victoryData={victoryData}
          hasReplay={Boolean(hasReplay)}
          modalRef={victoryModalRef}
          okashiToast={toast}
          onClose={closeVictory}
          onWatchReplay={() => {
            closeVictory();
            handleWatchReplay();
          }}
          onNextMission={handleNextMission}
          onMissionMap={() => navigate("/missions")}
          onOpenInOkashi={() => openInOkashi(code)}
        />
      )}
    </MissionErrorBoundary>
  );
}
