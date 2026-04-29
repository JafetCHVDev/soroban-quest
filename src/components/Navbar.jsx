import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { loadProfile } from "../systems/storage";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const profile = loadProfile();

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-text">SOROBAN QUEST</span>
      </Link>

      {/* LINKS */}
      <ul className="navbar-links">
        <li>
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/campaigns" className={isActive("/campaigns")}>
            Campaigns
          </Link>
        </li>
        <li>
          <Link to="/missions" className={isActive("/missions")}>
            Missions
          </Link>
        </li>
        <li>
          <Link to="/profile" className={isActive("/profile")}>
            Profile
          </Link>
        </li>
      </ul>

      {/* PROFILE DISPLAY & THEME TOGGLE (DESKTOP) */}
      <div className="navbar-stats">
        <button
          onClick={toggleTheme}
          className="btn-ghost"
          style={{ padding: "0.5rem", borderRadius: "50%" }}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <span className="text-xl">{profile.avatar}</span>
        <span className="text-sm font-semibold">{profile.name}</span>
      </div>

      {/* HAMBURGER */}
      <button onClick={() => setIsOpen(!isOpen)} className="hamburger-btn">
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* BACKDROP */}
      {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}

      {/* MOBILE */}
      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setIsOpen(false)}>
          Home
        </Link>
        <Link to="/campaigns" onClick={() => setIsOpen(false)}>
          Campaigns
        </Link>
        <Link to="/missions" onClick={() => setIsOpen(false)}>
          Missions
        </Link>
        <Link to="/profile" onClick={() => setIsOpen(false)}>
          Profile
        </Link>

        {/* MOBILE EXTRAS */}
        <div className="mobile-stats">
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{ padding: "0.5rem", borderRadius: "50%" }}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <span>{profile.avatar}</span>
          <span>{profile.name}</span>
        </div>
      </div>
    </nav>
  );
}
