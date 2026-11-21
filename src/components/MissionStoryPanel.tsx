import React from "react";
import ReactMarkdown from "react-markdown";
import type { LanguageContextValue } from "../i18n";
import type { LocalizedMission } from "../types/game";

interface MissionStoryPanelProps {
  t: LanguageContextValue["t"];
  mission: Pick<LocalizedMission, "difficulty" | "xpReward" | "story" | "hints">;
  hintIndex: number;
}

/** Mission briefing: difficulty, reward, story and the latest unlocked hint. */
export default function MissionStoryPanel({
  t,
  mission,
  hintIndex,
}: MissionStoryPanelProps): React.ReactElement {
  return (
    <div
      className="mission-story"
      role="region"
      aria-label="Mission briefing and story description"
    >
      <div style={{ marginBottom: "var(--space-md)" }}>
        <span className={`badge badge-${mission.difficulty}`}>
          <span className="sr-only">{t("missionDetail.difficultyLabel")} </span>
          {t(`difficulty.${mission.difficulty}`)}
        </span>
        <span className="mission-card-xp" style={{ marginLeft: "0.5rem" }}>
          {t("missionMap.card.xp", { xp: mission.xpReward })}
        </span>
      </div>
      <ReactMarkdown>{mission.story}</ReactMarkdown>

      {hintIndex >= 0 && (
        <div
          role="alert"
          style={{
            marginTop: "var(--space-lg)",
            padding: "var(--space-md)",
            background: "var(--gold-dim)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <strong style={{ color: "var(--gold)" }}>
            {t("missionDetail.hint.label", { index: hintIndex + 1 })}
          </strong>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "0.85rem" }}>
            {mission.hints[hintIndex]}
          </p>
        </div>
      )}
    </div>
  );
}
