import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { gameReducer, gameActions } from "./gameReducer";
import { loadProgress, saveProgress } from "./storage";

const StateContext = createContext(null);
const DispatchContext = createContext(null);

function init() {
  return loadProgress();
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, init);

  // Persistence middleware: after every reducer-produced state, mirror to
  // localStorage. saveProgress strips transient flags (leveledUp/newBadges/
  // alreadyCompleted) itself, so they never get written.
  const isFirstRunRef = useRef(true);
  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }
    saveProgress(state);
  }, [state]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(StateContext);
  if (ctx === null) {
    throw new Error("useGameState must be used inside <GameProvider>");
  }
  return ctx;
}

export function useGameDispatch() {
  const ctx = useContext(DispatchContext);
  if (ctx === null) {
    throw new Error("useGameDispatch must be used inside <GameProvider>");
  }
  return ctx;
}

export { gameActions };
