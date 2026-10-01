// @vitest-environment jsdom

import { act, cleanup, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useKeyboardShortcuts } from '../useKeyboardShortcuts.js';

function setPlatform(platform) {
  Object.defineProperty(window.navigator, 'platform', {
    configurable: true,
    value: platform,
  });
}

describe('useKeyboardShortcuts', () => {
  let onAction;
  let setIsOpen;

  beforeEach(() => {
    onAction = vi.fn();
    setIsOpen = vi.fn((value) => (typeof value === 'function' ? value(false) : value));
    setPlatform('Win32');
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
  });

  it('fires the matching callback for each registered shortcut', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        isOpen: false,
        setIsOpen,
        onAction,
      })
    );

    const cases = [
      { event: { key: '1', ctrlKey: true }, expected: 'home' },
      { event: { key: '2', ctrlKey: true }, expected: 'campaigns' },
      { event: { key: '3', ctrlKey: true }, expected: 'missions' },
      { event: { key: '4', ctrlKey: true }, expected: 'profile' },
      { event: { key: '5', ctrlKey: true }, expected: 'journal' },
      { event: { key: '/', ctrlKey: true }, expected: 'toggle-hints' },
      { event: { key: 'r', ctrlKey: true, shiftKey: true }, expected: 'reset-template' },
      { event: { key: 's', ctrlKey: true, shiftKey: true }, expected: 'show-solution' },
      { event: { key: 'h', ctrlKey: true, shiftKey: true }, expected: 'toggle-theme' },
      { event: { key: 'Enter', ctrlKey: true }, expected: 'run-tests' },
      { event: { key: '?', ctrlKey: false }, expected: 'modal-toggle' },
      { event: { key: 'k', ctrlKey: true }, expected: 'modal-toggle' },
    ];

    cases.forEach(({ event, expected }) => {
      onAction.mockClear();
      setIsOpen.mockClear();

      act(() => {
        fireEvent.keyDown(window, event);
      });

      if (expected === 'modal-toggle') {
        expect(setIsOpen).toHaveBeenCalledTimes(1);
      } else {
        expect(onAction).toHaveBeenCalledWith(expected);
      }
    });
  });

  it('ignores shortcuts while focus is in an input or textarea', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        isOpen: false,
        setIsOpen,
        onAction,
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      fireEvent.keyDown(window, { key: '1', ctrlKey: true });
      fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
    });

    expect(onAction).not.toHaveBeenCalled();

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    act(() => {
      fireEvent.keyDown(window, { key: 'r', ctrlKey: true, shiftKey: true });
    });

    expect(onAction).not.toHaveBeenCalled();
  });

  it('ignores unrelated key combinations', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        isOpen: false,
        setIsOpen,
        onAction,
      })
    );

    const unrelated = [
      { key: 'a', ctrlKey: true },
      { key: 'b', shiftKey: true },
      { key: 'Escape' },
      { key: 'Tab', ctrlKey: true },
    ];

    unrelated.forEach((event) => {
      act(() => {
        fireEvent.keyDown(window, event);
      });
    });

    expect(onAction).not.toHaveBeenCalled();
    expect(setIsOpen).not.toHaveBeenCalled();
  });

  it('uses Cmd (metaKey) instead of Ctrl as the modifier on Mac', () => {
    setPlatform('MacIntel');

    renderHook(() =>
      useKeyboardShortcuts({
        isOpen: false,
        setIsOpen,
        onAction,
      })
    );

    act(() => {
      fireEvent.keyDown(window, { key: '1', metaKey: true });
    });
    expect(onAction).toHaveBeenCalledWith('home');

    onAction.mockClear();

    // Ctrl alone must not act as the modifier on Mac.
    act(() => {
      fireEvent.keyDown(window, { key: '1', ctrlKey: true });
    });
    expect(onAction).not.toHaveBeenCalled();

    act(() => {
      fireEvent.keyDown(window, { key: 'k', metaKey: true });
    });
    expect(setIsOpen).toHaveBeenCalledTimes(1);
  });

  it('closes the modal on Escape while it is open', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        isOpen: true,
        setIsOpen,
        onAction,
      })
    );

    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    expect(setIsOpen).toHaveBeenCalledWith(false);

    // Navigation shortcuts stay disabled while the modal is open.
    onAction.mockClear();
    act(() => {
      fireEvent.keyDown(window, { key: '1', ctrlKey: true });
    });
    expect(onAction).not.toHaveBeenCalled();
  });

  it('removes the keydown listener when the hook unmounts', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        isOpen: false,
        setIsOpen,
        onAction,
      })
    );

    const keyListener = addSpy.mock.calls.find(([eventName]) => eventName === 'keydown')?.[1];
    expect(keyListener).toEqual(expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', keyListener);
  });
});
