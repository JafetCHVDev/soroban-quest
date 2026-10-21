/* ==========================================
   useMissionReplay: saved code-session recording for a
   mission and the full-screen replay player state
   ========================================== */

import { useCallback, useState } from "react";
import CodeRecorder from "./codeRecorder";
import type { RecordingData } from "./codeRecorder";

export interface UseMissionReplayReturn {
  hasReplay: boolean;
  showReplay: boolean;
  replayData: RecordingData | null;
  handleWatchReplay: () => void;
  handleCloseReplay: () => void;
}

export function useMissionReplay(missionId: string | undefined): UseMissionReplayReturn {
  const [showReplay, setShowReplay] = useState(false);
  const [replayData, setReplayData] = useState<RecordingData | null>(null);

  const hasReplay = Boolean(missionId && CodeRecorder.hasRecording(missionId));

  const handleWatchReplay = useCallback((): void => {
    if (!missionId) return;
    const recording = CodeRecorder.loadRecording(missionId);
    if (recording) {
      setReplayData(recording);
      setShowReplay(true);
    }
  }, [missionId]);

  const handleCloseReplay = useCallback((): void => {
    setShowReplay(false);
    setReplayData(null);
  }, []);

  return { hasReplay, showReplay, replayData, handleWatchReplay, handleCloseReplay };
}
