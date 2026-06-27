/* ==========================================
   Campaign System — Grouped mission chapters
   with lore, progression gates, hero images
   ========================================== */

import React, { useState, useEffect, useMemo, useRef } from "react";

import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { missions, localizeMissions } from "../data/missions.js";
import { campaigns, localizeCampaigns, getCampaignProgress } from "../data/campaigns.js";
import { loadProgress } from "../systems/storage.js";
import { isMissionUnlocked } from "../systems/missionLoader.js";
import { getLevelFromXP } from "../systems/gameEngine.js";
import { useTranslation } from "../i18n/useTranslation";

import "./Campaigns.css";
import useDocumentTitle from '../systems/useDocumentTitle';

export default function Campaigns() {
  const { t, language } = useTranslation();
  useDocumentTitle('Campaigns');
  const [progress, setProgress] = useState(loadProgress());
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [showLoreModal, setShowLoreModal] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const [loading, setLoading] = useState(true);

  const localizedCampaigns = useMemo(
    () => localizeCampaigns(campaigns, language),
    [language],
  );
  const localizedMissions = useMemo(
    () => localizeMissions(missions, language),
    [language],
  );
  const selectedCampaign = useMemo(
    () => localizedCampaigns.find((c) => c.id === selectedCampaignId) || null,
    [localizedCampaigns, selectedCampaignId],
  );
  const loreModalRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => setProgress(loadProgress());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Focus Trapping for the Lore Modal attached directly to Element Context instead of Window
  useEffect(() => {
    if (!showLoreModal || !loreModalRef.current) return;

    const modalElement = loreModalRef.current;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modalElement.querySelectorAll(focusableSelectors);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Auto-focus first element cleanly
    firstElement.focus();

    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalElement.addEventListener("keydown", handleKeyDown);
    return () => modalElement.removeEventListener("keydown", handleKeyDown);
  }, [showLoreModal]);

  const handleCampaignClick = (campaign) => {
    const visitedKey = `campaign-first-visit-${campaign.id}`;
    if (!localStorage.getItem(visitedKey)) {
      localStorage.setItem(visitedKey, "true");
      setFirstVisit(true);
      setShowLoreModal(true);
    }
    setSelectedCampaignId(campaign.id);
  };

  const closeModal = () => {
    setShowLoreModal(false);
    setFirstVisit(false);
  };

  const currentLevel = getLevelFromXP(progress.xp || 0);

  if (loading) {
    return (
      <div id="main-content" className="campaigns-page">
        <div className="page-header">
          <div className="skeleton-title skeleton-pulse" />
          <div className="skeleton-subtitle skeleton-pulse" />
        </div>

        <div className="campaigns-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="campaign-card skeleton-card">
              <div className="campaign-hero skeleton-hero skeleton-pulse" />
              <div className="campaign-info">
                <div className="skeleton-line skeleton-title skeleton-pulse" />
                <div className="skeleton-line skeleton-desc skeleton-pulse" />
                <div className="skeleton-line skeleton-desc skeleton-pulse" style={{ width: "80%" }} />
                <div className="skeleton-skills-label skeleton-pulse" />
                <div className="skeleton-skills skeleton-pulse" />
                <div className="skeleton-progress skeleton-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="main-content" className="campaigns-page">
      <div className="page-header">
        <h1 className="section-title">{t("campaigns.title")}</h1>
        <p className="section-subtitle">
          {t("campaigns.subtitle", {
            level: currentLevel,
            completed: progress.completedMissions.length,
            total: missions.length,
          })}
        </p>
      </div>

      <div className="campaigns-grid">
        {localizedCampaigns.map((campaign) => {
          const stats = getCampaignProgress(
            campaign.id,
            progress.completedMissions,
          );
          const unlocked = currentLevel >= campaign.requiredLevel;
          const completed = stats.completed === stats.total;

          const campaignMissions = campaign.missionIds
            .map((id) => localizedMissions.find((m) => m.id === id))
            .filter(Boolean);
          const unlockableSkills = Array.from(
            new Set(campaignMissions.flatMap((m) => m.conceptsIntroduced || [])),
          );
          const skillsTitle = language === "es" ? "Habilidades a desbloquear:" : "Skills to unlock:";

          return (
            <div
              key={campaign.id}
              className={`campaign-card ${unlocked ? "" : "locked"} ${completed ? "completed" : ""}`}
              onClick={() => unlocked && handleCampaignClick(campaign)}
              onKeyDown={(e) => {
                if (unlocked && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleCampaignClick(campaign);
                }
              }}
              role="button"
              tabIndex={unlocked ? 0 : -1}
              aria-label={`Chapter ${campaign.chapterNumber}: ${campaign.title}. ${campaign.description}. Progress: ${stats.completed} of ${stats.total} missions complete.${unlocked ? "" : ` Locked until level ${campaign.requiredLevel}.`}${completed ? " Status: Chapter complete." : ""}`}
            >
              <div
                className="campaign-hero"
                style={{
                  background: campaign.heroImage,
                  borderTop: `4px solid ${unlocked ? `var(--${campaign.color})` : "var(--border-subtle)"}`,
                }}
              >

                 <div className="campaign-badge" aria-hidden="true">
                  {t("campaigns.chapter", { number: campaign.chapterNumber })}

                </div>
              </div>

              <div className="campaign-info">
                <h3 className="campaign-title">{campaign.title}</h3>
                <p className="campaign-desc">{campaign.description}</p>

                <div className="campaign-skills">
                  <span className="skills-label">{skillsTitle}</span>
                  <div className="skills-list">
                    {unlockableSkills.map((skill) => (
                      <span key={skill} className="skill-badge">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="campaign-progress" aria-label={`Chapter progress: ${stats.percentage}% complete`}>
                  <div className="progress-label">
                    {t("campaigns.missionCount", {
                      completed: stats.completed,
                      total: stats.total,
                    })}
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

                    <span className="sr-only">{t("campaigns.statusLabel")} </span>
                    {t("campaigns.lockedAt", { level: campaign.requiredLevel })}

                  </div>
                )}

                {completed && (
                  <div className="campaign-status completed">

                    <span className="sr-only">{t("campaigns.statusLabel")} </span>
                    {t("campaigns.chapterComplete")}

                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCampaign && (
        <div className="campaign-detail-overlay" role="region" aria-label={`Details log for ${selectedCampaign.title}`}>
          <div className="campaign-detail">
            <button
              type="button"
              className="detail-back"
              onClick={() => setSelectedCampaignId(null)}
            >
              {t("campaigns.back")}
            </button>

            <div className="detail-header">
              <h2>{selectedCampaign.title}</h2>
              <div className="detail-stats">
                <span>
                  {t("campaigns.completeOf", {
                    completed: getCampaignProgress(
                      selectedCampaign.id,
                      progress.completedMissions,
                    ).completed,
                    total: selectedCampaign.missionIds.length,
                  })}
                </span>
              </div>
            </div>

            <div className="missions-list" role="list" aria-label="Missions included in this campaign chapter">
              {selectedCampaign.missionIds.map((missionId) => {
                const mission = localizedMissions.find((m) => m.id === missionId);
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
                    role="listitem"
                    aria-label={`Mission ${mission.order}: ${mission.title}. Difficulty: ${mission.difficulty}.${missionCompleted ? " Completed." : !missionUnlocked ? " Locked." : " Unlocked."}`}
                  >

                    <div className="mission-order" aria-hidden="true">#{mission.order}</div>
                    <div className="mission-title" aria-hidden="true">{mission.title}</div>
                    <div className={`mission-badge badge-${mission.difficulty}`} aria-hidden="true">
                      {t(`difficulty.${mission.difficulty}`)}

                    </div>
                    {missionCompleted ? (
                      <span className="mission-status" aria-hidden="true">✓</span>
                    ) : !missionUnlocked ? (
                      <span className="mission-status locked" aria-hidden="true">🔒</span>
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
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            ref={loreModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lore-modal-title"
          >
            <div className="modal-icon" role="img" aria-label={t("campaigns.lore.iconLabel")}>📜</div>
            <h2 id="lore-modal-title" className="modal-title">{t("campaigns.lore.modalTitle")}</h2>
            <div className="modal-lore">
              <ReactMarkdown>{selectedCampaign.lore}</ReactMarkdown>
            </div>
            <button type="button" className="btn btn-primary" onClick={closeModal}>
              {t("campaigns.lore.beginChapter", {
                number: selectedCampaign.chapterNumber,
              })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}