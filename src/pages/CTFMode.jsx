import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { ctfChallenges } from '../data/ctfChallenges';
import { validateCode } from '../systems/codeValidator';
import { loadProgress, saveProgress } from '../systems/storage';
import { completeCTF } from '../systems/gameEngine';

const CTF_INTRO_KEY = 'soroban_quest_ctf_intro_seen';

/* ── helpers ── */
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runCTFTests(code, challenge) {
  const results = [];

  // Phase 1: basic syntax
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      results: [{ passed: false, message: '✗ Editor is empty — write your fix!' }],
      allPassed: false,
    };
  }
  let braces = 0;
  for (const ch of trimmed) {
    if (ch === '{') braces++;
    if (ch === '}') braces--;
  }
  results.push(
    braces === 0
      ? { passed: true, message: '✓ Syntax looks good' }
      : { passed: false, message: '✗ Unbalanced braces' }
  );
  await delay(250);

  // Phase 2: challenge checks
  const validation = validateCode(code, challenge.checks);
  for (const r of validation.results) {
    await delay(180);
    results.push(r);
  }

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}

/* ── Intro Modal ── */
function IntroModal({ onClose }) {
  return (
    <div className="ctf-modal-backdrop" onClick={onClose}>
      <div className="ctf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ctf-modal-header">
          <span className="ctf-modal-icon">🚩</span>
          <h2>How CTF Mode Works</h2>
        </div>
        <div className="ctf-modal-body">
          <p>
            <strong>CTF (Capture The Flag)</strong> challenges teach smart-contract security by
            showing you intentionally vulnerable Soroban contracts.
          </p>
          <ol className="ctf-modal-steps">
            <li>
              <span className="ctf-step-num">1</span>
              <span>
                <strong>Read the vulnerable contract</strong> on the left panel. Spot the bug.
              </span>
            </li>
            <li>
              <span className="ctf-step-num">2</span>
              <span>
                <strong>Write the fix</strong> in the editor on the right. The template gives you a
                starting point.
              </span>
            </li>
            <li>
              <span className="ctf-step-num">3</span>
              <span>
                <strong>Run the exploit checks</strong> to verify your solution is correct.
              </span>
            </li>
            <li>
              <span className="ctf-step-num">4</span>
              <span>
                <strong>Earn XP and CTF badges</strong> separate from the main quest progression.
              </span>
            </li>
          </ol>
          <p className="ctf-modal-note">
            💡 Use hints if you're stuck. Revealing the solution is always available for learning.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onClose}>
          Let's Hunt Bugs 🐛
        </button>
      </div>
    </div>
  );
}

/* ── Challenge Card ── */
function ChallengeCard({ challenge, completed, active, onClick }) {
  const diffColor = { beginner: 'cyan', intermediate: 'gold', advanced: 'red' };
  return (
    <button
      className={`ctf-card ${active ? 'ctf-card--active' : ''} ${completed ? 'ctf-card--done' : ''}`}
      onClick={onClick}
    >
      <div className="ctf-card-top">
        <span className="ctf-card-icon">{challenge.icon}</span>
        {completed && <span className="ctf-card-badge">✓</span>}
      </div>
      <h3 className="ctf-card-title">{challenge.title}</h3>
      <span className={`ctf-difficulty ctf-difficulty--${diffColor[challenge.difficulty]}`}>
        {challenge.difficulty}
      </span>
      <div className="ctf-card-meta">
        <span className="ctf-card-category">{challenge.category}</span>
        <span className="ctf-card-xp">+{challenge.xpReward} XP</span>
      </div>
    </button>
  );
}

