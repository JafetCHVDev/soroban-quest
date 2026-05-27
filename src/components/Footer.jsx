
import React from "react";
// Import Link from react-router-dom to handle client-side routing transitions
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Platform</h4>
          <ul>
            {/* Replaced raw HTML anchors with React Router Link components to prevent page reloads */}
            <li><Link to="/">Home</Link></li>
            <li><Link to="/missions">Missions</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            {/* Removed the non-existent /glossary link per acceptance criteria */}
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            {/* Kept external links as standard tags, adding the secure noreferrer parameter */}
            <li><a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer">Soroban Docs</a></li>
            <li><a href="https://stellar.org/developers" target="_blank" rel="noopener noreferrer">Stellar SDK</a></li>
            <li><a href="https://github.com/JafetCHVDev/soroban-quest" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Community</h4>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Discord</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Telegram</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-credits">
        <p>Built for the Stellar ecosystem</p>
        <p>MIT License</p>
      </div>
    </footer>
  );
}