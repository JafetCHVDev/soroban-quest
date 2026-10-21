/** @vitest-environment jsdom */

import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMonacoMarkers } from '../useMonacoMarkers';

describe('useMonacoMarkers', () => {
  afterEach(() => cleanup());

  it('writes markers to the mounted editor model under the given owner', () => {
    const { result } = renderHook(() => useMonacoMarkers());
    const model = {};
    const setModelMarkers = vi.fn();
    result.current.editorRef.current = { getModel: () => model };
    result.current.monacoRef.current = { editor: { setModelMarkers } };

    result.current.setMarkers('soroban-quest-live', [{ message: 'x' }]);

    expect(setModelMarkers).toHaveBeenCalledWith(model, 'soroban-quest-live', [{ message: 'x' }]);
  });

  it('does nothing before the editor is mounted', () => {
    const { result } = renderHook(() => useMonacoMarkers());
    expect(() => result.current.setMarkers('soroban-quest-live', [])).not.toThrow();
  });

  it('keeps setMarkers stable across renders', () => {
    // The live validator and compiler effects are keyed on this identity.
    const { result, rerender } = renderHook(() => useMonacoMarkers());
    const first = result.current.setMarkers;
    rerender();
    expect(result.current.setMarkers).toBe(first);
  });
});
