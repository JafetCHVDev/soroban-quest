import React, { useState, useRef } from "react";
// Import the fixed custom layout definitions directly
import "./Profile.css";

import { Link } from "react-router-dom";

import {
  loadProgress,
  importProgress,
  exportProgress,
  resetProgress,
  loadProfile,
  saveProfile,
} from "../systems/storage";

import { getXPProgress, getRankTitle, BADGES } from "../systems/gameEngine";
import { getAllMissions } from "../systems/missionLoader";
import { avatars } from "../data/avatars";

// ✅ FIXED: Correctly matching the named hook export from your ToastContext
import { useToast } from "../systems/ToastContext";

export default function Profile() {
  const [state, setState] = useState(loadProgress());

  // ✅ Initialize the custom system toast notifier hook
  const { showToast } = useToast();

  // ✅ IMPORTANT: safe profile init
  const [profile, setProfile] = useState(() => loadProfile());

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const [avatar, setAvatar] = useState(profile.avatar || "🛡️");

  const [importStatus, setImportStatus] = useState("");
  const fileInputRef = useRef(null);

  const xpProgress = getXPProgress(state);
  const rankTitle = getRankTitle(state.level);
  const missions = getAllMissions();

  /* ---------------- SAVE PROFILE ---------------- */
  const saveUserProfile = () => {
    const updated = {
      name: name.trim() || "Player",
      avatar,
    };

    saveProfile(updated);
    setProfile(updated);
    setEditing(false);

    // ✅ Trigger global success toast alert
    showToast("Profile layout saved successfully!", "success");
  };

  const openEdit = () => {
    setName(profile.name);
    setAvatar(profile.avatar);
    setEditing(true);
  };

  /* ---------------- PROGRESS ACTIONS ---------------- */
  const handleExport = () => {
    exportProgress();
    setImportStatus("✅ Progress exported!");
    
    // ✅ Trigger global success toast alert
    showToast("Progress configuration data exported!", "success");
    setTimeout(() => setImportStatus(""), 3000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newState = await importProgress(file);
      setState(newState);
      setImportStatus("✅ Progress imported successfully!");
      
      // ✅ Trigger global success toast alert
      showToast("Progress state imported successfully!", "success");
    } catch {
      setImportStatus("❌ Invalid file — could not import.");
      
      // ✅ Trigger global error toast alert
      showToast("Could not parse file. Verify structure format.", "error");
    }

    setTimeout(() => setImportStatus(""), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all progress? This cannot be undone.")) {
      const newState = resetProgress();
      setState(newState);
      setImportStatus("🗑️ Progress reset.");
      
      // ✅ Trigger global warning toast alert
      showToast("All missions, XP levels, and badges have been cleared.", "warning");
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
                {xpProgress.current} / {xpProgress.needed} XP needed for next level
              </span>
              <span>Total cumulative: {state.xp} XP</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn btn-secondary" onClick={openEdit}>
              ✏️ Edit Character Profile
            </button>
            <Link to="/journal" className="btn btn-ghost">
              📖 View Quest Journal
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
              Missions Completed
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              {state.badges.length}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Badges Earned
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PANEL */}
      {editing && (
        <div className="card mt-4" role="form" aria-labelledby="edit-profile-heading">
          <h3 id="edit-profile-heading" className="mb-3">Edit Profile</h3>

          {/* NAME INPUT */}
          <input
            className="profile-input-full w-full p-2 mb-3 rounded"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />

          {/* AVATAR SELECTOR WITH NATIVE 6-COLUMN RESPONSIVE GRID */}
          <div className="avatar-grid-6col">
            {avatars.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`avatar-btn-node text-2xl p-2 rounded transition ${
                  avatar === a ? "active" : ""
                }`}
                style={{
                  backgroundColor: avatar === a ? "var(--cyan-dim)" : "var(--bg-glass)",
                  transform: avatar === a ? "scale(1.1)" : "none",
                }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* ACTION BUTTON CONTAINER */}
          <div className="profile-flex-row">
            <button className="btn btn-primary" onClick={saveUserProfile}>
              Save
            </button>

            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              Cancel Changes
            </button>
          </div>
        </div>
      )}

      {/* BADGES */}
      <h2 className="profile-section-title">🏅 Earned Honor Badges</h2>

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
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPLETED MISSIONS LIST */}
      <h2 className="profile-section-title">✅ Completed Missions</h2>

      {completedMissions.length === 0 ? (
        <div className="card text-center p-6">No missions completed yet.</div>
      ) : (
        completedMissions.map((m) => (
          <div key={m.id} className="card profile-space-between">
            <span>{m.title}</span>
            <span className="text-gold">+{m.xpReward} XP</span>
          </div>
        ))
      )}

      {/* CONFIGURATION DATA MANAGEMENT */}
      <h2 className="profile-section-title">⚙️ Data</h2>

      <div className="profile-actions" role="group" aria-label="Game progress backup controls">
        <button type="button" className="btn btn-secondary" onClick={handleExport}>
          Export Progress File
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          Import Progress File
        </button>

        <button type="button" className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={handleReset}>
          Reset Progress
        </button>

        <input
          ref={fileInputRef}
          type="file"
          id="progress-import-hidden-file"
          accept=".json"
          hidden
          onChange={handleImport}
          aria-label="Hidden file progress backup uploader tool"
        />
      </div>

      {importStatus && (
        <p className="mt-3 text-sm text-gray-400">{importStatus}</p>
      )}
    </div>
  );
}