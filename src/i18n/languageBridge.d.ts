/**
 * TypeScript declaration file for languageBridge.js
 * Provides type definitions for the language bridge module
 */

/**
 * Set the active language for data loading and localization
 * @param _lang - Language code ('en', 'es', 'fr', or 'ja')
 */
export function setActiveLanguage(_lang: 'en' | 'es' | 'fr' | 'ja'): void;

/**
 * Get the current active language
 * @returns Current language code
 */
export function getActiveLanguage(): 'en' | 'es' | 'fr' | 'ja';
