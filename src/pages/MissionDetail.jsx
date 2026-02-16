import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { getMissionById, getNextMission } from '../systems/missionLoader';
import { runTests } from '../systems/testRunner';
import { loadProgress, saveProgress } from '../systems/storage';
import { completeMission, recordAttempt, getXPProgress, getRankTitle } from '../systems/gameEngine';

export default function MissionDetail() {
    const { missionId } = useParams();
    const navigate = useNavigate();
    const mission = getMissionById(missionId);

    const [code, setCode] = useState('');
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [victoryData, setVictoryData] = useState(null);
    const [hintIndex, setHintIndex] = useState(-1);
    const terminalBodyRef = useRef(null);

    useEffect(() => {
        if (mission) {
            setCode(mission.template);
            setTestResults([]);
            setHintIndex(-1);
            setShowVictory(false);
        }
    }, [missionId]);

    const handleRunTests = useCallback(async () => {
        if (isRunning || !mission) return;
        setIsRunning(true);
        setTestResults([]);

        // Record attempt
        let state = loadProgress();
        state = recordAttempt(state, missionId);
        saveProgress(state);

        // Run tests with progressive output
        const resultCollector = [];
        const addResult = (result) => {
            resultCollector.push(result);
            setTestResults([...resultCollector]);
        };

        // Phase 1: Syntax
        addResult({ phase: 'info', message: '🔍 Running validation checks...' });
        await delay(400);

        const result = await runTests(code, mission);

        for (const r of result.results) {
            addResult(r);
            await delay(250);
        }

        await delay(300);
        addResult({ phase: 'summary', message: result.summary });

        if (result.allPassed) {
            await delay(500);
            state = loadProgress();
            const newState = completeMission(state, missionId, mission.xpReward);

            if (!newState.alreadyCompleted) {
                saveProgress(newState);
                setVictoryData({
                    xp: mission.xpReward,
                    leveledUp: newState.leveledUp,
                    newLevel: newState.level,
                    newBadges: newState.newBadges || [],
                });
                setShowVictory(true);
            } else {
                addResult({ phase: 'info', message: '🏅 Already completed — no additional XP awarded.' });
            }
        }

        setIsRunning(false);
    }, [code, mission, missionId, isRunning]);

    const handleHint = () => {
        if (mission && hintIndex < mission.hints.length - 1) {
            setHintIndex(hintIndex + 1);
        }
    };

    const handleReset = () => {
        if (mission) {
            setCode(mission.template);
            setTestResults([]);
            setHintIndex(-1);
        }
    };

    const handleShowSolution = () => {
        if (mission?.solution) {
            setCode(mission.solution);
        }
    };

    const handleNextMission = () => {
        const next = getNextMission(missionId);
        if (next) {
            navigate(`/mission/${next.id}`);
        } else {
            navigate('/missions');
        }
    };

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalBodyRef.current) {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
        }
    }, [testResults]);

    if (!mission) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Mission Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    The mission "{missionId}" doesn't exist.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/missions')} style={{ marginTop: '1.5rem' }}>
                    ← Back to Mission Map
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="mission-detail">
                {/* Story Panel */}
                <div className="mission-story">
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <span className={`badge badge-${mission.difficulty}`}>{mission.difficulty}</span>
                        <span className="mission-card-xp" style={{ marginLeft: '0.5rem' }}>
                            ⚡ {mission.xpReward} XP
                        </span>
                    </div>
                    <ReactMarkdown
                        components={{
                            code: ({ node, inline, className, children, ...props }) => {
                                if (inline) {
                                    return <code {...props}>{children}</code>;
                                }
                                return (
                                    <pre>
                                        <code className={className} {...props}>{children}</code>
                                    </pre>
                                );
                            },
                        }}
                    >
                        {mission.story}
                    </ReactMarkdown>

                    {/* Hints */}
                    {hintIndex >= 0 && (
                        <div style={{
                            marginTop: 'var(--space-lg)',
                            padding: 'var(--space-md)',
                            background: 'var(--gold-dim)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <strong style={{ color: 'var(--gold)' }}>💡 Hint {hintIndex + 1}:</strong>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.85rem' }}>
                                {mission.hints[hintIndex]}
                            </p>
                        </div>
                    )}
                </div>

                {/* Editor Panel */}
                <div className="mission-editor-panel">
                    <div className="mission-editor-toolbar">
                        <div className="mission-editor-toolbar-left">
                            <div className="editor-file-tab">
                                <span className="dot" />
                                lib.rs
                            </div>
                        </div>
                        <div className="mission-editor-toolbar-right">
                            <button className="btn btn-ghost btn-sm" onClick={handleReset} disabled={isRunning}>
                                ↺ Reset
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={handleHint}
                                disabled={!mission.hints || hintIndex >= mission.hints.length - 1}>
                                💡 Hint
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={handleShowSolution}>
                                👁️ Solution
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={handleRunTests} disabled={isRunning}>
                                {isRunning ? (
                                    <><span className="spinner" style={{ width: 14, height: 14 }} /> Running...</>
                                ) : (
                                    '▶ Run Tests'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="editor-wrapper">
                        <Editor
                            height="100%"
                            defaultLanguage="rust"
                            value={code}
                            onChange={(v) => setCode(v || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16 },
                                lineNumbers: 'on',
                                renderLineHighlight: 'all',
                                cursorBlinking: 'smooth',
                                wordWrap: 'on',
                                tabSize: 4,
                                suggestOnTriggerCharacters: true,
                            }}
                        />
                    </div>

                    {/* Terminal Panel */}
                    <div className="mission-terminal-panel">
                        <div className="terminal" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div className="terminal-header">
                                <span className="terminal-dot red" />
                                <span className="terminal-dot yellow" />
                                <span className="terminal-dot green" />
                                <span className="terminal-title">Test Output</span>
                            </div>
                            <div className="terminal-body" ref={terminalBodyRef} style={{ flex: 1 }}>
                                {testResults.length === 0 ? (
                                    <span className="terminal-line info" style={{ opacity: 1, animation: 'none', color: 'var(--text-muted)' }}>
                                        Click "Run Tests" to validate your code...
                                    </span>
                                ) : (
                                    testResults.map((r, i) => (
                                        <span
                                            key={i}
                                            className={`terminal-line ${r.passed === true ? 'pass' : r.passed === false ? 'fail' : 'info'}`}
                                            style={{ animationDelay: `${i * 0.05}s` }}
                                        >
                                            {r.message}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Victory Modal */}
            {showVictory && victoryData && (
                <div className="modal-overlay" onClick={() => setShowVictory(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon">🏆</div>
                        <h2 className="modal-title">Mission Complete!</h2>
                        <p className="modal-message">
                            You've completed <strong>{mission.title}</strong>
                        </p>
                        <div className="modal-xp">+{victoryData.xp} XP</div>
                        {victoryData.leveledUp && (
                            <p style={{ color: 'var(--purple)', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
                                🎉 Level Up! You are now Level {victoryData.newLevel} — {getRankTitle(victoryData.newLevel)}
                            </p>
                        )}
                        {victoryData.newBadges?.length > 0 && (
                            <p style={{ color: 'var(--gold)', marginBottom: '1rem' }}>
                                🏅 New badge{victoryData.newBadges.length > 1 ? 's' : ''} earned!
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={handleNextMission}>
                                Next Mission →
                            </button>
                            <button className="btn btn-secondary" onClick={() => navigate('/missions')}>
                                Mission Map
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
