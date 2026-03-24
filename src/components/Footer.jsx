import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Platform</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/missions">Missions</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/glossary">Glossary</a></li>
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