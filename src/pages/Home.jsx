import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProgress } from '../systems/storage';
import { getAllMissions } from '../systems/missionLoader';
import { useTranslation } from '../i18n/useTranslation';

export default function Home() {
    const navigate = useNavigate();
    const state = loadProgress();
    const canvasRef = useRef(null);
    const { t, language } = useTranslation();
    const missions = getAllMissions(language);
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

                <div className="hero-badge">
                    {t('home.badge')}
                </div>

                <h1 className="hero-title">
                    {t('home.title.lead')}{' '}
                    <span className="hero-title-gradient">{t('home.title.brand')}</span>
                    <br />
                    {t('home.title.tail')}
                </h1>

                <p className="hero-subtitle">
                    {t('home.subtitle')}
                </p>

                <div className="hero-actions">
                    {hasMissions ? (
                        <>
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/missions')}>
                                {t('home.cta.continueQuest')}
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/profile')}>
                                {t('home.cta.viewProgress')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/mission/hello-soroban')}>
                                {t('home.cta.beginJourney')}
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/missions')}>
                                {t('home.cta.viewMissionMap')}
                            </button>
                        </>
                    )}
                </div>

                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="hero-stat-value">{missions.length}</div>
                        <div className="hero-stat-label">{t('home.stats.missions')}</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{missions.reduce((s, m) => s + m.xpReward, 0)}</div>
                        <div className="hero-stat-label">{t('home.stats.totalXp')}</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">0</div>
                        <div className="hero-stat-label">{t('home.stats.backendNeeded')}</div>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2 className="section-title">{t('home.howItWorks.title')}</h2>
                <p className="section-subtitle">
                    {t('home.howItWorks.subtitle')}
                </p>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon cyan">📖</div>
                        <h3>{t('home.features.read.title')}</h3>
                        <p>{t('home.features.read.body')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon purple">⌨️</div>
                        <h3>{t('home.features.write.title')}</h3>
                        <p>{t('home.features.write.body')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon gold">🧪</div>
                        <h3>{t('home.features.test.title')}</h3>
                        <p>{t('home.features.test.body')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon cyan">🏆</div>
                        <h3>{t('home.features.xp.title')}</h3>
                        <p>{t('home.features.xp.body')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon purple">🔒</div>
                        <h3>{t('home.features.zeroBackend.title')}</h3>
                        <p>{t('home.features.zeroBackend.body')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon gold">🗺️</div>
                        <h3>{t('home.features.path.title')}</h3>
                        <p>{t('home.features.path.body')}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
