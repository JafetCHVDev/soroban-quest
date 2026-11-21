/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MissionVictoryModal from '../MissionVictoryModal';
import { TOAST_STATES } from '../../systems/useokashi';

const t = (key, vars) => (vars ? `${key} ${JSON.stringify(vars)}` : key);

function renderModal(overrides = {}) {
  const props = {
    t,
    missionTitle: 'Hello Soroban',
    victoryData: { xp: 150, leveledUp: false, newLevel: 1, newBadges: [] },
    hasReplay: false,
    modalRef: { current: null },
    okashiToast: { state: TOAST_STATES.IDLE, message: '' },
    onClose: vi.fn(),
    onWatchReplay: vi.fn(),
    onNextMission: vi.fn(),
    onMissionMap: vi.fn(),
    onOpenInOkashi: vi.fn(),
    ...overrides,
  };
  const view = render(<MissionVictoryModal {...props} />);
  return { ...view, props };
}

describe('MissionVictoryModal', () => {
  afterEach(() => cleanup());

  it('closes when the overlay is clicked but not when the dialog is clicked', () => {
    const { container, props } = renderModal();

    fireEvent.click(screen.getByRole('dialog'));
    expect(props.onClose).not.toHaveBeenCalled();

    fireEvent.click(container.querySelector('.modal-overlay'));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the XP and gold earned and attaches the focus-trap ref to the dialog', () => {
    const { props } = renderModal();
    expect(screen.getByText('+150 XP')).toBeTruthy();
    expect(screen.getByText('+75 Gold')).toBeTruthy();
    expect(props.modalRef.current).toBe(screen.getByRole('dialog'));
  });

  it('clamps the level-up rank to the highest rank title', () => {
    renderModal({ victoryData: { xp: 150, leveledUp: true, newLevel: 42, newBadges: [] } });
    expect(
      screen.getByText('missionDetail.victory.levelUp {"level":42,"rank":"ranks.10"}'),
    ).toBeTruthy();
  });

  it('offers the session replay only when one exists', () => {
    renderModal();
    expect(screen.queryByText(/missionDetail.victory.watchReplay/)).toBeNull();
    cleanup();

    const { props } = renderModal({ hasReplay: true });
    fireEvent.click(screen.getByText(/missionDetail.victory.watchReplay/));
    expect(props.onWatchReplay).toHaveBeenCalledTimes(1);
  });

  it('wires the navigation and Okashi buttons', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText('missionDetail.victory.next'));
    fireEvent.click(screen.getByText('missionDetail.victory.map'));
    fireEvent.click(screen.getByText('missionDetail.okashi.button'));
    expect(props.onNextMission).toHaveBeenCalledTimes(1);
    expect(props.onMissionMap).toHaveBeenCalledTimes(1);
    expect(props.onOpenInOkashi).toHaveBeenCalledTimes(1);
  });

  it('shows the Okashi toast once it leaves the idle state', () => {
    renderModal();
    expect(screen.queryByText('Copied!')).toBeNull();
    cleanup();

    renderModal({ okashiToast: { state: TOAST_STATES.SUCCESS, message: 'Copied!' } });
    expect(screen.getByText('Copied!')).toBeTruthy();
  });
});
