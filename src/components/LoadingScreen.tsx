import React from "react";

const LoadingScreen = () => {
  return (
    <div className="quest-loading-overlay">
      {/* Radial Glow Ambient Effect */}
      <div className="quest-loading-glow" />

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