import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CodeRecorder from '../codeRecorder.js';

// Mirrors real localStorage: stored entries become the mock's own enumerable
// properties (via instance assignment), while getItem/setItem/removeItem live
// on the prototype and are excluded from Object.keys — matching the Storage
// interface that CodeRecorder's static helpers rely on.
class LocalStorageMock {
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this, key) ? this[key] : null;
  }
  setItem(key, value) {
    this[key] = String(value);
  }
  removeItem(key) {
    delete this[key];
  }
}

describe('CodeRecorder', () => {
  let storage;

  beforeEach(() => {
    storage = new LocalStorageMock();
    vi.stubGlobal('localStorage', storage);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('constructor', () => {
    it('initializes with the given mission id and empty state', () => {
      const recorder = new CodeRecorder('mission-1');
      expect(recorder.missionId).toBe('mission-1');
      expect(recorder.storageKey).toBe('soroban_quest_replays_mission-1');
      expect(recorder.events).toEqual([]);
      expect(recorder.isRecording).toBe(false);
    });
  });

  describe('startRecording / stopRecording', () => {
    it('starts recording and adds an initial edit event', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('fn main() {}');

      expect(recorder.isRecording).toBe(true);
      expect(recorder.events).toHaveLength(1);
      expect(recorder.events[0]).toMatchObject({ type: 'edit', content: 'fn main() {}' });
    });

    it('does nothing on stopRecording if not currently recording', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.stopRecording();
      expect(storage['soroban_quest_replays_mission-1']).toBeUndefined();
    });

    it('stops recording and persists the session to localStorage', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('code');
      recorder.stopRecording();

      expect(recorder.isRecording).toBe(false);
      const saved = JSON.parse(storage['soroban_quest_replays_mission-1']);
      expect(saved.missionId).toBe('mission-1');
      expect(saved.events).toHaveLength(1);
    });

    it('clears a pending debounce timer when stopped', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('a');
      recorder.recordCodeEdit('b');
      recorder.stopRecording();

      vi.advanceTimersByTime(5000);
      // The debounced edit for 'b' should never have fired after stop
      expect(recorder.events.some((e) => e.content === 'b')).toBe(false);
    });
  });

  describe('addEvent', () => {
    it('does not record events when not recording', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.addEvent('run');
      expect(recorder.events).toEqual([]);
    });

    it('caps events at the max event count, keeping the most recent', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('');
      for (let i = 0; i < 250; i++) {
        recorder.addEvent('run', i);
      }
      expect(recorder.events.length).toBe(200);
      expect(recorder.events[recorder.events.length - 1].content).toBe(249);
    });
  });

  describe('recordCodeEdit', () => {
    it('does not record when not currently recording', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.recordCodeEdit('some code');
      vi.advanceTimersByTime(5000);
      expect(recorder.events).toEqual([]);
    });

    it('does not record when the code is unchanged from the last state', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('same');
      recorder.recordCodeEdit('same');
      vi.advanceTimersByTime(5000);
      expect(recorder.events).toHaveLength(1); // only the initial event
    });

    it('debounces rapid edits into a single event after the delay', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('');
      recorder.recordCodeEdit('a');
      vi.advanceTimersByTime(500);
      recorder.recordCodeEdit('ab');
      vi.advanceTimersByTime(500);
      recorder.recordCodeEdit('abc');

      vi.advanceTimersByTime(1999);
      expect(recorder.events).toHaveLength(1); // still just the initial event

      vi.advanceTimersByTime(1);
      expect(recorder.events).toHaveLength(2);
      expect(recorder.events[1]).toMatchObject({ type: 'edit', content: 'abc' });
      expect(recorder.lastCodeState).toBe('abc');
    });
  });

  describe('recordRunTests / recordHint / recordReset', () => {
    it('records a run event', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('');
      recorder.recordRunTests();
      expect(recorder.events[1]).toMatchObject({ type: 'run', content: '' });
    });

    it('records a hint event with the hint index as content', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('');
      recorder.recordHint(2);
      expect(recorder.events[1]).toMatchObject({ type: 'hint', content: 2 });
    });

    it('records a reset event', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('');
      recorder.recordReset();
      expect(recorder.events[1]).toMatchObject({ type: 'reset', content: '' });
    });
  });

  describe('saveRecording', () => {
    it('trims events when the serialized recording exceeds the storage limit', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('');
      const bigContent = 'x'.repeat(3000);
      for (let i = 0; i < 199; i++) {
        recorder.addEvent('edit', bigContent);
      }
      recorder.stopRecording();

      const saved = JSON.parse(storage['soroban_quest_replays_mission-1']);
      const serializedLength = JSON.stringify(saved).length;
      expect(serializedLength).toBeLessThanOrEqual(500 * 1024);
      expect(saved.events.length).toBeLessThan(200);
    });

    it('clears storage if writing fails (e.g. quota exceeded)', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('code');
      storage['soroban_quest_replays_mission-1'] = 'pre-existing';

      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => recorder.stopRecording()).not.toThrow();
      expect(storage['soroban_quest_replays_mission-1']).toBeUndefined();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('static loadRecording', () => {
    it('returns null when no recording exists', () => {
      expect(CodeRecorder.loadRecording('missing')).toBeNull();
    });

    it('returns the parsed recording when one exists', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('code');
      recorder.stopRecording();

      const loaded = CodeRecorder.loadRecording('mission-1');
      expect(loaded.missionId).toBe('mission-1');
      expect(loaded.events).toHaveLength(1);
    });

    it('returns null and warns when stored data is corrupted', () => {
      storage['soroban_quest_replays_mission-1'] = 'not json';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(CodeRecorder.loadRecording('mission-1')).toBeNull();
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('static hasRecording', () => {
    it('returns false when no recording exists', () => {
      expect(CodeRecorder.hasRecording('mission-1')).toBe(false);
    });

    it('returns true when a recording exists', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('code');
      recorder.stopRecording();
      expect(CodeRecorder.hasRecording('mission-1')).toBe(true);
    });
  });

  describe('static deleteRecording', () => {
    it('removes the recording for the given mission', () => {
      const recorder = new CodeRecorder('mission-1');
      recorder.startRecording('code');
      recorder.stopRecording();

      CodeRecorder.deleteRecording('mission-1');
      expect(CodeRecorder.hasRecording('mission-1')).toBe(false);
    });
  });

  describe('static clearAllRecordings', () => {
    it('removes only recording keys, leaving unrelated keys intact', () => {
      const recorderA = new CodeRecorder('mission-a');
      recorderA.startRecording('a');
      recorderA.stopRecording();

      const recorderB = new CodeRecorder('mission-b');
      recorderB.startRecording('b');
      recorderB.stopRecording();

      storage['unrelated_key'] = 'keep-me';

      CodeRecorder.clearAllRecordings();

      expect(CodeRecorder.hasRecording('mission-a')).toBe(false);
      expect(CodeRecorder.hasRecording('mission-b')).toBe(false);
      expect(storage['unrelated_key']).toBe('keep-me');
    });
  });

  describe('static getAllRecordingKeys', () => {
    it('returns mission ids for all stored recordings', () => {
      const recorderA = new CodeRecorder('mission-a');
      recorderA.startRecording('a');
      recorderA.stopRecording();

      const recorderB = new CodeRecorder('mission-b');
      recorderB.startRecording('b');
      recorderB.stopRecording();

      storage['unrelated_key'] = 'keep-me';

      const keys = CodeRecorder.getAllRecordingKeys();
      expect(keys.sort()).toEqual(['mission-a', 'mission-b']);
    });
  });
});
