import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Editor from "../components/LazyMonacoEditor";
import { getMissionById, getNextMission } from "../systems/missionLoader";
import {
  HINT_GOLD_COST,
  getHintTokenCount,
  isHintGoldUnlocked,
  spendGoldForHint,
  spendHintTokenForHint,
} from "../systems/gameEngine";
import { useGameState } from "../systems/GameStateContext";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";
import MissionDetailSkeleton from "../components/MissionDetailSkeleton";
import { useOkashi } from "../systems/useokashi";
import SecurityNotes from "../components/SecurityNotes";
import { useToast } from "../systems/ToastContext";
import { MissionErrorBoundary } from "../components/ErrorBoundary";
import CodeReplayPlayer from "../components/CodeReplayPlayer";
import { useTranslation } from "../i18n/useTranslation";
import useDocumentTitle from '../systems/useDocumentTitle';
import { measureRender } from "../systems/performanceMonitor";
import { useMonacoMarkers } from "../systems/useMonacoMarkers";
import { useEditorPreferences } from "../systems/useEditorPreferences";
import { useLiveValidation } from "../systems/useLiveValidation";
import { useMissionCompileRunner } from "../systems/useMissionCompileRunner";
import { useVictoryModal } from "../systems/useVictoryModal";
import { useMissionShortcuts } from "../systems/useMissionShortcuts";
import { useMissionReplay } from "../systems/useMissionReplay";
import MissionShortcutLegend from "../components/MissionShortcutLegend";
import MissionTabs from "../components/MissionTabs";
import MissionStoryPanel from "../components/MissionStoryPanel";
import MissionReplayPanel from "../components/MissionReplayPanel";
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
  const { progress, updateProgress } = useGameState();

  // --------------------------- States ---------------------------
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [hintIndex, setHintIndex] = useState(-1);
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
  const { hasReplay, showReplay, replayData, handleWatchReplay, handleCloseReplay } =
    useMissionReplay(missionId);

  const isCompleted = missionId && progress.completedMissions.includes(missionId);
  const nextHintIndex = hintIndex + 1;
  const noMoreHints = !mission?.hints || nextHintIndex >= mission.hints.length;
  const nextHintAlreadyUnlocked = Boolean(
    missionId && !noMoreHints && isHintGoldUnlocked(progress, missionId, nextHintIndex),
  );

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

  // Reveal the next hint by spending gold (unless it was already paid for).
  const handleGoldHint = (): void => {
    if (!mission?.hints || missionId === undefined || noMoreHints) return;

    if (nextHintAlreadyUnlocked) {
      setHintIndex(nextHintIndex);
      if (showToast) {
        showToast(
          t("missionDetail.toasts.hintUnlocked", { index: nextHintIndex + 1 }),
          "info",
        );
      }
      return;
    }

    const updated = spendGoldForHint(progress, missionId, nextHintIndex, HINT_GOLD_COST);
    if (updated.insufficientGold) {
      if (showToast) {
        showToast(
          t("missionDetail.toasts.hintInsufficientGold", { cost: HINT_GOLD_COST }),
          "error",
        );
      }
      return;
    }

    updateProgress(updated);
    setHintIndex(nextHintIndex);
    if (showToast) {
      showToast(
        t("missionDetail.toasts.hintGoldUnlocked", {
          index: nextHintIndex + 1,
          cost: HINT_GOLD_COST,
        }),
        "success",
      );
    }
    logActivity(
      ACTIVITY_TYPES.HINT_USED,
      { missionId, hintIndex: nextHintIndex, title: mission.title, gold: HINT_GOLD_COST },
      `Spent ${HINT_GOLD_COST} gold to unlock hint ${nextHintIndex + 1} for ${mission.title}`,
    );
  };

  // Reveal the next hint with a Hint Token instead of gold, consuming one.
  const handleUseHintToken = (): void => {
    if (!mission?.hints || missionId === undefined || noMoreHints) return;

    const updated = spendHintTokenForHint(progress, missionId, nextHintIndex);
    if (updated.insufficientTokens) {
      if (showToast) showToast(t("missionDetail.toasts.hintTokenMissing"), "error");
      return;
    }

    if (!updated.hintAlreadyUnlocked) {
      updateProgress(updated);
      logActivity(
        ACTIVITY_TYPES.HINT_USED,
        { missionId, hintIndex: nextHintIndex, title: mission.title, hintToken: true },
        `Used a Hint Token for hint ${nextHintIndex + 1} of ${mission.title}`,
      );
    }
    setHintIndex(nextHintIndex);

    if (showToast) {
      showToast(
        updated.hintAlreadyUnlocked
          ? t("missionDetail.toasts.hintUnlocked", { index: nextHintIndex + 1 })
          : t("missionDetail.toasts.hintTokenUnlocked", { index: nextHintIndex + 1 }),
        "success",
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
      <MissionShortcutLegend
        hasPreviousMission={Boolean(previousMissionItem)}
        hasNextMission={Boolean(nextMissionItem)}
      />

      {/* Tabs */}
      <MissionTabs
        t={t}
        activeTab={activeTab}
        showReplayTab={Boolean((isCompleted || showVictory) && hasReplay)}
        onTabChange={setActiveTab}
      />

      <div id="main-content" className={`mission-detail active-tab-${activeTab}`}>
        {/* ---------------- Story Panel ---------------- */}
        <MissionStoryPanel t={t} mission={mission} hintIndex={hintIndex} />

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
            hintDisabled={noMoreHints}
            goldHintCost={HINT_GOLD_COST}
            goldBalance={progress.gold || 0}
            hintTokens={getHintTokenCount(progress)}
            nextHintAlreadyUnlocked={nextHintAlreadyUnlocked}
            onReset={handleReset}
            onHint={handleHint}
            onGoldHint={handleGoldHint}
            onUseHintToken={handleUseHintToken}
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
          <MissionReplayPanel t={t} onWatchReplay={handleWatchReplay} />
        )}
      </div>

      {/* Victory Modal */}
      {showVictory && victoryData && (
        <MissionVictoryModal
          t={t}
          missionTitle={mission.title}
          victoryData={victoryData}
          hasReplay={hasReplay}
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
