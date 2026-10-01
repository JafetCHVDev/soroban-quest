/*
 * These tests use Vitest fake timers to drive the module's window timeout
 * deterministically. The auth and storage modules are mocked so the suite
 * exercises scheduling and payload orchestration without browser persistence
 * or network state.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authService = {
  getCurrentUser: vi.fn(() => ({ id: 'test-user' })),
  isAuthenticated: vi.fn(() => true),
};

const storage = {
  loadProgress: vi.fn(() => ({ xp: 10 })),
  loadProfile: vi.fn(() => ({ id: 'profile-1' })),
  saveProgress: vi.fn(),
  saveProfile: vi.fn(),
  loadProfiles: vi.fn(() => [{ id: 'profile-1' }]),
  saveProfiles: vi.fn(),
  getActiveProfileId: vi.fn(() => 'profile-1'),
  setActiveProfileId: vi.fn(),
};

vi.mock('../authService', () => ({ authService }));
vi.mock('../storage', () => storage);

const { cloudSyncService, scheduleCloudSync } = await import('../cloudSync.js');

describe('cloudSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      setTimeout,
      clearTimeout,
    });
    authService.getCurrentUser.mockReturnValue({ id: 'test-user' });
    authService.isAuthenticated.mockReturnValue(true);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('schedules one sync after the debounce window', async () => {
    const sync = vi.spyOn(cloudSyncService, 'syncLocalToCloud').mockResolvedValue({ ok: true });

    scheduleCloudSync();
    expect(sync).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(799);
    expect(sync).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(sync).toHaveBeenCalledTimes(1);
  });

  it('debounces rapid repeated calls into one sync', async () => {
    const sync = vi.spyOn(cloudSyncService, 'syncLocalToCloud').mockResolvedValue({ ok: true });

    scheduleCloudSync();
    await vi.advanceTimersByTimeAsync(400);
    scheduleCloudSync();
    await vi.advanceTimersByTimeAsync(400);
    scheduleCloudSync();

    await vi.advanceTimersByTimeAsync(799);
    expect(sync).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(sync).toHaveBeenCalledTimes(1);
  });

  it('reschedules the sync when another call arrives after a prior sync', async () => {
    const sync = vi.spyOn(cloudSyncService, 'syncLocalToCloud').mockResolvedValue({ ok: true });

    scheduleCloudSync();
    await vi.advanceTimersByTimeAsync(800);
    scheduleCloudSync();
    await vi.advanceTimersByTimeAsync(800);

    expect(sync).toHaveBeenCalledTimes(2);
  });

  it('does not throw synchronously when the scheduled async sync fails', async () => {
    const sync = vi
      .spyOn(cloudSyncService, 'syncLocalToCloud')
      .mockRejectedValue(new Error('cloud unavailable'));

    expect(() => scheduleCloudSync()).not.toThrow();
    await vi.advanceTimersByTimeAsync(800);

    expect(sync).toHaveBeenCalledTimes(1);
    await expect(sync.mock.results[0].value).rejects.toThrow('cloud unavailable');
  });
});