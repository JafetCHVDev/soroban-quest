/* ==========================================
   useTranslation — Hook for accessing i18n
   ========================================== */

import { useContext } from 'react';
import { LanguageContext, type LanguageContextValue } from './index';

/**
 * Hook to access translation functions and language state.
 * Returns a fallback object if LanguageProvider is not present in the tree,
 * preventing errors in isolated tests or storybook scenarios.
 * @returns Language context value with translation function
 */
export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);

  // Graceful fallback so consumers don't crash if a tree is rendered
  // outside the provider (e.g., isolated tests or storybook).
  if (!ctx) {
    return {
      t: (key) => key,
      language: 'en',
      setLanguage: () => {},
      languages: [{ code: 'en', name: 'English' }],
    };
  }
  return ctx;
}
