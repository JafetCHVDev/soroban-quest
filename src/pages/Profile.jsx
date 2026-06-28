import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

import {
  importProgress,
  exportProgress,
  resetProgress,
  loadProfile,
  saveProfile,
  readAndValidateFile,
  getDefaultState,
  defaultProfile,
} from "../systems/storage";

import { getXPProgress, BADGES } from "../systems/gameEngine";
import { getAllMissions } from "../systems/missionLoader";
import { avatars } from "../data/avatars";

// Hooks and Utilities
import { useToast } from "../systems/ToastContext";
import { useGameState } from "../systems/GameStateContext";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";
import useDocumentTitle from '../systems/useDocumentTitle';
import { useTranslation } from "../i18n/useTranslation";

// Total rank entries: 0..10. Anything >= 10 maps to the last rank.
const MAX_RANK_INDEX = 10;

export default function Profile() {
  useDocumentTitle('Profile');
  const { showToast } = useToast();
  const { t, language } = useTranslation();
  const {
    progress: state,
    profile,
    updateProgress,
    updateProfile,
    resetProgress,
  } = useGameState();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const [avatar, setAvatar] = useState(profile.avatar || "🛡️");

  const [importStatus, setImportStatus] = useState("");
  const fileInputRef = useRef(null);

  const [importPreview, setImportPreview] = useState(null);

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

    updateProfile(updated);
    setEditing(false);

    // Trigger global success toast alert
    showToast("Profile layout saved successfully!", "success");
  };

  const openEdit = () => {
    setName(profile.name);
    setAvatar(profile.avatar);
    setEditing(true);
  };

  /* ---------------- PROGRESS ACTIONS ---------------- */
  const handleExport = async () => {
    await exportProgress();
    setImportStatus(" Progress exported!");
    
    // Trigger global success toast alert
    showToast("Progress configuration data exported!", "success");
    showToast(t("profile.data.status.exported"), "success");
    setImportStatus(t("profile.data.status.exported"));
    logActivity(ACTIVITY_TYPES.EXPORT, {}, t("profile.data.log.exported"));

    setTimeout(() => setImportStatus(""), 3000);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await readAndValidateFile(file);
    
    if (result.success) {
      setImportPreview(result.data);
    } else {
      setImportStatus("Invalid file — could not import.");
      showToast(result.errors.join("\n"), "error");
      showToast(t("profile.data.status.importFailed"), "error");
      setImportStatus(t("profile.data.status.importFailed"));
      setTimeout(() => setImportStatus(""), 3000);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmImport = async () => {
    if (!importPreview) return;

    try {
      await importProgress(importPreview);
      if (importPreview.state) {
        updateProgress(importPreview.state);
      }
      if (importPreview.profile) {
        updateProfile(importPreview.profile);
      }
      setImportStatus("Progress imported successfully!");
      
      // Trigger global success toast alert
      showToast("Progress state imported successfully!", "success");
      showToast(t("profile.data.status.imported"), "success");
      setImportStatus(t("profile.data.status.imported"));
      logActivity(ACTIVITY_TYPES.IMPORT, {}, t("profile.data.log.imported"));
    } catch {
      setImportStatus("Invalid file — could not import.");
      showToast("Could not parse file. Verify structure format.", "error");
      showToast(t("profile.data.status.importFailed"), "error");
      setImportStatus(t("profile.data.status.importFailed"));
    }

    setImportPreview(null);
    setTimeout(() => setImportStatus(""), 3000);
  };

  const cancelImport = () => {
    setImportPreview(null);
  };

  const handleReset = async () => {
    const confirmed = await resetProgress();
    if (confirmed) {
      setImportStatus("🗑️ Progress reset.");
      
      // Trigger global warning toast alert
      showToast("All missions, XP levels, and badges have been cleared.", "warning");
      showToast(t("profile.data.status.resetDone"), "warning");
      setImportStatus(t("profile.data.status.resetDone"));
      setTimeout(() => setImportStatus(""), 3000);
    }
  };

  const completedMissions = missions.filter((m) =>
    state.completedMissions.includes(m.id)
  );

  return (
    <div id="main-content" className="profile-page">
      {/* HEADER */}
      <div className="profile-header">
        {/* AVATAR */}
        <div className="profile-avatar text-5xl" role="img" aria-label={`Active avatar character: ${profile.avatar}`}>
          {profile.avatar}
        </div>

        {/* INFO */}
        <div className="profile-info" style={{ flex: 1 }}>
          <h1 className="profile-name">
            <span className="sr-only">Adventurer Name: </span>
            {profile.name}
          </h1> 

          <div className="profile-rank">
            <span className="sr-only">Rank Title: </span>
            {rankTitle}
          </div>

          <div className="xp-bar-container" aria-label={`XP progress bar: ${xpProgress.percentage}% complete`}>
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
            <button type="button" className="btn btn-secondary" onClick={openEdit}>
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
          role="region"
          aria-label="Adventurer stats dashboard"
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
        <div className="card mt-4" role="form" aria-labelledby="edit-profile-heading">
          <h3 id="edit-profile-heading" className="mb-3">{t("profile.editPanel.title")}</h3>

          {/* NAME */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label htmlFor="profile-name-edit-input" className="text-sm font-semibold">
              {t("profile.editPanel.nameLabel")}
            </label>
            <input
              id="profile-name-edit-input"
              className="w-full p-2 mb-3 rounded"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("profile.editPanel.namePlaceholder")}
            />
          </div>

          {/* AVATARS */}
          <fieldset className="mb-3" style={{ border: "none", padding: 0, margin: 0 }}>
            <legend className="text-sm font-semibold mb-2">{t("profile.editPanel.avatarLegend")}</legend>
            <div className="grid grid-cols-6 gap-2">
              {avatars.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setAvatar(a)}
                  className="text-2xl p-2 rounded transition"
                  aria-label={t("profile.aria.selectAvatar", { avatar: a })}
                  aria-pressed={avatar === a}
                  style={{
                    backgroundColor: avatar === a ? "var(--cyan-dim)" : "var(--bg-glass)",
                    transform: avatar === a ? "scale(1.1)" : "none",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </fieldset>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={saveUserProfile}>
              {t("common.save")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* BADGES */}
      <h2 className="profile-section-title">{t("profile.sections.badges")}</h2>

      <div className="profile-badges-grid" role="region" aria-label="Badges progression collection">
        {BADGES.map((badge) => {
          const earned = state.badges.includes(badge.id);

          return (
            <div
              key={badge.id}
              className={`profile-badge-card ${earned ? "earned" : "locked"}`}
              aria-label={`Badge record: ${badge.name}. Description: ${badge.description}. Status: ${earned ? 'Earned' : 'Locked'}`}
            >
              <div className="profile-badge-icon" aria-hidden="true">{badge.icon}</div>
              <div className="profile-badge-info" aria-hidden="true">
                <h4>{t(`badges.${badge.id}.name`)}</h4>
                <p>{t(`badges.${badge.id}.description`)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPLETED MISSIONS LIST */}
      <h2 className="profile-section-title">{t("profile.sections.completedMissions")}</h2>
      <div className="flex flex-col gap-2" role="region" aria-label={t("profile.aria.completedListing")}>
        {completedMissions.length === 0 ? (
          <div className="card text-center p-6" role="status">{t("profile.noMissions")}</div>
        ) : (
          completedMissions.map((m) => (
            <div key={m.id} className="card flex justify-between" aria-label={t("profile.aria.completedEntry", { title: m.title, xp: m.xpReward })}>
              <span aria-hidden="true">{m.title}</span>
              <span className="text-gold" aria-hidden="true">+{m.xpReward} XP</span>
            </div>
          ))
        )}
      </div>

      {/* CONFIGURATION DATA MANAGEMENT */}
      <h2 className="profile-section-title">{t("profile.sections.data")}</h2>
      <div className="profile-actions" role="group" aria-label="Game progress backup controls">
        <button type="button" className="btn btn-secondary" onClick={handleExport}>
          {t("profile.data.export")}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          {t("profile.data.import")}
        </button>
        
        <button type="button" className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={handleReset}>
          {t("profile.data.reset")}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          id="progress-import-hidden-file"
          accept=".json,.json.gz"
          hidden
          onChange={handleFileSelect}
          aria-label="Hidden file progress backup uploader tool"
        />
      </div>

      {importStatus && (
        <p className="mt-3 text-sm text-gray-400">{importStatus}</p>
      )}

      {/* IMPORT PREVIEW MODAL */}
      {importPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Import Preview</h3>
            
            {importPreview.state && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Game State</h4>
                <ul className="list-disc list-inside text-sm">
                  <li>XP: {importPreview.state.xp}</li>
                  <li>Level: {importPreview.state.level}</li>
                  <li>Completed Missions: {importPreview.state.completedMissions?.length || 0}</li>
                  <li>Badges: {importPreview.state.badges?.length || 0}</li>
                  <li>Skill Points: {importPreview.state.skillPoints?.length || 0}</li>
                </ul>
              </div>
            )}
            
            {importPreview.profile && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Profile</h4>
                <ul className="list-disc list-inside text-sm">
                  <li>Name: {importPreview.profile.name}</li>
                  <li>Avatar: {importPreview.profile.avatar}</li>
                </ul>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <button type="button" className="btn btn-primary" onClick={confirmImport}>
                Confirm Import
              </button>
              <button type="button" className="btn btn-ghost" onClick={cancelImport}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}