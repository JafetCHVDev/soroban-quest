/* ==========================================
   useMissionShortcuts: mission page hotkeys
   (Ctrl/Cmd+Enter, R, N, P)
   ========================================== */

import { useEffect } from "react";

export interface MissionShortcutHandlers {
  onRunTests: () => void;
  onNextMission: () => void;
  onPreviousMission: () => void;
}

export function useMissionShortcuts({
  onRunTests,
  onNextMission,
  onPreviousMission,
}: MissionShortcutHandlers): void {
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent): void => {
      // Ctrl+Enter / Cmd+Enter always runs tests (even from Monaco)
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onRunTests();
        return;
      }

      // Prevent running if user is typing inside code fields or inputs
      const targetTag = (document.activeElement as HTMLElement)?.tagName.toLowerCase();
      const isMonacoFocused = document.activeElement?.closest(".monaco-editor");
      const isContentEditable = (document.activeElement as HTMLElement)?.contentEditable === "true";

      if (
        targetTag === "input" ||
        targetTag === "textarea" ||
        isContentEditable ||
        isMonacoFocused
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "r") {
        e.preventDefault();
        onRunTests();
      } else if (key === "n") {
        e.preventDefault();
        onNextMission();
      } else if (key === "p") {
        e.preventDefault();
        onPreviousMission();
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [onRunTests, onNextMission, onPreviousMission]);
}
