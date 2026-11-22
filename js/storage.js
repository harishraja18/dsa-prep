// Storage and State Management with LocalStorage & Analytics

import { INITIAL_DSA_PROBLEMS } from "./data/dsaRoadmap.js";
import { INITIAL_AI_TOPICS } from "./data/aiRoadmap.js";

const KEYS = {
  DSA_PROBLEMS: "ascent_dsa_problems_v2",
  AI_TOPICS: "ascent_ai_topics_v2",
  SESSIONS: "ascent_study_sessions_v1",
  SETTINGS: "ascent_user_settings_v1"
};

const DEFAULT_SETTINGS = {
  userName: "Harishraja",
  dailyTargetHours: 4,
  careerGoalHours: 300,
  theme: "light"
};

export class StorageManager {
  // Load DSA Problems with intelligent merging of new additions
  static getDSAProblems() {
    try {
      const data = localStorage.getItem(KEYS.DSA_PROBLEMS);
      if (data) {
        const stored = JSON.parse(data);
        const storedMap = new Map(stored.map((p) => [p.id, p]));
        
        // Merge with initial list so new problems are automatically available
        const merged = INITIAL_DSA_PROBLEMS.map((initial) => {
          if (storedMap.has(initial.id)) {
            return { ...initial, ...storedMap.get(initial.id) };
          }
          return {
            ...initial,
            status: "todo",
            completedSteps: [],
            notes: "",
            solvedAt: null
          };
        });

        // Also append any custom user-added problems
        stored.forEach((p) => {
          if (p.id.startsWith("custom_") && !merged.some((m) => m.id === p.id)) {
            merged.push(p);
          }
        });

        StorageManager.saveDSAProblems(merged);
        return merged;
      }
    } catch (e) {
      console.error("Error reading DSA problems:", e);
    }

    const initial = INITIAL_DSA_PROBLEMS.map((prob) => ({
      ...prob,
      status: "todo",
      completedSteps: [],
      notes: "",
      solvedAt: null
    }));
    StorageManager.saveDSAProblems(initial);
    return initial;
  }

  static saveDSAProblems(problems) {
    try {
      localStorage.setItem(KEYS.DSA_PROBLEMS, JSON.stringify(problems));
    } catch (e) {
      console.error("Error saving DSA problems:", e);
    }
  }

  // Load AI Topics with merging
  static getAITopics() {
    try {
      const data = localStorage.getItem(KEYS.AI_TOPICS);
      if (data) {
        const stored = JSON.parse(data);
        const storedMap = new Map(stored.map((t) => [t.id, t]));

        const merged = INITIAL_AI_TOPICS.map((initial) => {
          if (storedMap.has(initial.id)) {
            return { ...initial, ...storedMap.get(initial.id) };
          }
          return {
            ...initial,
            status: "todo",
            completedSteps: [],
            notes: "",
            solvedAt: null
          };
        });

        StorageManager.saveAITopics(merged);
        return merged;
      }
    } catch (e) {
      console.error("Error reading AI topics:", e);
    }

    const initial = INITIAL_AI_TOPICS.map((topic) => ({
      ...topic,
      status: "todo",
      completedSteps: [],
      notes: "",
      solvedAt: null
    }));
    StorageManager.saveAITopics(initial);
    return initial;
  }

  static saveAITopics(topics) {
    try {
      localStorage.setItem(KEYS.AI_TOPICS, JSON.stringify(topics));
    } catch (e) {
      console.error("Error saving AI topics:", e);
    }
  }

