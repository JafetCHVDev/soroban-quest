import React, { useState, useMemo } from "react";
import { getActivityLog, ACTIVITY_TYPES, clearLog } from "../systems/activityLogger";
import { loadProgress } from "../systems/storage";
import "./Journal.css";

const EVENT_CONFIG = {
  [ACTIVITY_TYPES.MISSION_STARTED]: { icon: "⚔️", class: "mission", label: "Mission" },
  [ACTIVITY_TYPES.MISSION_COMPLETED]: { icon: "🗡️", class: "mission", label: "Mission" },
  [ACTIVITY_TYPES.BADGE_EARNED]: { icon: "🏅", class: "badge", label: "Badge" },
  [ACTIVITY_TYPES.LEVEL_UP]: { icon: "⬆️", class: "level", label: "Level Up" },
  [ACTIVITY_TYPES.HINT_USED]: { icon: "💡", class: "hint", label: "Hint" },
  [ACTIVITY_TYPES.EXPORT]: { icon: "📤", class: "system", label: "System" },
  [ACTIVITY_TYPES.IMPORT]: { icon: "📥", class: "system", label: "System" },
  [ACTIVITY_TYPES.STREAK]: { icon: "🔥", class: "system", label: "Streak" },
};

export default function Journal() {
  const [log, setLog] = useState(() => getActivityLog());
  const [filter, setFilter] = useState("ALL");
  const progress = loadProgress();

  const filteredLog = useMemo(() => {
    if (filter === "ALL") return log;
    return log.filter(entry => {
      const config = EVENT_CONFIG[entry.type];
      return config && config.label.toUpperCase() === filter;
    });
  }, [log, filter]);

  // Group by date
  const groupedLog = useMemo(() => {
    const groups = {};
    filteredLog.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = formatDateHeader(date);
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(entry);
    });
    return groups;
  }, [filteredLog]);

  const handleClear = () => {
    if (window.confirm("Clear all activity history?")) {
      clearLog();
      setLog([]);
    }
  };

  return (
    <div className="journal-page">
      <div className="journal-header flex justify-between items-end">
        <div>
          <h1 className="journal-title">Adventure Journal</h1>
          <p className="text-secondary">Your journey through the Soroban realm, recorded for eternity.</p>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={handleClear}>
          🗑️ Clear Log
        </button>
      </div>

      {/* Summary Stats */}
      <div className="adventure-summary">
        <div className="summary-stat">
          <span className="summary-stat-value">{progress.completedMissions.length}</span>
          <span className="summary-stat-label">Missions</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{progress.badges.length}</span>
          <span className="summary-stat-label">Badges</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{progress.level}</span>
          <span className="summary-stat-label">Level</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{progress.xp}</span>
          <span className="summary-stat-label">Total XP</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{progress.streak || 0}</span>
          <span className="summary-stat-label">Day Streak</span>
        </div>
      </div>

      {/* Filters */}
      <div className="journal-filters">
        {["ALL", "MISSION", "BADGE", "LEVEL UP", "HINT", "SYSTEM"].map(f => (
          <button 
            key={f} 
            className={`filter-chip ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {Object.keys(groupedLog).length === 0 ? (
        <div className="card text-center p-12">
          <div style={{ fontSize: "3rem", marginBottom: "1rem opacity: 0.3" }}>📖</div>
          <p className="text-secondary">No activities recorded yet. Start your first mission!</p>
        </div>
      ) : (
        <div className="timeline">
          {Object.entries(groupedLog).map(([date, entries]) => (
            <div key={date} className="date-group">
              <div className="date-header">{date}</div>
              {entries.map(entry => {
                const config = EVENT_CONFIG[entry.type] || { icon: "❓", class: "system" };
                const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={entry.id} className="timeline-event">
                    <div className={`event-dot ${config.class}`}>
                      {config.icon}
                    </div>
                    <div className="event-content">
                      <div className="event-time">{time}</div>
                      <div className="event-message">{entry.message}</div>
                      {entry.data && Object.keys(entry.data).length > 0 && (
                        <div className="event-details">
                          {entry.type === ACTIVITY_TYPES.LEVEL_UP && `Target XP reached: ${progress.xp}`}
                          {entry.type === ACTIVITY_TYPES.MISSION_COMPLETED && `Earned ${entry.data.xp || ""} XP`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDateHeader(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", { 
    month: "long", 
    day: "numeric", 
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined 
  });
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}
