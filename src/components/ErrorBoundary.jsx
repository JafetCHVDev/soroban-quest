import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import "./ErrorBoundary.css";

/* ---------- Functional fallback subcomponents ---------- */
/* They live inside the LanguageProvider tree (the provider is above
   the ErrorBoundary in App.jsx), so they can safely use useTranslation. */

function GenericErrorFallback() {
  const { t } = useTranslation();
  return (
    <div className="error-boundary-overlay">
      <div className="error-icon">⚠️</div>
      <h1 className="error-title">{t("errorBoundary.generic.title")}</h1>
      <p className="error-text">{t("errorBoundary.generic.body")}</p>
      <div className="error-button-group">
        <button
          className="btn-reload"
          onClick={() => window.location.reload()}
        >
          {t("errorBoundary.generic.reload")}
        </button>
        <button
          className="btn-reload"
          onClick={() => window.location.href = '/'}
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          {t("errorBoundary.generic.goHome")}
        </button>
        <a
          className="btn-report"
          href="https://github.com/JafetCHVDev/soroban-quest/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("errorBoundary.generic.report")}
        </a>
      </div>
    </div>
  );
}

function EditorErrorFallback() {
  const { t } = useTranslation();
  return (
    <div className="editor-fallback">
      <p style={{ color: "#f87171" }}>{t("errorBoundary.editor.body")}</p>
      <button
        className="btn-reload"
        style={{ scale: "0.8" }}
        onClick={() => window.location.reload()}
      >
        {t("errorBoundary.editor.reset")}
      </button>
    </div>
  );
}

function MissionErrorFallback() {
  const { t } = useTranslation();
  return (
    <div
      className="error-boundary-overlay"
      style={{ minHeight: "auto", padding: "40px" }}
    >
      <h3 style={{ color: "#6366f1" }}>{t("errorBoundary.mission.title")}</h3>
      <button onClick={() => window.location.reload()}>
        {t("errorBoundary.mission.retry")}
      </button>
    </div>
  );
}

/* ---------- Class boundaries ---------- */

/**
 * 1. Generic Error Boundary
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Soroban Quest Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <GenericErrorFallback />;
    }
    return this.props.children;
  }
}

/**
 * 2. Editor Error Boundary
 */
export class EditorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <EditorErrorFallback />;
    }
    return this.props.children;
  }
}

/**
 * 3. Mission Error Boundary
 */
export class MissionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <MissionErrorFallback />;
    }
    return this.props.children;
  }
}
