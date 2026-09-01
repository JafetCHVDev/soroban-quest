import React from "react";

/**
 * LoadingScreen component
 * Displays a loading overlay with spinner and status text while assets are being loaded
 *
 * @returns {React.ReactElement} Loading screen overlay
 */
const LoadingScreen = (): React.ReactElement => {
  return (
    <div className="quest-loading-overlay" role="status" aria-live="polite" aria-label="Loading quest assets">
      {/* Radial Glow Ambient Effect */}
      <div className="quest-loading-glow" aria-hidden="true" />

      <div className="quest-loading-content">
        {/* Futuristic Custom Spinner */}
        <div className="quest-loading-spinner-container">
          <div className="quest-loading-spinner-bg" />
          <div className="quest-loading-spinner-active" />
        </div>

        {/* Informational Tracking Typography */}
        <div className="quest-loading-text-wrapper">
          <h2 className="quest-loading-title">Loading Quest Assets</h2>
          <p className="quest-loading-subtitle">Initializing module chunks...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
