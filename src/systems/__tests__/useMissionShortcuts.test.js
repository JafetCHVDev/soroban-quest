/** @vitest-environment jsdom */

import { cleanup, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMissionShortcuts } from '../useMissionShortcuts';

function setup() {
  const handlers = {
    onRunTests: vi.fn(),
    onNextMission: vi.fn(),
    onPreviousMission: vi.fn(),
  };
  renderHook(() => useMissionShortcuts(handlers));
  return handlers;
}

describe('useMissionShortcuts', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('runs tests on Ctrl+Enter and Cmd+Enter', () => {
    const { onRunTests } = setup();
    fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'Enter', metaKey: true });
    expect(onRunTests).toHaveBeenCalledTimes(2);
  });

  it('runs tests on Ctrl+Enter even while typing in the editor', () => {
    const { onRunTests } = setup();
    document.body.innerHTML = '<div class="monaco-editor"><textarea></textarea></div>';
    document.querySelector('textarea').focus();
    fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
    expect(onRunTests).toHaveBeenCalledTimes(1);
  });

  it('maps r, n and p to run, next and previous', () => {
    const handlers = setup();
    fireEvent.keyDown(window, { key: 'r' });
    fireEvent.keyDown(window, { key: 'N' });
    fireEvent.keyDown(window, { key: 'p' });
    expect(handlers.onRunTests).toHaveBeenCalledTimes(1);
    expect(handlers.onNextMission).toHaveBeenCalledTimes(1);
    expect(handlers.onPreviousMission).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['an input', '<input />', 'input'],
    ['a textarea', '<textarea></textarea>', 'textarea'],
    ['the Monaco editor', '<div class="monaco-editor"><button>x</button></div>', 'button'],
  ])('ignores single-key shortcuts while focus is in %s', (_label, html, selector) => {
    const handlers = setup();
    document.body.innerHTML = html;
    document.querySelector(selector).focus();
    fireEvent.keyDown(window, { key: 'r' });
    fireEvent.keyDown(window, { key: 'n' });
    expect(handlers.onRunTests).not.toHaveBeenCalled();
    expect(handlers.onNextMission).not.toHaveBeenCalled();
  });
});
