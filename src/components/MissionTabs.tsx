import React from "react";
import type { LanguageContextValue } from "../i18n";

interface MissionTabsProps {
  t: LanguageContextValue["t"];
  activeTab: string;
  showReplayTab: boolean;
  onTabChange: (_tab: string) => void;
}

/** Tab bar that switches mission panels on narrow screens. */
export default function MissionTabs({
  t,
  activeTab,
  showReplayTab,
  onTabChange,
}: MissionTabsProps): React.ReactElement {
  return (
    <div className="mobile-tabs" role="tablist" aria-label={t("missionDetail.tabs.ariaLabel")}>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "story"}
        className={`tab-btn ${activeTab === "story" ? "active" : ""}`}
        onClick={(): void => onTabChange("story")}
      >
        {t("missionDetail.tabs.story")}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "editor"}
        className={`tab-btn ${activeTab === "editor" ? "active" : ""}`}
        onClick={(): void => onTabChange("editor")}
      >
        {t("missionDetail.tabs.editor")}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "tests"}
        className={`tab-btn ${activeTab === "tests" ? "active" : ""}`}
        onClick={(): void => onTabChange("tests")}
      >
        {t("missionDetail.tabs.tests")}
      </button>
      {showReplayTab && (
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "replay"}
          className={`tab-btn ${activeTab === "replay" ? "active" : ""}`}
          onClick={(): void => onTabChange("replay")}
        >
          📹 {t("missionDetail.tabs.replay")}
        </button>
      )}
    </div>
  );
}
