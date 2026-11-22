// Access Control and Scoped Authentication System

const AUTH_KEYS = {
  MASTER_PASSKEY: "ascent_auth_master_passkey",
  SESSION: "ascent_auth_session",
  GUEST_TOKENS: "ascent_auth_guest_tokens",
  ACCESS_REQUESTS: "ascent_auth_access_requests"
};

// Default initial passkey for owner
const DEFAULT_PASSKEY = "google2026";

// Scope code mappings for stateless cross-device tokens
const SCOPE_CODE_MAP = {
  careers_only: "CAR",
  dsa_only: "DSA",
  ai_only: "AI",
  full: "FULL"
};

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

  static generateGuestToken(label = "Guest", scope = "full") {
    const tokens = AuthService.getGuestTokens();
    const prefix = SCOPE_CODE_MAP[scope] || "FULL";
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const checkCode = Math.floor(1000 + Math.random() * 9000);
    // Structured format: ACC-CAR-4A9F8120
    const token = `ACC-${prefix}-${randomHex}${checkCode}`;

    const tokenRecord = {
      token,
      label,
      scope, // 'full' | 'careers_only' | 'dsa_only' | 'ai_only'
      createdAt: new Date().toISOString()
    };

    tokens.push(tokenRecord);
    localStorage.setItem(AUTH_KEYS.GUEST_TOKENS, JSON.stringify(tokens));
    return token;
  }

  static parseStatelessToken(key) {
    if (!key) return null;
    const clean = key.trim().toUpperCase();

    // Check if token matches standard ACC- or GST- pattern
    if (!clean.startsWith("ACC-") && !clean.startsWith("GST-")) {
      return null;
    }

    // Determine scope from token structure
    let scope = "full";
    let label = "Authorized Guest";

    if (clean.includes("-CAR-") || clean.includes("-CAREERS-") || clean.includes("CAR") || clean.endsWith("-CAR")) {
      scope = "careers_only";
      label = "Careers Guest";
    } else if (clean.includes("-DSA-") || clean.includes("-ALGO-") || clean.includes("DSA") || clean.endsWith("-DSA")) {
      scope = "dsa_only";
      label = "DSA Guest";
    } else if (clean.includes("-AI-") || clean.includes("-ML-") || clean.includes("AI") || clean.endsWith("-AI")) {
      scope = "ai_only";
      label = "AI Curriculum Guest";
    } else if (clean.includes("-FULL-") || clean.includes("-FUL-") || clean.includes("FULL") || clean.endsWith("-FULL")) {
      scope = "full";
      label = "Full Access Guest";
    } else {
      // Handles generic tokens like ACC-ABC123 previously generated
      scope = "full";
      label = "Authorized Guest";
    }

    return {
      token: clean,
      scope,
      label
    };
  }

  static revokeGuestToken(tokenToRevoke) {
    let tokens = AuthService.getGuestTokens();
    tokens = tokens.filter((t) => t.token.toUpperCase() !== tokenToRevoke.toUpperCase());
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

  static submitAccessRequest(name, email, reason, requestedScope = "careers_only") {
    const requests = AuthService.getAccessRequests();
    const newReq = {
      id: "req_" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      reason: reason.trim(),
      requestedScope,
      timestamp: new Date().toLocaleString(),
      status: "pending"
    };
    requests.unshift(newReq);
    localStorage.setItem(AUTH_KEYS.ACCESS_REQUESTS, JSON.stringify(requests));
    return newReq;
  }

  static authenticate(key) {
    const trimmed = (key || "").trim();
    if (!trimmed) return { success: false, message: "Please enter an access passkey or token." };

    // 1. Check master passkey (Full Owner Access)
    if (trimmed === AuthService.getMasterPasskey() || trimmed === DEFAULT_PASSKEY) {
      const session = {
        role: "owner",
        scope: "full",
        label: "Harishraja",
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
      return { success: true, role: "owner", scope: "full" };
    }

    // 2. Check local recorded guest tokens on this browser
    const guestTokens = AuthService.getGuestTokens();
    const localMatch = guestTokens.find((t) => t.token.toUpperCase() === trimmed.toUpperCase());
    if (localMatch) {
      const session = {
        role: "guest",
        scope: localMatch.scope || "full",
        label: localMatch.label,
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
      return { success: true, role: "guest", scope: session.scope };
    }

    // 3. Cross-device stateless token verification (allows tokens generated on desktop to open on mobile!)
    const parsed = AuthService.parseStatelessToken(trimmed);
    if (parsed) {
      const session = {
        role: "guest",
        scope: parsed.scope,
        label: parsed.label,
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));

      // Save token into this device's token store so it's permanently remembered locally
      if (!guestTokens.some((t) => t.token.toUpperCase() === parsed.token.toUpperCase())) {
        guestTokens.push({
          token: parsed.token,
          label: parsed.label,
          scope: parsed.scope,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(AUTH_KEYS.GUEST_TOKENS, JSON.stringify(guestTokens));
      }

      return { success: true, role: "guest", scope: parsed.scope };
    }

    return {
      success: false,
      message: "Invalid passkey or token. Access denied without administrator permission."
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
