/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useVictoryModal } from '../useVictoryModal';

const victory = { xp: 150, leveledUp: false, newLevel: 1, newBadges: [] };

function mountModal(result) {
  const modal = document.createElement('div');
  modal.innerHTML = '<button id="first">a</button><button id="middle">b</button><button id="last">c</button>';
  document.body.appendChild(modal);
  result.current.victoryModalRef.current = modal;
  return modal;
}

describe('useVictoryModal', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('opens with the victory data and closes again', () => {
    const { result } = renderHook(() => useVictoryModal());
    expect(result.current.showVictory).toBe(false);

    act(() => result.current.openVictory(victory));
    expect(result.current.showVictory).toBe(true);
    expect(result.current.victoryData).toEqual(victory);

    act(() => result.current.closeVictory());
    expect(result.current.showVictory).toBe(false);
    expect(result.current.victoryData).toEqual(victory);
  });

  it('focuses the first control and wraps Tab focus inside the modal', () => {
    const { result } = renderHook(() => useVictoryModal());
    const modal = mountModal(result);

    act(() => result.current.openVictory(victory));
    const first = modal.querySelector('#first');
    const last = modal.querySelector('#last');
    expect(document.activeElement).toBe(first);

    last.focus();
    fireEvent.keyDown(modal, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(modal, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('closes on Escape', () => {
    const { result } = renderHook(() => useVictoryModal());
    const modal = mountModal(result);
    act(() => result.current.openVictory(victory));

    act(() => {
      fireEvent.keyDown(modal, { key: 'Escape' });
    });

    expect(result.current.showVictory).toBe(false);
  });
});
