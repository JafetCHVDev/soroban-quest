/**
 * @file i18n.ts
 * Internationalization and translation types
 */

import type { Language } from './game';

/**
 * Translation key paths (dot notation)
 */
export type TranslationKey = string;

/**
 * Locale data mapping
 */
export type LocaleMap = Record<Language, Record<string, string | Record<string, string>>>;

/**
 * Language metadata
 */
export interface LanguageOption {
  code: Language;
  name: string;
  nativeName?: string;
  flag?: string;
}

/**
 * Translation context
 */
export interface TranslationContext {
  t: (key: TranslationKey, defaultValue?: string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: LanguageOption[];
}

/**
 * Translation file structure
 */
export interface TranslationFile {
  [key: string]: string | Record<string, string | Record<string, string>>;
}

/**
 * Plural form rules
 */
export interface PluralRules {
  zero?: string;
  one: string;
  other: string;
}

/**
 * Translation with interpolation
 */
export interface InterpolatedTranslation {
  key: TranslationKey;
  values?: Record<string, string | number | boolean>;
  count?: number;
}
