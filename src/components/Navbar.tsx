import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Keyboard, Volume2, VolumeX } from 'lucide-react';
import {
  isMuted,
  toggleMute,
  unlockAudio,
} from '../systems/soundManager';
import { useTranslation } from '../i18n/useTranslation';
import { useGameState } from '../systems/GameStateContext';
import LanguageSelector from './LanguageSelector';
import { resetOnboarding } from './Onboarding';

/**
 * Navbar component props
 */
interface NavbarProps {
  /** Callback to open keyboard shortcuts modal */
  onOpenShortcuts: () => void;
}

/**
 * Navbar component
 * Main navigation bar with links, theme toggle, language selector, and user profile info
 *
 * @param {NavbarProps} props - Component props
 * @returns {ReactElement} Navigation bar
 */
export default function Navbar({ onOpenShortcuts }: NavbarProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [muted, setMuted] = useState(() => isMuted());
  const location = useLocation();
  const { profile, progress } = useGameState();
  const langRef = useRef<HTMLDivElement>(null);

  const { t, language, setLanguage, languages } = useTranslation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('soroban_quest_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('soroban_quest_theme', theme);
  }, [theme]);

  // Close the language dropdown on outside click or Escape
  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e: MouseEvent): void => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [langOpen]);

  const toggleTheme = (): void => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleMute = (): void => {
    const nextMuted = toggleMute();
    setMuted(nextMuted);

    // Unlock AudioContext from a user gesture where supported.
    unlockAudio();
  };

  const handleLanguageChange = (code: string): void => {
    setLanguage(code as 'en' | 'es' | 'fr' | 'ja');
    setLangOpen(false);
  };

  const isActive = (path: string): string => (location.pathname === path ? 'active' : '');

  return (
    <>
      {/* SKIP TO CONTENT LINK (#102) */}
      <a href="#main-content" className="skip-to-content">
        {t('common.skipToContent')}
      </a>

      <nav className="navbar" aria-label={t('navbar.ariaMain')}>
        {/* LOGO */}
        <Link to="/" className="navbar-logo" aria-label={t('navbar.ariaHome')}>
          <span className="navbar-logo-text">SOROBAN QUEST</span>
        </Link>

        {/* LINKS */}
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
            <Link to="/quests" className={isActive('/quests')}>
              {t('navbar.quests')}
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

        {/* PROFILE DISPLAY, LANGUAGE & THEME TOGGLE (DESKTOP) */}
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
            type="button"
            onClick={toggleTheme}
            className="btn-ghost"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            aria-label={t('common.toggleTheme')}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className="btn-ghost"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* KEYBOARD SHORTCUTS BUTTON */}
          <button
            onClick={onOpenShortcuts}
            className="btn-ghost"
            style={{ padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem' }}
            title="Keyboard Shortcuts (? or Ctrl+K)"
            aria-label="Keyboard Shortcuts"
          >
            ⌨️
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
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            title={t('navbar.replayTutorial')}
            aria-label={t('navbar.replayTutorial')}
          >
            🎓
          </button>
        </div>

        {/* HAMBURGER */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hamburger-btn"
          aria-label={isOpen ? t('navbar.closeMenu') : t('navbar.openMenu')}
          aria-expanded={isOpen}
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* BACKDROP */}
        {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}

        {/* MOBILE MENU */}
        <div
          className={`mobile-menu ${isOpen ? 'open' : ''}`}
          aria-label={t('navbar.ariaMobile')}
          aria-hidden={!isOpen}
          inert={!isOpen ? undefined : ''}
        >
          <Link to="/" onClick={() => setIsOpen(false)}>
            {t('navbar.home')}
          </Link>
          <Link to="/campaigns" onClick={() => setIsOpen(false)}>
            {t('navbar.campaigns')}
          </Link>
          <Link to="/missions" onClick={() => setIsOpen(false)}>
            {t('navbar.missions')}
          </Link>
          <Link to="/quests" onClick={() => setIsOpen(false)}>
            {t('navbar.quests')}
          </Link>
          <Link to="/profile" onClick={() => setIsOpen(false)}>
            {t('navbar.profile')}
          </Link>
          <Link to="/journal" onClick={() => setIsOpen(false)}>
            {t('navbar.journal')}
          </Link>
          <Link to="/leaderboard" onClick={() => setIsOpen(false)}>
            {t('navbar.leaderboard')}
          </Link>
          <Link to="/achievements" onClick={() => setIsOpen(false)}>
            {t('navbar.achievements')}
          </Link>
          <Link to="/shop" onClick={() => setIsOpen(false)}>
            {t('navbar.shop')}
          </Link>

          {/* MOBILE EXTRAS */}
          <div className="mobile-stats">
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
              type="button"
              onClick={toggleTheme}
              className="btn-ghost"
              style={{ padding: '0.5rem', borderRadius: '50%' }}
              aria-label={t('common.toggleTheme')}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              className="btn-ghost"
              style={{ padding: '0.5rem', borderRadius: '50%' }}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              title={muted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* KEYBOARD SHORTCUTS BUTTON (MOBILE) */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenShortcuts();
              }}
              className="btn-ghost"
              style={{
                padding: '0.5rem',
                borderRadius: '50%',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
              title="Keyboard Shortcuts"
              aria-label="Keyboard Shortcuts"
            >
              <Keyboard size={24} />
            </button>

            <span aria-hidden="true">{profile.avatar}</span>
            <span>{profile.name}</span>
          </div>
        </div>
      </nav>
    </>
  );
}
