import React, { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  getActivityLog,
  ACTIVITY_TYPES,
  clearLog,
  ActivityEntry,
} from "../systems/activityLogger";
import { loadProgress } from "../systems/storage";
import { useTranslation } from "../i18n/useTranslation";
import "./Journal.css";
import useDocumentTitle from '../systems/useDocumentTitle';

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

const EVENT_CONFIG: Record<string, { icon: string; class: string; bucket: string }> = {
  [ACTIVITY_TYPES.MISSION_STARTED]: { icon: "⚔️", class: "mission", bucket: "mission" },
  [ACTIVITY_TYPES.MISSION_COMPLETED]: { icon: "🗡️", class: "mission", bucket: "mission" },
  [ACTIVITY_TYPES.BADGE_EARNED]: { icon: "🏅", class: "badge", bucket: "badge" },
  [ACTIVITY_TYPES.LEVEL_UP]: { icon: "⬆️", class: "level", bucket: "levelUp" },
  [ACTIVITY_TYPES.HINT_USED]: { icon: "💡", class: "hint", bucket: "hint" },
  [ACTIVITY_TYPES.EXPORT]: { icon: "📤", class: "system", bucket: "system" },
  [ACTIVITY_TYPES.IMPORT]: { icon: "📥", class: "system", bucket: "system" },
  [ACTIVITY_TYPES.STREAK]: { icon: "🔥", class: "system", bucket: "system" },
};

function formatEventMessage(entry: any, t: (key: string, vars?: any) => string): string {
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
      const translatedName = data.badgeId
        ? t(`badges.items.${data.badgeId}.name`, { fallback: data.badgeName })
        : data.badgeName;
      return t("journal.events.badgeEarned", {
        name: translatedName || data.achievementName || "",
      });
    }
    case ACTIVITY_TYPES.LEVEL_UP:
      return t("journal.events.levelUp", { level: data.level || 1 });
    case ACTIVITY_TYPES.HINT_USED:
      return t("journal.events.hintUsed", {
        title: data.title || data.missionId || "",
      });
    case ACTIVITY_TYPES.EXPORT:
      return t("journal.events.export");
    case ACTIVITY_TYPES.IMPORT:
      return t("journal.events.import");
    case ACTIVITY_TYPES.STREAK:
      return t("journal.events.streak", { count: data.streak || 1 });
    default:
      return message || type;
  }
}

