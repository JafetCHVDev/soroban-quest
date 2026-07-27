import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProgress } from '../systems/storage';
import { getAllMissions, isMissionUnlocked } from '../systems/missionLoader';
import { useTranslation } from '../i18n/useTranslation';
import useDocumentTitle from '../systems/useDocumentTitle';
import "./MissionMap.css";
import { getXPProgress, getLevelFromXP, xpForLevel, getRankTitle } from "../systems/gameEngine";

function getMissionCompletionRatio(completed: number, total: number): number {
    if (!total) return 0;
    return Math.min(Math.max((completed / total) * 100, 0), 100);
}

function formatLevel(progressState: any, fallbackLevel = 1): number {
    if (typeof progressState?.level === 'number' && progressState.level > 0) return progressState.level;
    return getLevelFromXP(progressState?.xp ?? 0) || fallbackLevel;
}

function formatCurrentLevelProgressPercent(progressState: any): number {
    const level = formatLevel(progressState);
    const nextLevelXP = xpForLevel(level + 1);
    const currentLevelXP = xpForLevel(level);
    const xp = progressState?.xp ?? 0;
    const denom = Math.max(nextLevelXP - currentLevelXP, 1);
    return Math.min(Math.max(((xp - currentLevelXP) / denom) * 100, 0), 100);
}

export default function MissionMap() {
    useDocumentTitle('Mission Map');
    const navigate = useNavigate();
    const state = loadProgress();
    const { t, language } = useTranslation();
    const missions = useMemo(() => getAllMissions(language), [language]);
    const learningPathRef = useRef<HTMLDivElement>(null);
    const [learningPathWidth, setLearningPathWidth] = useState(800);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedChapter, setSelectedChapter] = useState('all');

    const chapters = useMemo(() => {
        return [...new Set(missions.map((m) => m.chapter))].sort((a, b) => a - b);
    }, [missions]);

    const missionStates = useMemo(() => {
        return missions.map((m) => ({
            ...m,
            completed: (state.completedMissions || []).includes(m.id),
            unlocked: isMissionUnlocked(m.id, state.completedMissions || []),
        }));
    }, [missions, state.completedMissions]);

    const filteredMissions = useMemo(() => {
        return missionStates.filter((mission) => {
            const matchesSearch = searchTerm === '' ||
                (mission.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (mission.learningGoal || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDifficulty = selectedDifficulty === 'all' || mission.difficulty === selectedDifficulty;
            const matchesChapter = selectedChapter === 'all' || mission.chapter === Number(selectedChapter);
            return matchesSearch && matchesDifficulty && matchesChapter;
        });
    }, [missionStates, searchTerm, selectedDifficulty, selectedChapter]);

    useEffect(() => {
        const handleResize = () => {
            if (learningPathRef.current) {
                setLearningPathWidth(learningPathRef.current.offsetWidth);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const completedCount = (state.completedMissions || []).length;
    const totalCount = missions.length;
    const completionPercentage = Math.round(getMissionCompletionRatio(completedCount, totalCount));

    return (
        <div id="main-content" className="mission-map-container">
            {/* Header */}
            <div className="mission-map-header">
                <h1 className="mission-map-title">🗺️ {t("missionMap.title")}</h1>
                <p className="mission-map-subtitle">
                    {t("missionMap.subtitle")}
                </p>

                {/* Progress Overview Card */}
                <div className="map-progress-card">
                    <div className="map-progress-stats">
                        <div className="map-stat-item">
                            <span className="map-stat-label">{t("missionMap.stats.overallProgress")}</span>
                            <span className="map-stat-value">{completedCount} / {totalCount} ({completionPercentage}%)</span>
                        </div>
                        <div className="map-stat-item">
                            <span className="map-stat-label">{t("missionMap.stats.level")}</span>
                            <span className="map-stat-value">Lvl {formatLevel(state)} — {getRankTitle(formatLevel(state))}</span>
                        </div>
                        <div className="map-stat-item">
                            <span className="map-stat-label">{t("missionMap.stats.xp")}</span>
                            <span className="map-stat-value">{state.xp} XP</span>
                        </div>
                    </div>

                    <div className="map-progress-bar">
                        <div
                            className="map-progress-fill"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="map-filter-bar">
                <div className="map-search-box">
                    <input
                        type="text"
                        placeholder={t("missionMap.filters.searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="map-search-input"
                    />
                </div>

                <div className="map-filter-group">
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="map-filter-select"
                    >
                        <option value="all">{t("missionMap.filters.allDifficulties")}</option>
                        <option value="beginner">{t("missionMap.filters.beginner")}</option>
                        <option value="intermediate">{t("missionMap.filters.intermediate")}</option>
                        <option value="advanced">{t("missionMap.filters.advanced")}</option>
                    </select>

                    <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        className="map-filter-select"
                    >
                        <option value="all">{t("missionMap.filters.allChapters")}</option>
                        {chapters.map((ch) => (
                            <option key={ch} value={ch}>
                                {t("missionMap.chapter", { number: ch })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Visual Learning Path View */}
            <div className="learning-path-wrapper" ref={learningPathRef}>
                <h2 className="section-heading">⚡ {t("missionMap.sections.learningPath")}</h2>
                
                <div className="learning-path-node-container">
                    {missions.map((mission, index) => {
                        const isCompleted = (state.completedMissions || []).includes(mission.id);
                        const isUnlocked = isMissionUnlocked(mission.id, state.completedMissions || []);
                        const isCurrent = isUnlocked && !isCompleted;

                        return (
                            <div
                                key={mission.id}
                                className={`path-node-card ${isCompleted ? 'completed' : isCurrent ? 'current' : 'locked'}`}
                                onClick={() => isUnlocked && navigate(`/mission/${mission.id}`)}
                            >
                                <div className="node-status-indicator">
                                    {isCompleted && '✓'}
                                    {isCurrent && '▶'}
                                    {!isUnlocked && '🔒'}
                                </div>
                                <div className="node-content">
                                    <span className="node-chapter">Chapter {mission.chapter}</span>
                                    <h3 className="node-title">{mission.title}</h3>
                                    <p className="node-goal">{mission.learningGoal}</p>
                                    <div className="node-footer">
                                        <span className={`difficulty-tag ${mission.difficulty}`}>{mission.difficulty}</span>
                                        <span className="xp-badge">+{mission.xpReward} XP</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Grid List View */}
            <div className="missions-grid-section">
                <h2 className="section-heading">📚 {t("missionMap.sections.allMissions")}</h2>
                <div className="missions-grid">
                    {filteredMissions.map((mission) => (
                        <div
                            key={mission.id}
                            className={`mission-card ${mission.completed ? 'completed' : mission.unlocked ? 'unlocked' : 'locked'}`}
                            onClick={() => mission.unlocked && navigate(`/mission/${mission.id}`)}
                        >
                            <div className="card-header">
                                <span className="chapter-badge">Chapter {mission.chapter}</span>
                                <span className={`diff-badge ${mission.difficulty}`}>{mission.difficulty}</span>
                            </div>
                            <h3 className="card-title">{mission.title}</h3>
                            <p className="card-goal">{mission.learningGoal}</p>
                            <div className="card-footer">
                                <span className="reward-tag">+{mission.xpReward} XP</span>
                                <button
                                    className={`btn ${mission.completed ? 'btn-secondary' : mission.unlocked ? 'btn-primary' : 'btn-disabled'}`}
                                    disabled={!mission.unlocked}
                                >
                                    {mission.completed ? t("missionMap.buttons.review") : mission.unlocked ? t("missionMap.buttons.start") : t("missionMap.buttons.locked")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}