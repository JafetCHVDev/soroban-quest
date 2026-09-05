import React, { ReactNode, ReactElement } from "react";
import { useTranslation } from "../i18n/useTranslation";
import "./ErrorBoundary.css";
import type { ErrorBoundaryState } from "../types/components";

/**
 * Functional fallback subcomponents
 * They live inside the LanguageProvider tree (the provider is above
 * the ErrorBoundary in App.tsx), so they can safely use useTranslation.
 */

/**
 * GenericErrorFallback component
 * Displays a generic error message with reload and go home options
 */
function GenericErrorFallback(): ReactElement {
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
          onClick={() => (window.location.href = "/")}
          style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
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

/**
 * EditorErrorFallback component
 * Displays error message specific to editor component failures
 */
function EditorErrorFallback(): ReactElement {
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

/**
 * MissionErrorFallback component
 * Displays error message specific to mission component failures
 */
function MissionErrorFallback(): ReactElement {
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

/**
 * ErrorBoundary component props
 */
interface ErrorBoundaryComponentProps {
  children: ReactNode;
}

/**
 * Generic Error Boundary
 * Catches errors in the component tree and displays GenericErrorFallback
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryComponentProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryComponentProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    console.error("Soroban Quest Error:", error, errorInfo);
  }

  render(): ReactElement | ReactNode {
    if (this.state.hasError) {
      return <GenericErrorFallback />;
    }
    return this.props.children;
  }
}

/**
 * Editor Error Boundary
 * Catches errors specific to the editor component
 */
export class EditorErrorBoundary extends React.Component<
  ErrorBoundaryComponentProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryComponentProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactElement | ReactNode {
    if (this.state.hasError) {
      return <EditorErrorFallback />;
    }
    return this.props.children;
  }
}

/**
 * Mission Error Boundary
 * Catches errors specific to mission components
 */
export class MissionErrorBoundary extends React.Component<
  ErrorBoundaryComponentProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryComponentProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactElement | ReactNode {
    if (this.state.hasError) {
      return <MissionErrorFallback />;
    }
    return this.props.children;
  }
}
