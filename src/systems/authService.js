const AUTH_STORAGE_KEY = "soroban_quest_auth_user";

function generateUserId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

class AuthService {
  constructor() {
    this.user = readStoredUser();
  }

  initialize() {
    this.user = readStoredUser();
    return this.getCurrentUser();
  }

  getCurrentUser() {
    if (!this.user) {
      this.user = readStoredUser();
    }

    return this.user;
  }

  isAuthenticated() {
    return Boolean(this.getCurrentUser());
  }

  signIn(email, username) {
    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error("An email is required for cloud sync.");
    }

    const user = {
      id: this.user?.id || generateUserId(),
      email: normalizedEmail,
      username: (username || normalizedEmail.split("@")[0]).trim(),
      provider: "local",
      createdAt: this.user?.createdAt || Date.now(),
      lastSeen: Date.now(),
    };

    this.user = user;
    writeStoredUser(user);
    return user;
  }

  signUp(email, username) {
    return this.signIn(email, username);
  }

  signOut() {
    this.user = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return true;
  }
}

export const authService = new AuthService();

export function getAuthService() {
  return authService;
}
