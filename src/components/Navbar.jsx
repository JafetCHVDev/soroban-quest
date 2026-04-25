import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { loadProfile } from "../systems/storage";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const profile = loadProfile();

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

      {/* PROFILE DISPLAY (DESKTOP) */}
      <div className="navbar-stats">
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
        <Link to="/missions" onClick={() => setIsOpen(false)}>
          Missions
        </Link>
        <Link to="/profile" onClick={() => setIsOpen(false)}>
          Profile
        </Link>

        {/* MOBILE PROFILE */}
        <div className="mobile-stats">
          <span>{profile.avatar}</span>
          <span>{profile.name}</span>
        </div>
      </div>
    </nav>
  );
}
