import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { measureNavigation } from '../systems/performanceMonitor';

/**
 * Hook that scrolls the page to the top when the route changes.
 * Respects browser history back/forward by checking navigation type.
 * Measures navigation performance when scroll completes.
 */
export default function useScrollToTop(): void {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const stopNavigation = measureNavigation(previousPathname.current, pathname);
    previousPathname.current = pathname;

    // Keep standard browser history back/forward placement untouched
    if (navigationType !== 'POP') {
      // 1. Reset global window layer
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });

      // 2. Reset internal DOM main layout wrappers if they hold the overflow scrollbars
      const scrollContainers = document.querySelectorAll(
        '.main-content, .app, main',
      );
      scrollContainers.forEach((container) => {
        (container as HTMLElement).scrollTop = 0;
      });
    }

    // Route content has mounted when this effect runs, so record the completed transition.
    stopNavigation();
  }, [pathname, navigationType]);
}
