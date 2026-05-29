import React from "react";
import { useTranslation } from "../i18n/useTranslation";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>{t("footer.platform.heading")}</h4>
          <ul>
            <li><a href="/">{t("footer.platform.home")}</a></li>
            <li><a href="/missions">{t("footer.platform.missions")}</a></li>
            <li><a href="/profile">{t("footer.platform.profile")}</a></li>
            <li><a href="/glossary">{t("footer.platform.glossary")}</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t("footer.resources.heading")}</h4>
          <ul>
            <li><a href="https://soroban.stellar.org" target="_blank" rel="noopener">{t("footer.resources.docs")}</a></li>
            <li><a href="https://stellar.org/developers" target="_blank" rel="noopener">{t("footer.resources.sdk")}</a></li>
            <li><a href="https://github.com/JafetCHVDev/soroban-quest" target="_blank" rel="noopener">{t("footer.resources.github")}</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t("footer.community.heading")}</h4>
          <ul>
            <li><a href="#" target="_blank" rel="noopener">{t("footer.community.discord")}</a></li>
            <li><a href="#" target="_blank" rel="noopener">{t("footer.community.telegram")}</a></li>
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
