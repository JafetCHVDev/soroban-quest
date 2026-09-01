/* =========================
   EDITOR THEMES
   Color schemes for the Monaco code editor used in missions.
   Built-in themes ("vs-dark", etc.) are used as-is; custom themes are
   registered with monaco.editor.defineTheme on editor mount.
========================= */

const THEME_KEY = "soroban_quest_editor_theme";

export interface ThemeDefinition {
  base: string;
  inherit: boolean;
  rules: Array<{
    token: string;
    foreground: string;
    fontStyle?: string;
  }>;
  colors: Record<string, string>;
}

export interface Theme {
  id: string;
  label: string;
  builtin: boolean;
  data?: ThemeDefinition;
}

/**
 * Available editor themes.
 * - `id`: stable identifier persisted in localStorage and passed to Monaco.
 * - `label`: human-readable name shown in the selector.
 * - `builtin`: true for Monaco's bundled themes (no definition needed).
 * - `data`: monaco theme definition, required for custom themes.
 */
export const EDITOR_THEMES: Theme[] = [
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
  {
    // Deep navy/dark-blue background with cyan + magenta accents.
    // Cyberpunk aesthetic designed for extended coding sessions (low eye strain).
    id: "midnight-protocol",
    label: "Midnight Protocol",
    builtin: false,
    data: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "4a5568", fontStyle: "italic" },
        { token: "keyword", foreground: "00d4ff" }, // electric cyan
        { token: "string", foreground: "ff79c6" }, // magenta/pink
        { token: "number", foreground: "bd93f9" }, // soft purple
        { token: "type", foreground: "50fa7b" }, // neon green
        { token: "function", foreground: "8be9fd" }, // light cyan
        { token: "variable", foreground: "f8f8f2" }, // near-white
        { token: "operator", foreground: "ff79c6" }, // magenta
        { token: "delimiter", foreground: "6272a4" }, // muted blue-grey
      ],
      colors: {
        "editor.background": "#0a0e1a",
        "editor.foreground": "#cdd6f4",
        "editor.lineHighlightBackground": "#111827",
        "editor.selectionBackground": "#1e3a5f",
        "editor.inactiveSelectionBackground": "#162840",
        "editorLineNumber.foreground": "#3d4f6e",
        "editorLineNumber.activeForeground": "#00d4ff",
        "editorCursor.foreground": "#ff79c6",
        "editorIndentGuide.background": "#1e2a3a",
        "editorWidget.background": "#0d1525",
        "editorSuggestWidget.background": "#0d1525",
        "editorSuggestWidget.border": "#1e3a5f",
      },
    },
  },
  {
    // Purple/violet background with warm orange + cool blue syntax highlights.
    // Inspired by space nebula imagery — fits the Stellar blockchain theme.
    id: "nebula",
    label: "Nebula",
    builtin: false,
    data: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff9d00" }, // warm amber/orange
        { token: "string", foreground: "69d2e7" }, // cool cyan-blue
        { token: "number", foreground: "ff6b6b" }, // soft coral
        { token: "type", foreground: "c792ea" }, // lavender
        { token: "function", foreground: "82aaff" }, // periwinkle blue
        { token: "variable", foreground: "e1e4f0" }, // near-white lavender
        { token: "operator", foreground: "ff9d00" }, // warm amber
        { token: "delimiter", foreground: "7b7fb5" }, // muted indigo
      ],
      colors: {
        "editor.background": "#12103a",
        "editor.foreground": "#e1e4f0",
        "editor.lineHighlightBackground": "#1a1752",
        "editor.selectionBackground": "#2d2a6e",
        "editor.inactiveSelectionBackground": "#211e55",
        "editorLineNumber.foreground": "#443f7a",
        "editorLineNumber.activeForeground": "#ff9d00",
        "editorCursor.foreground": "#c792ea",
        "editorIndentGuide.background": "#1e1b4b",
        "editorWidget.background": "#0e0c2e",
        "editorSuggestWidget.background": "#0e0c2e",
        "editorSuggestWidget.border": "#2d2a6e",
      },
    },
  },
];

export const DEFAULT_THEME_ID = "vs-dark";

/** Returns the theme definition for an id, or undefined when unknown. */
export function getThemeById(id: string): Theme | undefined {
  return EDITOR_THEMES.find((theme) => theme.id === id);
}

/** Returns true when `id` matches a known theme. */
export function isValidThemeId(id: string): boolean {
  return EDITOR_THEMES.some((theme) => theme.id === id);
}

/**
 * Register every custom theme with the given monaco instance. Built-in themes
 * are skipped since Monaco already knows them. Safe to call more than once.
 */
export function registerEditorThemes(monaco: Record<string, unknown> & { editor?: Record<string, unknown> }): void {
  if (!monaco?.editor?.defineTheme) return;
  for (const theme of EDITOR_THEMES) {
    if (!theme.builtin && theme.data) {
      (monaco.editor as Record<string, unknown> & { defineTheme(id: string, def: ThemeDefinition): void }).defineTheme(theme.id, theme.data);
    }
  }
}

/** Read the persisted theme id, falling back to the default when unset/invalid. */
export function loadEditorTheme(): string {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored && isValidThemeId(stored) ? stored : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

/** Persist the selected theme id. Unknown ids are ignored. */
export function saveEditorTheme(id: string): void {
  if (!isValidThemeId(id)) return;
  try {
    localStorage.setItem(THEME_KEY, id);
  } catch {
    /* localStorage may be unavailable (private mode, quota); ignore. */
  }
}
