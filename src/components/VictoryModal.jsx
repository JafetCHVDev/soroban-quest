import React from "react";
import { useNavigate } from "react-router-dom";
import { getRankTitle } from "../systems/gameEngine";
import { useokashi, TOAST_STATES } from "../systems/useokashi";

export default function VictoryModal({ 
  show, 
  onClose, 
  mission, 
  victoryData,
  code 
}) {
  const navigate = useNavigate();
  const { openInOkashi, toast } = useokashi();

  if (!show || !victoryData) {
    return null;
  }

  const handleNextMission = () => {
    // This will be handled by parent component
    onClose();
  };

  const handleMissionMap = () => {
    navigate("/missions");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">🏆</div>
        <h2 className="modal-title">Mission Complete!</h2>
        <p className="modal-message">
          You've completed <strong>{mission.title}</strong>
        </p>
        <div className="modal-xp">+{victoryData.xp} XP</div>

        {victoryData.leveledUp && (
          <p className="modal-level-up">
            🎉 Level Up! You are now Level {victoryData.newLevel} —{" "}
            {getRankTitle(victoryData.newLevel)}
          </p>
        )}

        {victoryData.newBadges?.length > 0 && (
          <p className="modal-badges">
            🏅 New badge{victoryData.newBadges.length > 1 ? "s" : ""} earned!
          </p>
        )}

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleNextMission}>
            Next Mission →
          </button>
          <button className="btn btn-secondary" onClick={handleMissionMap}>
            Mission Map
          </button>
        </div>

        <div className="modal-okashi-section">
          <button onClick={() => openInOkashi(code)} className="btn btn-secondary">
            🚀 Try on Okashi — Compile & Deploy
          </button>

          <p className="modal-okashi-hint">
            Opens okashi.dev in a new tab. Your code is copied to clipboard
            — paste it there to compile with the real Soroban compiler and
            deploy to Testnet.
          </p>

          {toast?.state !== TOAST_STATES.IDLE && (
            <div className={`modal-toast modal-toast-${toast.state}`}>
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
