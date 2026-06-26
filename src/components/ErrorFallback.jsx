import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import "./ErrorBoundary.css";
import ErrorFallback from "./ErrorFallback";

/* ---------- Specialized fallback components (kept inside for Editor/Mission) ---------- */
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

/* ---------- Class Error Boundaries ---------- */

/**
 * App-wide Error Boundary (uses the new separate ErrorFallback component)
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
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

/**
 * Editor-specific Error Boundary
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
 * Mission-specific Error Boundary
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