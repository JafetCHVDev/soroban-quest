import React from "react";
import type { LanguageContextValue } from "../i18n";

interface MissionReplayPanelProps {
  t: LanguageContextValue["t"];
  onWatchReplay: () => void;
}

/** Call to action for watching the saved coding session of a completed mission. */
export default function MissionReplayPanel({
  t,
  onWatchReplay,
}: MissionReplayPanelProps): React.ReactElement {
  return (
    <div
      className="mission-replay-panel"
      style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)'
      }}
      role="region"
      aria-label="Problem solving archive replay tools"
    >
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
        📹 {t("missionDetail.replay.header")}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {t("missionDetail.replay.body")}
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onWatchReplay}
        style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
      >
        ▶️ {t("missionDetail.replay.start")}
      </button>
    </div>
  );
}
