import { describe, expect, it, vi } from "vitest";
import { buildJournalRows, filterJournalEntries } from "../Journal.jsx";

const t = (key, vars = {}) => {
  const messages = {
    "journal.events.missionStarted": `Started mission: ${vars.title}`,
    "journal.events.badgeEarned": `Earned ${vars.name}`,
    "journal.dates.today": "Today",
    "journal.dates.yesterday": "Yesterday",
  };
  return messages[key] || key;
};

const entries = [
  {
    id: "newer",
    timestamp: "2026-06-25T06:00:00.000Z",
    type: "MISSION_STARTED",
    data: { title: "Counter Vault" },
  },
  {
    id: "older",
    timestamp: "2025-06-25T06:00:00.000Z",
    type: "BADGE_EARNED",
    data: { badgeName: "First Contract" },
  },
];

describe("Journal helpers", () => {
  it("filters entries by activity type and search text", () => {
    const filtered = filterJournalEntries(
      entries,
      { typeFilter: "MISSION", searchTerm: "counter" },
      t,
    );

    expect(filtered.map((entry) => entry.id)).toEqual(["newer"]);
  });

  it("filters entries by date range", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-25T12:00:00.000Z"));

    const filtered = filterJournalEntries(entries, { dateFilter: "TODAY" }, t);

    expect(filtered.map((entry) => entry.id)).toEqual(["newer"]);
    vi.useRealTimers();
  });

  it("builds date rows using full year comparisons", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-25T12:00:00.000Z"));

    const rows = buildJournalRows(entries, t, "en");

    expect(rows[0]).toMatchObject({ type: "date", date: "Today" });
    expect(rows[2]).toMatchObject({ type: "date", date: "June 25, 2025" });
    vi.useRealTimers();
  });
});
