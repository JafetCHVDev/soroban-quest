import React from "react";
import type { MutableRefObject } from "react";
import type { LanguageContextValue } from "../i18n";
import Confetti from "./Confetti";
import { TOAST_STATES } from "../systems/useokashi";
import type { Toast as OkashiToast } from "../systems/useokashi";
import type { VictoryData } from "../systems/useVictoryModal";

const MAX_RANK_INDEX = 10;

interface MissionVictoryModalProps {
  t: LanguageContextValue["t"];
  missionTitle: string;
  victoryData: VictoryData;
  hasReplay: boolean;
  modalRef: MutableRefObject<HTMLDivElement | null>;
  okashiToast: OkashiToast;
  onClose: () => void;
  onWatchReplay: () => void;
  onNextMission: () => void;
  onMissionMap: () => void;
  onOpenInOkashi: () => void;
}

/** Celebration modal shown after a mission's checks all pass. */
export default function MissionVictoryModal({
  t,
  missionTitle,
  victoryData,
  hasReplay,
  modalRef,
  okashiToast: toast,
  onClose,
  onWatchReplay,
  onNextMission,
  onMissionMap,
  onOpenInOkashi,
}: MissionVictoryModalProps): React.ReactElement {
  const victoryRank = t(`ranks.${Math.min(Math.max(victoryData.newLevel - 1, 0), MAX_RANK_INDEX)}`);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <Confetti />
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-modal-heading"
      >
        <div className="modal-icon" role="img" aria-label={t("missionDetail.victory.iconLabel")}>🏆</div>
        <h2 id="victory-modal-heading" className="modal-title">{t("missionDetail.victory.title")}</h2>
        <p className="modal-message">
          {t("missionDetail.victory.youCompleted")} <strong>{missionTitle}</strong>
        </p>
        <div className="modal-xp" style={{ display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center" }}>
          <span style={{ color: "var(--cyan)", fontSize: "1.5rem", fontWeight: 700, textShadow: "0 0 20px rgba(6, 214, 160, 0.5)" }}>
            +{victoryData.xp} XP
          </span>
          <span style={{ color: "var(--gold)", fontSize: "1.5rem", fontWeight: 700, textShadow: "0 0 20px rgba(245, 158, 11, 0.5)" }}>
            +{Math.floor(victoryData.xp * 0.5)} Gold
          </span>
        </div>

        {victoryData.leveledUp && (
          <p style={{ color: "var(--purple)", fontFamily: "var(--font-display)", marginBottom: "1rem" }}>
            {t("missionDetail.victory.levelUp", {
              level: victoryData.newLevel,
              rank: victoryRank,
            })}
          </p>
        )}

        {victoryData.newBadges?.length > 0 && (
          <p style={{ color: "var(--gold)", marginBottom: "1rem" }}>
            🏅 {victoryData.newBadges.length > 1
              ? t("missionDetail.victory.badgeEarnedMany")
              : t("missionDetail.victory.badgeEarnedOne")}
          </p>
        )}

        {hasReplay && (
          <div style={{ marginBottom: "1.25rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onWatchReplay}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              📹 {t("missionDetail.victory.watchReplay") || "Watch Session Replay"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button type="button" className="btn btn-primary" onClick={onNextMission}>
            {t("missionDetail.victory.next")}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onMissionMap}>
            {t("missionDetail.victory.map")}
          </button>
        </div>

        {/* Okashi Section */}
        <div
          style={{
            marginTop: "1.25rem",
            padding: "1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button type="button" onClick={onOpenInOkashi} className="okashi-btn">
            {t("missionDetail.okashi.button")}
          </button>

          <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", maxWidth: "300px", margin: 0, lineHeight: "1.5" }}>
            {t("missionDetail.okashi.help")}
          </p>

          {toast?.state !== TOAST_STATES.IDLE && (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "500",
                background: toast.state === TOAST_STATES.SUCCESS ? "#064e3b" : "#4c0519",
                color: toast.state === TOAST_STATES.SUCCESS ? "#6ee7b7" : "#fda4af",
                border: toast.state === TOAST_STATES.SUCCESS ? "1px solid #065f46" : "1px solid #881337",
                maxWidth: "340px",
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
