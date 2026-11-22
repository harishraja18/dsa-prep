// Main Application Controller for ASCENT

import { DSA_TOPICS, DEFAULT_PROBLEM_STEPS } from "./data/dsaRoadmap.js";
import { AI_MODULES, DEFAULT_AI_STEPS } from "./data/aiRoadmap.js";
import { StorageManager } from "./storage.js";
import { StudyTimer } from "./timer.js";
import { NewsService } from "./newsService.js";

class AscentApp {
  constructor() {
    this.newsService = new NewsService();
    this.currentDsaProblem = null;
    this.currentAiTopic = null;

    // Initialize Study Timer
    this.timer = new StudyTimer(
      (tickData) => this.handleTimerTick(tickData),
      (completeData) => this.handleTimerComplete(completeData)
    );

    this.initTheme();
    this.initNavigation();
    this.initDashboard();
    this.initDsaTracker();
    this.initAiRoadmap();
    this.initTimerControls();
    this.initDailyNews();
    this.initSettingsAndBackup();
  }

  // --- THEME ---
  initTheme() {
    const savedTheme = localStorage.getItem("ascent_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const icon = document.getElementById("themeIcon");
    if (icon) icon.textContent = savedTheme === "dark" ? "☀️" : "🌙";

    document.getElementById("themeToggleBtn")?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("ascent_theme", next);
      if (icon) icon.textContent = next === "dark" ? "☀️" : "🌙";
    });
  }

  // --- NAVIGATION ---
  initNavigation() {
    const navButtons = document.querySelectorAll(".nav-tab-btn");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

    document.getElementById("headerQuickTimer")?.addEventListener("click", () => {
      this.switchTab("timer");
    });
    document.getElementById("dashViewAiBtn")?.addEventListener("click", () => {
      this.switchTab("ai");
    });
    document.getElementById("dashStartPomodoroBtn")?.addEventListener("click", () => {
      this.switchTab("timer");
      this.setTimerMode("pomodoro");
      this.timer.start("DSA Deliberate Practice", "DSA");
    });
    document.getElementById("dashStartInterviewBtn")?.addEventListener("click", () => {
      this.switchTab("timer");
      this.setTimerMode("interview");
      this.timer.start("45-Min Google Mock Interview", "Mock");
    });
  }

  switchTab(tabId) {
    document.querySelectorAll(".nav-tab-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.toggle("active", pane.id === `tab-${tabId}`);
    });
    if (tabId === "dashboard") this.updateDashboard();
    if (tabId === "dsa") this.renderDsaProblems();
    if (tabId === "ai") this.renderAiTopics();
    if (tabId === "timer") this.renderSessionHistory();
    if (tabId === "news") this.loadNews();
  }

  // --- DASHBOARD ---
  initDashboard() {
    this.updateDashboard();
  }

  updateDashboard() {
    const analytics = StorageManager.calculateAnalytics();

    // Readiness score
    const readinessElem = document.getElementById("dashReadinessScore");
    const readinessBar = document.getElementById("dashReadinessBar");
    if (readinessElem && readinessBar) {
      readinessElem.textContent = `${analytics.readinessScore}%`;
      readinessBar.style.width = `${analytics.readinessScore}%`;
    }

    // Level label
    const levelElem = document.getElementById("dashReadinessLevel");
    if (levelElem) {
      let level = "Beginner • L3 SWE Foundation";
      if (analytics.readinessScore >= 80) level = "Google Interview Ready • L4/L5 SWE & Senior AI";
      else if (analytics.readinessScore >= 50) level = "Strong Competency • L4 SWE / AI Specialist";
      else if (analytics.readinessScore >= 25) level = "Intermediate Progression • L3+ SWE";
      levelElem.textContent = level;
    }

    // Hours
    const totalHoursElem = document.getElementById("dashTotalHours");
    const todayHoursElem = document.getElementById("dashTodayHours");
    const todayBar = document.getElementById("dashTodayBar");
    if (totalHoursElem) totalHoursElem.textContent = `${analytics.totalHours}h`;
    if (todayHoursElem) todayHoursElem.textContent = `${analytics.todayHours}h`;
    if (todayBar) {
      const todayPct = Math.min(100, Math.round(((analytics.todayMinutes / 60) / analytics.settings.dailyTargetHours) * 100));
      todayBar.style.width = `${todayPct}%`;
    }

    // DSA problems
    const dsaMasteredElem = document.getElementById("dashDsaMastered");
    const dsaPercentElem = document.getElementById("dashDsaPercent");
    const dsaBar = document.getElementById("dashDsaBar");
    if (dsaMasteredElem) dsaMasteredElem.textContent = `${analytics.dsa.mastered} / ${analytics.dsa.total}`;
    if (dsaPercentElem) dsaPercentElem.textContent = `${analytics.dsa.percent}%`;
    if (dsaBar) dsaBar.style.width = `${analytics.dsa.percent}%`;

    // Streak
    const streakElem = document.getElementById("dashStreak");
    if (streakElem) streakElem.textContent = `${analytics.streak} Day${analytics.streak === 1 ? "" : "s"}`;

    // AI progress badge
    const aiBadge = document.getElementById("dashAiProgressBadge");
    if (aiBadge) aiBadge.textContent = `${analytics.ai.mastered} / ${analytics.ai.total} Topics`;
  }

  // --- DSA TRACKER ---
  initDsaTracker() {
    // Populate topic filter dropdown
    const topicFilter = document.getElementById("dsaTopicFilter");
    const customTopic = document.getElementById("customTopic");
    DSA_TOPICS.forEach((t) => {
      const opt1 = document.createElement("option");
      opt1.value = t;
      opt1.textContent = t;
      topicFilter?.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = t;
      opt2.textContent = t;
      customTopic?.appendChild(opt2);
    });

    // Event listeners for filters
    document.getElementById("dsaSearchInput")?.addEventListener("input", () => this.renderDsaProblems());
    document.getElementById("dsaTopicFilter")?.addEventListener("change", () => this.renderDsaProblems());
    document.getElementById("dsaDifficultyFilter")?.addEventListener("change", () => this.renderDsaProblems());
    document.getElementById("dsaStatusFilter")?.addEventListener("change", () => this.renderDsaProblems());

    // Modal close & save
    document.getElementById("closeProblemModalBtn")?.addEventListener("click", () => this.closeProblemModal());
    document.getElementById("modalSaveProblemBtn")?.addEventListener("click", () => this.saveCurrentProblem());

    // Modal start timer
    document.getElementById("modalStartTimerBtn")?.addEventListener("click", () => {
      if (!this.currentDsaProblem) return;
      this.closeProblemModal();
      this.switchTab("timer");
      this.setTimerMode("interview");
      this.timer.start(`Solving: ${this.currentDsaProblem.title}`, "DSA");
    });

    // Add custom problem button & form
    document.getElementById("addNewProblemBtn")?.addEventListener("click", () => {
      document.getElementById("addCustomModal")?.classList.add("open");
    });
    document.getElementById("closeAddCustomModalBtn")?.addEventListener("click", () => {
      document.getElementById("addCustomModal")?.classList.remove("open");
    });
    document.getElementById("cancelAddCustomBtn")?.addEventListener("click", () => {
      document.getElementById("addCustomModal")?.classList.remove("open");
    });
    document.getElementById("addCustomProblemForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAddCustomProblem();
    });

    this.renderDsaProblems();
  }

  renderDsaProblems() {
    const container = document.getElementById("dsaProblemsContainer");
    if (!container) return;

    const problems = StorageManager.getDSAProblems();
    const searchQuery = (document.getElementById("dsaSearchInput")?.value || "").toLowerCase().trim();
    const topic = document.getElementById("dsaTopicFilter")?.value || "all";
    const difficulty = document.getElementById("dsaDifficultyFilter")?.value || "all";
    const status = document.getElementById("dsaStatusFilter")?.value || "all";

    const filtered = problems.filter((p) => {
      if (topic !== "all" && p.topic !== topic) return false;
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (status !== "all" && p.status !== status) return false;
      if (searchQuery) {
        const matchTitle = p.title.toLowerCase().includes(searchQuery);
        const matchPattern = (p.pattern || "").toLowerCase().includes(searchQuery);
        const matchTopic = p.topic.toLowerCase().includes(searchQuery);
        if (!matchTitle && !matchPattern && !matchTopic) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 2.5rem; text-align: center; color: var(--text-secondary);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No matching problems found.</p>
          <small>Try clearing filters or add your own custom problem!</small>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((prob) => {
      const diffClass = prob.difficulty === "Easy" ? "badge-easy" : prob.difficulty === "Medium" ? "badge-medium" : "badge-hard";
      const statusIcon = prob.status === "mastered" ? "✓" : prob.status === "in_progress" ? "◐" : prob.status === "needs_revision" ? "↺" : "";
      const stepCount = (prob.completedSteps || []).length;

      return `
        <div class="problem-row" data-id="${prob.id}">
          <div class="problem-main-info">
            <div class="problem-status-indicator ${prob.status}">${statusIcon}</div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span class="problem-title-text">${prob.title}</span>
                <span class="badge ${diffClass}">${prob.difficulty}</span>
                ${prob.googleFreq ? `<span class="badge badge-google">${prob.googleFreq}</span>` : ""}
              </div>
              <div class="problem-meta">
                <span>📁 ${prob.topic}</span>
                ${prob.pattern ? `<span>• 💡 ${prob.pattern}</span>` : ""}
                <span>• ⏱ ${prob.timeComp || "O(N)"}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="problem-steps-mini" title="${stepCount}/8 Framework steps completed">
              ${Array.from({ length: 8 }).map((_, i) => `<span class="step-dot ${i < stepCount ? "done" : ""}"></span>`).join("")}
              <span style="font-size: 0.72rem; color: var(--text-secondary); margin-left: 4px;">${stepCount}/8</span>
            </div>
            <span class="badge badge-status status-${prob.status}">
              ${prob.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>
      `;
    }).join("");

    // Attach row click listeners
    container.querySelectorAll(".problem-row").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-id");
        this.openProblemModal(id);
      });
    });
  }

  openProblemModal(problemId) {
    const problems = StorageManager.getDSAProblems();
    const problem = problems.find((p) => p.id === problemId);
    if (!problem) return;
    this.currentDsaProblem = problem;

    document.getElementById("modalProblemTitle").textContent = problem.title;
    document.getElementById("modalProblemTopic").textContent = problem.topic;
    
    const diffBadge = document.getElementById("modalProblemDifficulty");
    diffBadge.textContent = problem.difficulty;
    diffBadge.className = `badge ${problem.difficulty === "Easy" ? "badge-easy" : problem.difficulty === "Medium" ? "badge-medium" : "badge-hard"}`;

    document.getElementById("modalProblemGoogleFreq").textContent = problem.googleFreq || "Google High-Freq";
    document.getElementById("modalProblemLink").href = problem.link || `https://www.google.com/search?q=${encodeURIComponent(problem.title + " leetcode")}`;
    document.getElementById("modalProblemPattern").textContent = problem.pattern || "Pattern recognition";
    document.getElementById("modalProblemInsight").textContent = problem.keyInsight || "Identify optimal invariants and constraints.";
    document.getElementById("modalProblemTimeComp").textContent = problem.timeComp || "O(N)";
    document.getElementById("modalProblemSpaceComp").textContent = problem.spaceComp || "O(1)";

    // Problem status & notes
    document.getElementById("modalProblemStatus").value = problem.status || "todo";
    document.getElementById("modalProblemNotes").value = problem.notes || "";

    // 8-Step framework checklist
    const completedSet = new Set(problem.completedSteps || []);
    const checklistContainer = document.getElementById("modalStepsChecklist");
    checklistContainer.innerHTML = DEFAULT_PROBLEM_STEPS.map((step) => {
      const checked = completedSet.has(step.id);
      return `
        <div class="checklist-step-item">
          <input type="checkbox" class="step-checkbox" data-step-id="${step.id}" ${checked ? "checked" : ""}>
          <div class="step-content">
            <div class="step-header-title">${step.title}</div>
            <div class="step-description">${step.desc}</div>
          </div>
        </div>
      `;
    }).join("");

    this.updateStepsCounter();

    // Checkbox change handlers
    checklistContainer.querySelectorAll(".step-checkbox").forEach((cb) => {
      cb.addEventListener("change", () => {
        this.updateStepsCounter();
      });
    });

    document.getElementById("problemModal")?.classList.add("open");
  }

  updateStepsCounter() {
    const checkboxes = document.querySelectorAll("#modalStepsChecklist .step-checkbox:checked");
    const count = checkboxes.length;
    document.getElementById("modalStepsCounter").textContent = `${count}/8 Complete`;

    // Auto-suggest mastered if all 8 steps completed
    const statusSelect = document.getElementById("modalProblemStatus");
    if (count === 8 && statusSelect.value === "todo") {
      statusSelect.value = "mastered";
    }
  }

  saveCurrentProblem() {
    if (!this.currentDsaProblem) return;
    const problems = StorageManager.getDSAProblems();
    const index = problems.findIndex((p) => p.id === this.currentDsaProblem.id);
    if (index === -1) return;

    // Collect completed steps
    const checkedSteps = [];
    document.querySelectorAll("#modalStepsChecklist .step-checkbox:checked").forEach((cb) => {
      checkedSteps.push(cb.getAttribute("data-step-id"));
    });

    const status = document.getElementById("modalProblemStatus").value;
    const notes = document.getElementById("modalProblemNotes").value;

    problems[index] = {
      ...problems[index],
      completedSteps: checkedSteps,
      status,
      notes,
      solvedAt: status === "mastered" ? (problems[index].solvedAt || Date.now()) : problems[index].solvedAt
    };

    StorageManager.saveDSAProblems(problems);
    this.closeProblemModal();
    this.renderDsaProblems();
    this.updateDashboard();
  }

  closeProblemModal() {
    document.getElementById("problemModal")?.classList.remove("open");
    this.currentDsaProblem = null;
  }

  handleAddCustomProblem() {
    const title = document.getElementById("customTitle")?.value.trim();
    if (!title) return;

    const topic = document.getElementById("customTopic")?.value;
    const difficulty = document.getElementById("customDifficulty")?.value;
    const link = document.getElementById("customLink")?.value.trim();
    const pattern = document.getElementById("customPattern")?.value.trim();
    const insight = document.getElementById("customInsight")?.value.trim();

    const problems = StorageManager.getDSAProblems();
    const newProblem = {
      id: "custom_" + Date.now(),
      title,
      topic,
      difficulty,
      googleFreq: "Custom Prep",
      link: link || `https://www.google.com/search?q=${encodeURIComponent(title + " leetcode")}`,
      pattern: pattern || "Algorithmic Pattern",
      keyInsight: insight || "Follow 8-step framework.",
      timeComp: "O(N)",
      spaceComp: "O(1)",
      status: "todo",
      completedSteps: [],
      notes: "",
      solvedAt: null
    };

    problems.unshift(newProblem);
    StorageManager.saveDSAProblems(problems);
    document.getElementById("addCustomProblemForm")?.reset();
    document.getElementById("addCustomModal")?.classList.remove("open");
    this.renderDsaProblems();
    this.updateDashboard();
  }

  // --- AI ROADMAP ---
  initAiRoadmap() {
    const moduleFilter = document.getElementById("aiModuleFilter");
    AI_MODULES.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      moduleFilter?.appendChild(opt);
    });

    document.getElementById("aiSearchInput")?.addEventListener("input", () => this.renderAiTopics());
    document.getElementById("aiModuleFilter")?.addEventListener("change", () => this.renderAiTopics());
    document.getElementById("aiStatusFilter")?.addEventListener("change", () => this.renderAiTopics());

    document.getElementById("closeAiTopicModalBtn")?.addEventListener("click", () => this.closeAiTopicModal());
    document.getElementById("modalSaveAiTopicBtn")?.addEventListener("click", () => this.saveCurrentAiTopic());

    document.getElementById("modalStartAiTimerBtn")?.addEventListener("click", () => {
      if (!this.currentAiTopic) return;
      this.closeAiTopicModal();
      this.switchTab("timer");
      this.setTimerMode("pomodoro");
      this.timer.start(`AI Study: ${this.currentAiTopic.title}`, "AI");
    });

    this.renderAiTopics();
  }

  renderAiTopics() {
    const container = document.getElementById("aiTopicsContainer");
    if (!container) return;

    const topics = StorageManager.getAITopics();
    const searchQuery = (document.getElementById("aiSearchInput")?.value || "").toLowerCase().trim();
    const moduleVal = document.getElementById("aiModuleFilter")?.value || "all";
    const statusVal = document.getElementById("aiStatusFilter")?.value || "all";

    const filtered = topics.filter((t) => {
      if (moduleVal !== "all" && t.module !== moduleVal) return false;
      if (statusVal !== "all" && t.status !== statusVal) return false;
      if (searchQuery) {
        const matchTitle = t.title.toLowerCase().includes(searchQuery);
        const matchModule = t.module.toLowerCase().includes(searchQuery);
        const matchConcepts = (t.keyConcepts || "").toLowerCase().includes(searchQuery);
        if (!matchTitle && !matchModule && !matchConcepts) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 2.5rem; text-align: center; color: var(--text-secondary);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No matching AI topics found.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((topic) => {
      const diffClass = topic.difficulty === "Easy" ? "badge-easy" : topic.difficulty === "Medium" ? "badge-medium" : "badge-hard";
      const stepCount = (topic.completedSteps || []).length;
      const statusIcon = topic.status === "mastered" ? "✓" : topic.status === "in_progress" ? "◐" : "";

      return `
        <div class="problem-row" data-id="${topic.id}">
          <div class="problem-main-info">
            <div class="problem-status-indicator ${topic.status}">${statusIcon}</div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span class="problem-title-text">${topic.title}</span>
                <span class="badge ${diffClass}">${topic.difficulty}</span>
                <span class="badge badge-google">${topic.importance || "Core"}</span>
              </div>
              <div class="problem-meta">
                <span>📚 ${topic.module}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="problem-steps-mini" title="${stepCount}/5 AI Mastery steps completed">
              ${Array.from({ length: 5 }).map((_, i) => `<span class="step-dot ${i < stepCount ? "done" : ""}"></span>`).join("")}
              <span style="font-size: 0.72rem; color: var(--text-secondary); margin-left: 4px;">${stepCount}/5</span>
            </div>
            <span class="badge badge-status status-${topic.status}">
              ${topic.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".problem-row").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-id");
        this.openAiTopicModal(id);
      });
    });
  }

  openAiTopicModal(topicId) {
    const topics = StorageManager.getAITopics();
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;
    this.currentAiTopic = topic;

    document.getElementById("modalAiTopicTitle").textContent = topic.title;
    document.getElementById("modalAiTopicModule").textContent = topic.module;
    document.getElementById("modalAiTopicImportance").textContent = topic.importance || "Core FAANG";

    const diffBadge = document.getElementById("modalAiTopicDifficulty");
    diffBadge.textContent = topic.difficulty;
    diffBadge.className = `badge ${topic.difficulty === "Easy" ? "badge-easy" : topic.difficulty === "Medium" ? "badge-medium" : "badge-hard"}`;

    document.getElementById("modalAiTopicConcepts").textContent = topic.keyConcepts || "Master core foundations.";
    document.getElementById("modalAiTopicExercise").textContent = topic.practicalExercise || "Build PyTorch implementation.";

    document.getElementById("modalAiTopicStatus").value = topic.status || "todo";
    document.getElementById("modalAiTopicNotes").value = topic.notes || "";

    const completedSet = new Set(topic.completedSteps || []);
    const checklistContainer = document.getElementById("modalAiStepsChecklist");
    checklistContainer.innerHTML = DEFAULT_AI_STEPS.map((step) => {
      const checked = completedSet.has(step.id);
      return `
        <div class="checklist-step-item">
          <input type="checkbox" class="step-checkbox" data-step-id="${step.id}" ${checked ? "checked" : ""}>
          <div class="step-content">
            <div class="step-header-title">${step.title}</div>
            <div class="step-description">${step.desc}</div>
          </div>
        </div>
      `;
    }).join("");

    const updateAiStepsCounter = () => {
      const count = checklistContainer.querySelectorAll(".step-checkbox:checked").length;
      document.getElementById("modalAiStepsCounter").textContent = `${count}/5 Complete`;
    };
    updateAiStepsCounter();

    checklistContainer.querySelectorAll(".step-checkbox").forEach((cb) => {
      cb.addEventListener("change", updateAiStepsCounter);
    });

    document.getElementById("aiTopicModal")?.classList.add("open");
  }

  saveCurrentAiTopic() {
    if (!this.currentAiTopic) return;
    const topics = StorageManager.getAITopics();
    const idx = topics.findIndex((t) => t.id === this.currentAiTopic.id);
    if (idx === -1) return;

    const checkedSteps = [];
    document.querySelectorAll("#modalAiStepsChecklist .step-checkbox:checked").forEach((cb) => {
      checkedSteps.push(cb.getAttribute("data-step-id"));
    });

    const status = document.getElementById("modalAiTopicStatus").value;
    const notes = document.getElementById("modalAiTopicNotes").value;

    topics[idx] = {
      ...topics[idx],
      completedSteps: checkedSteps,
      status,
      notes,
      solvedAt: status === "mastered" ? (topics[idx].solvedAt || Date.now()) : topics[idx].solvedAt
    };

    StorageManager.saveAITopics(topics);
    this.closeAiTopicModal();
    this.renderAiTopics();
    this.updateDashboard();
  }

  closeAiTopicModal() {
    document.getElementById("aiTopicModal")?.classList.remove("open");
    this.currentAiTopic = null;
  }

  // --- STUDY HOURS & TIMER ---
  initTimerControls() {
    // Mode switcher buttons
    document.querySelectorAll(".timer-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode");
        this.setTimerMode(mode);
      });
    });

    const startBtn = document.getElementById("timerStartBtn");
    const pauseBtn = document.getElementById("timerPauseBtn");
    const resumeBtn = document.getElementById("timerResumeBtn");
    const stopBtn = document.getElementById("timerStopBtn");
    const resetBtn = document.getElementById("timerResetBtn");

    startBtn?.addEventListener("click", () => {
      const topic = document.getElementById("timerActiveTopicText")?.textContent || "DSA Deliberate Practice";
      this.timer.start(topic, "DSA");
      this.updateTimerButtonStates("running");
    });

    pauseBtn?.addEventListener("click", () => {
      this.timer.pause();
      this.updateTimerButtonStates("paused");
    });

    resumeBtn?.addEventListener("click", () => {
      this.timer.resume();
      this.updateTimerButtonStates("running");
    });

    stopBtn?.addEventListener("click", () => {
      const seconds = this.timer.stop();
      if (seconds >= 30) {
        StorageManager.addSession({
          durationSeconds: seconds,
          topic: this.timer.sessionTopic,
          category: this.timer.sessionCategory
        });
      }
      this.updateTimerButtonStates("idle");
      this.renderSessionHistory();
      this.updateDashboard();
    });

    resetBtn?.addEventListener("click", () => {
      this.timer.reset();
      this.updateTimerButtonStates("idle");
    });

    document.getElementById("timerChangeTopicBtn")?.addEventListener("click", () => {
      const newTopic = prompt("Enter what you are practicing:", document.getElementById("timerActiveTopicText")?.textContent);
      if (newTopic && newTopic.trim()) {
        document.getElementById("timerActiveTopicText").textContent = newTopic.trim();
        this.timer.sessionTopic = newTopic.trim();
      }
    });

    this.renderSessionHistory();
  }

  setTimerMode(mode) {
    document.querySelectorAll(".timer-mode-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-mode") === mode);
    });

    if (mode === "pomodoro") {
      this.timer.setMode("pomodoro", 25);
    } else if (mode === "pomodoro50") {
      this.timer.setMode("pomodoro", 50);
    } else if (mode === "interview") {
      this.timer.setMode("interview");
    } else {
      this.timer.setMode("stopwatch");
    }

    this.updateTimerButtonStates("idle");
  }

  updateTimerButtonStates(status) {
    const startBtn = document.getElementById("timerStartBtn");
    const pauseBtn = document.getElementById("timerPauseBtn");
    const resumeBtn = document.getElementById("timerResumeBtn");
    const stopBtn = document.getElementById("timerStopBtn");

    if (status === "running") {
      if (startBtn) startBtn.style.display = "none";
      if (pauseBtn) pauseBtn.style.display = "inline-flex";
      if (resumeBtn) resumeBtn.style.display = "none";
      if (stopBtn) stopBtn.style.display = "inline-flex";
    } else if (status === "paused") {
      if (startBtn) startBtn.style.display = "none";
      if (pauseBtn) pauseBtn.style.display = "none";
      if (resumeBtn) resumeBtn.style.display = "inline-flex";
      if (stopBtn) stopBtn.style.display = "inline-flex";
    } else {
      if (startBtn) startBtn.style.display = "inline-flex";
      if (pauseBtn) pauseBtn.style.display = "none";
      if (resumeBtn) resumeBtn.style.display = "none";
      if (stopBtn) stopBtn.style.display = "none";
    }
  }

  handleTimerTick(tickData) {
    const clock = document.getElementById("mainClockDisplay");
    const headerClock = document.getElementById("headerTimerDisplay");
    const headerPulse = document.getElementById("headerTimerPulse");
    const headerLabel = document.getElementById("headerTimerLabel");

    if (clock) clock.textContent = tickData.formattedTime;
    if (headerClock) headerClock.textContent = tickData.formattedTime;

    if (headerPulse) {
      headerPulse.classList.toggle("active", tickData.status === "running");
    }
    if (headerLabel) {
      headerLabel.textContent = tickData.status === "running" ? `(${tickData.mode})` : `(${tickData.status})`;
    }
  }

  handleTimerComplete(completeData) {
    alert(`🎉 Focus Session Finished!\n\nYou completed ${Math.round(completeData.durationSeconds / 60)} minutes of ${completeData.topic}! Keep up the Google mindset.`);
    StorageManager.addSession(completeData);
    this.updateTimerButtonStates("idle");
    this.renderSessionHistory();
    this.updateDashboard();
  }

  renderSessionHistory() {
    const container = document.getElementById("sessionHistoryContainer");
    if (!container) return;
    const sessions = StorageManager.getSessions();
    const analytics = StorageManager.calculateAnalytics();

    const totalText = document.getElementById("timerTotalHoursLoggedText");
    if (totalText) totalText.textContent = `${analytics.totalHours} Hours`;

    if (sessions.length === 0) {
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
          <p>No study sessions logged yet. Hit "Start Focus" to record your deep work hours!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); text-align: left;">
              <th style="padding: 0.6rem 0.75rem;">Date & Time</th>
              <th style="padding: 0.6rem 0.75rem;">Category</th>
              <th style="padding: 0.6rem 0.75rem;">Focus Topic</th>
              <th style="padding: 0.6rem 0.75rem;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.slice(0, 15).map((s) => `
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 0.6rem 0.75rem; color: var(--text-secondary);">${new Date(s.timestamp).toLocaleString()}</td>
                <td style="padding: 0.6rem 0.75rem;"><span class="badge badge-google">${s.category}</span></td>
                <td style="padding: 0.6rem 0.75rem; font-weight: 600;">${s.topic}</td>
                <td style="padding: 0.6rem 0.75rem; color: var(--google-green); font-weight: 700;">${s.durationMinutes} min</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // --- DAILY GOOGLE & AI NEWS ---
  initDailyNews() {
    document.getElementById("refreshNewsBtn")?.addEventListener("click", () => {
      this.loadNews(true);
    });

    document.querySelectorAll(".news-category-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".news-category-btn").forEach((b) => {
          b.classList.remove("active", "btn-primary");
          b.classList.add("btn-outline");
        });
        btn.classList.add("active", "btn-primary");
        btn.classList.remove("btn-outline");
        const category = btn.getAttribute("data-category");
        this.renderNews(category);
      });
    });

    this.loadNews();
  }

  async loadNews(forceRefresh = false) {
    const container = document.getElementById("newsFeedContainer");
    if (container && (!this.cachedNewsItems || forceRefresh)) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-secondary);">
          <p>📡 Fetching daily Google & AI updates...</p>
        </div>
      `;
    }

    try {
      this.cachedNewsItems = await this.newsService.fetchAllNews(forceRefresh);
      const activeBtn = document.querySelector(".news-category-btn.active");
      const category = activeBtn ? activeBtn.getAttribute("data-category") : "all";
      this.renderNews(category);
    } catch (e) {
      console.error("Error loading news:", e);
      if (container) {
        container.innerHTML = `<div style="padding: 2rem; color: var(--text-secondary);">Unable to load live news right now.</div>`;
      }
    }
  }

  renderNews(category = "all") {
    const container = document.getElementById("newsFeedContainer");
    if (!container || !this.cachedNewsItems) return;

    const filtered = this.cachedNewsItems.filter((item) => {
      if (category === "all") return true;
      return item.category === category;
    });

    container.innerHTML = filtered.map((item) => `
      <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-card">
        <div>
          <div class="news-card-header">
            <span class="news-source-tag">${item.source}</span>
            <span class="news-pub-date">${item.pubDate}</span>
          </div>
          <h3 class="news-title">${item.title}</h3>
          <p class="news-snippet">${item.snippet}</p>
        </div>
        <div class="news-footer-link">
          <span>Read Full Article</span>
          <span>→</span>
        </div>
      </a>
    `).join("");
  }

  // --- SETTINGS & BACKUP ---
  initSettingsAndBackup() {
    const settings = StorageManager.getSettings();
    const dailyInput = document.getElementById("settingsDailyGoal");
    const careerInput = document.getElementById("settingsCareerGoal");

    if (dailyInput) dailyInput.value = settings.dailyTargetHours || 4;
    if (careerInput) careerInput.value = settings.careerGoalHours || 300;

    document.getElementById("settingsForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const newDaily = parseFloat(dailyInput.value) || 4;
      const newCareer = parseFloat(careerInput.value) || 300;

      StorageManager.saveSettings({
        ...settings,
        dailyTargetHours: newDaily,
        careerGoalHours: newCareer
      });

      alert("Settings saved successfully!");
      this.updateDashboard();
    });

    // Export backup
    document.getElementById("exportDataBtn")?.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(StorageManager.exportBackup());
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ascent_faang_prep_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    // Import backup
    document.getElementById("importDataInput")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = StorageManager.importBackup(event.target.result);
        if (success) {
          alert("Backup restored successfully!");
          window.location.reload();
        } else {
          alert("Failed to parse backup JSON. Please check the file.");
        }
      };
      reader.readAsText(file);
    });
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.ascentApp = new AscentApp();
});
