// src/components/TimeStats.jsx
import React from "react";
import { formatTime } from "../pages/MissionDetail";

/**
 * TimeStats
 *
 * Displays a "Time Statistics" section on the Profile page.
 *
 * Props:
 *   missionTimes — object from loadMissionTimes():
 *     { [missionId]: { startTime, completionTime, completedAt } }
 *   completedMissions — array of mission objects that the user has completed
 *     (each with .id and .title)
 */
export default function TimeStats({ missionTimes, completedMissions }) {
  // Only count missions that have a recorded completionTime
  const timedMissions = completedMissions.filter(
    (m) => missionTimes[m.id]?.completionTime != null
  );

  if (timedMissions.length === 0) {
    return (
      <>
        <h2 className="profile-section-title">⏱ Time Statistics</h2>
        <div
          className="card"
          style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", marginBottom: "var(--space-2xl)" }}
        >
          Complete a mission to start tracking your times.
        </div>
      </>
    );
  }

  // ── Compute aggregate stats ──────────────────────────────────────────────
  const times = timedMissions.map((m) => missionTimes[m.id].completionTime);
  const totalSeconds = times.reduce((acc, t) => acc + t, 0);
  const averageSeconds = Math.round(totalSeconds / times.length);
  const fastestSeconds = Math.min(...times);
  const fastestMission = timedMissions.find(
    (m) => missionTimes[m.id].completionTime === fastestSeconds
  );

  return (
    <>
      <h2 className="profile-section-title">⏱ Time Statistics</h2>

      {/* ── Summary cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "var(--space-sm)",
          marginBottom: "var(--space-lg)",
        }}
      >
        <StatCard
          label="Total Time"
          value={formatTime(totalSeconds)}
          color="var(--cyan)"
          bg="var(--cyan-dim)"
          border="rgba(6, 214, 160, 0.2)"
          icon="🕐"
        />
        <StatCard
          label="Average Time"
          value={formatTime(averageSeconds)}
          color="var(--purple)"
          bg="rgba(139, 92, 246, 0.08)"
          border="rgba(139, 92, 246, 0.2)"
          icon="📊"
        />
        <StatCard
          label="Fastest"
          value={formatTime(fastestSeconds)}
          color="var(--gold)"
          bg="var(--gold-dim)"
          border="rgba(245, 158, 11, 0.2)"
          icon="⚡"
          subtitle={fastestMission?.title}
        />
      </div>

      {/* ── Per-mission breakdown ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        {timedMissions.map((m) => {
          const entry = missionTimes[m.id];
          const isFastest = entry.completionTime === fastestSeconds;
          return (
            <div
              key={m.id}
              className="card"
              style={{
                padding: "var(--space-md)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{m.title}</strong>
                {isFastest && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.7rem",
                      color: "var(--gold)",
                      background: "var(--gold-dim)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      borderRadius: "4px",
                      padding: "1px 6px",
                      verticalAlign: "middle",
                    }}
                  >
                    ⚡ Fastest
                  </span>
                )}
                {entry.completedAt && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {new Date(entry.completedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.9rem",
                  color: "var(--cyan)",
                  minWidth: "60px",
                  textAlign: "right",
                }}
              >
                {formatTime(entry.completionTime)}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Small reusable stat card ──────────────────────────────────────────────────
function StatCard({ label, value, color, bg, border, icon, subtitle }) {
  return (
    <div
      className="card"
      style={{
        padding: "var(--space-md)",
        background: bg,
        border: `1px solid ${border}`,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "1.25rem", marginBottom: "4px" }}>{icon}</div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.2rem",
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
        {label}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            marginTop: "2px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
} 