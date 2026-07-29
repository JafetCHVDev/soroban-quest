/**
 * SoundContext — React wrapper around soundManager singleton.
 *
 * Provides:
 *   muted     — current mute state
 *   volume    — current volume (0–1)
 *   toggleMute()
 *   setVolume(n)
 *   sound     — the soundManager instance for direct play() calls
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import { soundManager } from "./soundManager";

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [muted,  setMutedState]  = useState(() => soundManager.muted);
  const [volume, setVolumeState] = useState(() => soundManager.volume);

  // Keep React state in sync whenever the manager is mutated externally
  useEffect(() => {
    return soundManager.subscribe(({ muted: m, volume: v }) => {
      setMutedState(m);
      setVolumeState(v);
    });
  }, []);

  const toggleMute = () => soundManager.toggleMute();
  const setVolume  = (v) => soundManager.setVolume(v);

  return (
    <SoundContext.Provider value={{ muted, volume, toggleMute, setVolume, sound: soundManager }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    // Graceful fallback — never throw in a sound hook
    return {
      muted: true,
      volume: 0.5,
      toggleMute: () => {},
      setVolume: () => {},
      sound: soundManager,
    };
  }
  return ctx;
}
