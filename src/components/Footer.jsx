
import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import { Link } from "react-router-dom";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>{t("footer.platform.heading")}</h4>
          <ul>
            <li><Link to="/">{t("footer.platform.home")}</Link></li>
            <li><Link to="/missions">{t("footer.platform.missions")}</Link></li>
            <li><Link to="/profile">{t("footer.platform.profile")}</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t("footer.resources.heading")}</h4>
          <ul>
            <li><a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer">{t("footer.resources.docs")}<span className="sr-only"> (opens in new tab)</span></a></li>
            <li><a href="https://stellar.org/developers" target="_blank" rel="noopener noreferrer">{t("footer.resources.sdk")}<span className="sr-only"> (opens in new tab)</span></a></li>
            <li><a href="https://github.com/JafetCHVDev/soroban-quest" target="_blank" rel="noopener noreferrer">{t("footer.resources.github")}<span className="sr-only"> (opens in new tab)</span></a></li>
            <li><a href="https://developers.stellar.org/docs/learn/encyclopedia" target="_blank" rel="noopener noreferrer">{t("footer.resources.glossary")}<span className="sr-only"> (opens in new tab)</span></a></li>
            <li><a href="https://github.com/JafetCHVDev/soroban-quest/issues" target="_blank" rel="noopener noreferrer">{t("footer.resources.faq")}<span className="sr-only"> (opens in new tab)</span></a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t("footer.community.heading")}</h4>
          <ul>
            <li><a href="https://discord.gg/stellarcomm" target="_blank" rel="noopener noreferrer">{t("footer.community.discord")}<span className="sr-only"> (opens in new tab)</span></a></li>
            <li><a href="https://forum.stellar.org" target="_blank" rel="noopener noreferrer">{t("footer.community.forum")}<span className="sr-only"> (opens in new tab)</span></a></li>
            <li><a href="https://stellar.org/blog" target="_blank" rel="noopener noreferrer">{t("footer.community.blog")}<span className="sr-only"> (opens in new tab)</span></a></li>
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
