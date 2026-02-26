import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProgress } from '../systems/storage';
import { getAllMissions, isMissionUnlocked } from '../systems/missionLoader';

export default function MissionMap() {
  const navigate = useNavigate();
  const state = loadProgress();
  const missions = getAllMissions();

  const missionStates = useMemo(() => {
    return missions.map((m) => ({
      ...m,
      completed: state.completedMissions.includes(m.id),
      unlocked: isMissionUnlocked(m.id, state.completedMissions),
    }));
  }, [state.completedMissions, missions]);

  const handleMissionClick = (mission) => {
    if (mission.unlocked) {
      navigate(`/mission/${mission.id}`);
    }
  };

  return (
    <div className="mission-map-page">
      <div className="mission-map-header">
        <h1 className="section-title">Mission Map</h1>
        <p className="section-subtitle">
          {state.completedMissions.length} of {missions.length} missions completed
        </p>
      </div>

      {/* SVG Learning Path */}
      <div className="learning-path">
        <svg viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg">
          {missionStates.map((m, i) => {
            const cols = 4;
            const row = Math.floor(i / cols);
            const colInRow = i % cols;
            const isReverse = row % 2 === 1;
            const col = isReverse ? cols - 1 - colInRow : colInRow;
            const cx = 100 + col * 200;
            const cy = 60 + row * 140;

            // Connect to next node
            let nextCx, nextCy;
            if (i < missionStates.length - 1) {
              const nextRow = Math.floor((i + 1) / cols);
              const nextColInRow = (i + 1) % cols;
              const nextIsReverse = nextRow % 2 === 1;
              const nextCol = nextIsReverse ? cols - 1 - nextColInRow : nextColInRow;
              nextCx = 100 + nextCol * 200;
              nextCy = 60 + nextRow * 140;
            }

            const nodeColor = m.completed ? '#22c55e' : m.unlocked ? '#06d6a0' : '#374151';
            const textColor = m.completed ? '#22c55e' : m.unlocked ? '#f1f5f9' : '#4b5563';
            const glowFilter = m.completed ? 'url(#glowGreen)' : m.unlocked ? 'url(#glowCyan)' : '';

            return (
              <g key={m.id}>
                {nextCx !== undefined && (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={nextCx}
                    y2={nextCy}
                    stroke={m.completed ? '#22c55e' : '#1f2937'}
                    strokeWidth="2"
                    strokeDasharray={m.completed ? '' : '6 4'}
                    className={m.completed ? 'path-line completed' : 'path-line'}
                  />
                )}
                <g
                  className="path-node"
                  onClick={() => handleMissionClick(m)}
                  style={{ cursor: m.unlocked ? 'pointer' : 'not-allowed' }}
                >
                  <circle
                    className="path-node-circle"
                    cx={cx}
                    cy={cy}
                    r="24"
                    fill={
                      m.completed
                        ? 'rgba(34,197,94,0.15)'
                        : m.unlocked
                          ? 'rgba(6,214,160,0.1)'
                          : 'rgba(31,41,55,0.5)'
                    }
                    stroke={nodeColor}
                    strokeWidth="2"
                    filter={glowFilter}
                  />
                  <text
                    x={cx}
                    y={cy + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={m.completed ? '#22c55e' : m.unlocked ? '#06d6a0' : '#6b7280'}
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {m.completed ? '✓' : m.unlocked ? m.order : '🔒'}
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
                    {m.title}
                  </text>
                  <text
                    x={cx}
                    y={cy + 56}
                    textAnchor="middle"
                    fill={m.completed ? '#22c55e' : '#f59e0b'}
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="Orbitron, sans-serif"
                  >
                    {m.completed ? 'COMPLETED' : `${m.xpReward} XP`}
                  </text>
                </g>
              </g>
            );
          })}
          <defs>
            <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feFlood floodColor="#06d6a0" floodOpacity="0.4" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feFlood floodColor="#22c55e" floodOpacity="0.4" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Mission Cards Grid */}
      <div className="mission-map-grid">
        {missionStates.map((m) => (
          <div
            key={m.id}
            className={`mission-card ${m.completed ? 'completed' : ''} ${!m.unlocked ? 'locked' : ''}`}
            onClick={() => handleMissionClick(m)}
          >
            <div className="mission-card-header">
              <span className="mission-card-chapter">
                Chapter {m.chapter} • Mission {m.order}
              </span>
              <span className="mission-card-xp">⚡ {m.xpReward} XP</span>
            </div>
            <h3 className="mission-card-title">{m.title}</h3>
            <p className="mission-card-desc">{m.learningGoal}</p>
            <div className="mission-card-footer">
              <div className="mission-card-concepts">
                {m.conceptsIntroduced.slice(0, 3).map((c) => (
                  <span key={c} className="concept-tag">
                    {c}
                  </span>
                ))}
              </div>
              <span className={`badge badge-${m.difficulty}`}>{m.difficulty}</span>
            </div>
            {m.completed && <div className="mission-card-status completed">✓ Completed</div>}
            {!m.unlocked && (
              <div className="mission-card-status" style={{ color: 'var(--text-muted)' }}>
                🔒 Locked
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
