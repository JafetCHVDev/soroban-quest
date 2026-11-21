/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useMissionReplay } from '../useMissionReplay';

const recording = {
  events: [{ type: 'start', content: 'fn a() {}', timestamp: 0 }],
  missionId: 'hello-soroban',
  recordedAt: 1,
  duration: 0,
};

describe('useMissionReplay', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => cleanup());

  it('reports whether the mission has a saved recording', () => {
    expect(renderHook(() => useMissionReplay('hello-soroban')).result.current.hasReplay).toBe(false);

    localStorage.setItem('soroban_quest_replays_hello-soroban', JSON.stringify(recording));
    expect(renderHook(() => useMissionReplay('hello-soroban')).result.current.hasReplay).toBe(true);
    expect(renderHook(() => useMissionReplay(undefined)).result.current.hasReplay).toBe(false);
  });

  it('opens the saved recording and closes it again', () => {
    localStorage.setItem('soroban_quest_replays_hello-soroban', JSON.stringify(recording));
    const { result } = renderHook(() => useMissionReplay('hello-soroban'));

    act(() => result.current.handleWatchReplay());
    expect(result.current.showReplay).toBe(true);
    expect(result.current.replayData).toEqual(recording);

    act(() => result.current.handleCloseReplay());
    expect(result.current.showReplay).toBe(false);
    expect(result.current.replayData).toBeNull();
  });

  it('stays closed when there is no recording', () => {
    const { result } = renderHook(() => useMissionReplay('hello-soroban'));

    act(() => result.current.handleWatchReplay());

    expect(result.current.showReplay).toBe(false);
    expect(result.current.replayData).toBeNull();
  });
});
