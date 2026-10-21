/* ==========================================
   useVictoryModal: open/close state for the mission
   victory modal and its keyboard focus trap
   ========================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";

export interface VictoryData {
  xp: number;
  leveledUp: boolean;
  newLevel: number;
  newBadges: string[];
}

export interface UseVictoryModalReturn {
  showVictory: boolean;
  victoryData: VictoryData | null;
  victoryModalRef: MutableRefObject<HTMLDivElement | null>;
  openVictory: (_victory: VictoryData) => void;
  closeVictory: () => void;
}

export function useVictoryModal(): UseVictoryModalReturn {
  const [showVictory, setShowVictory] = useState(false);
  const [victoryData, setVictoryData] = useState<VictoryData | null>(null);
  const victoryModalRef = useRef<HTMLDivElement | null>(null);

  const openVictory = useCallback((victory: VictoryData): void => {
    setVictoryData(victory);
    setShowVictory(true);
  }, []);

  const closeVictory = useCallback((): void => {
    setShowVictory(false);
  }, []);

  // Focus Trapping for the Victory Modal
  useEffect(() => {
    if (!showVictory || !victoryModalRef.current) return;

    const modalElement = victoryModalRef.current;
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modalElement.querySelectorAll(focusableSelectors);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowVictory(false);
        return;
      }
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalElement.addEventListener("keydown", handleKeyDown);
    return () => modalElement.removeEventListener("keydown", handleKeyDown);
  }, [showVictory]);

  return { showVictory, victoryData, victoryModalRef, openVictory, closeVictory };
}
