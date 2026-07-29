import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useRef } from "react";
import { measureNavigation } from "../systems/performanceMonitor";

export default function useScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const stopNavigation = measureNavigation(previousPathname.current, pathname);
    previousPathname.current = pathname;

    // Keep standard browser history back/forward placement untouched
    if (navigationType !== "POP") {
      
      // 1. Reset global window layer
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      });

      // 2. Reset internal DOM main layout wrappers if they hold the overflow scrollbars
      const scrollContainers = document.querySelectorAll(".main-content, .app, main");
      scrollContainers.forEach((container) => {
        container.scrollTop = 0;
      });
    }

    // Route content has mounted when this effect runs, so record the completed transition.
    stopNavigation();
  }, [pathname, navigationType]);
}
