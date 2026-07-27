/* ==========================================
   Campaign System — Grouped mission chapters
   with lore, progression gates, hero images
   ========================================== */

import React, { useState, useEffect, useMemo, useRef } from "react";

import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { missions, localizeMissions } from "../data/missions";
import { campaigns, localizeCampaigns, getCampaignProgress } from "../data/campaigns";
import { loadProgress } from "../systems/storage";
import { isMissionUnlocked } from "../systems/missionLoader";
import { getLevelFromXP } from "../systems/gameEngine";
import { useTranslation } from "../i18n/useTranslation";
import { Campaign } from "../types";

import "./Campaigns.css";
import useDocumentTitle from '../systems/useDocumentTitle';

export default function Campaigns() {
  const { t, language } = useTranslation();
  useDocumentTitle('Campaigns');
  const [progress, setProgress] = useState(() => loadProgress());
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
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
  const loreModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);
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
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(
      modalElement.querySelectorAll<HTMLElement>(focusableSelectors)
    );

    if (focusableElements.length === 0) return;

    // Auto-focus the close button or first available interactive element inside modal
    const closeBtn = focusableElements.find(
      (el) =>
        el.classList.contains("modal-close-btn") ||
        el.getAttribute("aria-label") === t("campaigns.loreModal.close"),
    );

    if (closeBtn) {
      closeBtn.focus();
    } else {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowLoreModal(false);
        return;
      }

      if (e.key !== "Tab") return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

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

    const handleEventKey = (e: Event) => handleKeyDown(e as KeyboardEvent);
    modalElement.addEventListener("keydown", handleEventKey);
    return () => modalElement.removeEventListener("keydown", handleEventKey);
  }, [showLoreModal, t]);

  useEffect(() => {
    const hasSeenCampaigns = localStorage.getItem("soroban_seen_campaigns");
    if (!hasSeenCampaigns) {
      setFirstVisit(true);
      localStorage.setItem("soroban_seen_campaigns", "true");
    }
  }, []);

  const totalMissionsCompleted = (progress.completedMissions || []).length;
  const currentLevel = getLevelFromXP(progress.xp);

  const getCampaignStatus = (campaign: Campaign) => {
    const minMissions = campaign.requiredMissionsCompleted || 0;
    const minLevel = campaign.requiredLevel || 1;

    const missionsOk = totalMissionsCompleted >= minMissions;
    const levelOk = currentLevel >= minLevel;

    return {
      unlocked: missionsOk && levelOk,
      reason: !missionsOk
        ? t("campaigns.lockReason.missions", { count: minMissions })
        : !levelOk
        ? t("campaigns.lockReason.level", { level: minLevel })
        : null,
    };
  };

  const getCampaignMissions = (missionIds: string[]) => {
    return (missionIds || [])
      .map((id) => localizedMissions.find((m) => m.id === id))
      .filter(Boolean) as typeof localizedMissions;
  };

  if (loading) {
    return (
      <div className="campaigns-page">
        <div className="campaigns-header fade-in">
          <div
            className="skeleton"
            style={{ width: "240px", height: "36px", marginBottom: "0.5rem" }}
          />
          <div className="skeleton" style={{ width: "380px", height: "20px" }} />
        </div>
        <div
          className="campaigns-grid"
          style={{ display: "grid", gap: "1.5rem", marginTop: "2rem" }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "220px", borderRadius: "16px" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="main-content" className="campaigns-page">
      {firstVisit && (
        <div className="campaigns-intro-banner">
          <div className="banner-content">
            <span className="banner-icon">📜</span>
            <div>
              <h3>{t("campaigns.banner.title")}</h3>
              <p>{t("campaigns.banner.subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setFirstVisit(false)}
            aria-label={t("campaigns.banner.dismiss")}
          >
            ✕
          </button>
        </div>
      )}

      <div className="campaigns-header">
        <h1>🗺️ {t("campaigns.title")}</h1>
        <p>{t("campaigns.subtitle")}</p>
      </div>

      <div className="campaigns-grid">
        {localizedCampaigns.map((campaign) => {
          const status = getCampaignStatus(campaign);
          const cpProgress = getCampaignProgress(campaign.id, progress.completedMissions || []);
          const isSelected = selectedCampaignId === campaign.id;

          return (
            <div
              key={campaign.id}
              className={`campaign-card ${status.unlocked ? "unlocked" : "locked"} ${
                isSelected ? "selected" : ""
              } ${cpProgress.percentage === 100 ? "completed" : ""}`}
              onClick={() => {
                if (status.unlocked) {
                  setSelectedCampaignId(isSelected ? null : campaign.id);
                }
              }}
            >
              <div
                className="campaign-hero-bg"
                style={{ backgroundImage: `url(${campaign.heroImage})` }}
              >
                <div className="campaign-hero-overlay" />
                <div className="campaign-header-content">
                  <div className="campaign-icon">{campaign.icon}</div>
                  <div className="campaign-badges">
                    <span className={`difficulty-badge ${campaign.difficulty}`}>
                      {t(`campaigns.difficulty.${campaign.difficulty}`)}
                    </span>
                    {cpProgress.percentage === 100 && (
                      <span className="completed-badge">
                        ✓ {t("campaigns.status.completed")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="campaign-body">
                <h3>{campaign.title}</h3>
                <p className="campaign-desc">{campaign.description}</p>

                <div className="campaign-progress-bar-wrapper">
                  <div className="progress-label">
                    <span>
                      {cpProgress.completed}/{cpProgress.total}{" "}
                      {t("campaigns.missionsCount")}
                    </span>
                    <span>{cpProgress.percentage}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${cpProgress.percentage}%` }}
                    />
                  </div>
                </div>

                {!status.unlocked && (
                  <div className="lock-overlay">
                    <span className="lock-icon">🔒</span>
                    <span className="lock-reason">{status.reason}</span>
                  </div>
                )}

                {status.unlocked && (
                  <div className="campaign-actions">
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaignId(campaign.id);
                        setShowLoreModal(true);
                      }}
                    >
                      📖 {t("campaigns.viewLore")}
                    </button>
                    <button
                      type="button"
                      className={`btn-primary btn-sm ${isSelected ? "active" : ""}`}
                    >
                      {isSelected
                        ? t("campaigns.hideMissions")
                        : t("campaigns.viewMissions")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCampaign && !showLoreModal && (
        <div className="campaign-detail-section">
          <div className="detail-header">
            <h2>
              {selectedCampaign.icon} {selectedCampaign.title} —{" "}
              {t("campaigns.detailTitle")}
            </h2>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setSelectedCampaignId(null)}
            >
              ✕ {t("campaigns.close")}
            </button>
          </div>

          <div className="campaign-missions-list">
            {getCampaignMissions(selectedCampaign.missionIds || selectedCampaign.missions || []).map((m, index) => {
              const isCompleted = (progress.completedMissions || []).includes(m.id);
              const unlocked = isMissionUnlocked(
                m.id,
                progress.completedMissions || [],
              );

              return (
                <div
                  key={m.id}
                  className={`campaign-mission-item ${
                    isCompleted ? "completed" : unlocked ? "unlocked" : "locked"
                  }`}
                >
                  <div className="mission-step-number">{index + 1}</div>
                  <div className="mission-info">
                    <h4>{m.title}</h4>
                    <p>{m.learningGoal}</p>
                    <div className="mission-meta">
                      <span className={`diff-tag ${m.difficulty}`}>{m.difficulty}</span>
                      <span className="xp-tag">+{m.xpReward} XP</span>
                    </div>
                  </div>

                  <div className="mission-action">
                    {unlocked ? (
                      <Link
                        to={`/mission/${m.id}`}
                        className={`btn ${
                          isCompleted ? "btn-secondary" : "btn-primary"
                        }`}
                      >
                        {isCompleted
                          ? t("campaigns.replay")
                          : t("campaigns.start")}
                      </Link>
                    ) : (
                      <span className="locked-tag">
                        🔒 {t("campaigns.status.locked")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showLoreModal && selectedCampaign && (
        <div
          className="lore-modal-overlay"
          onClick={() => setShowLoreModal(false)}
        >
          <div
            className="lore-modal-card"
            ref={loreModalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("campaigns.loreModal.title", {
              title: selectedCampaign.title,
            })}
          >
            <div
              className="lore-modal-hero"
              style={{ backgroundImage: `url(${selectedCampaign.heroImage})` }}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowLoreModal(false)}
                aria-label={t("campaigns.loreModal.close")}
              >
                ✕
              </button>
              <div className="lore-hero-text">
                <span className="lore-icon">{selectedCampaign.icon}</span>
                <h2>{selectedCampaign.title}</h2>
              </div>
            </div>

            <div className="lore-modal-body markdown-body">
              <ReactMarkdown>{selectedCampaign.lore}</ReactMarkdown>
            </div>

            <div className="lore-modal-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowLoreModal(false)}
              >
                {t("campaigns.loreModal.gotIt")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}