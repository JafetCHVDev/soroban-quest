/**
 * SoundManager — Web Audio API procedural sound effects
 *
 * All sounds are generated with OscillatorNode + GainNode so no audio
 * files need to be loaded.  Every public method is a no-op when:
 *   - AudioContext is unavailable in the browser
 *   - The user has the global mute enabled
 *   - The OS "prefers-reduced-motion" media query is active (same
 *     principle applied to audio to respect user sensory preferences)
 */

const STORAGE_KEY_MUTED  = "soroban_quest_sound_muted";
const STORAGE_KEY_VOLUME = "soroban_quest_sound_volume";

// Debounce interval for click sounds (ms)
const CLICK_DEBOUNCE_MS = 80;

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                    */
/* ------------------------------------------------------------------ */

function createContext() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    return AC ? new AC() : null;
  } catch {
    return null;
  }
}

/**
 * Plays a sequence of oscillator segments.
 * Each segment: { freq, type, startTime, duration, gainStart, gainEnd }
 */
function playSequence(ctx, segments, masterGain) {
  segments.forEach(({ freq, type = "sine", startTime, duration, gainStart = 0.4, gainEnd = 0 }) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(masterGain);

    osc.type      = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    gain.gain.setValueAtTime(gainStart, ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(gainEnd, ctx.currentTime + startTime + duration);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  });
}

/* ------------------------------------------------------------------ */
/*  SoundManager singleton                                             */
/* ------------------------------------------------------------------ */

class SoundManager {
  constructor() {
    this._ctx        = null;   // lazy-init AudioContext
    this._muted      = localStorage.getItem(STORAGE_KEY_MUTED) === "true";
    this._volume     = parseFloat(localStorage.getItem(STORAGE_KEY_VOLUME) ?? "0.5");
    this._lastClick  = 0;
    this._listeners  = new Set();

    // Respect OS-level "prefers-reduced-motion" as a sensory preference
    // proxy — users who reduce motion typically also prefer less audio.
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    this._prefersReduced = mq?.matches ?? false;
    mq?.addEventListener("change", (e) => { this._prefersReduced = e.matches; });
  }

  /* ---- Public API ---- */

  get muted()  { return this._muted; }
  get volume() { return this._volume; }

  setMuted(value) {
    this._muted = Boolean(value);
    localStorage.setItem(STORAGE_KEY_MUTED, String(this._muted));
    this._notify();
  }

  toggleMute() {
    this.setMuted(!this._muted);
  }

  setVolume(value) {
    this._volume = Math.max(0, Math.min(1, value));
    localStorage.setItem(STORAGE_KEY_VOLUME, String(this._volume));
    this._notify();
  }

  /** Subscribe to mute/volume changes. Returns unsubscribe fn. */
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  /* ---- Sound definitions ---- */

  /** Triumphant multi-note fanfare — mission complete */
  playMissionComplete() {
    const ctx = this._ready();
    if (!ctx) return;
    const mg = this._masterGain(ctx);

    playSequence(ctx, [
      { freq: 523.25, type: "triangle", startTime: 0.00, duration: 0.12, gainStart: 0.5, gainEnd: 0.3 },
      { freq: 659.25, type: "triangle", startTime: 0.10, duration: 0.12, gainStart: 0.5, gainEnd: 0.3 },
      { freq: 783.99, type: "triangle", startTime: 0.20, duration: 0.12, gainStart: 0.5, gainEnd: 0.3 },
      { freq: 1046.5, type: "triangle", startTime: 0.30, duration: 0.40, gainStart: 0.6, gainEnd: 0.0 },
      // Harmony layer
      { freq: 392.00, type: "sine",     startTime: 0.30, duration: 0.40, gainStart: 0.2, gainEnd: 0.0 },
    ], mg);
  }

  /** Ascending chime — level up */
  playLevelUp() {
    const ctx = this._ready();
    if (!ctx) return;
    const mg = this._masterGain(ctx);

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      playSequence(ctx, [
        { freq, type: "sine", startTime: i * 0.10, duration: 0.18, gainStart: 0.45, gainEnd: 0.0 },
      ], mg);
    });
  }

  /** Short jingle — badge earned */
  playBadgeEarned() {
    const ctx = this._ready();
    if (!ctx) return;
    const mg = this._masterGain(ctx);

    playSequence(ctx, [
      { freq: 880.00, type: "sine",     startTime: 0.00, duration: 0.10, gainStart: 0.4, gainEnd: 0.2 },
      { freq: 1108.7, type: "sine",     startTime: 0.08, duration: 0.10, gainStart: 0.4, gainEnd: 0.2 },
      { freq: 1318.5, type: "triangle", startTime: 0.16, duration: 0.30, gainStart: 0.5, gainEnd: 0.0 },
    ], mg);
  }

  /** Subtle click/tap — button interaction */
  playClick() {
    const now = Date.now();
    if (now - this._lastClick < CLICK_DEBOUNCE_MS) return;
    this._lastClick = now;

    const ctx = this._ready();
    if (!ctx) return;
    const mg = this._masterGain(ctx);

    playSequence(ctx, [
      { freq: 1200, type: "sine", startTime: 0, duration: 0.04, gainStart: 0.25, gainEnd: 0.0 },
    ], mg);
  }

  /** Soft pop/ding — XP gained */
  playXPGained() {
    const ctx = this._ready();
    if (!ctx) return;
    const mg = this._masterGain(ctx);

    playSequence(ctx, [
      { freq: 600,  type: "sine", startTime: 0.00, duration: 0.06, gainStart: 0.3, gainEnd: 0.15 },
      { freq: 900,  type: "sine", startTime: 0.05, duration: 0.12, gainStart: 0.3, gainEnd: 0.0  },
    ], mg);
  }

  /** Coin sound — gold earned */
  playGoldEarned() {
    const ctx = this._ready();
    if (!ctx) return;
    const mg = this._masterGain(ctx);

    playSequence(ctx, [
      { freq: 1046.5, type: "sine", startTime: 0.00, duration: 0.08, gainStart: 0.35, gainEnd: 0.1 },
      { freq: 1318.5, type: "sine", startTime: 0.07, duration: 0.12, gainStart: 0.35, gainEnd: 0.0 },
    ], mg);
  }

  /** Negative buzz — test failed / error */
  playError() {
    const ctx = this._ready();
    if (!ctx) return;
    const mg = this._masterGain(ctx);

    playSequence(ctx, [
      { freq: 220, type: "sawtooth", startTime: 0.00, duration: 0.12, gainStart: 0.3, gainEnd: 0.1 },
      { freq: 196, type: "sawtooth", startTime: 0.10, duration: 0.18, gainStart: 0.25, gainEnd: 0.0 },
    ], mg);
  }

  /* ---- Private helpers ---- */

  /** Returns AudioContext, or null if muted / unavailable */
  _ready() {
    if (this._muted || this._prefersReduced) return null;

    if (!this._ctx) {
      this._ctx = createContext();
    }

    if (!this._ctx) return null;

    // Resume suspended context (browsers suspend after user inactivity)
    if (this._ctx.state === "suspended") {
      this._ctx.resume().catch(() => {});
    }

    return this._ctx;
  }

  /** Master gain node scaled by _volume */
  _masterGain(ctx) {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this._volume, ctx.currentTime);
    gain.connect(ctx.destination);
    return gain;
  }

  _notify() {
    this._listeners.forEach((fn) => fn({ muted: this._muted, volume: this._volume }));
  }
}

// Export a single shared instance
export const soundManager = new SoundManager();
