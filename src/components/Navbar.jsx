import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Keyboard } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useGameState } from '../systems/GameStateContext';
import LanguageSelector from './LanguageSelector';
import { resetOnboarding } from './Onboarding';

export default function Navbar({ onOpenShortcuts }) {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const { profile, progress } = useGameState();
  const langRef = useRef(null);

  const { t, language, setLanguage, languages } = useTranslation();

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem('soroban_quest_theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('soroban_quest_theme', theme);
  }, [theme]);

  // Close mobile menu and reset body scroll on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [langOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setLangOpen(false);
  };

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        {t('common.skipToContent')}
      </a>

      <nav className="navbar" aria-label={t('navbar.ariaMain')}>
        <Link
          to="/"
          className="navbar-logo"
          aria-label={t('navbar.ariaHome')}
          style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
        >
          <span className="navbar-logo-text">SOROBAN QUEST</span>
        </Link>

        <ul className="navbar-links">
          <li>
            <Link to="/" className={isActive('/')}>
              {t('navbar.home')}
            </Link>
          </li>
          <li>
            <Link to="/campaigns" className={isActive('/campaigns')}>
              {t('navbar.campaigns')}
            </Link>
          </li>
          <li>
            <Link to="/missions" className={isActive('/missions')}>
              {t('navbar.missions')}
            </Link>
          </li>
          <li>
            <Link to="/profile" className={isActive('/profile')}>
              {t('navbar.profile')}
            </Link>
          </li>
          <li>
            <Link to="/journal" className={isActive('/journal')}>
              {t('navbar.journal')}
            </Link>
          </li>
          <li>
            <Link to="/leaderboard" className={isActive('/leaderboard')}>
              {t('navbar.leaderboard')}
            </Link>
          </li>
          <li>
            <Link to="/achievements" className={isActive('/achievements')}>
              {t('navbar.achievements')}
            </Link>
          </li>
          <li>
            <Link to="/shop" className={isActive('/shop')}>
              {t('navbar.shop')}
            </Link>
          </li>
        </ul>

        <div className="navbar-stats">
          <LanguageSelector
            idSuffix="desktop"
            langRef={langRef}
            langOpen={langOpen}
            setLangOpen={setLangOpen}
            handleLanguageChange={handleLanguageChange}
            language={language}
            languages={languages}
            t={t}
          />

          <button
            onClick={onOpenShortcuts}
            className="btn-ghost"
            style={{
              padding: '0.5rem',
              borderRadius: '50%',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Keyboard Shortcuts (Ctrl+K or ?)"
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard size={20} />
          </button>

          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{
              padding: '0.5rem',
              borderRadius: '50%',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={t('common.toggleTheme')}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <span className="text-xl" aria-hidden="true">
            {profile.avatar}
          </span>
          <span className="text-sm font-semibold">
            <span className="sr-only">{t('navbar.userProfile')} </span>
            {profile.name}
          </span>
          <span className="navbar-gold" title={`${progress.gold || 0} gold`}>
            🪙 {progress.gold || 0}
          </span>
          <button
            onClick={resetOnboarding}
            className="btn-ghost"
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              minWidth: '44px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={t('navbar.replayTutorial')}
            aria-label={t('navbar.replayTutorial')}
          >
            🎓
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hamburger-btn"
          style={{
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={isOpen ? t('navbar.closeMenu') : t('navbar.openMenu')}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}

        <div className={`mobile-menu ${isOpen ? 'open' : ''}`} aria-label={t('navbar.ariaMobile')}>
          <div
            className="mobile-menu-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              width: '100%',
            }}
          >
            <span className="text-sm font-bold opacity-85">Navigation</span>
            <button
              onClick={() => setIsOpen(false)}
              className="btn-ghost"
              style={{
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={t('navbar.closeMenu')}
            >
              <X size={24} />
            </button>
          </div>

          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            {t('navbar.home')}
          </Link>
          <Link
            to="/campaigns"
            onClick={() => setIsOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            {t('navbar.campaigns')}
          </Link>
          <Link
            to="/missions"
            onClick={() => setIsOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            {t('navbar.missions')}
          </Link>
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            {t('navbar.profile')}
          </Link>
          <Link
            to="/journal"
            onClick={() => setIsOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            {t('navbar.journal')}
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setIsOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            {t('navbar.leaderboard')}
          </Link>
          <Link
            to="/achievements"
            onClick={() => setIsOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            {t('navbar.achievements')}
          </Link>
          <Link
            to="/shop"
            onClick={() => setIsOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            {t('navbar.shop')}
          </Link>

          <div
            className="mobile-stats"
            style={{
              marginTop: 'auto',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <LanguageSelector
              idSuffix="mobile"
              langRef={langRef}
              langOpen={langOpen}
              setLangOpen={setLangOpen}
              handleLanguageChange={handleLanguageChange}
              language={language}
              languages={languages}
              t={t}
            />

            <div
              style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}
            >
              <button
                onClick={toggleTheme}
                className="btn-ghost"
                style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={t('common.toggleTheme')}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <span aria-hidden="true" style={{ fontSize: '1.25rem' }}>
                {profile.avatar}
              </span>
              <span style={{ fontWeight: '600' }}>{profile.name}</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
