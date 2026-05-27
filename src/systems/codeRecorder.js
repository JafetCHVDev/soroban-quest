// codeRecorder.js
// Records user coding sessions for replay functionality

const STORAGE_KEY_PREFIX = 'soroban_quest_replays_';
const MAX_EVENTS = 200;
const MAX_STORAGE_SIZE = 500 * 1024; // 500KB
const DEBOUNCE_DELAY = 2000; // 2 seconds

class CodeRecorder {
  constructor(missionId) {
    this.missionId = missionId;
    this.storageKey = `${STORAGE_KEY_PREFIX}${missionId}`;
    this.events = [];
    this.startTime = Date.now();
    this.debounceTimer = null;
    this.lastCodeState = '';
    this.isRecording = false;
  }

  // Start recording a new session
  startRecording(initialCode = '') {
    this.events = [];
    this.startTime = Date.now();
    this.lastCodeState = initialCode;
    this.isRecording = true;

    // Add initial state event
    this.addEvent('edit', initialCode);
  }

  // Stop recording and save to localStorage
  stopRecording() {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    
    // Clear any pending debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Save to localStorage
    this.saveRecording();
  }

  // Add an event to the recording
  addEvent(type, content = '') {
    if (!this.isRecording) return;

    const event = {
      timestamp: Date.now() - this.startTime,
      type,
      content
    };

    this.events.push(event);

    // Limit events to prevent storage issues
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }
  }

  // Record code edit (debounced)
  recordCodeEdit(newCode) {
    if (!this.isRecording || newCode === this.lastCodeState) return;

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.addEvent('edit', newCode);
      this.lastCodeState = newCode;
    }, DEBOUNCE_DELAY);
  }

  // Record immediate events (run tests, hint, reset)
  recordRunTests() {
    this.addEvent('run');
  }

  recordHint(hintIndex) {
    this.addEvent('hint', hintIndex);
  }

  recordReset() {
    this.addEvent('reset');
  }

  // Save recording to localStorage
  saveRecording() {
    try {
      const recordingData = {
        events: this.events,
        missionId: this.missionId,
        recordedAt: Date.now(),
        duration: Date.now() - this.startTime
      };

      const serialized = JSON.stringify(recordingData);
      
      // Check storage size
      if (serialized.length > MAX_STORAGE_SIZE) {
        // Trim events if too large
        const trimmedEvents = this.events.slice(-Math.floor(MAX_EVENTS * 0.7));
        recordingData.events = trimmedEvents;
        recordingData.duration = trimmedEvents[trimmedEvents.length - 1]?.timestamp || 0;
      }

      localStorage.setItem(this.storageKey, JSON.stringify(recordingData));
    } catch (error) {
      console.warn('Failed to save recording:', error);
      // Clear storage if quota exceeded
      try {
        localStorage.removeItem(this.storageKey);
      } catch (clearError) {
        console.warn('Failed to clear recording storage:', clearError);
      }
    }
  }

  // Load recording from localStorage
  static loadRecording(missionId) {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${missionId}`;
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to load recording:', error);
      return null;
    }
  }

  // Check if a recording exists for a mission
  static hasRecording(missionId) {
    const storageKey = `${STORAGE_KEY_PREFIX}${missionId}`;
    return localStorage.getItem(storageKey) !== null;
  }

  // Delete a recording
  static deleteRecording(missionId) {
    const storageKey = `${STORAGE_KEY_PREFIX}${missionId}`;
    localStorage.removeItem(storageKey);
  }

  // Clear all recordings
  static clearAllRecordings() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  // Get all recording keys (for management)
  static getAllRecordingKeys() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .map(key => key.replace(STORAGE_KEY_PREFIX, ''));
  }
}

export default CodeRecorder;
