import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProgress } from '../systems/storage';
import { getAllMissions } from '../systems/missionLoader';

export default function Home() {
  const navigate = useNavigate();
  const state = loadProgress();
  const canvasRef = useRef(null);
  const missions = getAllMissions();
  const completedCount = state.completedMissions.length;
  const hasMissions = completedCount > 0;

  // Particle starfield effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random() * 0.7 + 0.3,
      pulse: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.pulse += 0.02;
        s.y -= s.speed;
        if (s.y < -2) {
          s.y = canvas.height + 2;
          s.x = Math.random() * canvas.width;
        }
        const o = s.opacity * (0.6 + 0.4 * Math.sin(s.pulse));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 214, 160, ${o})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div>
      <section className="hero">
        <canvas ref={canvasRef} className="hero-particles" />

        <div className="hero-badge">✨ Zero setup • No wallet needed • Open source</div>

        <h1 className="hero-title">
          Master <span className="hero-title-gradient">Soroban</span>
          <br />
          Smart Contracts
        </h1>

        <p className="hero-subtitle">
          Embark on an epic quest to learn Stellar&apos;s smart contract platform. Write real
          Soroban code in your browser, solve challenges, and level up your blockchain skills — no
          installation required.
        </p>

        <div className="hero-actions">
          {hasMissions ? (
            <>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/missions')}>
                ⚔️ Continue Quest
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/profile')}>
                📊 View Progress
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/mission/hello-soroban')}
              >
                🚀 Begin Your Journey
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/missions')}>
                🗺️ View Mission Map
              </button>
            </>
          )}
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{missions.length}</div>
            <div className="hero-stat-label">Missions</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{missions.reduce((s, m) => s + m.xpReward, 0)}</div>
            <div className="hero-stat-label">Total XP</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">0</div>
            <div className="hero-stat-label">Backend Needed</div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Your path from zero to Soroban mastery, entirely in the browser.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon cyan">📖</div>
            <h3>Read the Quest</h3>
            <p>
              Each mission unfolds a story while teaching core Soroban concepts. Learn about
              contracts, storage, tokens, and more through narrative-driven challenges.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">⌨️</div>
            <h3>Write the Code</h3>
            <p>
              Use the built-in Monaco editor with Rust syntax highlighting and Soroban autocomplete.
              Templates get you started — you fill in the logic.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon gold">🧪</div>
            <h3>Run the Tests</h3>
            <p>
              Validate your code with instant feedback. Each mission has hidden checks that verify
              your contract structure, functions, and patterns.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon cyan">🏆</div>
            <h3>Earn XP & Level Up</h3>
            <p>
              Gain experience points for each completed mission. Unlock badges, climb ranks, and
              track your journey from Initiate to Stellar Sovereign.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">🔒</div>
            <h3>Zero Backend</h3>
            <p>
              Everything runs in your browser. No servers, no databases, no accounts. Your progress
              is saved locally — export it anytime as a JSON file.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon gold">🗺️</div>
            <h3>Progressive Path</h3>
            <p>
              From &quot;Hello World&quot; to multi-signature contracts. Each mission builds on the
              last, creating a structured path to Soroban mastery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
