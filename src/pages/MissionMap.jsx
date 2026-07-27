import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProgress } from '../systems/storage';
import { getAllMissions, isMissionUnlocked } from '../systems/missionLoader';
import { useTranslation } from '../i18n/useTranslation';
import useDocumentTitle from '../systems/useDocumentTitle';
import "./MissionMap.css";
import { getXPProgress, getLevelFromXP, xpForLevel, getRankTitle } from "../systems/gameEngine";

function getMissionCompletionRatio(completed, total) {
    if (!total) return 0;
    return Math.min(Math.max((completed / total) * 100, 0), 100);
}

function formatLevel(progressState, fallbackLevel = 1) {
    // Prefer the persisted level, but fall back to derived level from XP.
    if (typeof progressState?.level === 'number' && progressState.level > 0) return progressState.level;
    return getLevelFromXP(progressState?.xp ?? 0) || fallbackLevel;
}

function formatCurrentLevelProgressPercent(progressState) {
    const level = formatLevel(progressState);
    // Show progress within the current level as a percent.
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
    const learningPathRef = useRef(null);
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
            completed: state.completedMissions.includes(m.id),
            unlocked: isMissionUnlocked(m.id, state.completedMissions),
        }));
    }, [missions, state.completedMissions]);

    const filteredMissions = useMemo(() => {
        return missionStates.filter((mission) => {
            const matchesSearch = searchTerm === '' ||
                mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mission.learningGoal.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDifficulty = selectedDifficulty === 'all' || mission.difficulty === selectedDifficulty;
            const matchesChapter = selectedChapter === 'all' || mission.chapter === selectedChapter;
            return matchesSearch && matchesDifficulty && matchesChapter;
        });
    }, [missionStates, searchTerm, selectedDifficulty, selectedChapter]);

    const handleMissionClick = (mission) => {
        if (mission.unlocked) {
            navigate(`/mission/${mission.id}`);
        }
    };

    const ariaLabelFor = (m) => {
        if (m.completed) return t('missionMap.aria.missionItemCompleted', { order: m.order, title: m.title });
        if (m.unlocked) return t('missionMap.aria.missionItemUnlocked', { order: m.order, title: m.title });
        return t('missionMap.aria.missionItemLocked', { order: m.order, title: m.title });
    };

    useEffect(() => {
        if (!learningPathRef.current || typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const node = learningPathRef.current;
        const updateWidth = (width) => {
            setLearningPathWidth(Math.max(320, Math.floor(width)));
        };

        updateWidth(node.getBoundingClientRect().width);

        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                updateWidth(entries[0].contentRect.width);
            }
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const desktopPathLayout = useMemo(() => {
        const width = Math.max(learningPathWidth, 320);
        const cols = width >= 1024 ? 4 : width >= 860 ? 3 : 2;
        const rows = Math.ceil(filteredMissions.length / cols);
        const topPadding = 70;
        const horizontalPadding = cols === 2 ? 72 : 80;
        const rowSpacing = 140;
        const bottomPadding = 110;
        const usableWidth = Math.max(width - horizontalPadding * 2, 1);
        const colSpacing = cols > 1 ? usableWidth / (cols - 1) : 0;

        const points = filteredMissions.map((m, i) => {
            const row = Math.floor(i / cols);
            const colInRow = i % cols;
            const isReverse = row % 2 === 1;
            const col = isReverse ? cols - 1 - colInRow : colInRow;

            return {
                mission: m,
                cx: horizontalPadding + col * colSpacing,
                cy: topPadding + row * rowSpacing,
                index: i,
            };
        });

        const height = topPadding + Math.max(0, rows - 1) * rowSpacing + bottomPadding;

        return {
            width: Math.round(width),
            height: Math.round(Math.max(height, 280)),
            points,
        };
    }, [learningPathWidth, filteredMissions]);

    return (
        <div id="main-content" className="mission-map-page">
            <div className="mission-map-header">
                <div className="mission-progress-stats" role="region" aria-label="Mission progress statistics">
                    <div className="mission-progress-card">
                    <header className="mission-progress-legend">
                        <div>
                            <h2 className="mission-progress-title" style={{ margin: 0 }}>
                                {t('missionMap.stats.title') || 'Your progression'}
                            </h2>
                            <p className="mission-progress-subtitle" style={{ marginTop: '0.25rem' }}>
                                {t('missionMap.stats.subtitle') || 'Level, completion ratio and total XP'}
                            </p>
                        </div>
                        <p className="mission-progress-subtitle" style={{ textAlign: 'right' }}>
                            {state.completedMissions.length}/{missions.length} missions
                        </p>
                    </header>

                        <div className="mission-progress-legend">
                            <div>
                                <h3 className="mission-progress-title">{t('missionMap.stats.title') || 'Your progression'}</h3>
                                <p className="mission-progress-subtitle">
                                    {t('missionMap.stats.subtitle') || 'Level, completion ratio and total XP'}
                                </p>
                            </div>
                            <p className="mission-progress-subtitle" style={{ textAlign: 'right' }}>
                                {state.completedMissions.length}/{missions.length} missions
                            </p>
                        </div>

                        <div className="mission-progress-grid">
                            {(() => {
                                const totalMissions = missions.length;
                                const completedMissions = state.completedMissions.length;
                                const ratioPercent = getMissionCompletionRatio(completedMissions, totalMissions);
                                const totalXp = state.xp || 0;
                                const currentLevel = formatLevel(state, 1);
                                const xpProgressPercent = formatCurrentLevelProgressPercent(state);

                                return (
                                    <>
                                        <div className="mission-progress-stat" aria-label="Current player level">
                                            <div className="mission-progress-stat-row">
                                                <span className="mission-progress-label">{t('missionMap.stats.level') || 'Level'}</span>
                                                <span className="mission-progress-value" data-variant="purple">{currentLevel}</span>
                                            </div>
                                            <div className="mission-progress-meta">
                                                {t('missionMap.stats.xpToNext') || 'XP into next'}: {xpProgressPercent.toFixed(0)}%
                                            </div>
                                            <div className="mission-progress-meter" aria-hidden="true">
                                                <div className="mission-progress-meter-fill" style={{ width: `${xpProgressPercent}%` }} />
                                            </div>
                                        </div>

                                        <div className="mission-progress-stat" aria-label="Mission completion ratio">
                                            <div className="mission-progress-stat-row">
                                                <span className="mission-progress-label">{t('missionMap.stats.completed') || 'Completed'}</span>
                                                <span className="mission-progress-value" data-variant="green">{ratioPercent.toFixed(0)}%</span>
                                            </div>
                                            <div className="mission-progress-meta">
                                                {completedMissions} / {totalMissions} missions
                                            </div>
                                            <div className="mission-progress-meter" aria-hidden="true">
                                                <div className="mission-progress-meter-fill" style={{ width: `${ratioPercent}%` }} />
                                            </div>
                                        </div>

                                        <div className="mission-progress-stat" aria-label="Total XP earned">
                                            <div className="mission-progress-stat-row">
                                                <span className="mission-progress-label">{t('missionMap.stats.totalXp') || 'Total XP'}</span>
                                                <span className="mission-progress-value" data-variant="gold">{totalXp}</span>
                                            </div>
                                            <div className="mission-progress-meta">
                                                {t('missionMap.stats.progressCap') || 'Aggregated XP from completed missions'}
                                            </div>
                                            <div className="mission-progress-meter" aria-hidden="true">
                                                <div className="mission-progress-meter-fill" style={{ width: `${Math.min(xpForLevel(currentLevel + 1) ? (totalXp / xpForLevel(currentLevel + 1)) * 100 : 0, 100)}%` }} />
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                <h1 className="section-title">{t('missionMap.title')}</h1>
                <p className="section-subtitle">
                    {t('missionMap.subtitle', {
                        completed: state.completedMissions.length,
                        total: missions.length,
                    })}
                </p>
            </div>

            {/* All Completed Celebration */}
            {state.completedMissions.length === missions.length && missions.length > 0 && (
              <div className="card" style={{
                textAlign: 'center',
                padding: '2rem',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(6,214,160,0.1), rgba(139,92,246,0.1))',
                border: '2px solid rgba(6,214,160,0.3)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                <h2 style={{ color: 'var(--cyan)', fontFamily: 'var(--font-display)', margin: '0 0 0.5rem' }}>
                  {t('missionMap.allCompleted.title')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  {t('missionMap.allCompleted.body', { rank: getRankTitle(state.level), xp: state.xp })}
                </p>
              </div>
            )}

            {/* SVG Learning Path */}
            <div className="learning-path learning-path-desktop" ref={learningPathRef}>
                <svg
                    viewBox={`0 0 ${desktopPathLayout.width} ${desktopPathLayout.height}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label={t('missionMap.aria.missionPath')}
                >
                    {desktopPathLayout.points.map(({ mission, cx, cy, index }) => {
                        const next = desktopPathLayout.points[index + 1];
                        const nodeColor = mission.completed ? '#22c55e' : mission.unlocked ? '#06d6a0' : '#374151';
                        const textColor = mission.completed ? '#22c55e' : mission.unlocked ? '#f1f5f9' : '#4b5563';
                        const glowFilter = mission.completed ? 'url(#glowGreen)' : mission.unlocked ? 'url(#glowCyan)' : '';
                        const shortTitle = mission.title.length > 20 ? `${mission.title.slice(0, 19)}…` : mission.title;

                        return (
                            <g key={mission.id}>
                                {next && (
                                    <line
                                        x1={cx}
                                        y1={cy}
                                        x2={next.cx}
                                        y2={next.cy}
                                        stroke={mission.completed ? '#22c55e' : '#1f2937'}
                                        strokeWidth="2"
                                        strokeDasharray={mission.completed ? '' : '6 4'}
                                        className={mission.completed ? 'path-line completed' : 'path-line'}
                                    />
                                )}
                                <g
                                    className="path-node"
                                    onClick={() => handleMissionClick(mission)}
                                    onKeyDown={(event) => {
                                        if (mission.unlocked && (event.key === 'Enter' || event.key === ' ')) {
                                            event.preventDefault();
                                            handleMissionClick(mission);
                                        }
                                    }}
                                    role={mission.unlocked ? 'button' : undefined}
                                    tabIndex={mission.unlocked ? 0 : -1}
                                    aria-label={t('missionMap.aria.missionItem', { order: mission.order, title: mission.title })}
                                    style={{ cursor: mission.unlocked ? 'pointer' : 'not-allowed' }}
                                >
                                    <circle className="path-node-hit-area" cx={cx} cy={cy} r="28" fill="transparent" />
                                    <circle
                                        className="path-node-circle"
                                        cx={cx}
                                        cy={cy}
                                        r="24"
                                        fill={mission.completed ? 'rgba(34,197,94,0.15)' : mission.unlocked ? 'rgba(6,214,160,0.1)' : 'rgba(31,41,55,0.5)'}
                                        stroke={nodeColor}
                                        strokeWidth="2"
                                        filter={glowFilter}
                                    />
                                    <text
                                        x={cx}
                                        y={cy + 4}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill={mission.completed ? '#22c55e' : mission.unlocked ? '#06d6a0' : '#6b7280'}
                                        fontSize="14"
                                        fontWeight="bold"
                                        aria-hidden="true"
                                    >
                                        {mission.completed ? '✓' : mission.unlocked ? mission.order : '🔒'}
                                    </text>
                                    <text
                                        x={cx}
                                        y={cy + 44}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill={mission.unlocked ? '#cbd5e1' : '#475569'}
                                        fontWeight="500"
                                        fontFamily="Inter, sans-serif"
                                        aria-hidden="true"
                                    >
                                        {shortTitle}
                                    </text>
                                    <text
                                        x={cx}
                                        y={cy + 56}
                                        textAnchor="middle"
                                        fill={mission.completed ? '#22c55e' : '#f59e0b'}
                                        fontSize="9"
                                        fontWeight="600"
                                        fontFamily="Orbitron, sans-serif"
                                        aria-hidden="true"
                                    >
                                        {mission.completed ? 'COMPLETED' : `${mission.xpReward} XP`}
                                    </text>
                                </g>
                            </g>
                        );
                    })}
                    <defs>
                        <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                            <feFlood floodColor="var(--cyan)" floodOpacity="0.4" />
                            <feComposite in2="blur" operator="in" />
                            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                        <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                            <feFlood floodColor="var(--green)" floodOpacity="0.4" />
                            <feComposite in2="blur" operator="in" />
                            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                </svg>
            </div>

            <div className="learning-path-mobile" aria-label={t('missionMap.aria.missionTimeline')}>
                {filteredMissions.map((m, i) => (
                    <button
                        type="button"
                        key={m.id}
                        className={`timeline-item ${m.completed ? 'completed' : ''} ${!m.unlocked ? 'locked' : ''}`}
                        onClick={() => handleMissionClick(m)}
                        disabled={!m.unlocked}
                        aria-label={ariaLabelFor(m)}
                    >
                        <span className="timeline-track" aria-hidden="true">
                            <span className="timeline-node">
                                {m.completed ? '✓' : m.unlocked ? m.order : '🔒'}
                            </span>
                            {i < filteredMissions.length - 1 && (
                                <span className={`timeline-line ${m.completed ? 'completed' : ''}`} />
                            )}
                        </span>
                        <span className="timeline-body">
                            <span className="timeline-meta">
                                {t('missionMap.card.chapterMission', { chapter: m.chapter, mission: m.order })}
                            </span>
                            <span className="timeline-title">{m.title}</span>
                            <span className="timeline-foot">
                                <span className="timeline-xp">{t('missionMap.card.xp', { xp: m.xpReward })}</span>
                                <span className={`badge badge-${m.difficulty}`}>{t(`difficulty.${m.difficulty}`)}</span>
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Mission Cards Grid */}
            <div className="mission-map-filters">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder={t('missionMap.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-chips">
                    <div className="difficulty-filters">
                        <button
                            className={`filter-chip ${selectedDifficulty === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty('all')}
                        >
                            {t('missionMap.difficulty.all')}
                        </button>
                        <button
                            className={`filter-chip ${selectedDifficulty === 'beginner' ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty('beginner')}
                        >
                            {t('missionMap.difficulty.beginner')}
                        </button>
                        <button
                            className={`filter-chip ${selectedDifficulty === 'intermediate' ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty('intermediate')}
                        >
                            {t('missionMap.difficulty.intermediate')}
                        </button>
                        <button
                            className={`filter-chip ${selectedDifficulty === 'advanced' ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty('advanced')}
                        >
                            {t('missionMap.difficulty.advanced')}
                        </button>
                    </div>
                    <div className="chapter-filters">
                        <button
                            className={`filter-chip ${selectedChapter === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedChapter('all')}
                        >
                            {t('missionMap.chapters.all')}
                        </button>
                        {chapters.map((n) => (
                            <button
                                key={n}
                                className={`filter-chip ${selectedChapter === n ? 'active' : ''}`}
                                onClick={() => setSelectedChapter(n)}
                            >
                                {t('missionMap.chapters.n', { number: n })}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mission-map-grid">
                {filteredMissions.length === 0 ? (
                    <div className="no-missions-found" role="status">
                        <p>{t('missionMap.noResults')}</p>
                    </div>
                ) : (
                    filteredMissions.map((m) => (
                        <div
                            key={m.id}
                            className={`mission-card ${m.completed ? 'completed' : ''} ${!m.unlocked ? 'locked' : ''}`}
                            onClick={() => handleMissionClick(m)}
                            onKeyDown={(e) => {
                                if (m.unlocked && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    handleMissionClick(m);
                                }
                            }}
                            role="button"
                            tabIndex={m.unlocked ? 0 : -1}
                            aria-label={`Mission card ${m.order}: ${m.title}. Chapter ${m.chapter}. Reward: ${m.xpReward} XP. Difficulty: ${m.difficulty}.${m.completed ? ' Status: Completed.' : !m.unlocked ? ' Status: Locked.' : ' Status: Available.'}`}
                        >
                            <div className="mission-card-header">
                                <span className="mission-card-chapter">
                                    {t('missionMap.card.chapterMission', { chapter: m.chapter, mission: m.order })}
                                </span>
                                <span className="mission-card-xp">{t('missionMap.card.xp', { xp: m.xpReward })}</span>
                            </div>
                            <h3 className="mission-card-title">{m.title}</h3>
                            <p className="mission-card-desc">{m.learningGoal}</p>
                            <div className="mission-card-footer">
                                <div className="mission-card-concepts" aria-label="Concepts introduced in this mission">
                                    {m.conceptsIntroduced.slice(0, 3).map(c => (
                                        <span key={c} className="concept-tag">{c}</span>
                                    ))}
                                </div>
                                <span className={`badge badge-${m.difficulty}`}>
                                    <span className="sr-only">{t('missionMap.card.difficultyLabel')} </span>
                                    {t(`difficulty.${m.difficulty}`)}
                                </span>
                            </div>
                            {m.completed && (
                                <div className="mission-card-status completed"><span className="sr-only">{t('missionMap.card.stateLabel')} </span>{t('missionMap.card.completed')}</div>
                            )}
                            {!m.unlocked && (
                                <div className="mission-card-status" style={{ color: 'var(--text-muted)' }}><span className="sr-only">{t('missionMap.card.stateLabel')} </span>{t('missionMap.card.locked')}</div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}