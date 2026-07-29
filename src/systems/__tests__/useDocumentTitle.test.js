/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement, act } from 'react';
import { createRoot } from 'react-dom/client';
import useDocumentTitle from '../useDocumentTitle.js';

function TitleHarness({ title }) {
  useDocumentTitle(title);
  return null;
}

describe('useDocumentTitle', () => {
  let container;
  let root;

  beforeEach(() => {
    document.title = 'Initial Title';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    container.remove();
  });

  function mount(pageTitle) {
    act(() => {
      root.render(createElement(TitleHarness, { title: pageTitle }));
    });
  }

  it('sets the base title when no custom title is provided', () => {
    mount(undefined);
    expect(document.title).toBe('Soroban Quest');
  });

  it('sets the base title when an empty custom title is provided', () => {
    mount('');
    expect(document.title).toBe('Soroban Quest');
  });

  it('sets a custom title with the app name suffix', () => {
    mount('Profile');
    expect(document.title).toBe('Profile | Soroban Quest');
  });

  it('restores the previous title on unmount', () => {
    mount('Profile');
    expect(document.title).toBe('Profile | Soroban Quest');
    act(() => {
      root.unmount();
    });
    root = null;
    expect(document.title).toBe('Initial Title');
  });

  it('updates the title when the hook parameter changes', () => {
    mount('Profile');
    expect(document.title).toBe('Profile | Soroban Quest');

    mount('Shop');
    expect(document.title).toBe('Shop | Soroban Quest');
  });
});
