import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'soroban_quest_sound_settings';

function createLocalStorageMock() {
  let store = {};

  return {
    getItem: vi.fn((key) => (key in store ? store[key] : null)),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
}

function createWindowMock() {
  const oscillator = {
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };

  const gain = {
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };

  class MockAudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = 'running';
      this.destination = {};
    }

    createOscillator() {
      return oscillator;
    }

    createGain() {
      return gain;
    }

    resume = vi.fn(async () => {});
    close = vi.fn(async () => {});
  }

  return {
    AudioContext: MockAudioContext,
  };
}

describe('soundManager', () => {
  let soundManager;
  let storage;

  beforeEach(async () => {
    vi.resetModules();

    storage = createLocalStorageMock();

    globalThis.localStorage = storage;
    globalThis.window = createWindowMock();

    const matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    globalThis.window.matchMedia = matchMedia;

    soundManager = await import('../soundManager');
  });

  afterEach(() => {
    vi.restoreAllMocks();

    delete globalThis.localStorage;
    delete globalThis.window;
  });

  it('loads default settings', () => {
    expect(soundManager.getSoundSettings()).toEqual({
      muted: false,
      volume: 0.5,
    });
  });

  it('persists mute state', () => {
    soundManager.setMuted(true);

    expect(soundManager.isMuted()).toBe(true);

    const stored = JSON.parse(storage.getItem(STORAGE_KEY));

    expect(stored.muted).toBe(true);
  });

  it('toggles mute state', () => {
    expect(soundManager.isMuted()).toBe(false);

    expect(soundManager.toggleMute()).toBe(true);
    expect(soundManager.isMuted()).toBe(true);

    expect(soundManager.toggleMute()).toBe(false);
    expect(soundManager.isMuted()).toBe(false);
  });

  it('persists volume', () => {
    soundManager.setVolume(0.75);

    expect(soundManager.getVolume()).toBe(0.75);

    const stored = JSON.parse(storage.getItem(STORAGE_KEY));

    expect(stored.volume).toBe(0.75);
  });

  it('clamps volume between 0 and 1', () => {
    soundManager.setVolume(2);
    expect(soundManager.getVolume()).toBe(1);

    soundManager.setVolume(-1);
    expect(soundManager.getVolume()).toBe(0);
  });

  it('loads persisted settings from localStorage', async () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        muted: true,
        volume: 0.25,
      }),
    );

    vi.resetModules();

    const freshManager = await import('../soundManager');

    expect(freshManager.getSoundSettings()).toEqual({
      muted: true,
      volume: 0.25,
    });
  });

  it('handles malformed localStorage data', async () => {
    storage.setItem(STORAGE_KEY, '{invalid-json');

    vi.resetModules();

    const freshManager = await import('../soundManager');

    expect(freshManager.getSoundSettings()).toEqual({
      muted: false,
      volume: 0.5,
    });
  });

  it('does not play sounds while muted', () => {
    soundManager.setMuted(true);

    expect(() => {
      soundManager.playSound(soundManager.SOUND_TYPES.XP_GAINED);
    }).not.toThrow();
  });

  it('supports all defined sound types', () => {
    Object.values(soundManager.SOUND_TYPES).forEach((type) => {
      expect(() => {
        soundManager.playSound(type);
      }).not.toThrow();
    });
  });

  it('handles browsers without AudioContext', async () => {
    delete globalThis.window.AudioContext;

    vi.resetModules();

    const freshManager = await import('../soundManager');

    expect(() => {
      freshManager.playSound(freshManager.SOUND_TYPES.BUTTON_CLICK);
    }).not.toThrow();
  });

  it('unlockAudio does not throw when AudioContext is unavailable', async () => {
    delete globalThis.window.AudioContext;

    vi.resetModules();

    const freshManager = await import('../soundManager');

    await expect(freshManager.unlockAudio()).resolves.toBeNull();
  });

  it('playClick can be called safely', () => {
    expect(() => soundManager.playClick()).not.toThrow();
  });

  it('destroyAudioContext can be called safely', () => {
    expect(() => soundManager.destroyAudioContext()).not.toThrow();
  });
});