/* ── Main Page ── */
export default function CTFMode() {
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(CTF_INTRO_KEY));
  const [selected, setSelected] = useState(ctfChallenges[0]);
  const [code, setCode] = useState(ctfChallenges[0].template);
  const [termLines, setTermLines] = useState([]);
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [gameState, setGameState] = useState(() => loadProgress());
  const termRef = useRef(null);

  const completedCTFs = gameState.completedCTFs || [];

  // Scroll terminal to bottom
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [termLines]);

  function selectChallenge(ch) {
    setSelected(ch);
    setCode(ch.template);
    setTermLines([]);
    setShowSolution(false);
    setHintIndex(0);
  }

  function closeIntro() {
    localStorage.setItem(CTF_INTRO_KEY, '1');
    setShowIntro(false);
  }

  async function handleRun() {
    if (running) return;
    setRunning(true);
    setTermLines([{ text: `> Running exploit checks for "${selected.title}"…`, type: 'info' }]);

    const { results, allPassed } = await runCTFTests(code, selected);

    const lines = [{ text: `> Running exploit checks for "${selected.title}"…`, type: 'info' }];
    for (const r of results) {
      lines.push({ text: r.message, type: r.passed ? 'pass' : 'fail' });
    }

    if (allPassed) {
      lines.push({ text: '', type: 'info' });
      lines.push({ text: '🎉 Vulnerability patched! Challenge complete!', type: 'success' });

      if (!completedCTFs.includes(selected.id)) {
        const newState = completeCTF(gameState, selected.id, selected.xpReward);
        saveProgress(newState);
        setGameState(newState);
        lines.push({ text: `+${selected.xpReward} XP earned`, type: 'xp' });
        if (newState.newBadges?.length) {
          for (const b of newState.newBadges) {
            lines.push({ text: `🏅 Badge unlocked: ${b}`, type: 'badge' });
          }
        }
      } else {
        lines.push({ text: '(Already completed — no XP awarded)', type: 'info' });
      }
    } else {
      const passed = results.filter((r) => r.passed).length;
      lines.push({
        text: `❌ ${passed}/${results.length} checks passed. Keep digging!`,
        type: 'fail',
      });
    }

    setTermLines(lines);
    setRunning(false);
  }

  function handleHint() {
    if (hintIndex < selected.hints.length) {
      setTermLines((prev) => [
        ...prev,
        { text: `💡 Hint ${hintIndex + 1}: ${selected.hints[hintIndex]}`, type: 'hint' },
      ]);
      setHintIndex((i) => i + 1);
    }
  }

  function handleReveal() {
    setShowSolution((s) => !s);
    setCode(showSolution ? selected.template : selected.solution);
  }

  const theme = localStorage.getItem('soroban_quest_theme') === 'light' ? 'light' : 'vs-dark';

  return (
    <div className="ctf-page">
      {showIntro && <IntroModal onClose={closeIntro} />}

      {/* Header */}
      <div className="ctf-header">
        <div>
          <h1 className="ctf-title">🚩 CTF Mode</h1>
          <p className="ctf-subtitle">
            Find and fix vulnerabilities in intentionally broken Soroban contracts.
          </p>
        </div>
        <div className="ctf-header-stats">
          <span className="ctf-stat">
            <strong>{completedCTFs.length}</strong> / {ctfChallenges.length} solved
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowIntro(true)}>
            ❓ How it works
          </button>
        </div>
      </div>

      {/* Challenge grid */}
      <div className="ctf-grid">
        {ctfChallenges.map((ch) => (
          <ChallengeCard
            key={ch.id}
            challenge={ch}
            completed={completedCTFs.includes(ch.id)}
            active={selected.id === ch.id}
            onClick={() => selectChallenge(ch)}
          />
        ))}
      </div>

      {/* Split view */}
      <div className="ctf-workspace">
        {/* Left: vulnerable contract (read-only) */}
        <div className="ctf-panel ctf-panel--left">
          <div className="ctf-panel-header">
            <span className="ctf-panel-label">🐛 Vulnerable Contract</span>
            <span className="ctf-panel-tag ctf-panel-tag--danger">READ ONLY</span>
          </div>
          <div className="ctf-description">
            <p>{selected.description}</p>
            <p className="ctf-objective">
              <strong>Objective:</strong> {selected.objective}
            </p>
          </div>
          <Editor
            height="380px"
            language="rust"
            value={selected.vulnerableContract}
            theme={theme}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Right: exploit editor */}
        <div className="ctf-panel ctf-panel--right">
          <div className="ctf-panel-header">
            <span className="ctf-panel-label">⚔️ Your Fix</span>
            {completedCTFs.includes(selected.id) && (
              <span className="ctf-panel-tag ctf-panel-tag--success">SOLVED ✓</span>
            )}
          </div>
          <Editor
            height="380px"
            language="rust"
            value={code}
            onChange={(v) => setCode(v || '')}
            theme={theme}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />

          {/* Action bar */}
          <div className="ctf-actions">
            <button className="btn btn-primary" onClick={handleRun} disabled={running}>
              {running ? '⏳ Checking…' : '▶ Run Checks'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleHint}
              disabled={hintIndex >= selected.hints.length}
            >
              💡 Hint ({selected.hints.length - hintIndex} left)
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleReveal}>
              {showSolution ? '🙈 Hide Solution' : '👁 Show Solution'}
            </button>
          </div>

          {/* Terminal */}
          <div className="ctf-terminal" ref={termRef}>
            {termLines.length === 0 ? (
              <span className="ctf-terminal-placeholder">
                Press "Run Checks" to validate your fix…
              </span>
            ) : (
              termLines.map((line, i) => (
                <div key={i} className={`ctf-terminal-line ctf-terminal-line--${line.type}`}>
                  {line.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
