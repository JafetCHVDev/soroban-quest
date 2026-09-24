/** @vitest-environment jsdom */

import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import useDocumentTitle from '../useDocumentTitle.js';

describe('useDocumentTitle', () => {
  let originalTitle;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    cleanup();
    document.title = originalTitle;
  });

  it('sets the page title with the application suffix', () => {
    renderHook(() => useDocumentTitle('Profile'));

    expect(document.title).toBe('Profile | Soroban Quest');
  });

  it('updates the title when its input changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'Profile' },
    });
    expect(document.title).toBe('Profile | Soroban Quest');

    rerender({ title: 'Shop' });
    expect(document.title).toBe('Shop | Soroban Quest');
  });

  it('uses the application title for an empty string', () => {
    renderHook(() => useDocumentTitle(''));

    expect(document.title).toBe('Soroban Quest');
  });

  it('leaves the last title in place after unmount', () => {
    document.title = 'Previous page';
    const { unmount } = renderHook(() => useDocumentTitle('Journal'));
    expect(document.title).toBe('Journal | Soroban Quest');

    unmount();
    expect(document.title).toBe('Journal | Soroban Quest');
  });
});
