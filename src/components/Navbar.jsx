import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import { useGameState } from "../systems/GameStateContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const { profile } = useGameState();
  const langRef = useRef(null);

  const { t, language, setLanguage, languages } = useTranslation();

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("soroban_quest_theme") ||
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark")
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("soroban_quest_theme", theme);
  }, [theme]);

  // Close the language dropdown on outside click or Escape
  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setLangOpen(false);
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

return (
    <>
      {/* SKIP TO CONTENT LINK (#102) */}
      <a href="#main-content" className="skip-to-content">
        {t("common.skipToContent")}
      </a>

      <nav className="navbar" aria-label={t("navbar.ariaMain")}>
        {/* LOGO */}
        <Link to="/" className="navbar-logo" aria-label={t("navbar.ariaHome")}>
          <span className="navbar-logo-text">SOROBAN QUEST</span>
        </Link>

        {/* LINKS */}
        <ul className="navbar-links">
          <li>
            <Link to="/" className={isActive("/")}>
              {t("navbar.home")}
            </Link>
          </li>
          <li>
            <Link to="/campaigns" className={isActive("/campaigns")}>
              {t("navbar.campaigns")}
            </Link>
          </li>
          <li>
            <Link to="/missions" className={isActive("/missions")}>
              {t("navbar.missions")}
            </Link>
          </li>
          <li>
            <Link to="/profile" className={isActive("/profile")}>
              {t("navbar.profile")}
            </Link>
          </li>
          <li>
            <Link to="/journal" className={isActive("/journal")}>
              {t("navbar.journal")}
            </Link>
          </li>
          <li>
            <Link to="/leaderboard" className={isActive("/leaderboard")}>
              {t("navbar.leaderboard")}
            </Link>
          </li>
          <li>
            <Link to="/achievements" className={isActive("/achievements")}>
              {t("navbar.achievements")}
            </Link>
          </li>
          <li>
            <Link to="/shop" className={isActive("/shop")}>
              {t("navbar.shop")}
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
            onClick={toggleTheme}
            className="btn-ghost"
            style={{ padding: "0.5rem", borderRadius: "50%" }}
            aria-label={t("common.toggleTheme")}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <span className="text-xl" aria-hidden="true">
            {profile.avatar}
          </span>
          <span className="text-sm font-semibold">
            <span className="sr-only">{t("navbar.userProfile")} </span>
            {profile.name}
          </span>
        </div>

        {/* HAMBURGER */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hamburger-btn"
          aria-label={isOpen ? t("navbar.closeMenu") : t("navbar.openMenu")}
          aria-expanded={isOpen}
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* BACKDROP */}
        {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}

        {/* MOBILE MENU */}
        <div
          className={`mobile-menu ${isOpen ? "open" : ""}`}
          aria-label={t("navbar.ariaMobile")}
        >
          <Link to="/" onClick={() => setIsOpen(false)}>
            {t("navbar.home")}
          </Link>
          <Link to="/campaigns" onClick={() => setIsOpen(false)}>
            {t("navbar.campaigns")}
          </Link>
          <Link to="/missions" onClick={() => setIsOpen(false)}>
            {t("navbar.missions")}
          </Link>
          <Link to="/profile" onClick={() => setIsOpen(false)}>
            {t("navbar.profile")}
          </Link>
          <Link to="/journal" onClick={() => setIsOpen(false)}>
            {t("navbar.journal")}
          </Link>
          <Link to="/leaderboard" onClick={() => setIsOpen(false)}>
            {t("navbar.leaderboard")}
          </Link>
          <Link to="/achievements" onClick={() => setIsOpen(false)}>
            {t("navbar.achievements")}
          </Link>
          <Link to="/shop" onClick={() => setIsOpen(false)}>
            {t("navbar.shop")}
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

            <button
              onClick={toggleTheme}
              className="btn-ghost"
              style={{ padding: "0.5rem", borderRadius: "50%" }}
              aria-label={t("common.toggleTheme")}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <span aria-hidden="true">{profile.avatar}</span>
            <span>{profile.name}</span>
          </div>
        </div>
      </nav>
    </>
  );
}

function LanguageSelector({
  idSuffix = "desktop",
  langRef,
  langOpen,
  setLangOpen,
  handleLanguageChange,
  language,
  languages,
  t,
}) {
  const currentLang =
    languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="language-selector" ref={idSuffix === "desktop" ? langRef : null}>
      <button
        type="button"
        className="btn-ghost language-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        aria-label={t("common.selectLanguage")}
        onClick={() => setLangOpen((v) => !v)}
      >
        <Globe size={18} />
        <span className="language-selector-code">
          {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {langOpen && (
        <ul
          className="language-selector-menu"
          role="listbox"
          aria-label={t("common.selectLanguage")}
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === language}
                className={`language-selector-option ${
                  lang.code === language ? "active" : ""
                }`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="language-selector-option-code">
                  {lang.code.toUpperCase()}
                </span>
                <span className="language-selector-option-name">
                  {lang.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
