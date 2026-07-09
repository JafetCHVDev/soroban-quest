import React from "react";
import "./Achievements.css";

import { BADGES } from "../systems/gameEngine";
import { useGameState } from "../systems/GameStateContext";
import { useTranslation } from "../i18n/useTranslation";
import useDocumentTitle from "../systems/useDocumentTitle";

export default function Achievements() {
  useDocumentTitle("Achievements");
  const { progress, profile } = useGameState();
  const { t } = useTranslation();

  const unlockedCount = BADGES.filter((badge) =>
    progress.badges.includes(badge.id)
  ).length;
  const completion = Math.round((unlockedCount / BADGES.length) * 100);

  return (
    <div id="main-content" className="achievements-page">
      <header className="achievements-header">
        <div>
          <p className="achievements-kicker">{t("achievements.kicker")}</p>
          <h1>{t("achievements.title")}</h1>
          <p>{t("achievements.subtitle", { name: profile.name })}</p>
        </div>

        <div className="achievements-summary" aria-label={t("achievements.summaryAria")}>
          <strong>{unlockedCount}/{BADGES.length}</strong>
          <span>{t("achievements.unlocked")}</span>
        </div>
      </header>

      <section className="achievements-progress" aria-label={t("achievements.progressAria")}>
        <div className="achievements-progress-label">
          <span>{t("achievements.progress")}</span>
          <span>{completion}%</span>
        </div>
        <div className="achievements-progress-track">
          <div
            className="achievements-progress-fill"
            style={{ width: `${completion}%` }}
          />
        </div>
      </section>

      <section className="achievements-grid" aria-label={t("achievements.gridAria")}>
        {BADGES.length === 0 ? (
          <div className="card text-center p-12">
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>
              🏅
            </div>
            <p className="text-secondary">{t("achievements.empty")}</p>
          </div>
        ) : (
          BADGES.map((badge) => {
            const isUnlocked = progress.badges.includes(badge.id);
            return (
              <article
                key={badge.id}
                className={`achievement-card ${isUnlocked ? "unlocked" : "locked"}`}
              >
                <div className="achievement-icon" aria-hidden="true">
                  {isUnlocked ? badge.icon : "?"}
                </div>
                <div className="achievement-content">
                  <div className="achievement-title-row">
                    <h2>{t(`badges.${badge.id}.name`)}</h2>
                    <span className={`achievement-status ${isUnlocked ? "unlocked" : "locked"}`}>
                      {isUnlocked ? t("common.unlocked") : t("common.locked")}
                    </span>
                  </div>
                  <p>{t(`badges.${badge.id}.description`)}</p>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
