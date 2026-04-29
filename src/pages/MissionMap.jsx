import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProgress } from '../systems/storage';
import { getAllMissions, isMissionUnlocked } from '../systems/missionLoader';

export default function MissionMap() {
    const navigate = useNavigate();
    const state = loadProgress();
    const missions = getAllMissions();
    const learningPathRef = useRef(null);
    const [learningPathWidth, setLearningPathWidth] = useState(800);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedChapter, setSelectedChapter] = useState('all');

    const missionStates = useMemo(() => {
        return missions.map((m) => ({
            ...m,
            completed: state.completedMissions.includes(m.id),
            unlocked: isMissionUnlocked(m.id, state.completedMissions),
        }));
    }, [state.completedMissions]);

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
        <div className="mission-map-page">
            <div className="mission-map-header">
                <h1 className="section-title">Mission Map</h1>
                <p className="section-subtitle">
                    {state.completedMissions.length} of {missions.length} missions completed
                </p>
            </div>

            {/* SVG Learning Path */}
            <div className="learning-path learning-path-desktop" ref={learningPathRef}>
                <svg
                    viewBox={`0 0 ${desktopPathLayout.width} ${desktopPathLayout.height}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Mission path graph"
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
                                    aria-label={`Mission ${mission.order}: ${mission.title}`}
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
                                        y={cy + 1}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill={mission.completed ? '#22c55e' : mission.unlocked ? '#06d6a0' : '#6b7280'}
                                        fontSize="14"
                                        fontWeight="bold"
                                    >
                                        {mission.completed ? '✓' : mission.unlocked ? mission.order : '🔒'}
                                    </text>
                                    <text
                                        x={cx}
                                        y={cy + 42}
                                        textAnchor="middle"
                                        fill={textColor}
                                        fontSize="11"
                                        fontWeight="500"
                                        fontFamily="Inter, sans-serif"
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
            <div className="learning-path-mobile" aria-label="Mission timeline">
                {filteredMissions.map((m, i) => (
                    <button
                        type="button"
                        key={m.id}
                        className={`timeline-item ${m.completed ? 'completed' : ''} ${!m.unlocked ? 'locked' : ''}`}
                        onClick={() => handleMissionClick(m)}
                        disabled={!m.unlocked}
                        aria-label={`Mission ${m.order}: ${m.title}${m.completed ? ', completed' : m.unlocked ? ', unlocked' : ', locked'}`}
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
                                Chapter {m.chapter} • Mission {m.order}
                            </span>
                            <span className="timeline-title">{m.title}</span>
                            <span className="timeline-foot">
                                <span className="timeline-xp">⚡ {m.xpReward} XP</span>
                                <span className={`badge badge-${m.difficulty}`}>{m.difficulty}</span>
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
                        placeholder="Search missions..."
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
                            All
                        </button>
                        <button
                            className={`filter-chip ${selectedDifficulty === 'beginner' ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty('beginner')}
                        >
                            Beginner
                        </button>
                        <button
                            className={`filter-chip ${selectedDifficulty === 'intermediate' ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty('intermediate')}
                        >
                            Intermediate
                        </button>
                        <button
                            className={`filter-chip ${selectedDifficulty === 'advanced' ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty('advanced')}
                        >
                            Advanced
                        </button>
                    </div>
                    <div className="chapter-filters">
                        <button
                            className={`filter-chip ${selectedChapter === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedChapter('all')}
                        >
                            All Chapters
                        </button>
                        <button
                            className={`filter-chip ${selectedChapter === 1 ? 'active' : ''}`}
                            onClick={() => setSelectedChapter(1)}
                        >
                            Chapter 1
                        </button>
                        <button
                            className={`filter-chip ${selectedChapter === 2 ? 'active' : ''}`}
                            onClick={() => setSelectedChapter(2)}
                        >
                            Chapter 2
                        </button>
                        <button
                            className={`filter-chip ${selectedChapter === 3 ? 'active' : ''}`}
                            onClick={() => setSelectedChapter(3)}
                        >
                            Chapter 3
                        </button>
                    </div>
                </div>
            </div>
            <div className="mission-map-grid">
                {filteredMissions.length === 0 ? (
                    <div className="no-missions-found">
                        <p>No missions found matching your filters.</p>
                    </div>
                ) : (
                    filteredMissions.map((m) => (
                        <div
                            key={m.id}
                            className={`mission-card ${m.completed ? 'completed' : ''} ${!m.unlocked ? 'locked' : ''}`}
                            onClick={() => handleMissionClick(m)}
                        >
                            <div className="mission-card-header">
                                <span className="mission-card-chapter">Chapter {m.chapter} • Mission {m.order}</span>
                                <span className="mission-card-xp">⚡ {m.xpReward} XP</span>
                            </div>
                            <h3 className="mission-card-title">{m.title}</h3>
                            <p className="mission-card-desc">{m.learningGoal}</p>
                            <div className="mission-card-footer">
                                <div className="mission-card-concepts">
                                    {m.conceptsIntroduced.slice(0, 3).map(c => (
                                        <span key={c} className="concept-tag">{c}</span>
                                    ))}
                                </div>
                                <span className={`badge badge-${m.difficulty}`}>
                                    {m.difficulty}
                                </span>
                            </div>
                            {m.completed && (
                                <div className="mission-card-status completed">✓ Completed</div>
                            )}
                            {!m.unlocked && (
                                <div className="mission-card-status" style={{ color: 'var(--text-muted)' }}>🔒 Locked</div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
