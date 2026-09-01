const STORAGE_KEY = 'soroban_quest_sound_settings';

const DEFAULT_SETTINGS = {
  muted: false,
  volume: 0.5,
};

function systemPrefersReducedAudio() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const SOUND_TYPES = {
  MISSION_COMPLETE: 'MISSION_COMPLETE',
  LEVEL_UP: 'LEVEL_UP',
  BADGE_EARNED: 'BADGE_EARNED',
  BUTTON_CLICK: 'BUTTON_CLICK',
  XP_GAINED: 'XP_GAINED',
  GOLD_EARNED: 'GOLD_EARNED',
  ERROR: 'ERROR',
};

let audioContext = null;
let lastClickTime = 0;

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_SETTINGS, muted: systemPrefersReducedAudio() };
    }

    const parsed = JSON.parse(stored);

    return {
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULT_SETTINGS.muted,
      volume:
        typeof parsed.volume === 'number'
          ? Math.min(Math.max(parsed.volume, 0), 1)
          : DEFAULT_SETTINGS.volume,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

let settings = loadSettings();

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures.
  }
}

function getAudioContext() {
  if (typeof window === 'undefined') return null;

  if (!window.AudioContext && !window.webkitAudioContext) {
    return null;
  }

  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

async function resumeAudioContext() {
  const context = getAudioContext();

  if (!context) return null;

  if (context.state === 'suspended') {
    try {
      await context.resume();
    } catch {
      return null;
    }
  }

  return context;
}

function playTone(frequency, duration, type = 'sine', volumeMultiplier = 1) {
  if (settings.muted || settings.volume <= 0) return;

  const context = getAudioContext();
  if (!context) return;

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);

    const volume = settings.volume * volumeMultiplier;

    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + duration,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch {
    // Audio failures should never break the application.
  }
}

function playSequence(notes, interval = 0.08) {
  if (settings.muted || settings.volume <= 0) return;

  notes.forEach(({ frequency, duration = 0.15, type = 'sine' }, index) => {
    setTimeout(() => {
      playTone(frequency, duration, type);
    }, index * interval * 1000);
  });
}

export function playSound(type) {
  if (settings.muted) return;

  switch (type) {
    case SOUND_TYPES.MISSION_COMPLETE:
      playSequence([
        { frequency: 523.25 },
        { frequency: 659.25 },
        { frequency: 783.99 },
        { frequency: 1046.5, duration: 0.3 },
      ]);
      break;

    case SOUND_TYPES.LEVEL_UP:
      playSequence([
        { frequency: 392 },
        { frequency: 523.25 },
        { frequency: 659.25 },
        { frequency: 783.99, duration: 0.25 },
      ]);
      break;

    case SOUND_TYPES.BADGE_EARNED:
      playSequence([
        { frequency: 659.25 },
        { frequency: 783.99 },
        { frequency: 987.77 },
        { frequency: 1174.66, duration: 0.3 },
      ]);
      break;

    case SOUND_TYPES.BUTTON_CLICK:
      playTone(800, 0.05, 'square', 0.35);
      break;

    case SOUND_TYPES.XP_GAINED:
      playSequence([
        { frequency: 660, duration: 0.08 },
        { frequency: 880, duration: 0.12 },
      ]);
      break;

    case SOUND_TYPES.GOLD_EARNED:
      playSequence([
        { frequency: 880, duration: 0.08 },
        { frequency: 1174.66, duration: 0.12 },
      ]);
      break;

    case SOUND_TYPES.ERROR:
      playTone(180, 0.25, 'sawtooth', 0.45);
      break;

    default:
      break;
  }
}

export function playClick() {
  const now = Date.now();

  // Prevent rapid repeated click sounds.
  if (now - lastClickTime < 80) return;

  lastClickTime = now;
  playSound(SOUND_TYPES.BUTTON_CLICK);
}

export function setMuted(muted) {
  settings = {
    ...settings,
    muted: Boolean(muted),
  };

  saveSettings();
}

export function toggleMute() {
  setMuted(!settings.muted);
  return settings.muted;
}

export function isMuted() {
  return settings.muted;
}

export function setVolume(volume) {
  const normalized = Math.min(Math.max(Number(volume) || 0, 0), 1);

  settings = {
    ...settings,
    volume: normalized,
  };

  saveSettings();
}

export function getVolume() {
  return settings.volume;
}

export function getSoundSettings() {
  return { ...settings };
}

export async function unlockAudio() {
  return resumeAudioContext();
}

export function destroyAudioContext() {
  if (!audioContext) return;

  audioContext.close().catch(() => {});
  audioContext = null;
}
