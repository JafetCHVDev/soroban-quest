import React, { useState, useRef } from "react";
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

export default function Profile() {
  const [state, setState] = useState(loadProgress());

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
    setTimeout(() => setImportStatus(""), 3000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newState = await importProgress(file);
      setState(newState);
      setImportStatus("✅ Progress imported successfully!");
    } catch {
      setImportStatus("❌ Invalid file — could not import.");
    }

    setTimeout(() => setImportStatus(""), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all progress? This cannot be undone.")) {
      const newState = resetProgress();
      setState(newState);
      setImportStatus("🗑️ Progress reset.");
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
                {xpProgress.current} / {xpProgress.needed} XP
              </span>
              <span>Total: {state.xp} XP</span>
            </div>
          </div>

          {/* EDIT BUTTON */}
          <button className="btn btn-secondary mt-3" onClick={openEdit}>
            ✏️ Edit Profile
          </button>
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
              Missions
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              {state.badges.length}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Badges
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PANEL */}
      {editing && (
        <div className="card mt-4">
          <h3 className="mb-3">Edit Profile</h3>

          {/* NAME */}
          <input
            className="w-full p-2 mb-3 rounded"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />

          {/* AVATARS */}
          <div className="grid grid-cols-6 gap-2 mb-3">
            {avatars.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className="text-2xl p-2 rounded transition"
                style={{
                  backgroundColor: avatar === a ? "var(--cyan-dim)" : "var(--bg-glass)",
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
              Save
            </button>

            <button className="btn btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* BADGES */}
      <h2 className="profile-section-title">🏅 Badges</h2>

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
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* MISSIONS */}
      <h2 className="profile-section-title">✅ Completed Missions</h2>

      {completedMissions.length === 0 ? (
        <div className="card text-center p-6">No missions completed yet.</div>
      ) : (
        completedMissions.map((m) => (
          <div key={m.id} className="card flex justify-between">
            <span>{m.title}</span>
            <span className="text-gold">+{m.xpReward} XP</span>
          </div>
        ))
      )}

      {/* DATA */}
      <h2 className="profile-section-title">⚙️ Data</h2>

      <div className="profile-actions">
        <button className="btn btn-secondary" onClick={handleExport}>
          Export
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </button>

        <button className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={handleReset}>
          Reset
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
