import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import "./ErrorBoundary.css";

export interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { t } = useTranslation();
  return (
    <div className="error-boundary-overlay">
      <div className="error-icon">⚠️</div>
      <h1 className="error-title">{t("errorBoundary.generic.title")}</h1>
      <p className="error-text">{t("errorBoundary.generic.body")}</p>
      {error && <pre className="error-details">{error.message}</pre>}
      <div className="error-button-group">
        <button
          className="btn-reload"
          onClick={resetErrorBoundary || (() => window.location.reload())}
        >
          {t("errorBoundary.generic.reload")}
        </button>
        <button
          className="btn-reload"
          onClick={() => (window.location.href = "/")}
          style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
        >
          {t("errorBoundary.generic.goHome")}
        </button>
      </div>
    </div>
  );
}