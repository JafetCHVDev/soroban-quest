import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProgress } from '../systems/storage';
import { useTranslation } from '../i18n/useTranslation';
import { getAllMissions } from '../systems/missionLoader';
import useDocumentTitle from '../systems/useDocumentTitle';
import HomeSkeleton from '../components/HomeSkeleton';
import Onboarding, { shouldShowOnboarding } from '../components/Onboarding';
import { getActivityLog } from '../systems/activityLogger';
import { getRankTitle } from '../systems/gameEngine';

export default function Home() {
    useDocumentTitle('Home');
    const navigate = useNavigate();
    const state = loadProgress();
    const canvasRef = useRef(null);
    const { t, language } = useTranslation();
    const missions = getAllMissions(language);
    const completedCount = state.completedMissions.length;
    const hasMissions = completedCount > 0;
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());

    // Loading effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

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

    const activityLog = useMemo(() => getActivityLog().slice(0, 5), [state]);
    const rankTitle = getRankTitle(state.level);
    const totalMissions = missions.length;
    const badgesCount = state.badges.length;
    const goldBalance = state.gold || 0;
    const nextMission = useMemo(() => {
        return missions.find((m) => !state.completedMissions.includes(m.id));
    }, [missions, state.completedMissions]);

    if (loading) return <HomeSkeleton />;

    return (
        <div>
            {showOnboarding && <Onboarding />}

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
                        <div className="hero-stat-value">{completedCount}/{totalMissions}</div>
                        <div className="hero-stat-label">{t('home.stats.missionsCompleted', { count: completedCount, total: totalMissions })}</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{state.xp}</div>
                        <div className="hero-stat-label">{t('home.stats.xpEarned', { xp: state.xp })}</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{goldBalance}</div>
                        <div className="hero-stat-label">{t('home.stats.goldEarned', { gold: goldBalance })}</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{badgesCount}</div>
                        <div className="hero-stat-label">{t('home.stats.badgesUnlocked', { count: badgesCount })}</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{state.streak || 0}🔥</div>
                        <div className="hero-stat-label">{t('home.stats.streak')}</div>
                    </div>
                </div>
            </section>

            {hasMissions && (
                <section className="dashboard-section">
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h3>{t('home.stats.quickStats')}</h3>
                            <div className="dashboard-stat-row">
                                <span className="dashboard-stat-label">Level</span>
                                <span className="dashboard-stat-value">{t('home.stats.currentLevel', { level: state.level, rank: rankTitle })}</span>
                            </div>
                            <div className="dashboard-stat-row">
                                <span className="dashboard-stat-label">{t('home.stats.missionsCompleted', { count: completedCount, total: totalMissions })}</span>
                                <span className="dashboard-stat-value">{completedCount}/{totalMissions}</span>
                            </div>
                            <div className="dashboard-stat-row">
                                <span className="dashboard-stat-label">{t('home.stats.goldEarned', { gold: goldBalance })}</span>
                                <span className="dashboard-stat-value">{goldBalance}</span>
                            </div>
                            <div className="dashboard-stat-row">
                                <span className="dashboard-stat-label">{t('home.stats.badgesUnlocked', { count: badgesCount })}</span>
                                <span className="dashboard-stat-value">{badgesCount}</span>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>{t('home.stats.recentActivity')}</h3>
                            {activityLog.length === 0 ? (
                                <p className="dashboard-empty">{t('home.stats.viewAll')}</p>
                            ) : (
                                <ul className="dashboard-activity-list">
                                    {activityLog.map((entry) => (
                                        <li key={entry.id} className="dashboard-activity-item">
                                            <span className="dashboard-activity-msg">{entry.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/journal')}>
                                {t('home.stats.viewAll')}
                            </button>
                        </div>

                        {nextMission && (
                            <div className="dashboard-card dashboard-next">
                                <h3>{t('home.stats.nextMission')}</h3>
                                <p className="dashboard-next-title">{nextMission.title}</p>
                                <p className="dashboard-next-goal">{nextMission.learningGoal}</p>
                                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/mission/${nextMission.id}`)}>
                                    {t('home.stats.continueFrom', { title: nextMission.title })}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}

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
