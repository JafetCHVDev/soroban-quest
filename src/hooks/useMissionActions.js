import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { runTests } from "../systems/testRunner";
import { loadProgress, saveProgress } from "../systems/storage";
import { completeMission, recordAttempt } from "../systems/gameEngine";
import { getNextMission } from "../systems/missionLoader";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";
import CodeRecorder from "../systems/codeRecorder";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useMissionActions(mission, missionId, code, showToast, state) {
  const navigate = useNavigate();
  const { isRunning, setIsRunning, setTestResults, setVictoryData, setShowVictory, hintIndex, setHintIndex, setCode, setReplayData, setShowReplay } = state;

  const handleRunTests = useCallback(async () => {
    if (isRunning || !mission) return;
    setIsRunning(true);
    setTestResults([]);
    let progressState = loadProgress();
    progressState = recordAttempt(progressState, missionId);
    saveProgress(progressState);
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
      progressState = loadProgress();
      const newState = completeMission(progressState, missionId, mission.xpReward);
      if (!newState.alreadyCompleted) {
        saveProgress(newState);
        setVictoryData({ xp: mission.xpReward, leveledUp: newState.leveledUp, newLevel: newState.level, newBadges: newState.newBadges || [] });
        setShowVictory(true);
      } else {
        addResult({ phase: "info", message: "🏅 Already completed — no additional XP awarded." });
      }
    } else {
      if (showToast) showToast("Validation failed. Check terminal.", "error");
    }
    setIsRunning(false);
  }, [code, mission, missionId, isRunning, showToast, setIsRunning, setTestResults, setVictoryData, setShowVictory]);

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

  const handleVictoryClose = () => {
    setShowVictory(false);
    handleNextMission();
  };

  return { handleRunTests, handleHint, handleReset, handleShowSolution, handleNextMission, handleWatchReplay, handleCloseReplay, handleVictoryClose };
}
