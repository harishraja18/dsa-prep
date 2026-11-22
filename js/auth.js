// Access Control and Authentication System

const AUTH_KEYS = {
  MASTER_PASSKEY: "ascent_auth_master_passkey",
  SESSION: "ascent_auth_session",
  GUEST_TOKENS: "ascent_auth_guest_tokens",
  ACCESS_REQUESTS: "ascent_auth_access_requests"
};

// Default initial passkey
const DEFAULT_PASSKEY = "google2026";

export class AuthService {
  static getMasterPasskey() {
    return localStorage.getItem(AUTH_KEYS.MASTER_PASSKEY) || DEFAULT_PASSKEY;
  }

  static setMasterPasskey(newPasskey) {
    if (!newPasskey || newPasskey.trim().length < 4) return false;
    localStorage.setItem(AUTH_KEYS.MASTER_PASSKEY, newPasskey.trim());
    return true;
  }

  static getGuestTokens() {
    try {
      const data = localStorage.getItem(AUTH_KEYS.GUEST_TOKENS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static generateGuestToken(label = "Guest") {
    const tokens = AuthService.getGuestTokens();
    const token = "ACC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    tokens.push({
      token,
      label,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(AUTH_KEYS.GUEST_TOKENS, JSON.stringify(tokens));
    return token;
  }

  static revokeGuestToken(tokenToRevoke) {
    let tokens = AuthService.getGuestTokens();
    tokens = tokens.filter((t) => t.token !== tokenToRevoke);
    localStorage.setItem(AUTH_KEYS.GUEST_TOKENS, JSON.stringify(tokens));
  }

  static getAccessRequests() {
    try {
      const data = localStorage.getItem(AUTH_KEYS.ACCESS_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static submitAccessRequest(name, email, reason) {
    const requests = AuthService.getAccessRequests();
    const newReq = {
      id: "req_" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      reason: reason.trim(),
      timestamp: new Date().toLocaleString(),
      status: "pending"
    };
    requests.unshift(newReq);
    localStorage.setItem(AUTH_KEYS.ACCESS_REQUESTS, JSON.stringify(requests));
    return newReq;
  }

  static authenticate(key) {
    const trimmed = (key || "").trim();
    if (!trimmed) return { success: false, message: "Please enter an access key." };

    // Check master passkey
    if (trimmed === AuthService.getMasterPasskey()) {
      const session = {
        role: "owner",
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
      return { success: true, role: "owner" };
    }

    // Check guest tokens
    const guestTokens = AuthService.getGuestTokens();
    const match = guestTokens.find((t) => t.token === trimmed);
    if (match) {
      const session = {
        role: "guest",
        label: match.label,
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
      return { success: true, role: "guest" };
    }

    return {
      success: false,
      message: "Invalid passkey. Access denied without administrator permission."
    };
  }

  static isAuthenticated() {
    try {
      const sessionStr = localStorage.getItem(AUTH_KEYS.SESSION);
      if (!sessionStr) return false;
      const session = JSON.parse(sessionStr);
      return Boolean(session && session.role);
    } catch {
      return false;
    }
  }

  static getCurrentUser() {
    try {
      const sessionStr = localStorage.getItem(AUTH_KEYS.SESSION);
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch {
      return null;
    }
  }

  static logout() {
    localStorage.removeItem(AUTH_KEYS.SESSION);
  }
}
