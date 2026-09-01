const AUTH_STORAGE_KEY = "soroban_quest_auth_user";

export interface User {
  id: string;
  email: string;
  username: string;
  provider: string;
  createdAt: number;
  lastSeen: number;
}

function generateUserId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

class AuthService {
  user: User | null;

  constructor() {
    this.user = readStoredUser();
  }

  initialize(): User | null {
    this.user = readStoredUser();
    return this.getCurrentUser();
  }

  getCurrentUser(): User | null {
    if (!this.user) {
      this.user = readStoredUser();
    }

    return this.user;
  }

  isAuthenticated(): boolean {
    return Boolean(this.getCurrentUser());
  }

  signIn(email: string, username?: string): User {
    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error("An email is required for cloud sync.");
    }

    const user: User = {
      id: this.user?.id || generateUserId(),
      email: normalizedEmail,
      username: (
        username ||
        normalizedEmail.split("@")[0]
      ).trim(),
      provider: "local",
      createdAt: this.user?.createdAt || Date.now(),
      lastSeen: Date.now(),
    };

    this.user = user;
    writeStoredUser(user);
    return user;
  }

  signUp(email: string, username?: string): User {
    return this.signIn(email, username);
  }

  signOut(): boolean {
    this.user = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return true;
  }
}

export const authService = new AuthService();

export function getAuthService(): AuthService {
  return authService;
}
