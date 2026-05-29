import React, { useState, useMemo } from "react";
import {
  getActivityLog,
  ACTIVITY_TYPES,
  clearLog,
} from "../systems/activityLogger";
import { loadProgress } from "../systems/storage";
import { useTranslation } from "../i18n/useTranslation";
import "./Journal.css";

// Filter chip definitions: i18n key for label + the EVENT_LABEL bucket it matches.
const FILTER_DEFS = [
  { id: "ALL", labelKey: "journal.filters.all", bucket: null },
  { id: "MISSION", labelKey: "journal.filters.mission", bucket: "mission" },
  { id: "BADGE", labelKey: "journal.filters.badge", bucket: "badge" },
  { id: "LEVEL_UP", labelKey: "journal.filters.levelUp", bucket: "levelUp" },
  { id: "HINT", labelKey: "journal.filters.hint", bucket: "hint" },
  { id: "SYSTEM", labelKey: "journal.filters.system", bucket: "system" },
];

// Map each activity type to a visual bucket (icon + class + label key).
const EVENT_CONFIG = {
  [ACTIVITY_TYPES.MISSION_STARTED]: { icon: "⚔️", class: "mission", bucket: "mission" },
  [ACTIVITY_TYPES.MISSION_COMPLETED]: { icon: "🗡️", class: "mission", bucket: "mission" },
  [ACTIVITY_TYPES.BADGE_EARNED]: { icon: "🏅", class: "badge", bucket: "badge" },
  [ACTIVITY_TYPES.LEVEL_UP]: { icon: "⬆️", class: "level", bucket: "levelUp" },
  [ACTIVITY_TYPES.HINT_USED]: { icon: "💡", class: "hint", bucket: "hint" },
  [ACTIVITY_TYPES.EXPORT]: { icon: "📤", class: "system", bucket: "system" },
  [ACTIVITY_TYPES.IMPORT]: { icon: "📥", class: "system", bucket: "system" },
  [ACTIVITY_TYPES.STREAK]: { icon: "🔥", class: "system", bucket: "system" },
};

/**
 * Compose a display message from the entry's type + data using current language.
 * Falls back to the stored legacy `message` for entries with unknown types
 * (or persisted by older app versions before this refactor).
 */
function formatEventMessage(entry, t) {
  const { type, data = {}, message } = entry;
  switch (type) {
    case ACTIVITY_TYPES.MISSION_STARTED:
      return t("journal.events.missionStarted", {
        title: data.title || data.missionId || "",
      });
    case ACTIVITY_TYPES.MISSION_COMPLETED:
      return t("journal.events.missionCompleted", {
        title: data.title || data.missionId || "",
      });
    case ACTIVITY_TYPES.BADGE_EARNED: {
      // Prefer translated badge name (by id); fall back to stored name.
      const translatedName = data.badgeId
        ? t(`badges.${data.badgeId}.name`)
        : null;
      const name =
        translatedName && translatedName !== `badges.${data.badgeId}.name`
          ? translatedName
          : data.badgeName || "";
      return t("journal.events.badgeEarned", { name });
    }
    case ACTIVITY_TYPES.LEVEL_UP:
      return t("journal.events.levelUp", { level: data.level });
    case ACTIVITY_TYPES.HINT_USED:
      return t("journal.events.hintUsed", {
        index: (data.hintIndex ?? 0) + 1,
      });
    case ACTIVITY_TYPES.EXPORT:
      return t("journal.events.export");
    case ACTIVITY_TYPES.IMPORT:
      return t("journal.events.import");
    case ACTIVITY_TYPES.STREAK:
      return t(
        data.streak === 1
          ? "journal.events.streakOne"
          : "journal.events.streakMany",
        { count: data.streak },
      );
    default:
      // Unknown type — fall back to legacy stored message
      return message || type;
  }
}

