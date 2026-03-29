import React, { useEffect, useRef, useState } from "react";
import { getBadgeById, getRankTitle } from "../systems/gameEngine";
import { TOAST_STATES } from "../systems/useokashi";

const EXIT_DURATION_MS = 220;

const CONFETTI_PIECES = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 7.7) % 100}%`,
  delay: `${(index % 8) * 0.08}s`,
  duration: `${2.4 + (index % 6) * 0.18}s`,
  rotation: `${(index % 2 === 0 ? 1 : -1) * (160 + index * 9)}deg`,
  color: ["#f59e0b", "#06b6d4", "#22c55e", "#f43f5e", "#8b5cf6"][index % 5],
}));

export default function MissionCelebrationModal({
  missionTitle,
  victoryData,
  onClose,
  onNextMission,
  onBackToMap,
  openInOkashi,
  toast,
  code,
}) {
  const [displayXp, setDisplayXp] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);
  const badgeDetails = (victoryData.newBadges || [])
    .map((badgeId) => getBadgeById(badgeId))
    .filter(Boolean);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let frameId;
    const targetXp = victoryData.xp || 0;

    if (targetXp === 0) {
      setDisplayXp(0);
      return undefined;
    }

    setDisplayXp(0);
    const startedAt = performance.now();
    const duration = 950;

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayXp(Math.round(targetXp * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [victoryData.xp]);

  const requestClose = (action) => {
    if (isClosing) return;

    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(action, EXIT_DURATION_MS);
  };

  return (
    <div
      className={`celebration-overlay ${isClosing ? "is-closing" : ""}`}
      onClick={() => requestClose(onClose)}
      role="presentation"
    >
      <div className="celebration-confetti" aria-hidden="true">
        {CONFETTI_PIECES.map((piece) => (
          <span
            key={piece.id}
            className="celebration-confetti-piece"
            style={{
              "--confetti-left": piece.left,
              "--confetti-delay": piece.delay,
              "--confetti-duration": piece.duration,
              "--confetti-rotation": piece.rotation,
              "--confetti-color": piece.color,
            }}
          />
        ))}
      </div>

      <div
        className="celebration-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-celebration-title"
      >
        <div className="celebration-header">
          <div className="celebration-icon">🏆</div>
          <p className="celebration-kicker">Mission completed</p>
          <h2 id="mission-celebration-title" className="celebration-title">
            {missionTitle}
          </h2>
        </div>

        <div className="celebration-stat-card">
          <span className="celebration-stat-label">XP earned</span>
          <strong className="celebration-stat-value">+{displayXp} XP</strong>
        </div>

        {victoryData.leveledUp && (
          <section className="celebration-section">
            <span className="celebration-section-label">Level up</span>
            <p className="celebration-section-copy">
              You reached Level {victoryData.newLevel}, earning the rank{" "}
              <strong>{getRankTitle(victoryData.newLevel)}</strong>.
            </p>
          </section>
        )}

        {badgeDetails.length > 0 && (
          <section className="celebration-section">
            <span className="celebration-section-label">New badges unlocked</span>
            <div className="celebration-badge-list">
              {badgeDetails.map((badge) => (
                <div key={badge.id} className="celebration-badge-card">
                  <span className="celebration-badge-icon" aria-hidden="true">
                    {badge.icon}
                  </span>
                  <div>
                    <strong className="celebration-badge-name">
                      {badge.name}
                    </strong>
                    <p className="celebration-badge-description">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="celebration-actions">
          <button className="btn btn-primary" onClick={() => requestClose(onNextMission)}>
            Next Mission →
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => requestClose(onBackToMap)}
          >
            Back to Map
          </button>
        </div>

        <div className="celebration-okashi">
          <button
            onClick={() => openInOkashi(code)}
            className="celebration-okashi-button"
          >
            Try on Okashi - Compile & Deploy
          </button>

          <p className="celebration-okashi-copy">
            Opens okashi.dev in a new tab. Your code is copied to clipboard so
            you can compile it with the Soroban toolchain and deploy to Testnet.
          </p>

          {toast.state !== TOAST_STATES.IDLE && (
            <div
              className={`celebration-toast ${
                toast.state === TOAST_STATES.SUCCESS ? "success" : "error"
              }`}
            >
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