  // Sessions & Hours
  static getSessions() {
    try {
      const data = localStorage.getItem(KEYS.SESSIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error("Error reading sessions:", e);
    }
    return [];
  }

  static addSession(session) {
    const sessions = StorageManager.getSessions();
    const newSession = {
      id: "sess_" + Date.now(),
      timestamp: Date.now(),
      durationMinutes: Math.max(1, Math.round(session.durationSeconds / 60)),
      category: session.category || "DSA",
      topic: session.topic || "Deep Work",
      notes: session.notes || ""
    };
    sessions.unshift(newSession);
    try {
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error("Error adding session:", e);
    }
    return sessions;
  }

  // Peer Study Activity & Messages
  static getPeerActivities() {
    try {
      const data = localStorage.getItem("ascent_peer_activities_v1");
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "act_1",
        userName: "Harishraja (Owner)",
        action: "Logged 45 min in College Commute mode (Google Mock Interview)",
        tag: "Commute Study",
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      },
      {
        id: "act_2",
        userName: "Harishraja (Owner)",
        action: "Solved Two Sum in Daily DSA Code Editor",
        tag: "DSA Practice",
        timestamp: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  }

  static logPeerActivity(action, tag = "Study Update") {
    const activities = StorageManager.getPeerActivities();
    const userStr = localStorage.getItem("ascent_auth_session");
    let userName = "Harishraja";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        userName = u.role === "owner" ? "Harishraja (Owner)" : `Guest (${u.label || "Authorized"})`;
      } catch {}
    }
    const newAct = {
      id: "act_" + Date.now(),
      userName,
      action,
      tag,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    activities.unshift(newAct);
    if (activities.length > 50) activities.pop();
    try {
      localStorage.setItem("ascent_peer_activities_v1", JSON.stringify(activities));
    } catch (e) {
      console.error(e);
    }
    return activities;
  }

  static getPeerChatMessages() {
    try {
      const data = localStorage.getItem("ascent_peer_chat_v1");
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "msg_1",
        userName: "Harishraja",
        role: "owner",
        tag: "Study Focus",
        message: "Welcome to the workspace! Today's focus is Google core algorithmic patterns and AI engineering foundations.",
        timestamp: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  }

  static postPeerChatMessage(message, tag = "Study Update") {
    const msgs = StorageManager.getPeerChatMessages();
    const userStr = localStorage.getItem("ascent_auth_session");
    let userName = "Harishraja";
    let role = "owner";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        userName = u.label || "Peer";
        role = u.role || "guest";
      } catch {}
    }
    const newMsg = {
      id: "msg_" + Date.now(),
      userName,
      role,
      tag,
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    msgs.unshift(newMsg);
    if (msgs.length > 50) msgs.pop();
    try {
      localStorage.setItem("ascent_peer_chat_v1", JSON.stringify(msgs));
    } catch (e) {
      console.error(e);
    }
    return msgs;
  }

  // Settings
  static getSettings() {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error("Error reading settings:", e);
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  }

  // Analytics Calculation
  static calculateAnalytics() {
    const sessions = StorageManager.getSessions();
    const dsa = StorageManager.getDSAProblems();
    const ai = StorageManager.getAITopics();
    const settings = StorageManager.getSettings();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - (now.getDay() * 24 * 60 * 60 * 1000);

    let totalMinutes = 0;
    let todayMinutes = 0;
    let weekMinutes = 0;

    const daysWithStudy = new Set();

    sessions.forEach((s) => {
      totalMinutes += s.durationMinutes || 0;
      if (s.timestamp >= startOfToday) {
        todayMinutes += s.durationMinutes || 0;
      }
      if (s.timestamp >= startOfWeek) {
        weekMinutes += s.durationMinutes || 0;
      }
      const dayKey = new Date(s.timestamp).toDateString();
      daysWithStudy.add(dayKey);
    });

    let streak = 0;
    let checkDate = new Date();
    if (!daysWithStudy.has(checkDate.toDateString())) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (daysWithStudy.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const dsaTotal = dsa.length;
    const dsaMastered = dsa.filter((p) => p.status === "mastered").length;
    const dsaInProgress = dsa.filter((p) => p.status === "in_progress").length;
    const dsaRevision = dsa.filter((p) => p.status === "needs_revision").length;

    const aiTotal = ai.length;
    const aiMastered = ai.filter((t) => t.status === "mastered").length;
    const aiInProgress = ai.filter((t) => t.status === "in_progress").length;

    const dsaScore = dsaTotal > 0 ? (dsaMastered / dsaTotal) * 40 : 0;
    const aiScore = aiTotal > 0 ? (aiMastered / aiTotal) * 25 : 0;
    const hoursScore = Math.min(25, ((totalMinutes / 60) / settings.careerGoalHours) * 25);
    const streakScore = Math.min(10, streak * 2);
    const readinessScore = Math.round(dsaScore + aiScore + hoursScore + streakScore);

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      todayHours: (todayMinutes / 60).toFixed(1),
      weekHours: (weekMinutes / 60).toFixed(1),
      todayMinutes,
      totalMinutes,
      streak,
      readinessScore: Math.min(100, Math.max(0, readinessScore)),
      dsa: {
        total: dsaTotal,
        mastered: dsaMastered,
        inProgress: dsaInProgress,
        needsRevision: dsaRevision,
        percent: dsaTotal > 0 ? Math.round((dsaMastered / dsaTotal) * 100) : 0
      },
      ai: {
        total: aiTotal,
        mastered: aiMastered,
        inProgress: aiInProgress,
        percent: aiTotal > 0 ? Math.round((aiMastered / aiTotal) * 100) : 0
      },
      settings
    };
  }

  static exportBackup() {
    return JSON.stringify({
      version: 2,
      exportedAt: new Date().toISOString(),
      dsa: StorageManager.getDSAProblems(),
      ai: StorageManager.getAITopics(),
      sessions: StorageManager.getSessions(),
      settings: StorageManager.getSettings()
    }, null, 2);
  }

  static importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.dsa) StorageManager.saveDSAProblems(data.dsa);
      if (data.ai) StorageManager.saveAITopics(data.ai);
      if (data.sessions) localStorage.setItem(KEYS.SESSIONS, JSON.stringify(data.sessions));
      if (data.settings) StorageManager.saveSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  }
}
