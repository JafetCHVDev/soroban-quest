import React from "react";
import ReactMarkdown from "react-markdown";

export default function MissionStoryPanel({ mission, hintIndex }) {
  return (
    <div className="mission-story">
      <div className="mission-story-header">
        <span className={`badge badge-${mission.difficulty}`}>
          {mission.difficulty}
        </span>
        <span className="mission-card-xp">
          ⚡ {mission.xpReward} XP
        </span>
      </div>
      
      <ReactMarkdown>{mission.story}</ReactMarkdown>

      {hintIndex >= 0 && mission.hints && (
        <div className="mission-hint-box">
          <strong className="mission-hint-title">
            💡 Hint {hintIndex + 1}:
          </strong>
          <p className="mission-hint-text">
            {mission.hints[hintIndex]}
          </p>
        </div>
      )}
    </div>
  );
}
