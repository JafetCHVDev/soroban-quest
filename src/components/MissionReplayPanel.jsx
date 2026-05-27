import React from "react";

export default function MissionReplayPanel({ onWatchReplay }) {
  return (
    <div className="mission-replay-panel">
      <h3 className="mission-replay-title">
        📹 Watch Your Solution
      </h3>
      <p className="mission-replay-description">
        Review your problem-solving process step by step.
      </p>
      <button
        className="btn btn-primary mission-replay-button"
        onClick={onWatchReplay}
      >
        ▶️ Start Replay
      </button>
    </div>
  );
}
