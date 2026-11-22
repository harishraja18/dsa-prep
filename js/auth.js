// Access Control and Scoped Authentication System

const AUTH_KEYS = {
  MASTER_PASSKEY: "ascent_auth_master_passkey",
  SESSION: "ascent_auth_session",
  GUEST_TOKENS: "ascent_auth_guest_tokens",
  ACCESS_REQUESTS: "ascent_auth_access_requests",
  REVOKED_TOKENS: "ascent_auth_revoked_tokens",
  GUEST_PASSWORDS: "ascent_auth_guest_passwords"
};

// Default initial passkey for owner
const DEFAULT_PASSKEY = "google2026";
const OWNER_EMAIL = "harishraja1802@gmail.com";

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
      scope = "full";
      label = "Authorized Guest";
    }

    return {
      token: clean,
      scope,
      label
    };
  }

  // Revocation Blacklist Engine
  static getRevokedTokens() {
    try {
      const data = localStorage.getItem(AUTH_KEYS.REVOKED_TOKENS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static isTokenRevoked(key) {
    if (!key) return false;
    const clean = key.trim().toUpperCase();
    const revoked = AuthService.getRevokedTokens();
    if (revoked.includes(clean)) return true;

    // Check if key is a custom password linked to a revoked token
    const guestPasses = AuthService.getGuestPasswords();
    const matchPass = guestPasses.find((p) => p.customPassword === key.trim());
    if (matchPass && revoked.includes(matchPass.token.toUpperCase())) {
      return true;
    }
    return false;
  }

  static revokeGuestToken(tokenToRevoke) {
    if (!tokenToRevoke) return;
    const clean = tokenToRevoke.trim().toUpperCase();

    // 1. Add to permanent revoked blacklist
    const revoked = AuthService.getRevokedTokens();
    if (!revoked.includes(clean)) {
      revoked.push(clean);
      localStorage.setItem(AUTH_KEYS.REVOKED_TOKENS, JSON.stringify(revoked));
    }

    // 2. Remove from active local tokens
    let tokens = AuthService.getGuestTokens();
    tokens = tokens.filter((t) => t.token.toUpperCase() !== clean);
    localStorage.setItem(AUTH_KEYS.GUEST_TOKENS, JSON.stringify(tokens));

    // 3. Remove any custom personal passwords tied to this token
    let guestPasses = AuthService.getGuestPasswords();
    guestPasses = guestPasses.filter((p) => p.token.toUpperCase() !== clean);
    localStorage.setItem(AUTH_KEYS.GUEST_PASSWORDS, JSON.stringify(guestPasses));

    // 4. Update status in access requests
    const requests = AuthService.getAccessRequests();
    requests.forEach((r) => {
      if (r.approvedToken && r.approvedToken.toUpperCase() === clean) {
        r.status = "revoked";
      }
    });
    localStorage.setItem(AUTH_KEYS.ACCESS_REQUESTS, JSON.stringify(requests));

    // 5. Broadcast revocation to cloud sync so other devices blacklist it immediately
    try {
      fetch("https://ntfy.sh/harish_dsa_prep_access_2026", {
        method: "POST",
        headers: { "Priority": "min" },
        body: JSON.stringify({ type: "REVOKE", token: clean })
      }).catch(() => {});
    } catch {}
  }

  // Personal Custom Passwords for Guests
  static getGuestPasswords() {
    try {
      const data = localStorage.getItem(AUTH_KEYS.GUEST_PASSWORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static setGuestPassword(customPassword) {
    const session = AuthService.getCurrentUser();
    if (!session || session.role !== "guest") {
      return { success: false, message: "Only authenticated guests can set personal passwords." };
    }

    const cleanPass = (customPassword || "").trim();
    if (cleanPass.length < 4) {
      return { success: false, message: "Password must be at least 4 characters long." };
    }

    if (
      cleanPass.toLowerCase() === DEFAULT_PASSKEY.toLowerCase() ||
      cleanPass.toLowerCase() === "google2026"
    ) {
      return { success: false, message: "This passkey is reserved exclusively for the administrator." };
    }

    const token = session.token || "GUEST_ACC";
    const guestPasses = AuthService.getGuestPasswords();
    const updated = guestPasses.filter((p) => p.token.toUpperCase() !== token.toUpperCase());
    const newEntry = {
      token,
      customPassword: cleanPass,
      scope: session.scope || "full",
      label: session.label || "Authorized Guest",
      createdAt: new Date().toISOString()
    };
    updated.push(newEntry);
    localStorage.setItem(AUTH_KEYS.GUEST_PASSWORDS, JSON.stringify(updated));

    // Update session
    session.customPassword = cleanPass;
    localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));

    // Sync custom password to cloud
    try {
      fetch("https://ntfy.sh/harish_dsa_prep_access_2026", {
        method: "POST",
        headers: { "Priority": "min" },
        body: JSON.stringify({ type: "GUEST_PASSWORD", ...newEntry })
      }).catch(() => {});
    } catch {}

    return { success: true, message: "Personal password set successfully! You can now sign in using this password." };
  }

  // Access Requests & Cloud Synchronization
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
      const revoked = AuthService.getRevokedTokens();
      const guestPasses = AuthService.getGuestPasswords();
      let hasReqUpdate = false;
      let hasRevokeUpdate = false;
      let hasPassUpdate = false;

      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          if (item.event === "message" && item.message) {
            const data = JSON.parse(item.message);

            // Handle Revocations broadcasted across devices
            if (data.type === "REVOKE" && data.token) {
              const cleanTok = data.token.toUpperCase();
              if (!revoked.includes(cleanTok)) {
                revoked.push(cleanTok);
                hasRevokeUpdate = true;
              }
            } else if (data.type === "GUEST_PASSWORD" && data.customPassword && data.token) {
              // Handle Guest Passwords broadcasted across devices
              if (!guestPasses.some((p) => p.token === data.token && p.customPassword === data.customPassword)) {
                guestPasses.push(data);
                hasPassUpdate = true;
              }
            } else if (data.id && data.name && !requests.some((r) => r.id === data.id)) {
              // Handle Candidate Registrations
              requests.unshift(data);
              hasReqUpdate = true;
            }
          }
        } catch {}
      }

      if (hasRevokeUpdate) {
        localStorage.setItem(AUTH_KEYS.REVOKED_TOKENS, JSON.stringify(revoked));
      }
      if (hasPassUpdate) {
        localStorage.setItem(AUTH_KEYS.GUEST_PASSWORDS, JSON.stringify(guestPasses));
      }
      if (hasReqUpdate) {
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

    // 0. Check Revocation Blacklist: If token/password is revoked, immediately deny entry!
    if (AuthService.isTokenRevoked(trimmed)) {
      return {
        success: false,
        message: "Access Denied: This access passkey or token has been revoked by the administrator (Harish Raja)."
      };
    }

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
        email: OWNER_EMAIL,
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
      return { success: true, role: "owner", scope: "full", email: OWNER_EMAIL };
    }

    // 2. Check personal guest custom passwords
    const guestPasses = AuthService.getGuestPasswords();
    const passMatch = guestPasses.find((p) => p.customPassword === trimmed);
    if (passMatch) {
      if (AuthService.isTokenRevoked(passMatch.token)) {
        return {
          success: false,
          message: "Access Denied: This access passkey or token has been revoked by the administrator (Harish Raja)."
        };
      }
      const session = {
        role: "guest",
        scope: passMatch.scope || "full",
        label: passMatch.label || "Authorized Guest",
        token: passMatch.token,
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
      return { success: true, role: "guest", scope: session.scope };
    }

    // 3. Check local recorded guest tokens on this browser
    const guestTokens = AuthService.getGuestTokens();
    const localMatch = guestTokens.find((t) => t.token.toUpperCase() === trimmed.toUpperCase());
    if (localMatch) {
      const session = {
        role: "guest",
        scope: localMatch.scope || "full",
        label: localMatch.label,
        token: localMatch.token,
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
      return { success: true, role: "guest", scope: session.scope };
    }

    // 4. Cross-device stateless token verification
    const parsed = AuthService.parseStatelessToken(trimmed);
    if (parsed) {
      if (AuthService.isTokenRevoked(parsed.token)) {
        return {
          success: false,
          message: "Access Denied: This access passkey or token has been revoked by the administrator (Harish Raja)."
        };
      }
      const session = {
        role: "guest",
        scope: parsed.scope,
        label: parsed.label,
        token: parsed.token,
        authenticatedAt: Date.now()
      };
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));

      // Cache token locally
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

      // Check if session token was revoked in the background
      if (session.role === "guest" && session.token && AuthService.isTokenRevoked(session.token)) {
        AuthService.logout();
        return false;
      }

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
