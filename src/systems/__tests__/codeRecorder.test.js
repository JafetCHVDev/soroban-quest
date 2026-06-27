import CodeRecorder from '../codeRecorder.js';
import { describe, it, expect } from 'vitest';

describe('CodeRecorder (basic smoke tests)', () => {
  it('exports a constructor function', () => {
    expect(typeof CodeRecorder).toBe('function');
  });
});
