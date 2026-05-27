import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMissionById } from "../systems/missionLoader";
import { loadProgress } from "../systems/storage";
import { useToast } from "../systems/ToastContext";
import { MissionErrorBoundary } from "../components/ErrorBoundary";
import CodeRecorder from "../systems/codeRecorder";
import MissionDetailSkeleton from "../components/MissionDetailSkeleton";
import CodeReplayPlayer from "../components/CodeReplayPlayer";
import MissionStoryPanel from "../components/MissionStoryPanel";
import EditorToolbar from "../components/EditorToolbar";
import CodeEditor from "../components/CodeEditor";
import LiveValidationBar from "../components/LiveValidationBar";
import TestTerminal from "../components/TestTerminal";
import VictoryModal from "../components/VictoryModal";
import MissionReplayPanel from "../components/MissionReplayPanel";
import { useMissionState } from "../hooks/useMissionState";
import { useLiveValidation } from "../hooks/useLiveValidation";
import { useMissionActions } from "../hooks/useMissionActions";
import "../components/MissionComponents.css";

export default function MissionDetail() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const mission = getMissionById(missionId);
  const toastContext = useToast();
  const showToast = toastContext?.showToast;
  
  const state = useMissionState(missionId, mission);
  const { loading, code, setCode, testResults, isRunning, showVictory, victoryData, hintIndex, showReplay, replayData, livePassCount, liveTotalCount } = state;
  
  const { handleEditorMount } = useLiveValidation(code, mission, loading, state.setLivePassCount, state.setLiveTotalCount);
  
  const actions = useMissionActions(mission, missionId, code, showToast, state);
  const { handleRunTests, handleHint, handleReset, handleShowSolution, handleWatchReplay, handleCloseReplay, handleVictoryClose } = actions;
  
  const progressState = loadProgress();
  const isCompleted = progressState.completedMissions.includes(missionId);
  const hasReplay = CodeRecorder.hasRecording(missionId);

  if (loading) return <MissionDetailSkeleton />;

  if (!mission) {
    return (
      <div className="mission-not-found">
        <h2>Mission Not Found</h2>
        <p className="mission-not-found-text">The mission "{missionId}" doesn't exist.</p>
        <button className="btn btn-primary" onClick={() => navigate("/missions")}>← Back to Mission Map</button>
      </div>
    );
  }

  if (showReplay) {
    return (
      <div className="mission-replay-container">
        <CodeReplayPlayer missionId={missionId} recording={replayData} onClose={handleCloseReplay} />
      </div>
    );
  }

  return (
    <MissionErrorBoundary>
      <input type="radio" name="mission-tab" id="tab-story" className="tab-radio" defaultChecked />
      <input type="radio" name="mission-tab" id="tab-editor" className="tab-radio" />
      <input type="radio" name="mission-tab" id="tab-tests" className="tab-radio" />
      {isCompleted && hasReplay && <input type="radio" name="mission-tab" id="tab-replay" className="tab-radio" />}

      <div className="mobile-tabs">
        <label htmlFor="tab-story">Story</label>
        <label htmlFor="tab-editor">Editor</label>
        <label htmlFor="tab-tests">Tests</label>
        {isCompleted && hasReplay && <label htmlFor="tab-replay">📹 Replay</label>}
      </div>

      <div className="mission-detail">
        <MissionStoryPanel mission={mission} hintIndex={hintIndex} />

        <div className="mission-editor-panel">
          <EditorToolbar onReset={handleReset} onHint={handleHint} onShowSolution={handleShowSolution} onRunTests={handleRunTests} isRunning={isRunning} mission={mission} hintIndex={hintIndex} />
          <CodeEditor code={code} onChange={setCode} onMount={handleEditorMount} />
          <LiveValidationBar passCount={livePassCount} totalCount={liveTotalCount} />
          <TestTerminal testResults={testResults} />
        </div>

        {isCompleted && hasReplay && <MissionReplayPanel onWatchReplay={handleWatchReplay} />}
      </div>

      <VictoryModal show={showVictory} onClose={handleVictoryClose} mission={mission} victoryData={victoryData} code={code} />
    </MissionErrorBoundary>
  );
}
