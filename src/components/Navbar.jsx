import { Link, useLocation } from 'react-router-dom';
import { loadProgress } from '../systems/storage';

export default function Navbar() {
  const location = useLocation();
  const state = loadProgress();

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <svg className="navbar-logo-icon" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" stroke="url(#navGrad)" strokeWidth="2" />
          <path
            d="M18 6L22 14L30 16L24 22L25 30L18 26L11 30L12 22L6 16L14 14L18 6Z"
            fill="url(#navGrad)"
          />
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
        <li>
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/missions" className={isActive('/missions')}>
            Missions
          </Link>
        </li>
        <li>
          <Link to="/profile" className={isActive('/profile')}>
            Profile
          </Link>
        </li>
      </ul>

      <div className="navbar-stats">
        <div className="navbar-xp">⚡ {state.xp} XP</div>
        <div className="navbar-level">🛡️ Lv.{state.level}</div>
      </div>
    </nav>
  );
}
