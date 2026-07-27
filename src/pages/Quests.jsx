import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import "./Quests.css";

export default function Quests() {
  const { t } = useTranslation();

  const [missionsList] = useState([
    {
      id: "mission-1",
      title: "Introduction to Soroban",
      description:
        "Learn the foundational architecture of Stellar smart contracts.",
      campaign: "Getting Started",
      difficulty: "beginner",
      swordsCount: 2,
      completed: true,
      xp: 500,
    },
    {
      id: "mission-2",
      title: "Token Storage Patterns",
      description: "Master persistent state management and ledger entries.",
      campaign: "Storage & State",
      difficulty: "intermediate",
      swordsCount: 3,
      completed: false,
      xp: 1200,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [completionStatus, setCompletionStatus] = useState("ALL");

  const campaigns = useMemo(() => {
    if (!Array.isArray(missionsList)) return ["ALL"];
    return [
      "ALL",
      ...new Set(missionsList.map((m) => m?.campaign).filter(Boolean)),
    ];
  }, [missionsList]);

  const difficulties = useMemo(() => {
    if (!Array.isArray(missionsList)) return ["ALL"];
    return [
      "ALL",
      ...new Set(missionsList.map((m) => m?.difficulty).filter(Boolean)),
    ];
  }, [missionsList]);

  const filteredMissions = useMemo(() => {
    if (!Array.isArray(missionsList)) return [];
    return missionsList.filter((mission) => {
      if (!mission) return false;
      const title = mission.title || "";
      const description = mission.description || "";

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCampaign =
        selectedCampaign === "ALL" || mission.campaign === selectedCampaign;
      const matchesDifficulty =
        selectedDifficulty === "ALL" ||
        mission.difficulty === selectedDifficulty;

      const matchesCompletion =
        completionStatus === "ALL" ||
        (completionStatus === "COMPLETED" && mission.completed) ||
        (completionStatus === "INCOMPLETE" && !mission.completed);

      return (
        matchesSearch &&
        matchesCampaign &&
        matchesDifficulty &&
        matchesCompletion
      );
    });
  }, [
    missionsList,
    searchQuery,
    selectedCampaign,
    selectedDifficulty,
    completionStatus,
  ]);

  return (
    <div className="quests-container">
      <h1 className="quests-title">{t("quests.title")}</h1>

      {/* Filter and Search Controls */}
      <div className="quests-controls">
        <input
          type="text"
          placeholder={t("quests.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="quests-search-input"
        />

        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="quests-select-filter"
        >
          <option value="ALL">{t("quests.allCampaigns")}</option>
          {campaigns
            .filter((c) => c !== "ALL")
            .map((camp) => (
              <option key={camp} value={camp}>
                {camp}
              </option>
            ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="quests-select-filter"
        >
          <option value="ALL">{t("quests.allDifficulties")}</option>
          {difficulties
            .filter((d) => d !== "ALL")
            .map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
        </select>

        <select
          value={completionStatus}
          onChange={(e) => setCompletionStatus(e.target.value)}
          className="quests-select-filter"
        >
          <option value="ALL">{t("quests.allStatuses")}</option>
          <option value="COMPLETED">{t("quests.completed")}</option>
          <option value="INCOMPLETE">{t("quests.incomplete")}</option>
        </select>
      </div>

      {/* Responsive Mission Grid */}
      <div className="quests-grid">
        {filteredMissions.length > 0 ? (
          filteredMissions.map((mission) => (
            <Link
              key={mission.id}
              to={`/mission/${mission.id}`}
              className="quest-card"
            >
              <div className="quest-card-top">
                <div className="quest-card-header">
                  <span className="quest-campaign-tag">{mission.campaign}</span>
                  {mission.completed && (
                    <span className="quest-completion-check" title="Completed">
                      ✓
                    </span>
                  )}
                </div>
                <h3 className="quest-card-title">{mission.title}</h3>
                <p className="quest-card-description">{mission.description}</p>
              </div>

              <div className="quest-card-footer">
                <div className="quest-meta-left">
                  <span
                    className="quest-swords active"
                    title={`Difficulty: ${mission.difficulty}`}
                  >
                    {"⚔️".repeat(mission.swordsCount || 3)}
                  </span>
                </div>

                <div className="quest-xp-badge">
                  <span>⚡</span>
                  <span>{mission.xp}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="quests-empty-state">{t("quests.noMissions")}</div>
        )}
      </div>
    </div>
  );
}
