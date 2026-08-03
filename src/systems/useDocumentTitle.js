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
        const previousTitle = document.title;
        if (!title) {
            document.title = BASE_TITLE;
        } else {
            document.title = `${title} | ${BASE_TITLE}`;
        }
        return () => {
            document.title = previousTitle;
        };
    }, [title]);
}
