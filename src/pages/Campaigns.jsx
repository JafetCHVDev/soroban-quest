import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { missions } from "../data/missions.js";
import { campaigns, getCampaignProgress } from "../data/campaigns.js";
import { loadProgress } from "../systems/storage.js";
import { isMissionUnlocked } from "../systems/missionLoader.js";

import "./Campaigns.css";

export default function Campaigns() {
  const [progress, setProgress] = useState(loadProgress());
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showLoreModal, setShowLoreModal] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    // Listen for storage changes (profile updates)
    const handleStorageChange = () => setProgress(loadProgress());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleCampaignClick = (campaign) => {
    // Check first visit
    const visitedKey = `campaign-first-visit-${campaign.id}`;
    if (!localStorage.getItem(visitedKey)) {
      localStorage.setItem(visitedKey, "true");
      setFirstVisit(true);
      setShowLoreModal(true);
    }
    setSelectedCampaign(campaign);
  };

  const closeModal = () => {
    setShowLoreModal(false);
    setFirstVisit(false);
  };

  const getLevelFromXP = (xp) => {
    // Simple level calc: 1 lvl per ~300 XP (adjust as needed)
    return Math.floor(xp / 300) + 1;
  };

  const currentLevel = getLevelFromXP(progress.totalXP);

  return (
    <div className="campaigns-page">
      <div className="page-header">
        <h1 className="section-title">Campaigns</h1>
        <p className="section-subtitle">
          Epic story-driven chapters | Level {currentLevel} |{" "}
          {progress.completedMissions.length}/{missions.length} total missions
        </p>
      </div>

      <div className="campaigns-grid">
        {campaigns.map((campaign) => {
          const stats = getCampaignProgress(
            campaign.id,
            progress.completedMissions,
          );
          const unlocked = currentLevel >= campaign.requiredLevel;
          const completed = stats.completed === stats.total;

          return (
            <div
              key={campaign.id}
              className={`campaign-card ${unlocked ? "" : "locked"} ${completed ? "completed" : ""}`}
              onClick={() => unlocked && handleCampaignClick(campaign)}
            >
              <div
                className="campaign-hero"
                style={{
                  background: campaign.heroImage,
                  borderTop: `4px solid ${unlocked ? `var(--${campaign.color})` : "var(--border-subtle)"}`,
                }}
              >
                <div className="campaign-badge">
                  Chapter {campaign.chapterNumber}
                </div>
              </div>

              <div className="campaign-info">
                <h3 className="campaign-title">{campaign.title}</h3>
                <p className="campaign-desc">{campaign.description}</p>

                <div className="campaign-progress">
                  <div className="progress-label">
                    {stats.completed}/{stats.total} missions
                  </div>
                  <div className="xp-bar-container">
                    <div className="xp-bar-track">
                      <div
                        className="xp-bar-fill"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {!unlocked && (
                  <div className="campaign-lock">
                    🔒 Reach Level {campaign.requiredLevel} to unlock
                  </div>
                )}

                {completed && (
                  <div className="campaign-status completed">
                    ✓ Chapter Complete!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCampaign && (
        <div className="campaign-detail-overlay">
          <div className="campaign-detail">
            <button
              className="detail-back"
              onClick={() => setSelectedCampaign(null)}
            >
              ← Back to Campaigns
            </button>

            <div className="detail-header">
              <h2>{selectedCampaign.title}</h2>
              <div className="detail-stats">
                <span>
                  {
                    getCampaignProgress(
                      selectedCampaign.id,
                      progress.completedMissions,
                    ).completed
                  }
                  /{selectedCampaign.missionIds.length} Complete
                </span>
              </div>
            </div>

            <div className="missions-list">
              {selectedCampaign.missionIds.map((missionId) => {
                const mission = missions.find((m) => m.id === missionId);
                if (!mission) return null;

                const missionCompleted =
                  progress.completedMissions.includes(missionId);
                const missionUnlocked = isMissionUnlocked(
                  missionId,
                  progress.completedMissions,
                );

                return (
                  <Link
                    key={mission.id}
                    to={`/mission/${mission.id}`}
                    className={`mission-item ${missionUnlocked ? "" : "locked"} ${missionCompleted ? "completed" : ""}`}
                  >
                    <div className="mission-order">#{mission.order}</div>
                    <div className="mission-title">{mission.title}</div>
                    <div className="mission-badge badge-{mission.difficulty}">
                      {mission.difficulty}
                    </div>
                    {missionCompleted ? (
                      <span className="mission-status">✓</span>
                    ) : !missionUnlocked ? (
                      <span className="mission-status locked">🔒</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showLoreModal && selectedCampaign && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">📜</div>
            <h2 className="modal-title">Chapter Introduction</h2>
            <div className="modal-lore">
              <ReactMarkdown>{selectedCampaign.lore}</ReactMarkdown>
            </div>
            <button className="btn btn-primary" onClick={closeModal}>
              Begin Chapter {selectedCampaign.chapterNumber}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
