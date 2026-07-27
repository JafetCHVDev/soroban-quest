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
} from 'react';

import en from './locales/en.json';
import es from './locales/es.json';
import { setActiveLanguage } from './languageBridge';

const LOCALES: Record<string, any> = { en, es };
const SUPPORTED = ['en', 'es'];
const STORAGE_KEY = 'soroban_quest_lang';
const DEFAULT_LANG = 'en';

export interface LanguageContextType {
  t: (key: string, vars?: Record<string, any>) => string;
  language: string;
  setLanguage: (lang: string) => void;
  languages: Array<{ code: string; name: string }>;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

/* ---------- storage abstraction (private-mode safe) ---------- */

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

function detectBrowserLanguage(): string {
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

function readStoredLanguage(): string | null {
  const stored = storageGet(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  return null;
}

function resolveKey(dict: any, key: string): any {
  return key
    .split('.')
    .reduce((acc, part) => (acc == null ? undefined : acc[part]), dict);
}

function interpolate(template: any, vars?: Record<string, any>): string {
  if (typeof template !== 'string' || !vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) =>
    vars[name] != null ? String(vars[name]) : `{{${name}}}`,
  );
}

/* ---------- Provider ---------- */

export interface LanguageProviderProps {
  children?: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<string>(() => {
    const initial = readStoredLanguage() || detectBrowserLanguage();
    setActiveLanguage(initial);
    return initial;
  });

  const userChoseRef = useRef(readStoredLanguage() !== null);

  useEffect(() => {
    storageSet(STORAGE_KEY, language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    setActiveLanguage(language);
  }, [language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLanguageChange = () => {
      if (userChoseRef.current) return;
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, any>): string => {
      if (!key) return '';
      const dict = LOCALES[language] || LOCALES[DEFAULT_LANG];
      const fallback = LOCALES[DEFAULT_LANG];

      let value = resolveKey(dict, key);
      if (value == null) value = resolveKey(fallback, key);
      if (value == null) {
        if (import.meta?.env?.DEV) {
          console.warn(`[i18n] Missing translation key: "${key}"`);
        }
        return key;
      }
      return interpolate(value, vars);
    },
    [language],
  );

  const setLanguage = useCallback((lang: string) => {
    if (!SUPPORTED.includes(lang)) return;
    userChoseRef.current = true;
    setLanguageState(lang);
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
