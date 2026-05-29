import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  loadProgress,
  importProgress,
  exportProgress,
  resetProgress,
  loadProfile,
  saveProfile,
} from "../systems/storage";

import { getXPProgress, BADGES } from "../systems/gameEngine";
import { getAllMissions } from "../systems/missionLoader";
import { avatars } from "../data/avatars";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";
import { useTranslation } from "../i18n/useTranslation";

// Total rank entries: 0..10. Anything >= 10 maps to the last rank.
const MAX_RANK_INDEX = 10;

export default function Profile() {
  const { t, language } = useTranslation();

  const [state, setState] = useState(loadProgress());
  const [profile, setProfile] = useState(() => loadProfile());

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const [avatar, setAvatar] = useState(profile.avatar || "🛡️");

  const [importStatus, setImportStatus] = useState("");
  const fileInputRef = useRef(null);

  const xpProgress = getXPProgress(state);
  const rankIndex = Math.min(Math.max(state.level - 1, 0), MAX_RANK_INDEX);
  const rankTitle = t(`ranks.${rankIndex}`);
  const missions = getAllMissions(language);

  /* ---------------- SAVE PROFILE ---------------- */
  const saveUserProfile = () => {
    const updated = {
      name: name.trim() || "Player",
      avatar,
    };

    saveProfile(updated);
    setProfile(updated);

    setEditing(false);
  };

  const openEdit = () => {
    setName(profile.name);
    setAvatar(profile.avatar);
    setEditing(true);
  };

  /* ---------------- PROGRESS ACTIONS ---------------- */
  const handleExport = () => {
    exportProgress();
    setImportStatus(t("profile.data.status.exported"));
    logActivity(ACTIVITY_TYPES.EXPORT, {}, t("profile.data.log.exported"));
    setTimeout(() => setImportStatus(""), 3000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newState = await importProgress(file);
      setState(newState);
      setImportStatus(t("profile.data.status.imported"));
      logActivity(ACTIVITY_TYPES.IMPORT, {}, t("profile.data.log.imported"));
    } catch {
      setImportStatus(t("profile.data.status.importFailed"));
    }

    setTimeout(() => setImportStatus(""), 3000);
  };

  const handleReset = () => {
    if (window.confirm(t("profile.data.confirmReset"))) {
      const newState = resetProgress();
      setState(newState);
      setImportStatus(t("profile.data.status.resetDone"));
      setTimeout(() => setImportStatus(""), 3000);
    }
  };

  const completedMissions = missions.filter((m) =>
    state.completedMissions.includes(m.id),
  );

  return (
    <div className="profile-page">
      {/* HEADER */}
      <div className="profile-header">
        {/* AVATAR */}
        <div className="profile-avatar text-5xl">{profile.avatar}</div>

        {/* INFO */}
        <div className="profile-info" style={{ flex: 1 }}>
          <h1 className="profile-name">{profile.name}</h1>

          <div className="profile-rank">{rankTitle}</div>

          <div className="xp-bar-container">
            <div className="xp-bar-track">
              <div
                className="xp-bar-fill"
                style={{ width: `${xpProgress.percentage}%` }}
              />
            </div>

            <div className="xp-bar-label">
              <span>
                {t("profile.xpBar.current", {
                  current: xpProgress.current,
                  needed: xpProgress.needed,
                })}
              </span>
              <span>{t("profile.xpBar.total", { xp: state.xp })}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-3">
            <button className="btn btn-secondary" onClick={openEdit}>
              {t("profile.edit")}
            </button>
            <Link to="/journal" className="btn btn-ghost">
              {t("profile.viewJournal")}
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <div className="card">
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              {state.completedMissions.length}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              {t("profile.stats.missions")}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              {state.badges.length}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              {t("profile.stats.badges")}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PANEL */}
      {editing && (
        <div className="card mt-4">
          <h3 className="mb-3">{t("profile.editPanel.title")}</h3>

          {/* NAME */}
          <input
            className="w-full p-2 mb-3 rounded"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("profile.editPanel.namePlaceholder")}
          />

          {/* AVATARS */}
          <div className="grid grid-cols-6 gap-2 mb-3">
            {avatars.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className="text-2xl p-2 rounded transition"
                style={{
                  backgroundColor:
                    avatar === a ? "var(--cyan-dim)" : "var(--bg-glass)",
                  transform: avatar === a ? "scale(1.1)" : "none",
                }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={saveUserProfile}>
              {t("common.save")}
            </button>

            <button className="btn btn-ghost" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* BADGES */}
      <h2 className="profile-section-title">{t("profile.sections.badges")}</h2>

      <div className="profile-badges-grid">
        {BADGES.map((badge) => {
          const earned = state.badges.includes(badge.id);

          return (
            <div
              key={badge.id}
              className={`profile-badge-card ${earned ? "earned" : "locked"}`}
            >
              <div className="profile-badge-icon">{badge.icon}</div>
              <div className="profile-badge-info">
                <h4>{t(`badges.${badge.id}.name`)}</h4>
                <p>{t(`badges.${badge.id}.description`)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* MISSIONS */}
      <h2 className="profile-section-title">
        {t("profile.sections.completedMissions")}
      </h2>

      {completedMissions.length === 0 ? (
        <div className="card text-center p-6">{t("profile.noMissions")}</div>
      ) : (
        completedMissions.map((m) => (
          <div key={m.id} className="card flex justify-between">
            <span>{m.title}</span>
            <span className="text-gold">+{m.xpReward} XP</span>
          </div>
        ))
      )}

      {/* DATA */}
      <h2 className="profile-section-title">{t("profile.sections.data")}</h2>

      <div className="profile-actions">
        <button className="btn btn-secondary" onClick={handleExport}>
          {t("profile.data.export")}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          {t("profile.data.import")}
        </button>

        <button
          className="btn btn-ghost"
          style={{ color: "var(--red)" }}
          onClick={handleReset}
        >
          {t("profile.data.reset")}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          hidden
          onChange={handleImport}
        />
      </div>

      {importStatus && (
        <p className="mt-3 text-sm text-gray-400">{importStatus}</p>
      )}
    </div>
  );
}
