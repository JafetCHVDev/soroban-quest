import { useEffect } from 'react';

const BASE_TITLE = 'Soroban Quest';

/**
 * Custom hook to dynamically update the document title per route.
 *
 * @param {string} title - Page-specific title (e.g. "Profile", "Mission Map").
 * @returns {void}
 *
 * Usage:
 *   function Profile() {
 *     useDocumentTitle('Profile');
 *     return <div>...</div>;
 *   }
 *
 * Renders as: "Profile | Soroban Quest"
 */
export default function useDocumentTitle(title) {
    useEffect(() => {
        if (!title) {
            document.title = BASE_TITLE;
            return;
        }
        const fullTitle = `${title} | ${BASE_TITLE}`;
        if (document.title !== fullTitle) {
            document.title = fullTitle;
        }
    }, [title]);
}
