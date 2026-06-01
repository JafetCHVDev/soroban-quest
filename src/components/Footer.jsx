
import React from "react";
import { useTranslation } from "../i18n/useTranslation";
// Import Link from react-router-dom to handle client-side routing transitions
import { Link } from "react-router-dom";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>{t("footer.platform.heading")}</h4>
          <ul>
            {/* Replaced raw HTML anchors with React Router Link components to prevent page reloads */}
            <li><Link to="/">{t("footer.platform.home")}</Link></li>
            <li><Link to="/missions">{t("footer.platform.missions")}</Link></li>
            <li><Link to="/profile">{t("footer.platform.profile")}</Link></li>

          </ul>
        </div>

        <div className="footer-section">
          <h4>{t("footer.resources.heading")}</h4>
          <ul>
            {/* Kept external links as standard tags, adding the secure noreferrer parameter */}
            <li><a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer">{t("footer.resources.docs")}</a></li>
            <li><a href="https://stellar.org/developers" target="_blank" rel="noopener noreferrer">{t("footer.resources.sdk")}</a></li>
            <li><a href="https://github.com/JafetCHVDev/soroban-quest" target="_blank" rel="noopener noreferrer">{t("footer.resources.github")}</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t("footer.community.heading")}</h4>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">{t("footer.community.discord")}</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">{t("footer.community.telegram")}</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-credits">
        <p>{t("footer.credits.tagline")}</p>
        <p>{t("footer.credits.license")}</p>
      </div>
    </footer>
  );
}
