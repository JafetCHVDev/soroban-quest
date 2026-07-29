import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { missions, localizeMissions } from "../data/missions.js";
import { campaigns, localizeCampaigns } from "../data/campaigns.js";
import { loadProgress } from "../systems/storage.js";
import "./Quests.css";

const DIFFICULTY_ORDER = ["beginner", "intermediate", "advanced"];
const DIFFICULTY_SWORDS = {
  beginner: 2,
  intermediate: 3,
  advanced: 4,
};

export default function Quests() {
  const { t, language } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [completionStatus, setCompletionStatus] = useState("ALL");
  const [progress, setProgress] = useState(() => loadProgress());

  const localizedCampaigns = useMemo(
    () => localizeCampaigns(campaigns, language),
    [language],
  );

  const localizedMissions = useMemo(
    () => localizeMissions(missions, language),
    [language],
  );

  const campaignByMissionId = useMemo(() => {
    return localizedCampaigns.reduce((acc, campaign) => {
      (campaign.missionIds || []).forEach((id) => {
        acc[id] = campaign;
      });
      return acc;
    }, {});
  }, [localizedCampaigns]);

  useEffect(() => {
    const handleStorageChange = () => setProgress(loadProgress());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const campaigns = useMemo(() => {
    return [
      { id: "ALL", title: t("quests.allCampaigns") },
      ...localizedCampaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
      })),
    ];
  }, [localizedCampaigns, t]);

  const difficulties = useMemo(() => {
    const unique = Array.from(
      new Set(localizedMissions.map((mission) => mission.difficulty)),
    ).filter(Boolean);

    return ["ALL", ...DIFFICULTY_ORDER.filter((value) => unique.includes(value))];
  }, [localizedMissions]);

  const filteredMissions = useMemo(() => {
    return localizedMissions
      .map((mission) => ({
        ...mission,
        completed: Array.isArray(progress.completedMissions)
          ? progress.completedMissions.includes(mission.id)
          : false,
        campaign: campaignByMissionId[mission.id]?.title ||
          t("campaigns.chapter", { number: mission.chapter }),
      }))
      .filter((mission) => {
        if (!mission) return false;

        const title = mission.title || "";
        const description =
          mission.learningGoal || mission.story?.split("\n")[0] || "";

        const matchesSearch =
          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCampaign =
          selectedCampaign === "ALL" ||
          campaignByMissionId[mission.id]?.id === selectedCampaign;

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
    localizedMissions,
    campaignByMissionId,
    progress.completedMissions,
    searchQuery,
    selectedCampaign,
    selectedDifficulty,
    completionStatus,
    t,
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
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.title}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="quests-select-filter"
        >
          <option value="ALL">{t("missionMap.difficulty.all")}</option>
          {difficulties
            .filter((d) => d !== "ALL")
            .map((diff) => (
              <option key={diff} value={diff}>
                {t(`missionMap.difficulty.${diff}`)}
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
                  <span className="quest-completion-check" title={t("quests.completed")}>
                    ✓
                  </span>
                )}
              </div>
              <h3 className="quest-card-title">{mission.title}</h3>
              <p className="quest-card-description">
                {mission.learningGoal || mission.story?.split("\n")[0] || ''}
              </p>
              </div>

              <div className="quest-card-footer">
                <div className="quest-meta-left">
                  <span
                    className="quest-swords active"
                    title={`${t(`missionMap.difficulty.${mission.difficulty}`)} ${t("missionMap.card.xp", { xp: mission.xpReward })}`}
                  >
                    {"⚔️".repeat(DIFFICULTY_SWORDS[mission.difficulty] || 3)}
                  </span>
                </div>

                <div className="quest-xp-badge">
                  <span>⚡</span>
                  <span>{mission.xpReward}</span>
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
