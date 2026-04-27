import React from "react";
import "./ErrorBoundary.css";

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
      return (
        <div className="error-boundary-overlay">
          <div className="error-icon">⚠️</div>
          <h1 className="error-title">Something went wrong</h1>
          <p className="error-text">
            The quest encountered a runtime error. Check the console for
            details.
          </p>
          <div className="error-button-group">
            <button
              className="btn-reload"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <a
              className="btn-report"
              href="https://github.com/JafetCHVDev/soroban-quest/issues"
              target="_blank"
            >
              Report Issue
            </a>
          </div>
        </div>
      );
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
      return (
        <div className="editor-fallback">
          <p style={{ color: "#f87171" }}>Editor failed to load</p>
          <button
            className="btn-reload"
            style={{ scale: "0.8" }}
            onClick={() => window.location.reload()}
          >
            Reset Editor
          </button>
        </div>
      );
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
      return (
        <div
          className="error-boundary-overlay"
          style={{ minHeight: "auto", padding: "40px" }}
        >
          <h3 style={{ color: "#6366f1" }}>Mission unavailable</h3>
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
