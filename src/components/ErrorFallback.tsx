import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import "./ErrorBoundary.css";

/**
 * ErrorFallback component props
 */
interface ErrorFallbackProps {
  /** Error object that was caught */
  error?: Error;
  /** Component stack trace information */
  errorInfo?: {
    componentStack: string;
  };
  /** Callback to reset error state */
  onReset?: () => void;
}

/**
 * ErrorFallback component
 * Generic fallback UI displayed when an error is caught by the app-wide error boundary
 *
 * @param {ErrorFallbackProps} props - Component props
 * @returns {React.ReactElement} Error fallback UI
 */
function ErrorFallback({
  error,
  errorInfo,
  onReset,
}: ErrorFallbackProps = {}): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="error-boundary-overlay">
      <h2>{t("errorBoundary.title")}</h2>
      <p>{t("errorBoundary.message")}</p>
      {error && (
        <details style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
          <summary>{t("errorBoundary.details")}</summary>
          {error.toString()}
          {errorInfo && errorInfo.componentStack}
        </details>
      )}
      <button
        className="btn-reload"
        onClick={onReset || (() => window.location.reload())}
      >
        {t("errorBoundary.reload")}
      </button>
    </div>
  );
}

/**
 * EditorErrorFallback component
 * Specialized fallback for editor component errors
 *
 * @returns {React.ReactElement} Editor error fallback UI
 */
function EditorErrorFallback(): React.ReactElement {
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
 * Specialized fallback for mission component errors
 *
 * @returns {React.ReactElement} Mission error fallback UI
 */
function MissionErrorFallback(): React.ReactElement {
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

export { ErrorFallback, EditorErrorFallback, MissionErrorFallback };
export default ErrorFallback;
