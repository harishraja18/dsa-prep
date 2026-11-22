// Storage and State Management with LocalStorage & Analytics

import { INITIAL_DSA_PROBLEMS } from "./data/dsaRoadmap.js";
import { INITIAL_AI_TOPICS } from "./data/aiRoadmap.js";

const KEYS = {
  DSA_PROBLEMS: "ascent_dsa_problems_v1",
  AI_TOPICS: "ascent_ai_topics_v1",
  SESSIONS: "ascent_study_sessions_v1",
  SETTINGS: "ascent_user_settings_v1"
};

const DEFAULT_SETTINGS = {
  userName: "Future Google SWE / AI Engineer",
  dailyTargetHours: 4,
  careerGoalHours: 300,
  theme: "dark"
};

export class StorageManager {
  // Load DSA Problems
  static getDSAProblems() {
    try {
      const data = localStorage.getItem(KEYS.DSA_PROBLEMS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error("Error reading DSA problems:", e);
    }
    // Initialize with default problems & empty user state
    const initial = INITIAL_DSA_PROBLEMS.map((prob) => ({
      ...prob,
      status: "todo", // 'todo' | 'in_progress' | 'mastered' | 'needs_revision'
      completedSteps: [],
      notes: "",
      solvedAt: null,
      revisitDate: null
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

  // Load AI Topics
  static getAITopics() {
    try {
      const data = localStorage.getItem(KEYS.AI_TOPICS);
      if (data) return JSON.parse(data);
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

  // Calculations & Analytics
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

    // Calculate streak
    let streak = 0;
    let checkDate = new Date();
    // Check if today was studied
    if (!daysWithStudy.has(checkDate.toDateString())) {
      // Check if yesterday was studied
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (daysWithStudy.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // DSA stats
    const dsaTotal = dsa.length;
    const dsaMastered = dsa.filter((p) => p.status === "mastered").length;
    const dsaInProgress = dsa.filter((p) => p.status === "in_progress").length;
    const dsaRevision = dsa.filter((p) => p.status === "needs_revision").length;

    // AI stats
    const aiTotal = ai.length;
    const aiMastered = ai.filter((t) => t.status === "mastered").length;
    const aiInProgress = ai.filter((t) => t.status === "in_progress").length;

    // Google Readiness Score (0-100%)
    // Weighted: 40% DSA Mastered, 25% AI Mastered, 25% Hours Logged toward goal, 10% Consistency streak
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

  // Backup & Restore
  static exportBackup() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      dsa: StorageManager.getDSAProblems(),
      ai: StorageManager.getAITopics(),
      sessions: StorageManager.getSessions(),
      settings: StorageManager.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.dsa) StorageManager.saveDSAProblems(data.dsa);
      if (data.ai) StorageManager.saveAITopics(data.ai);
      if (data.sessions) localStorage.setItem(KEYS.SESSIONS, JSON.stringify(data.sessions));
      if (data.settings) StorageManager.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error("Backup import error:", e);
      return false;
    }
  }
}
