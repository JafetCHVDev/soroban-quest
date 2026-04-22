import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { loadProgress } from '../systems/storage';
import { getRankTitle, getXPProgress } from '../systems/gameEngine';

const THEME_KEY = 'soroban_quest_theme';

export default function Navbar() {
    const location = useLocation();
    const state = loadProgress();
    const xpProgress = getXPProgress(state);

    const [theme, setTheme] = useState(() => {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <svg className="navbar-logo-icon" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="16" stroke="url(#navGrad)" strokeWidth="2" />
                    <path d="M18 6L22 14L30 16L24 22L25 30L18 26L11 30L12 22L6 16L14 14L18 6Z" fill="url(#navGrad)" />
                    <defs>
                        <linearGradient id="navGrad" x1="0" y1="0" x2="36" y2="36">
                            <stop stopColor="#06d6a0" />
                            <stop offset="1" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>
                <span className="navbar-logo-text">SOROBAN QUEST</span>
            </Link>

            <ul className="navbar-links">
                <li><Link to="/" className={isActive('/')}>Home</Link></li>
                <li><Link to="/missions" className={isActive('/missions')}>Missions</Link></li>
                <li><Link to="/profile" className={isActive('/profile')}>Profile</Link></li>
            </ul>

            <div className="navbar-stats">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    id="theme-toggle-btn"
                >
                    {theme === 'dark' ? (
                        /* Sun icon — shown in dark mode, click to go light */
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    ) : (
                        /* Moon icon — shown in light mode, click to go dark */
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>
                <div className="navbar-xp">
                    ⚡ {state.xp} XP
                </div>
                <div className="navbar-level">
                    🛡️ Lv.{state.level}
                </div>
            </div>
        </nav>
    );
}
