import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { loadProgress } from '../systems/storage';
import { getRankTitle, getXPProgress } from '../systems/gameEngine';

export default function Navbar() {
    const location = useLocation();
    const state = loadProgress();
    const xpProgress = getXPProgress(state);


    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('soroban_quest_theme') || 'dark';
    });


    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('soroban_quest_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
                <div className="navbar-xp">
                    ⚡ {state.xp} XP
                </div>
                <div className="navbar-level">
                    🛡️ Lv.{state.level}
                </div>

                <button
                    onClick={toggleTheme}
                    className="btn-ghost"
                    aria-label="Toggle Theme"
                    style={{ fontSize: '1.2rem', padding: '0.2rem 0.6rem', borderRadius: '50px' }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </nav>
    );
}
