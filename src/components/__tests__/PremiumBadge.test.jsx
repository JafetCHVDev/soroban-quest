/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import PremiumBadge from '../PremiumBadge';

const t = (key) => (key === 'shop.items.premiumBadge' ? 'Premium Badge' : key);

describe('PremiumBadge', () => {
  afterEach(() => cleanup());

  it('is shown with an accessible label when owned and equipped', () => {
    render(
      <PremiumBadge
        t={t}
        inventory={{ owned: ['premium-badge'], equipped: ['premium-badge'] }}
      />,
    );

    expect(screen.getByRole('img', { name: 'Premium Badge' })).toBeTruthy();
  });

  it('is hidden when owned but unequipped', () => {
    const { container } = render(
      <PremiumBadge t={t} inventory={{ owned: ['premium-badge'], equipped: [] }} />,
    );

    expect(screen.queryByRole('img', { name: 'Premium Badge' })).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('is hidden when not owned', () => {
    const { container } = render(
      <PremiumBadge t={t} inventory={{ owned: [], equipped: [] }} />,
    );

    expect(screen.queryByRole('img', { name: 'Premium Badge' })).toBeNull();
    expect(container.innerHTML).toBe('');
  });
});
