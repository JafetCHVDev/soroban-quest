import React from "react";

export default function LiveValidationBar({ passCount, totalCount }) {
  if (totalCount === 0) {
    return null;
  }

  const pct = Math.round((passCount / totalCount) * 100);
  
  let label, color, barColor;
  
  if (passCount === totalCount) {
    label = `${passCount}/${totalCount} checks passing ✓`;
    color = "#34d399";
    barColor = "#059669";
  } else if (passCount === 0) {
    label = `${passCount}/${totalCount} checks passing`;
    color = "#f87171";
    barColor = "#dc2626";
  } else {
    label = `${passCount}/${totalCount} checks passing`;
    color = "#fbbf24";
    barColor = "#d97706";
  }

  return (
    <div className="live-validation-bar">
      <div className="live-validation-progress">
        <div
          className="live-validation-progress-fill"
          style={{
            width: `${pct}%`,
            background: barColor,
          }}
        />
      </div>
      <span className="live-validation-label" style={{ color }}>
        {label}
      </span>
      <span className="live-validation-separator">|</span>
      <span className="live-validation-hint">
        live checks · full suite on Run Tests
      </span>
    </div>
  );
}
