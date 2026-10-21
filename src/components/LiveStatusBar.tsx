import React from "react";
import type { LanguageContextValue } from "../i18n";

interface LiveStatusBarProps {
  passCount: number;
  totalCount: number;
  t: LanguageContextValue["t"];
}

interface StatusBarState {
  label: string;
  color: string;
  background: string;
  pct: number;
}

function statusBarState(
  passCount: number,
  totalCount: number,
  t: LanguageContextValue["t"],
): StatusBarState {
  const pct = Math.round((passCount / totalCount) * 100);
  if (passCount === totalCount) {
    return {
      label: t("missionDetail.status.allPassing", {
        passed: passCount,
        total: totalCount,
      }),
      color: "#34d399",
      background: "#059669",
      pct,
    };
  }

  if (passCount === 0) {
    return {
      label: t("missionDetail.status.passing", {
        passed: passCount,
        total: totalCount,
      }),
      color: "#f87171",
      background: "#dc2626",
      pct,
    };
  }
  return {
    label: t("missionDetail.status.passing", {
      passed: passCount,
      total: totalCount,
    }),
    color: "#fbbf24",
    background: "#d97706",
    pct,
  };
}

/**
 * Live validation status bar shown under the mission editor once the first
 * debounced check has run.
 */
export default function LiveStatusBar({
  passCount,
  totalCount,
  t,
}: LiveStatusBarProps): React.ReactElement | null {
  if (totalCount <= 0) return null;

  const sbState = statusBarState(passCount, totalCount, t);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "6px 14px",
        background: "rgba(0,0,0,0.35)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        fontSize: "11.5px",
        fontFamily: "'JetBrains Mono', monospace",
        userSelect: "none",
      }}
      role="status"
      aria-label="Live typing test checker tracker status panel"
    >
      <div
        style={{
          width: "100%",
          height: "4px",
          borderRadius: "2px",
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          maxWidth: "120px",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            height: "100%",
            width: `${sbState.pct}%`,
            background: sbState.background,
            borderRadius: "2px",
            transition: "width 0.3s ease, background 0.3s ease",
          }}
        />
      </div>
      <span style={{ color: sbState.color, transition: "color 0.3s" }}>
        {sbState.label}
      </span>
      <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }} aria-hidden="true">
        |
      </span>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10.5px" }}>
        {t("missionDetail.status.note")}
      </span>
    </div>
  );
}
