import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Platform</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/missions">Missions</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="https://soroban.stellar.org" target="_blank" rel="noopener">Soroban Docs</a></li>
            <li><a href="https://stellar.org/developers" target="_blank" rel="noopener">Stellar SDK</a></li>
            <li><a href="https://github.com/JafetCHVDev/soroban-quest" target="_blank" rel="noopener">GitHub</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Community</h4>
          <ul>
            <li><a href="#" target="_blank" rel="noopener">Discord</a></li>
            <li><a href="#" target="_blank" rel="noopener">Telegram</a></li>
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