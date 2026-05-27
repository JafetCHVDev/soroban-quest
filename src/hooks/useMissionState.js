import { useState, useEffect } from "react";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";

export function useMissionState(missionId, mission) {
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

  return {
    loading, code, setCode, testResults, setTestResults, isRunning, setIsRunning,
    showVictory, setShowVictory, victoryData, setVictoryData, hintIndex, setHintIndex,
    showReplay, setShowReplay, replayData, setReplayData, livePassCount, setLivePassCount,
    liveTotalCount, setLiveTotalCount
  };
}