export default function Journal() {
  const { t, language } = useTranslation();
  const [log, setLog] = useState(() => getActivityLog());
  const [filter, setFilter] = useState("ALL");
  const progress = loadProgress();

  const filteredLog = useMemo(() => {
    if (filter === "ALL") return log;
    const targetBucket = FILTER_DEFS.find((f) => f.id === filter)?.bucket;
    if (!targetBucket) return log;
    return log.filter((entry) => {
      const cfg = EVENT_CONFIG[entry.type];
      return cfg?.bucket === targetBucket;
    });
  }, [log, filter]);

  // Group by date — formatted using current locale.
  const groupedLog = useMemo(() => {
    const groups = {};
    filteredLog.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dateStr = formatDateHeader(date, t, language);
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(entry);
    });
    return groups;
  }, [filteredLog, t, language]);

  const handleClear = () => {
    if (window.confirm(t("journal.confirmClear"))) {
      clearLog();
      setLog([]);
    }
  };

  // Locale to use for time formatting (Intl falls back gracefully if unknown)
  const timeLocale = language === "es" ? "es" : "en";

  return (
    <div className="journal-page">
      <div className="journal-header flex justify-between items-end">
        <div>
          <h1 className="journal-title">{t("journal.title")}</h1>
          <p className="text-secondary">{t("journal.subtitle")}</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: "var(--red)" }}
          onClick={handleClear}
        >
          {t("journal.clearLog")}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="adventure-summary">
        <div className="summary-stat">
          <span className="summary-stat-value">
            {progress.completedMissions.length}
          </span>
          <span className="summary-stat-label">
            {t("journal.summary.missions")}
          </span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{progress.badges.length}</span>
          <span className="summary-stat-label">
            {t("journal.summary.badges")}
          </span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{progress.level}</span>
          <span className="summary-stat-label">
            {t("journal.summary.level")}
          </span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{progress.xp}</span>
          <span className="summary-stat-label">
            {t("journal.summary.totalXp")}
          </span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{progress.streak || 0}</span>
          <span className="summary-stat-label">
            {t("journal.summary.streak")}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="journal-filters">
        {FILTER_DEFS.map((f) => (
          <button
            key={f.id}
            className={`filter-chip ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {Object.keys(groupedLog).length === 0 ? (
        <div className="card text-center p-12">
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>
            📖
          </div>
          <p className="text-secondary">{t("journal.empty")}</p>
        </div>
      ) : (
        <div className="timeline">
          {Object.entries(groupedLog).map(([date, entries]) => (
            <div key={date} className="date-group">
              <div className="date-header">{date}</div>
              {entries.map((entry) => {
                const config = EVENT_CONFIG[entry.type] || {
                  icon: "❓",
                  class: "system",
                };
                const time = new Date(entry.timestamp).toLocaleTimeString(
                  timeLocale,
                  { hour: "2-digit", minute: "2-digit" },
                );

                const displayMessage = formatEventMessage(entry, t);

                return (
                  <div key={entry.id} className="timeline-event">
                    <div className={`event-dot ${config.class}`}>
                      {config.icon}
                    </div>
                    <div className="event-content">
                      <div className="event-time">{time}</div>
                      <div className="event-message">{displayMessage}</div>
                      {entry.data && Object.keys(entry.data).length > 0 && (
                        <div className="event-details">
                          {entry.type === ACTIVITY_TYPES.LEVEL_UP &&
                            t("journal.details.targetXp", { xp: progress.xp })}
                          {entry.type === ACTIVITY_TYPES.MISSION_COMPLETED &&
                            entry.data.xp != null &&
                            t("journal.details.earnedXp", {
                              xp: entry.data.xp,
                            })}
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

function formatDateHeader(date, t, language) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return t("journal.dates.today");
  if (isSameDay(date, yesterday)) return t("journal.dates.yesterday");

  const locale = language === "es" ? "es" : "en-US";
  return date.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year:
      date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
