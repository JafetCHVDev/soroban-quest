import React, { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  getActivityLog,
  ACTIVITY_TYPES,
  clearLog,
} from "../systems/activityLogger";
import { loadProgress } from "../systems/storage";
import { useTranslation } from "../i18n/useTranslation";
import "./Journal.css";
import useDocumentTitle from '../systems/useDocumentTitle';

// Filter chip definitions: i18n key for label + the EVENT_LABEL bucket it matches.
const FILTER_DEFS = [
  { id: "ALL", labelKey: "journal.filters.all", bucket: null },
  { id: "MISSION", labelKey: "journal.filters.mission", bucket: "mission" },
  { id: "BADGE", labelKey: "journal.filters.badge", bucket: "badge" },
  { id: "LEVEL_UP", labelKey: "journal.filters.levelUp", bucket: "levelUp" },
  { id: "HINT", labelKey: "journal.filters.hint", bucket: "hint" },
  { id: "SYSTEM", labelKey: "journal.filters.system", bucket: "system" },
];

const DATE_FILTERS = [
  { id: "ALL", labelKey: "journal.dateFilters.all" },
  { id: "TODAY", labelKey: "journal.dateFilters.today" },
  { id: "WEEK", labelKey: "journal.dateFilters.week" },
  { id: "MONTH", labelKey: "journal.dateFilters.month" },
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

export function getEntryBucket(entry) {
  return EVENT_CONFIG[entry.type]?.bucket || "system";
}

export function filterJournalEntries(entries, { typeFilter = "ALL", dateFilter = "ALL", searchTerm = "" } = {}, t = (key) => key) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const targetBucket = FILTER_DEFS.find((f) => f.id === typeFilter)?.bucket;

  return entries.filter((entry) => {
    if (targetBucket && getEntryBucket(entry) !== targetBucket) return false;
    if (!matchesDateFilter(entry.timestamp, dateFilter)) return false;

    if (!normalizedSearch) return true;

    const message = formatEventMessage(entry, t);
    const dataText = entry.data ? JSON.stringify(entry.data) : "";
    return `${message} ${dataText}`.toLowerCase().includes(normalizedSearch);
  });
}

export function buildJournalRows(entries, t, language) {
  const rows = [];
  let currentDate = null;

  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    const dateLabel = formatDateHeader(date, t, language);
    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      rows.push({ type: "date", id: `date-${dateLabel}`, date: dateLabel });
    }
    rows.push({ type: "entry", id: entry.id, entry });
  }

  return rows;
}

function matchesDateFilter(timestamp, filter) {
  if (filter === "ALL") return true;

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (filter === "TODAY") {
    return date >= start;
  }

  if (filter === "WEEK") {
    start.setDate(start.getDate() - 6);
    return date >= start;
  }

  if (filter === "MONTH") {
    start.setDate(1);
    return date >= start;
  }

  return true;
}

export default function Journal() {
  const { t, language } = useTranslation();
  useDocumentTitle('Journal');
  const [log, setLog] = useState(() => getActivityLog());
  const [filter, setFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const timelineRef = useRef(null);
  const progress = loadProgress();

  const filteredLog = useMemo(() => {
    return filterJournalEntries(log, { typeFilter: filter, dateFilter, searchTerm }, t);
  }, [log, filter, dateFilter, searchTerm, t]);

  const timelineRows = useMemo(
    () => buildJournalRows(filteredLog, t, language),
    [filteredLog, t, language],
  );

  const rowVirtualizer = useVirtualizer({
    count: timelineRows.length,
    getScrollElement: () => timelineRef.current,
    estimateSize: (index) => (timelineRows[index]?.type === "date" ? 56 : 132),
    overscan: 8,
  });

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
      <div className="journal-controls" aria-label={t("journal.controlsLabel")}>
        <label className="journal-search">
          <span className="sr-only">{t("journal.searchLabel")}</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t("journal.searchPlaceholder")}
          />
        </label>

        <div className="journal-filters" aria-label={t("journal.typeFilterLabel")}>
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

        <div className="journal-filters" aria-label={t("journal.dateFilterLabel")}>
          {DATE_FILTERS.map((f) => (
            <button
              key={f.id}
              className={`filter-chip ${dateFilter === f.id ? "active" : ""}`}
              onClick={() => setDateFilter(f.id)}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {timelineRows.length === 0 ? (
        <div className="card text-center p-12">
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>
            📖
          </div>
          <p className="text-secondary">{t("journal.empty")}</p>
        </div>
      ) : (
        <div className="timeline-viewport" ref={timelineRef}>
          <div
            className="timeline"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = timelineRows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  className="timeline-row"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.type === "date" ? (
                    <div className="date-header">{row.date}</div>
                  ) : (
                    <JournalEntry
                      entry={row.entry}
                      progressXp={progress.xp}
                      timeLocale={timeLocale}
                      t={t}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function JournalEntry({ entry, progressXp, timeLocale, t }) {
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
    <div className="timeline-event">
      <div className={`event-dot ${config.class}`}>
        {config.icon}
      </div>
      <div className="event-content">
        <div className="event-time">{time}</div>
        <div className="event-message">{displayMessage}</div>
        {entry.data && Object.keys(entry.data).length > 0 && (
          <div className="event-details">
            {entry.type === ACTIVITY_TYPES.LEVEL_UP &&
              t("journal.details.targetXp", { xp: progressXp })}
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