function getEventMeta(entry: any) {
  return (
    EVENT_CONFIG[entry.type] || {
      icon: "📌",
      class: "system",
      bucket: "system",
    }
  );
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function formatGroupDateHeader(dateObj: Date, t: (key: string, vars?: any) => string, lang: string): string {
  const now = new Date();

  if (isSameDay(dateObj, now)) {
    return t("journal.dates.today");
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(dateObj, yesterday)) {
    return t("journal.dates.yesterday");
  }

  const localeCode = lang === "es" ? "es-ES" : "en-US";
  const sameYear = dateObj.getFullYear() === now.getFullYear();

  return dateObj.toLocaleDateString(localeCode, {
    month: "long",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function formatEventTime(dateObj: Date, lang: string): string {
  const localeCode = lang === "es" ? "es-ES" : "en-US";
  return dateObj.toLocaleTimeString(localeCode, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function filterJournalEntries(entries: any[], { typeFilter = "ALL", dateFilter = "ALL", searchTerm = "" } = {}, t: any) {
  const query = searchTerm.trim().toLowerCase();
  const now = new Date();

  return (entries || []).filter((entry) => {
    const meta = getEventMeta(entry);

    if (typeFilter !== "ALL") {
      const targetBucket = FILTER_DEFS.find((f) => f.id === typeFilter)?.bucket;
      if (meta.bucket !== targetBucket) return false;
    }

    if (dateFilter !== "ALL") {
      const timestamp = new Date(entry.timestamp);
      if (isNaN(timestamp.getTime())) return false;

      if (dateFilter === "TODAY") {
        if (!isSameDay(timestamp, now)) return false;
      } else if (dateFilter === "WEEK") {
        const diffMs = now.getTime() - timestamp.getTime();
        if (diffMs < 0 || diffMs > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (dateFilter === "MONTH") {
        const diffMs = now.getTime() - timestamp.getTime();
        if (diffMs < 0 || diffMs > 30 * 24 * 60 * 60 * 1000) return false;
      }
    }

    if (query) {
      const msg = formatEventMessage(entry, t).toLowerCase();
      const raw = (entry.message || "").toLowerCase();
      if (!msg.includes(query) && !raw.includes(query)) return false;
    }

    return true;
  });
}

export function buildJournalRows(entries: any[], t: any, lang: string) {
  const rows: any[] = [];
  let currentGroupLabel: string | null = null;

  for (const entry of entries) {
    const timestamp = new Date(entry.timestamp);
    if (isNaN(timestamp.getTime())) continue;

    const groupLabel = formatGroupDateHeader(timestamp, t, lang);
    if (groupLabel !== currentGroupLabel) {
      currentGroupLabel = groupLabel;
      rows.push({
        type: "date",
        id: `date-${groupLabel}-${timestamp.getTime()}`,
        date: groupLabel,
      });
    }

    rows.push({
      type: "entry",
      id: entry.id,
      entry,
      formattedTime: formatEventTime(timestamp, lang),
    });
  }

  return rows;
}

export default function Journal() {
  useDocumentTitle('Journal');
  const { t, language } = useTranslation();
  const [logs, setLogs] = useState<ActivityEntry[]>(() => getActivityLog());
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  const progress = useMemo(() => loadProgress(), []);
  const level = progress?.level || 1;
  const xp = progress?.xp || 0;
  const completedMissionsCount = (progress?.completedMissions || []).length;
  const streak = progress?.streak || 0;

  const filteredEntries = useMemo(() => {
    return filterJournalEntries(logs, { typeFilter, dateFilter, searchTerm }, t);
  }, [logs, typeFilter, dateFilter, searchTerm, t]);

  const rows = useMemo(() => {
    return buildJournalRows(filteredEntries, t, language);
  }, [filteredEntries, t, language]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (rows[index]?.type === "date" ? 44 : 76),
    overscan: 5,
  });

  const handleClearLog = () => {
    if (window.confirm(t("journal.clearConfirm"))) {
      clearLog();
      setLogs([]);
    }
  };

  return (
    <div className="journal-page">
      <div className="journal-container">
        <header className="journal-header">
          <div className="journal-header-title">
            <h1>📜 {t("journal.title")}</h1>
            <p>{t("journal.subtitle")}</p>
          </div>
          {logs.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost journal-clear-btn"
              onClick={handleClearLog}
            >
              🗑️ {t("journal.clearLog")}
            </button>
          )}
        </header>

        <section className="journal-stats">
          <div className="journal-stat-card">
            <span className="journal-stat-icon">⚔️</span>
            <div className="journal-stat-info">
              <span className="journal-stat-value">{completedMissionsCount}</span>
              <span className="journal-stat-label">{t("journal.stats.missions")}</span>
            </div>
          </div>

          <div className="journal-stat-card">
            <span className="journal-stat-icon">✨</span>
            <div className="journal-stat-info">
              <span className="journal-stat-value">{xp}</span>
              <span className="journal-stat-label">{t("journal.stats.xp")}</span>
            </div>
          </div>

          <div className="journal-stat-card">
            <span className="journal-stat-icon">🎓</span>
            <div className="journal-stat-info">
              <span className="journal-stat-value">Lvl {level}</span>
              <span className="journal-stat-label">{t("journal.stats.level")}</span>
            </div>
          </div>

          <div className="journal-stat-card">
            <span className="journal-stat-icon">🔥</span>
            <div className="journal-stat-info">
              <span className="journal-stat-value">{streak}d</span>
              <span className="journal-stat-label">{t("journal.stats.streak")}</span>
            </div>
          </div>
        </section>

        <div className="journal-toolbar">
          <div className="journal-search">
            <input
              type="text"
              placeholder={t("journal.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="journal-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label={t("common.clear")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="journal-filters">
            <div className="journal-filter-group" role="radiogroup" aria-label={t("journal.filters.all")}>
              {FILTER_DEFS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={typeFilter === f.id}
                  className={`journal-filter-chip ${typeFilter === f.id ? "active" : ""}`}
                  onClick={() => setTypeFilter(f.id)}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>

            <div className="journal-filter-group" role="radiogroup" aria-label={t("journal.dateFilters.all")}>
              {DATE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={dateFilter === f.id}
                  className={`journal-filter-chip ${dateFilter === f.id ? "active" : ""}`}
                  onClick={() => setDateFilter(f.id)}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="journal-empty">
            <div className="journal-empty-icon">📜</div>
            <h3>{t("journal.empty.title")}</h3>
            <p>{t("journal.empty.body")}</p>
          </div>
        ) : (
          <div ref={parentRef} className="journal-timeline-wrapper">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = rows[virtualRow.index];
                return (
                  <div
                    key={item.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {item.type === "date" ? (
                      <div className="journal-date-divider">
                        <span>{item.date}</span>
                      </div>
                    ) : (
                      <div className="journal-entry">
                        <div className={`journal-entry-icon ${getEventMeta(item.entry).class}`}>
                          {getEventMeta(item.entry).icon}
                        </div>
                        <div className="journal-entry-content">
                          <p className="journal-entry-msg">
                            {formatEventMessage(item.entry, t)}
                          </p>
                          <span className="journal-entry-time">{item.formattedTime}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
