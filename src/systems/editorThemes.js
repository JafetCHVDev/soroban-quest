/* =========================
   EDITOR THEMES
   Color schemes for the Monaco code editor used in missions.
   Built-in themes ("vs-dark", etc.) are used as-is; custom themes are
   registered with monaco.editor.defineTheme on editor mount.
========================= */

const THEME_KEY = "soroban_quest_editor_theme";

/**
 * Available editor themes.
 * - `id`: stable identifier persisted in localStorage and passed to Monaco.
 * - `label`: human-readable name shown in the selector.
 * - `builtin`: true for Monaco's bundled themes (no definition needed).
 * - `data`: monaco theme definition, required for custom themes.
 */
export const EDITOR_THEMES = [
  {
    id: "vs-dark",
    label: "Dark (default)",
    builtin: true,
  },
  {
    id: "vs",
    label: "Light",
    builtin: true,
  },
  {
    id: "hc-black",
    label: "High Contrast",
    builtin: true,
  },
  {
    id: "soroban-night",
    label: "Soroban Night",
    builtin: false,
    data: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "5c6370", fontStyle: "italic" },
        { token: "keyword", foreground: "56b6c2" },
        { token: "string", foreground: "98c379" },
        { token: "number", foreground: "d19a66" },
        { token: "type", foreground: "e5c07b" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#c9d1d9",
        "editor.lineHighlightBackground": "#161b22",
        "editorLineNumber.foreground": "#484f58",
        "editorCursor.foreground": "#58a6ff",
      },
    },
  },
  {
    id: "stellar-dawn",
    label: "Stellar Dawn",
    builtin: false,
    data: {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "a0a1a7", fontStyle: "italic" },
        { token: "keyword", foreground: "a626a4" },
        { token: "string", foreground: "50a14f" },
        { token: "number", foreground: "986801" },
        { token: "type", foreground: "c18401" },
      ],
      colors: {
        "editor.background": "#fafafa",
        "editor.foreground": "#383a42",
        "editor.lineHighlightBackground": "#f0f0f1",
        "editorLineNumber.foreground": "#9d9d9f",
        "editorCursor.foreground": "#526fff",
      },
    },
  },
];

export const DEFAULT_THEME_ID = "vs-dark";

/** Returns the theme definition for an id, or undefined when unknown. */
export function getThemeById(id) {
  return EDITOR_THEMES.find((theme) => theme.id === id);
}

/** Returns true when `id` matches a known theme. */
export function isValidThemeId(id) {
  return EDITOR_THEMES.some((theme) => theme.id === id);
}

/**
 * Register every custom theme with the given monaco instance. Built-in themes
 * are skipped since Monaco already knows them. Safe to call more than once.
 */
export function registerEditorThemes(monaco) {
  if (!monaco?.editor?.defineTheme) return;
  for (const theme of EDITOR_THEMES) {
    if (!theme.builtin && theme.data) {
      monaco.editor.defineTheme(theme.id, theme.data);
    }
  }
}

/** Read the persisted theme id, falling back to the default when unset/invalid. */
export function loadEditorTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored && isValidThemeId(stored) ? stored : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

/** Persist the selected theme id. Unknown ids are ignored. */
export function saveEditorTheme(id) {
  if (!isValidThemeId(id)) return;
  try {
    localStorage.setItem(THEME_KEY, id);
  } catch {
    /* localStorage may be unavailable (private mode, quota); ignore. */
  }
}
