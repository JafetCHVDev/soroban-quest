import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService, getAuthService } from '../authService.js';
import { getCloudSyncStatus, cloudSyncService } from '../cloudSync.js';

const AUTH_STORAGE_KEY = 'soroban_quest_auth_user';

describe('authService', () => {
  let storage;
  let mockLocalStorage;

  beforeEach(() => {
    storage = {};
    mockLocalStorage = {
      getItem: vi.fn((key) => (Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null)),
      setItem: vi.fn((key, value) => {
        storage[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        storage = {};
      }),
    };

    const mockWindow = {
      localStorage: mockLocalStorage,
      dispatchEvent: vi.fn(),
    };

    vi.stubGlobal('window', mockWindow);
    vi.stubGlobal('localStorage', mockLocalStorage);

    // Reset auth singleton state before each test
    authService.signOut();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initial state / unauthenticated', () => {
    it('returns null for getCurrentUser when no user is signed in', () => {
      expect(authService.getCurrentUser()).toBeNull();
    });

    it('reports isAuthenticated as false when no session exists', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('returns idle sync status when no session exists', () => {
      expect(getCloudSyncStatus()).toBe('idle');
      expect(cloudSyncService.isEnabled()).toBe(false);
    });
  });

  describe('signIn', () => {
    it('successfully signs in with valid email and username', () => {
      const user = authService.signIn('Player@Example.COM', 'StellarPilot');

      expect(user).toBeDefined();
      expect(user.id).toMatch(/^(player-|[0-9a-f]{8}-)/);
      expect(user.email).toBe('player@example.com');
      expect(user.username).toBe('StellarPilot');
      expect(user.provider).toBe('local');
      expect(typeof user.createdAt).toBe('number');
      expect(typeof user.lastSeen).toBe('number');

      // State is reflected in service
      expect(authService.getCurrentUser()).toEqual(user);
      expect(authService.isAuthenticated()).toBe(true);

      // Persisted to localStorage
      const stored = JSON.parse(mockLocalStorage.getItem(AUTH_STORAGE_KEY));
      expect(stored).toEqual(user);
    });

    it('normalizes email by trimming and converting to lowercase', () => {
      const user = authService.signIn('   Test.User@Stellar.ORG   ', 'Pilot');
      expect(user.email).toBe('test.user@stellar.org');
    });

    it('derives default username from email prefix when username is omitted', () => {
      const user = authService.signIn('cosmic_coder@domain.xyz');
      expect(user.username).toBe('cosmic_coder');
    });

    it('preserves existing user id and createdAt on subsequent sign-in', () => {
      const initial = authService.signIn('user@stellar.org', 'UserOne');
      const initialId = initial.id;
      const initialCreatedAt = initial.createdAt;

      // Re-sign in with updated username
      const updated = authService.signIn('user@stellar.org', 'UserUpdated');

      expect(updated.id).toBe(initialId);
      expect(updated.createdAt).toBe(initialCreatedAt);
      expect(updated.username).toBe('UserUpdated');
      expect(updated.lastSeen).toBeGreaterThanOrEqual(initial.lastSeen);
    });

    it('throws an error when email is missing or empty', () => {
      expect(() => authService.signIn('')).toThrow('An email is required for cloud sync.');
      expect(() => authService.signIn('   ')).toThrow('An email is required for cloud sync.');
      expect(() => authService.signIn(null)).toThrow('An email is required for cloud sync.');
      expect(() => authService.signIn(undefined)).toThrow('An email is required for cloud sync.');

      // State remains unauthenticated
      expect(authService.isAuthenticated()).toBe(false);
      expect(mockLocalStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    });
  });

  describe('signUp', () => {
    it('creates and signs in a new user identical to signIn', () => {
      const user = authService.signUp('newplayer@stellar.org', 'Newbie');

      expect(user.email).toBe('newplayer@stellar.org');
      expect(user.username).toBe('Newbie');
      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.getCurrentUser()).toEqual(user);
    });

    it('fails when email is missing in signUp', () => {
      expect(() => authService.signUp('')).toThrow('An email is required for cloud sync.');
    });
  });

  describe('signOut', () => {
    it('clears active user state and removes item from localStorage', () => {
      authService.signIn('player@stellar.org', 'Player');
      expect(authService.isAuthenticated()).toBe(true);
      expect(mockLocalStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull();

      const result = authService.signOut();

      expect(result).toBe(true);
      expect(authService.getCurrentUser()).toBeNull();
      expect(authService.isAuthenticated()).toBe(false);
      expect(mockLocalStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    });

    it('handles signOut safely when never signed in (edge case)', () => {
      expect(authService.getCurrentUser()).toBeNull();

      const result = authService.signOut();

      expect(result).toBe(true);
      expect(authService.getCurrentUser()).toBeNull();
      expect(authService.isAuthenticated()).toBe(false);
      expect(mockLocalStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    });
  });

  describe('initialize', () => {
    it('restores stored user from localStorage on initialization', () => {
      const persistedUser = {
        id: 'player-test-12345',
        email: 'saved@stellar.org',
        username: 'SavedPilot',
        provider: 'local',
        createdAt: 1000,
        lastSeen: 2000,
      };
      storage[AUTH_STORAGE_KEY] = JSON.stringify(persistedUser);

      const initializedUser = authService.initialize();

      expect(initializedUser).toEqual(persistedUser);
      expect(authService.getCurrentUser()).toEqual(persistedUser);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('handles corrupted JSON in localStorage gracefully without throwing', () => {
      storage[AUTH_STORAGE_KEY] = 'not-valid-json{{{';

      const initializedUser = authService.initialize();

      expect(initializedUser).toBeNull();
      expect(authService.getCurrentUser()).toBeNull();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getAuthService', () => {
    it('returns the authService singleton instance', () => {
      expect(getAuthService()).toBe(authService);
    });
  });
});
