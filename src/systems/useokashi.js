import { useState, useCallback } from "react";

export const TOAST_STATES = {
  IDLE: "idle",
  SUCCESS: "success",
  ERROR: "error",
};

export function useokashi() {
  const [toast, setToast] = useState({ 
    state: TOAST_STATES.IDLE, 
    message: "" 
  });

  const openInOkashi = useCallback(async (code) => {
    // Step 1: Copy code to clipboard
    try {
      await navigator.clipboard.writeText(code);
      // Step 2: Open Okashi in new tab
      window.open("https://okashi.dev", "_blank", "noopener,noreferrer");
      // Step 3: Show success message
      setToast({
        state: TOAST_STATES.SUCCESS,
        message: "✅ Code copied! Paste it in Okashi (Ctrl+V) to compile & deploy to Testnet 🚀",
      });
    } catch {
      // Clipboard failed — still open Okashi
      window.open("https://okashi.dev", "_blank", "noopener,noreferrer");
      setToast({
        state: TOAST_STATES.ERROR,
        message: "⚠️ Okashi opened! Auto-copy failed — please copy your code manually and paste it there.",
      });
    }

    // Auto-clear the toast after 6 seconds
    setTimeout(() => {
      setToast({ state: TOAST_STATES.IDLE, message: "" });
    }, 6000);
  }, []);

  return { openInOkashi, toast };
}