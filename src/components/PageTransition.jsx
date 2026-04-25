import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("enter");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("enter");
      setDisplayLocation(location);
    }
  }, [location, displayLocation]);

  return (
    <div 
      className={transitionStage === "enter" ? "page-transition-enter" : ""}
      onAnimationEnd={() => setTransitionStage("done")}
    >
      {children}
    </div>
  );
}
