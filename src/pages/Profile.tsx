import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

import {
  exportProgress,
  loadProfile,
  saveProfile,
  readAndValidateFile,
  defaultProfile,
} from '../systems/storage';

import { getXPProgress, BADGES } from '../systems/gameEngine';
import { getAllMissions } from '../systems/missionLoader';
import { avatars } from '../data/avatars';
import {
  getVolume,
  setVolume,
  isMuted,
  setMuted,
  playClick,
} from '../systems/soundManager';

// Hooks and Utilities
import { useToast } from '../systems/ToastContext';
import { useGameState } from '../systems/GameStateContext';
import { logActivity, ACTIVITY_TYPES } from '../systems/activityLogger';
import useDocumentTitle from '../systems/useDocumentTitle';
import { useTranslation } from '../i18n/useTranslation';
import { authService } from '../systems/authService';
import { cloudSyncService, getCloudSyncStatus } from '../systems/cloudSync';

// Total rank entries: 0..10. Anything >= 10 maps to the last rank.
const MAX_RANK_INDEX = 10;

export default function Profile() {
  useDocumentTitle('Profile');
  const { showToast } = useToast();
  const { t, language } = useTranslation();
  const {
    progress: state,
    profile,
    profiles,
    activeProfileId,
    maxProfiles,
    updateProgress,
    updateProfile,
    switchProfile,
    createProfile,
    equipItem,
    unequipItem,
    resetProgress,
  } = useGameState();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || '');
  const [avatar, setAvatar] = useState(profile.avatar || '🛡️');

  const [importStatus, setImportStatus] = useState('');
  const fileInputRef = useRef(null);

  const [importPreview, setImportPreview] = useState(null);
  const importModalRef = useRef(null);
  const [authForm, setAuthForm] = useState({ email: '', username: '' });
  const [syncStatus, setSyncStatus] = useState(() => getCloudSyncStatus());
  const [syncMessage, setSyncMessage] = useState(
    'Sign in to sync progress across browsers. Progress stays on this device until you opt in.',
  );

  const xpProgress = getXPProgress(state);
  const rankIndex = Math.min(Math.max(state.level - 1, 0), MAX_RANK_INDEX);
  const rankTitle = t(`ranks.${rankIndex}`);
  const missions = getAllMissions(language);
  const [soundVolume, setSoundVolume] = useState(() => getVolume());
  const [soundMuted, setSoundMuted] = useState(() => isMuted());

  const cancelImport = () => {
    setImportPreview(null);
  };

  // Focus trap for import preview modal
  useEffect(() => {
    if (!importPreview || !importModalRef.current) return;
    const modal = importModalRef.current;
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(modal.querySelectorAll(focusableSelectors));

    const focusable = getFocusable();
    if (focusable.length) focusable[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelImport();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = getFocusable();
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    modal.addEventListener('keydown', handleKeyDown);
    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [importPreview, cancelImport]);

  /* ---------------- SAVE PROFILE ---------------- */
  const saveUserProfile = () => {
    const updated = {
      name: name.trim() || 'Player',
      avatar,
    };

    updateProfile(updated);
    setEditing(false);

    // Trigger global success toast alert
    showToast('Profile layout saved successfully!', 'success');
  };

  const openEdit = () => {
    setName(profile.name);
    setAvatar(profile.avatar);
    setEditing(true);
  };

  const handleCreateProfile = () => {
    const nextNumber = profiles.length + 1;
    createProfile({
      name: t('profile.selector.defaultName', { number: nextNumber }),
      avatar: avatars[(nextNumber - 1) % avatars.length],
    });
    setEditing(true);
  };

  /* ---------------- PROGRESS ACTIONS ---------------- */
  const handleExport = async () => {
    await exportProgress();
    const statusMsg = t('profile.data.status.exported');
    setImportStatus(statusMsg);

    playClick();
    showToast(statusMsg, 'success');
    logActivity(ACTIVITY_TYPES.EXPORT, {}, t('profile.data.log.exported'));

    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await readAndValidateFile(file);

    if (result.success) {
      setImportPreview(result.data);
    } else {
      const errorMsg = t('profile.data.status.importFailed');
      setImportStatus(errorMsg);
      showToast(result.errors.join('\n'), 'error');
      showToast(errorMsg, 'error');
      setTimeout(() => setImportStatus(''), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!importPreview) return;

    try {
      await exportProgress(importPreview); // Note: keeping original storage flow pattern
      if (importPreview.state) {
        updateProgress(importPreview.state);
      }
      if (importPreview.profile) {
        updateProfile(importPreview.profile);
      }

      const successMsg = t('profile.data.status.imported');
      setImportStatus(successMsg);

      showToast('Progress state imported successfully!', 'success');
      showToast(successMsg, 'success');
      logActivity(ACTIVITY_TYPES.IMPORT, {}, t('profile.data.log.imported'));
    } catch {
      const errorMsg = t('profile.data.status.importFailed');
      setImportStatus(errorMsg);
      showToast('Could not parse file. Verify structure format.', 'error');
      showToast(errorMsg, 'error');
    }

    setImportPreview(null);
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleAuthSubmit = async (mode) => {
    try {
      if (mode === 'signup') {
        authService.signUp(authForm.email, authForm.username);
      } else {
        authService.signIn(authForm.email, authForm.username);
      }
      await cloudSyncService.migrateLocalData();
      setSyncStatus(getCloudSyncStatus());
      setSyncMessage('Signed in. Cloud sync is local-first and opt-in.');
      showToast('Signed in for cloud sync', 'success');
    } catch (err) {
      const message = err?.message || 'Could not sign in';
      setSyncMessage(message);
      showToast(message, 'error');
    }
  };

  const handleSyncNow = async () => {
    setSyncStatus('syncing');
    await cloudSyncService.syncLocalToCloud();
    setSyncStatus(getCloudSyncStatus());
    setSyncMessage('Progress sync finished.');
  };

  const handleSignOut = () => {
    authService.signOut();
    setSyncStatus(getCloudSyncStatus());
    setSyncMessage('Signed out. Progress stays on this device.');
  };

  const handleReset = async () => {
    const confirmed = await resetProgress();
    if (confirmed) {
      const resetMsg = t('profile.data.status.resetDone');
      setImportStatus(resetMsg);

      showToast('All missions, XP levels, and badges have been cleared.', 'warning');
      showToast(resetMsg, 'warning');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const handleSoundMute = () => {
    const nextMuted = !soundMuted;
    setMuted(nextMuted);
    setSoundMuted(nextMuted);
    if (!nextMuted) playClick();
  };

  const handleVolumeChange = (e) => {
    const nextVolume = Number(e.target.value);
    setVolume(nextVolume);
    setSoundVolume(nextVolume);
  };

  const completedMissions = missions.filter((m) => state.completedMissions.includes(m.id));

  return (
    <div id="main-content" className="profile-page">
      <section className="profile-selector-panel" aria-labelledby="profile-selector-heading">
        <div>
          <h2 id="profile-selector-heading" className="profile-section-title">
            {t('profile.selector.title')}
          </h2>
          <p className="profile-selector-help">
            {t('profile.selector.help', {
              count: profiles.length,
              max: maxProfiles,
            })}
          </p>
        </div>

        <div className="profile-selector-grid">
          {profiles.map((slot) => {
            const isActive = slot.id === activeProfileId;
            return (
              <button
                key={slot.id}
                type="button"
                className={`profile-selector-card ${isActive ? 'active' : ''}`}
                onClick={() => switchProfile(slot.id)}
                aria-pressed={isActive}
              >
                <span className="profile-selector-avatar" aria-hidden="true">
                  {slot.profile.avatar}
                </span>
                <span className="profile-selector-name">{slot.profile.name}</span>
                <span className="profile-selector-meta">
                  {t('profile.selector.meta', {
                    level: slot.progress.level,
                    xp: slot.progress.xp,
                  })}
                </span>
              </button>
            );
          })}

          {profiles.length < maxProfiles && (
            <button
              type="button"
              className="profile-selector-card create"
              onClick={handleCreateProfile}
            >
              <span className="profile-selector-avatar" aria-hidden="true">
                +
              </span>
              <span className="profile-selector-name">{t('profile.selector.create')}</span>
              <span className="profile-selector-meta">{t('profile.selector.emptySlot')}</span>
            </button>
          )}
        </div>
      </section>

      {/* HEADER */}
      <div className="profile-header">
        {/* AVATAR */}
        <div
          className="profile-avatar text-5xl"
          role="img"
          aria-label={`Active avatar character: ${profile.avatar}`}
        >
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

          <div
            className="xp-bar-container"
            aria-label={`XP progress bar: ${xpProgress.percentage}% complete`}
          >
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${xpProgress.percentage}%` }} />
            </div>

            <div className="xp-bar-label">
              <span>
                {t('profile.xpBar.current', {
                  current: xpProgress.current,
                  needed: xpProgress.needed,
                })}
              </span>
              <span>{t('profile.xpBar.total', { xp: state.xp })}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn btn-secondary" onClick={openEdit}>
              {t('profile.edit')}
            </button>
            <Link to="/journal" className="btn btn-ghost">
              {t('profile.viewJournal')}
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          role="region"
          aria-label="Adventurer stats dashboard"
        >
          <div className="card">
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {state.completedMissions.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {t('profile.stats.missions')}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{state.badges.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {t('profile.stats.badges')}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PANEL */}
      {editing && (
        <div className="card mt-4" role="form" aria-labelledby="edit-profile-heading">
          <h3 id="edit-profile-heading" className="mb-3">
            {t('profile.editPanel.title')}
          </h3>

          {/* NAME */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="profile-name-edit-input" className="text-sm font-semibold">
              {t('profile.editPanel.nameLabel')}
            </label>
            <input
              id="profile-name-edit-input"
              className="w-full p-2 mb-3 rounded"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.editPanel.namePlaceholder')}
            />
          </div>

          {/* AVATARS */}
          <fieldset className="mb-3" style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className="text-sm font-semibold mb-2">
              {t('profile.editPanel.avatarLegend')}
            </legend>
            <div className="grid grid-cols-6 gap-2">
              {avatars.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setAvatar(a)}
                  className="text-2xl p-2 rounded transition"
                  aria-label={t('profile.aria.selectAvatar', { avatar: a })}
                  aria-pressed={avatar === a}
                  style={{
                    backgroundColor: avatar === a ? 'var(--cyan-dim)' : 'var(--bg-glass)',
                    transform: avatar === a ? 'scale(1.1)' : 'none',
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
              {t('common.save')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* BADGES */}
      <h2 className="profile-section-title">{t('profile.sections.badges')}</h2>

      <div className="profile-badges-grid" role="region" aria-label="Badges progression collection">
        {BADGES.map((badge) => {
          const earned = state.badges.includes(badge.id);

          return (
            <div
              key={badge.id}
              className={`profile-badge-card ${earned ? 'earned' : 'locked'}`}
              aria-label={`Badge record: ${badge.name}. Description: ${badge.description}. Status: ${earned ? 'Earned' : 'Locked'}`}
            >
              <div className="profile-badge-icon" aria-hidden="true">
                {badge.icon}
              </div>
              <div className="profile-badge-info" aria-hidden="true">
                <h4>{t(`badges.${badge.id}.name`)}</h4>
                <p>{t(`badges.${badge.id}.description`)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* INVENTORY */}
      <h2 className="profile-section-title">Inventory</h2>
      <div className="profile-badges-grid">
        {(state.inventory?.owned || []).map((itemId) => {
          const isEquipped = state.inventory.equipped.includes(itemId);
          return (
            <div key={itemId} className="card p-4">
              <h4>{itemId}</h4>
              <button
                type="button"
                className={`btn ${isEquipped ? 'btn-ghost' : 'btn-primary'}`}
                onClick={() => isEquipped ? unequipItem(itemId) : equipItem(itemId)}
              >
                {isEquipped ? 'Unequip' : 'Equip'}
              </button>
            </div>
          );
        })}
        {(state.inventory?.owned || []).length === 0 && <p>No items owned.</p>}
      </div>

      {/* COMPLETED MISSIONS LIST */}
      <h2 className="profile-section-title">{t('profile.sections.completedMissions')}</h2>
      <div
        className="flex flex-col gap-2"
        role="region"
        aria-label={t('profile.aria.completedListing')}
      >
        {completedMissions.length === 0 ? (
          <div className="card text-center p-6" role="status">
            {t('profile.noMissions')}
          </div>
        ) : (
          completedMissions.map((m) => (
            <div
              key={m.id}
              className="card flex justify-between"
              aria-label={t('profile.aria.completedEntry', { title: m.title, xp: m.xpReward })}
            >
              <span aria-hidden="true">{m.title}</span>
              <span className="text-gold" aria-hidden="true">
                +{m.xpReward} XP
              </span>
            </div>
          ))
        )}
      </div>

      {/* SOUND SETTINGS */}
      <section className="card profile-sound-card" aria-labelledby="sound-settings-heading">
        <div className="profile-space-between">
          <div>
            <h3 id="sound-settings-heading" className="profile-section-title profile-sound-title" style={{ marginBottom: 0 }}>
              Sound Settings
            </h3>

            <p className="profile-selector-help profile-sound-description">
              Adjust game sound effects and audio feedback.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleSoundMute}
            aria-pressed={soundMuted}
          >
            {soundMuted ? '🔇 Sound Off' : '🔊 Sound On'}
          </button>
        </div>

        <div className="profile-sound-volume">
          <label
            htmlFor="sound-volume"
            className="profile-sound-volume-label"
          >
            <span className="profile-sound-volume-name">Volume</span>
            <span className="profile-sound-volume-value">{Math.round(soundVolume * 100)}%</span>
          </label>

          <input
            id="sound-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundVolume}
            onChange={handleVolumeChange}
            disabled={soundMuted}
            style={{ width: '100%' }}
            aria-label="Sound volume"
          />
        </div>
      </section>

      <div className="card profile-sync-card">
        <div className="profile-space-between">
          <div>
            <h3 className="profile-section-title" style={{ marginBottom: 0 }}>Cloud Sync</h3>
            <p className="profile-selector-help">{syncMessage}</p>
          </div>
          <span className={`sync-status-pill ${syncStatus === "synced" ? "success" : syncStatus === "syncing" ? "syncing" : syncStatus === "offline" ? "offline" : "idle"}`}>
            {syncStatus}
          </span>
        </div>

        <div className="profile-sync-form">
          <input
            className="profile-input-full"
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            className="profile-input-full"
            type="text"
            placeholder="Display name"
            value={authForm.username}
            onChange={(e) => setAuthForm((prev) => ({ ...prev, username: e.target.value }))}
          />

          <div className="flex gap-2 mt-3">
            <button type="button" className="btn btn-secondary" onClick={() => handleAuthSubmit("signin")}>Sign in</button>
            <button type="button" className="btn btn-secondary" onClick={() => handleAuthSubmit("signup")}>Sign up</button>
            <button type="button" className="btn btn-ghost" onClick={handleSyncNow}>Sync now</button>
            {authService.isAuthenticated() && (
              <button type="button" className="btn btn-ghost" onClick={handleSignOut}>Sign out</button>
            )}
          </div>
        </div>
      </div>

      {/* CONFIGURATION DATA MANAGEMENT */}
      <h2 className="profile-section-title">{t('profile.sections.data')}</h2>
      <div className="profile-actions" role="group" aria-label="Game progress backup controls">
        <button type="button" className="btn btn-secondary" onClick={handleExport}>
          {t('profile.data.export')}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          {t('profile.data.import')}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          style={{ color: 'var(--red)' }}
          onClick={handleReset}
        >
          {t('profile.data.reset')}
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

      {importStatus && <p className="mt-3 text-sm text-gray-400">{importStatus}</p>}

      {/* IMPORT PREVIEW MODAL */}
      {importPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="presentation"
          onClick={cancelImport}
        >
          <div
            className="card max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-preview-heading"
            ref={importModalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="import-preview-heading" className="text-xl font-bold mb-4">
              Import Preview
            </h3>

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
