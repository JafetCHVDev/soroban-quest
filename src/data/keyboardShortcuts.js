/* ==========================================
   Keyboard shortcut definitions for MissionDetail
   ========================================== */

export const SHORTCUT_IDS = {
  RUN_TESTS: 'RUN_TESTS',
  RESET: 'RESET',
  HINT: 'HINT',
};

// Each entry owns its matcher so MissionDetail stays DRY: add a shortcut here
// and it is automatically picked up by the keydown dispatcher and tooltip helper.
export const KEYBOARD_SHORTCUTS = [
  {
    id: SHORTCUT_IDS.RUN_TESTS,
    label: 'Run Tests',
    display: 'Ctrl+Enter',
    matches: (e) =>
      (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key === 'Enter',
  },
  {
    id: SHORTCUT_IDS.RESET,
    label: 'Reset Code',
    display: 'Ctrl+Shift+R',
    matches: (e) =>
      (e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && e.key.toLowerCase() === 'r',
  },
  {
    id: SHORTCUT_IDS.HINT,
    label: 'Show Next Hint',
    display: 'Ctrl+Shift+H',
    matches: (e) =>
      (e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && e.key.toLowerCase() === 'h',
  },
];

export function getShortcutTitle(id) {
  const s = KEYBOARD_SHORTCUTS.find((s) => s.id === id);
  return s ? `${s.label} (${s.display})` : '';
}
