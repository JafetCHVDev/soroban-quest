/* ==========================================
   i18n — Lightweight client-side internationalization
   ========================================== */

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
  FC,
} from 'react';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import zhCN from './locales/zh-CN.json';
import ja from './locales/ja.json';
import {
  setActiveLanguage,
  SUPPORTED_LANGS,
  DEFAULT_LANG,
  type SupportedLang,
} from './languageBridge';
import type { LanguageOption } from '../types/i18n';
import './i18n.css';

interface LocaleMessages extends Record<string, unknown> {
  languages?: Record<string, string>;
}

const LOCALES: Record<SupportedLang, LocaleMessages> = {
  en,
  es,
  fr,
  'zh-CN': zhCN,
  ja,
};
const SUPPORTED = SUPPORTED_LANGS;
const STORAGE_KEY = 'soroban_quest_lang';

/**
 * Language option type
 */
/**
 * Language context value type
 */
export interface LanguageContextValue {
  t: (
    _key: string,
    _varsOrFallback?: Record<string, unknown> | string,
    _fallbackVars?: Record<string, unknown>,
  ) => string;
  language: SupportedLang;
  setLanguage: (_lang: SupportedLang) => void;
  languages: LanguageOption[];
}

/**
 * Language context
 */
export const LanguageContext = createContext<LanguageContextValue | null>(null);

/* ---------- storage abstraction (private-mode safe) ---------- */

/**
 * In-memory fallback used when localStorage is unavailable
 * (e.g. private/incognito mode or strict browser settings).
 */
const memoryStore = new Map<string, string>();

function storageGet(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
  } catch {
    /* localStorage blocked — fall through to memory */
  }
  return memoryStore.get(key) ?? null;
}

function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
    return;
  } catch {
    /* localStorage blocked — fall through to memory */
  }
  memoryStore.set(key, value);
}

/* ---------- helpers ---------- */

function detectBrowserLanguage(): SupportedLang {
  if (typeof navigator === 'undefined') return DEFAULT_LANG;

  const candidates = [
    ...(navigator.languages || []),
    navigator.language,
  ].filter(Boolean);

  for (const c of candidates) {
    const base = String(c).toLowerCase().split('-')[0];
    if (SUPPORTED.includes(base as SupportedLang)) return base as SupportedLang;
  }
  return DEFAULT_LANG;
}

function readStoredLanguage(): SupportedLang | null {
  const stored = storageGet(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored as SupportedLang)) return stored as SupportedLang;
  return null;
}

function resolveKey(
  dict: Record<string, unknown>,
  key: string,
): unknown {
  return key
    .split('.')
    .reduce(
      (acc: unknown, part: string) => (acc != null && typeof acc === 'object' && part in (acc as Record<string, unknown>) ? (acc as Record<string, unknown>)[part] : undefined),
      dict,
    );
}

function interpolate(
  template: string | undefined,
  vars?: Record<string, unknown>,
): string {
  if (typeof template !== 'string' || !vars) return template ?? '';
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) =>
    vars[name] != null ? String(vars[name]) : `{{${name}}}`,
  );
}

/* ---------- Provider ---------- */

/**
 * LanguageProvider component manages language state and i18n functions.
 * @param props - Component props
 * @param props.children - Child components
 * @returns Language provider element
 */
export const LanguageProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLang>(
    () => {
      const initial = readStoredLanguage() || detectBrowserLanguage();
      // Sync the bridge immediately so first-render data loads localize
      // correctly, before the effect below runs.
      setActiveLanguage(initial);
      return initial;
    },
  );

  // Track whether the user has explicitly chosen a language so we
  // don't override their preference when the OS language changes.
  const userChoseRef = useRef(readStoredLanguage() !== null);

  useEffect(() => {
    storageSet(STORAGE_KEY, language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    // Keep the non-React language bridge in sync so data loaders
    // (missions/campaigns) localize against the active language.
    setActiveLanguage(language);
  }, [language]);

  // Detect real-time OS language changes via the languagechange event.
  // Only applies when the user has NOT made an explicit choice.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLanguageChange = (): void => {
      if (userChoseRef.current) return; // respect explicit user choice
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () =>
      window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // t('a.b.c', { name: 'World' })
  const t = useCallback(
    (
      key: string,
      varsOrFallback?: Record<string, unknown> | string,
      fallbackVars?: Record<string, unknown>,
    ): string => {
      if (!key) return '';
      const dict = LOCALES[language] || LOCALES[DEFAULT_LANG];
      const fallback = LOCALES[DEFAULT_LANG];

      let value = resolveKey(dict, key);
      if (value == null) value = resolveKey(fallback, key);
      if (value == null) {
        if (typeof varsOrFallback === 'string') {
          return interpolate(varsOrFallback, fallbackVars);
        }
        if (import.meta?.env?.DEV) {
          // Surface missing keys in development without crashing
          console.warn(`[i18n] Missing translation key: "${key}"`);
        }
        return key;
      }
      return interpolate(
        value as string | undefined,
        typeof varsOrFallback === 'string' ? fallbackVars : varsOrFallback,
      );
    },
    [language],
  );

  const setLanguage = useCallback(
    (lang: SupportedLang): void => {
      if (!SUPPORTED.includes(lang)) return;
      userChoseRef.current = true; // mark explicit choice
      setLanguageState(lang);
    },
    [],
  );

  const languages = useMemo(
    (): LanguageOption[] =>
      SUPPORTED.map((code) => {
        const langRecord = LOCALES[code]?.languages as
          | Record<string, string>
          | undefined;
        return {
          code,
          name: langRecord?.[code] || code.toUpperCase(),
        };
      }),
    [],
  );

  const value = useMemo(
    (): LanguageContextValue => ({ t, language, setLanguage, languages }),
    [t, language, setLanguage, languages],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
