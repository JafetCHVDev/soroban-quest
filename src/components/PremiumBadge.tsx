import React from "react";
import type { LanguageContextValue } from "../i18n";
import "./PremiumBadge.css";

export const PREMIUM_BADGE_ID = "premium-badge";

interface Inventory {
  owned?: string[];
  equipped?: string[];
}

interface PremiumBadgeProps {
  t: LanguageContextValue["t"];
  inventory?: Inventory | null;
}

/** True when the Premium Badge is both owned and equipped. */
export function isPremiumBadgeEquipped(inventory?: Inventory | null): boolean {
  return (
    (inventory?.owned ?? []).includes(PREMIUM_BADGE_ID) &&
    (inventory?.equipped ?? []).includes(PREMIUM_BADGE_ID)
  );
}

/** Shows the Premium Badge next to a player name when it is owned and equipped. */
export default function PremiumBadge({ t, inventory }: PremiumBadgeProps): React.ReactElement | null {
  if (!isPremiumBadgeEquipped(inventory)) return null;

  return (
    <span className="premium-badge" role="img" aria-label={t("shop.items.premiumBadge")}>
      👑
    </span>
  );
}
