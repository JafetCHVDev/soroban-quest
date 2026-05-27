import { useEffect } from 'react';

const BASE_TITLE = 'Soroban Quest';

/**
 * Custom hook to dynamically update the document title
 * @param {string} title - The page-specific title (without the base title)
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | ${BASE_TITLE}`;
    } else {
      document.title = BASE_TITLE;
    }

    // Cleanup: restore base title when component unmounts
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
