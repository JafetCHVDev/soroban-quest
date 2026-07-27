/* ==========================================
   Internationalization (i18n) Types
   ========================================== */

export type Language = 'en' | 'es' | string;

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}
