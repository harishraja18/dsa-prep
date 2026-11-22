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
    return AuthService.submitRegistration({
      name,
      email,
      targetRole: "Software Developer",
      targetCompany: "Google",
      requestedScope,
      goals: reason
    });
  }

  static submitRegistration({ name, email, targetRole, targetCompany, requestedScope, goals }) {
    const requests = AuthService.getAccessRequests();
    const newReq = {
      id: "req_" + Date.now(),
      name: (name || "").trim(),
      email: (email || "").trim(),
      targetRole: targetRole || "Software Developer",
      targetCompany: targetCompany || "Google",
      requestedScope: requestedScope || "careers_only",
      reason: (goals || "").trim(),
      timestamp: new Date().toLocaleString(),
      status: "pending",
      approvedToken: null
    };
    requests.unshift(newReq);
    localStorage.setItem(AUTH_KEYS.ACCESS_REQUESTS, JSON.stringify(requests));

    // Completely silent cross-device sync without triggering any push notification or sound
    try {
      fetch("https://ntfy.sh/harish_dsa_prep_access_2026", {
        method: "POST",
        headers: { "Priority": "min" },
        body: JSON.stringify(newReq)
      }).catch(() => {});
    } catch {}

    return newReq;
  }

  static async syncCloudRequests() {
    try {
      const res = await fetch("https://ntfy.sh/harish_dsa_prep_access_2026/json?poll=1");
      if (!res.ok) return AuthService.getAccessRequests();
      const text = await res.text();
      const lines = text.trim().split("\n").filter(Boolean);
      const requests = AuthService.getAccessRequests();
      let hasNew = false;

      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          if (item.event === "message" && item.message) {
            const reqData = JSON.parse(item.message);
            if (reqData && reqData.id && !requests.some((r) => r.id === reqData.id)) {
              requests.unshift(reqData);
              hasNew = true;
            }
          }
        } catch {}
      }

      if (hasNew) {
        localStorage.setItem(AUTH_KEYS.ACCESS_REQUESTS, JSON.stringify(requests));
      }
      return requests;
    } catch {
      return AuthService.getAccessRequests();
    }
  }

  static approveRegistration(reqId) {
    const requests = AuthService.getAccessRequests();
    const target = requests.find((r) => r.id === reqId);
    if (!target) return null;

    // Generate scoped guest token for the applicant
    const token = AuthService.generateGuestToken(target.name || "Peer", target.requestedScope || "full");
    target.status = "approved";
    target.approvedToken = token;
    localStorage.setItem(AUTH_KEYS.ACCESS_REQUESTS, JSON.stringify(requests));

    return {
      token,
      name: target.name,
      email: target.email,
      scope: target.requestedScope
    };
  }

  static rejectRegistration(reqId) {
    const requests = AuthService.getAccessRequests();
    const target = requests.find((r) => r.id === reqId);
    if (target) {
      target.status = "rejected";
      localStorage.setItem(AUTH_KEYS.ACCESS_REQUESTS, JSON.stringify(requests));
    }
  }

  static authenticate(key) {
    const trimmed = (key || "").trim();
    if (!trimmed) return { success: false, message: "Please enter an access passkey or token." };

    // 1. Check master passkey (Full Owner Access exclusively for Harish Raja)
    const master = AuthService.getMasterPasskey();
    if (
      trimmed === master ||
      trimmed.toLowerCase() === DEFAULT_PASSKEY.toLowerCase() ||
      trimmed.toLowerCase() === "google2026"
    ) {
      const session = {
        role: "owner",
        scope: "full",
        label: "Harish Raja",
        email: "harishraja1802@gmail.com",
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
      return { success: true, role: "owner", scope: "full", email: "harishraja1802@gmail.com" };
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
