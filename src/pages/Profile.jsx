import React, { useState, useRef } from 'react';
import { loadProgress, saveProgress, exportProgress, importProgress, resetProgress } from '../systems/storage';
import { getXPProgress, getRankTitle, BADGES, getDefaultState } from '../systems/gameEngine';
import { getAllMissions } from '../systems/missionLoader';

export default function Profile() {
    const [state, setState] = useState(loadProgress());
    const [importStatus, setImportStatus] = useState('');
    const fileInputRef = useRef(null);
    const xpProgress = getXPProgress(state);
    const rankTitle = getRankTitle(state.level);
    const missions = getAllMissions();

    const handleExport = () => {
        exportProgress();
        setImportStatus('✅ Progress exported!');
        setTimeout(() => setImportStatus(''), 3000);
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const newState = await importProgress(file);
            setState(newState);
            setImportStatus('✅ Progress imported successfully!');
        } catch (err) {
            setImportStatus('❌ Invalid file — could not import.');
        }
        setTimeout(() => setImportStatus(''), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            const newState = resetProgress();
            setState(newState);
            setImportStatus('🗑️ Progress reset.');
            setTimeout(() => setImportStatus(''), 3000);
        }
    };

    const completedMissions = missions.filter(m => state.completedMissions.includes(m.id));

    return (
        <div className="profile-page">
            {/* Header Card */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {state.level}
                </div>
                <div className="profile-info" style={{ flex: 1 }}>
                    <h1 className="profile-name">Stellar Guardian</h1>
                    <div className="profile-rank">{rankTitle}</div>
                    <div className="xp-bar-container">
                        <div className="xp-bar-track">
                            <div className="xp-bar-fill" style={{ width: `${xpProgress.percentage}%` }} />
                        </div>
                        <div className="xp-bar-label">
                            <span>{xpProgress.current} / {xpProgress.needed} XP to Level {state.level + 1}</span>
                            <span>Total: {state.xp} XP</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--cyan-dim)',
                        border: '1px solid rgba(6, 214, 160, 0.2)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--cyan)' }}>
                            {state.completedMissions.length}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Missions</div>
                    </div>
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--gold-dim)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold)' }}>
                            {state.badges.length}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Badges</div>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <h2 className="profile-section-title">🏅 Badges</h2>
            <div className="profile-badges-grid">
                {BADGES.map(badge => {
                    const earned = state.badges.includes(badge.id);
                    return (
                        <div key={badge.id} className={`profile-badge-card ${earned ? 'earned' : 'locked'}`}>
                            <div className="profile-badge-icon" style={{
                                background: earned ? 'var(--gold-dim)' : 'var(--bg-tertiary)',
                                border: earned ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                            }}>
                                {badge.icon}
                            </div>
                            <div className="profile-badge-info">
                                <h4>{badge.name}</h4>
                                <p>{badge.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Completed Missions */}
            <h2 className="profile-section-title">✅ Completed Missions</h2>
            {completedMissions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No missions completed yet. Start your quest!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-2xl)' }}>
                    {completedMissions.map((m) => (
                        <div key={m.id} className="card" style={{ padding: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{m.title}</strong>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
                                    Chapter {m.chapter}
                                </span>
                            </div>
                            <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>
                                +{m.xpReward} XP
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <h2 className="profile-section-title">⚙️ Data Management</h2>
            <div className="profile-actions">
                <button className="btn btn-secondary" onClick={handleExport}>
                    📤 Export Progress
                </button>
                <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                    📥 Import Progress
                </button>
                <button className="btn btn-ghost" onClick={handleReset} style={{ color: 'var(--red)' }}>
                    🗑️ Reset All
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleImport}
                />
            </div>
            {importStatus && (
                <p style={{ marginTop: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {importStatus}
                </p>
            )}
        </div>
    );
}
