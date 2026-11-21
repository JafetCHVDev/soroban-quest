/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LiveStatusBar from '../LiveStatusBar';

const t = (key, vars) => (vars ? `${key}:${vars.passed}/${vars.total}` : key);

function renderBar(passCount, totalCount) {
  return render(<LiveStatusBar passCount={passCount} totalCount={totalCount} t={t} />);
}

describe('LiveStatusBar', () => {
  afterEach(() => cleanup());

  it('renders nothing before any live check has run', () => {
    const { container } = renderBar(0, 0);
    expect(container.innerHTML).toBe('');
  });

  it.each([
    [3, 3, 'missionDetail.status.allPassing:3/3', 'rgb(52, 211, 153)', '100%'],
    [0, 4, 'missionDetail.status.passing:0/4', 'rgb(248, 113, 113)', '0%'],
    [1, 4, 'missionDetail.status.passing:1/4', 'rgb(251, 191, 36)', '25%'],
  ])('shows %i of %i passing', (passed, total, label, color, width) => {
    renderBar(passed, total);
    const status = screen.getByRole('status', {
      name: 'Live typing test checker tracker status panel',
    });
    const text = screen.getByText(label);
    expect(status.contains(text)).toBe(true);
    expect(text.style.color).toBe(color);
    expect(status.querySelector('[aria-hidden="true"] > div').style.width).toBe(width);
    expect(screen.getByText('missionDetail.status.note')).toBeTruthy();
  });
});
