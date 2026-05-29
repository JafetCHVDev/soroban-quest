/* ==========================================
   Language Bridge — exposes the active UI language to plain
   (non-React) modules such as the mission/campaign loaders.

   The LanguageProvider calls `setActiveLanguage()` whenever the
   language changes, so data helpers can localize content without
   needing access to React context.
   ========================================== */

export const SUPPORTED_LANGS = ['en', 'es'];
export const DEFAULT_LANG = 'en';

let activeLanguage = DEFAULT_LANG;
const listeners = new Set();

/** Read the current active language code (e.g. 'en' | 'es'). */
export function getActiveLanguage() {
    return activeLanguage;
}

/** Update the active language. Called by the LanguageProvider. */
export function setActiveLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang) || lang === activeLanguage) return;
    activeLanguage = lang;
    for (const fn of listeners) {
        try {
            fn(activeLanguage);
        } catch {
            /* ignore listener errors */
        }
    }
}

/** Subscribe to language changes. Returns an unsubscribe function. */
export function onLanguageChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}
