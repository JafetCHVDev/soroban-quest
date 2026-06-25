import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function useScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
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
  }, [pathname, navigationType]);
}