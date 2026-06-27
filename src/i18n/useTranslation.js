/* ==========================================
   useTranslation — Hook for accessing i18n
   ========================================== */

import { useContext } from 'react';
import { LanguageContext } from './index.jsx';

export function useTranslation() {
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
