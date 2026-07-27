import React from "react";
import { Link } from "react-router-dom";
import "./Leaderboard.css";

import { useGameState } from "../systems/GameStateContext";
import { useTranslation } from "../i18n/useTranslation";
import useDocumentTitle from "../systems/useDocumentTitle";

export default function Leaderboard() {
  useDocumentTitle("Leaderboard");
  const { profiles, activeProfileId, switchProfile } = useGameState();
  const { t } = useTranslation();

  const rankedProfiles = [...profiles].sort((a, b) => {
    if (b.progress.xp !== a.progress.xp) return b.progress.xp - a.progress.xp;
    if (b.progress.level !== a.progress.level) return b.progress.level - a.progress.level;
    return (b.progress.completedMissions || []).length - (a.progress.completedMissions || []).length;
  });

  const topProfile = rankedProfiles[0];

  return (
    <div id="main-content" className="leaderboard-page">
      <header className="leaderboard-header">
        <div>
          <p className="leaderboard-kicker">{t("leaderboard.kicker")}</p>
          <h1>{t("leaderboard.title")}</h1>
          <p>{t("leaderboard.subtitle")}</p>
        </div>

        <Link to="/profile" className="btn btn-secondary">
          {t("leaderboard.manageProfiles")}
        </Link>
      </header>

      {topProfile && (
        <section className="leaderboard-champion" aria-label={t("leaderboard.championAria")}>
          <div className="leaderboard-champion-rank">#1</div>
          <div className="leaderboard-champion-avatar" aria-hidden="true">
            {topProfile.profile.avatar}
          </div>
          <div>
            <h2>{topProfile.profile.name}</h2>
            <p>
              {t("leaderboard.championSummary", {
                level: topProfile.progress.level,
                xp: topProfile.progress.xp,
                missions: (topProfile.progress.completedMissions || []).length,
              })}
            </p>
          </div>
        </section>
      )}

      <section className="leaderboard-table-card" aria-labelledby="leaderboard-table-heading">
        <div className="leaderboard-table-header">
          <h2 id="leaderboard-table-heading">{t("leaderboard.tableTitle")}</h2>
          <span>
            {t("leaderboard.profileCount", {
              count: rankedProfiles.length,
            })}
          </span>
        </div>

        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>{t("leaderboard.headers.rank")}</th>
                <th>{t("leaderboard.headers.adventurer")}</th>
                <th>{t("leaderboard.headers.level")}</th>
                <th>{t("leaderboard.headers.xp")}</th>
                <th>{t("leaderboard.headers.missions")}</th>
                <th>{t("leaderboard.headers.badges")}</th>
                <th>{t("leaderboard.headers.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rankedProfiles.map((slot, index) => {
                const rank = index + 1;
                const isActive = slot.id === activeProfileId;

                return (
                  <tr key={slot.id} className={isActive ? "active-row" : ""}>
                    <td className="rank-cell">#{rank}</td>
                    <td className="adventurer-cell">
                      <span className="avatar" aria-hidden="true">
                        {slot.profile.avatar}
                      </span>
                      <span className="name">{slot.profile.name}</span>
                      {isActive && <span className="active-badge">{t("common.active")}</span>}
                    </td>
                    <td>{slot.progress.level}</td>
                    <td className="xp-cell">{slot.progress.xp} XP</td>
                    <td>{(slot.progress.completedMissions || []).length}</td>
                    <td>{(slot.progress.badges || []).length}</td>
                    <td>
                      {isActive ? (
                        <span className="current-profile-label">{t("leaderboard.current")}</span>
                      ) : (
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => switchProfile(slot.id)}
                        >
                          {t("leaderboard.switch")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
