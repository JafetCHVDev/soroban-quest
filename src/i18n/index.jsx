/* ==========================================
   i18n — Lightweight client-side internationalization
   ========================================== */

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import en from './locales/en.json';
import es from './locales/es.json';
import { setActiveLanguage } from './languageBridge.js';

const LOCALES = { en, es };
const SUPPORTED = ['en', 'es'];
const STORAGE_KEY = 'soroban_quest_lang';
const DEFAULT_LANG = 'en';

export const LanguageContext = createContext(null);

/* ---------- helpers ---------- */

function detectBrowserLanguage() {
  if (typeof navigator === 'undefined') return DEFAULT_LANG;

  const candidates = [
    ...(navigator.languages || []),
    navigator.language,
  ].filter(Boolean);

  for (const c of candidates) {
    const base = String(c).toLowerCase().split('-')[0];
    if (SUPPORTED.includes(base)) return base;
  }
  return DEFAULT_LANG;
}

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {
    /* localStorage unavailable (private mode, SSR, etc.) — ignore */
  }
  return null;
}

function resolveKey(dict, key) {
  return key
    .split('.')
    .reduce((acc, part) => (acc == null ? undefined : acc[part]), dict);
}

function interpolate(template, vars) {
  if (typeof template !== 'string' || !vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) =>
    vars[name] != null ? String(vars[name]) : `{{${name}}}`,
  );
}

/* ---------- Provider ---------- */

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const initial = readStoredLanguage() || detectBrowserLanguage();
    // Sync the bridge immediately so first-render data loads localize
    // correctly, before the effect below runs.
    setActiveLanguage(initial);
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    // Keep the non-React language bridge in sync so data loaders
    // (missions/campaigns) localize against the active language.
    setActiveLanguage(language);
  }, [language]);

  // t('a.b.c', { name: 'World' })
  const t = useCallback(
    (key, vars) => {
      if (!key) return '';
      const dict = LOCALES[language] || LOCALES[DEFAULT_LANG];
      const fallback = LOCALES[DEFAULT_LANG];

      let value = resolveKey(dict, key);
      if (value == null) value = resolveKey(fallback, key);
      if (value == null) {
        if (import.meta?.env?.DEV) {
          // Surface missing keys in development without crashing
          // eslint-disable-next-line no-console
          console.warn(`[i18n] Missing translation key: "${key}"`);
        }
        return key;
      }
      return interpolate(value, vars);
    },
    [language],
  );

  const setLanguage = useCallback((lang) => {
    if (SUPPORTED.includes(lang)) setLanguageState(lang);
  }, []);

  const languages = useMemo(
    () =>
      SUPPORTED.map((code) => ({
        code,
        name: LOCALES[code]?.languages?.[code] || code.toUpperCase(),
      })),
    [],
  );

  const value = useMemo(
    () => ({ t, language, setLanguage, languages }),
    [t, language, setLanguage, languages],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
