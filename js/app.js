// Google Engineering Workspace - Application Controller

import { DSA_TOPICS, DEFAULT_PROBLEM_STEPS } from "./data/dsaRoadmap.js";
import { AI_MODULES, DEFAULT_AI_STEPS } from "./data/aiRoadmap.js";
import { StorageManager } from "./storage.js";
import { StudyTimer } from "./timer.js";
import { NewsService } from "./newsService.js";
import { AuthService } from "./auth.js";
import { ContestService } from "./contestService.js";
import { DailyPlanner } from "./dailyPlanner.js";

// Problem solving checklist to-do items
const GUIDANCE_TODO_ITEMS = [
  {
    id: "g_step_1",
    title: "1. Read Problem Twice Slowly",
    desc: "Read the entire statement without typing any code. Note return types, input limits, and edge guarantees (e.g. sorted, positive, unique)."
  },
  {
    id: "g_step_2",
    title: "2. Constraints & Scale Analysis",
    desc: "Calculate time budget from N: N <= 10^5 implies O(N log N) or O(N); N <= 20 implies O(2^N); N <= 500 implies O(N^3). Check memory limits."
  },
  {
    id: "g_step_3",
    title: "3. Write 3 Manual Test Cases",
    desc: "Write down 3 distinct test cases: 1) Minimal base case (N=0 or 1), 2) Standard typical case, 3) Adversarial boundary case (duplicates, negatives, reversed)."
  },
  {
    id: "g_step_4",
    title: "4. Propose Naive Baseline & Pinpoint Bottleneck",
    desc: "State brute-force time and space complexity explicitly. Explain why it fails and locate redundant recalculation."
  },
  {
    id: "g_step_5",
    title: "5. Match Algorithmic Pattern",
    desc: "Check pattern checklist: Contiguous subarray -> Sliding Window / Prefix Sum; Sorted search -> Two Pointers / Binary Search; Next greater -> Monotonic Stack; Dependencies -> Topo Sort; Shortest path -> Dijkstra; Overlapping subproblems -> DP."
  },
  {
    id: "g_step_6",
    title: "6. State Big-O Proof Before Code",
    desc: "State exact Time O(T) and Space O(S) complexities and confirm alignment with the interviewer before writing code."
  },
  {
    id: "g_step_7",
    title: "7. Production-Grade Clean Code",
    desc: "Implement modular helper functions, self-documenting variable names, and defensive guard clauses for null/empty inputs."
  },
  {
    id: "g_step_8",
    title: "8. Line-by-Line Manual Dry Run",
    desc: "Step through your code line-by-line using a variable state tracking table on your non-trivial sample input."
  },
  {
    id: "g_step_9",
    title: "9. Verify Bounds & Off-by-One Checks",
    desc: "Verify 0-indexing boundaries (0 to N-1), loop conditions (< vs <=), midpoint overflow (low + (high - low) / 2), and empty collections."
  },
  {
    id: "g_step_10",
    title: "10. Post-Mortem & Spaced Review",
    desc: "Log the core mental model and invariant into notes. Schedule spaced review for Day 1 and Day 3."
  }
];

class EngineeringWorkspace {
  constructor() {
    this.newsService = new NewsService();
    this.contestService = new ContestService();
    this.currentDsaProblem = null;
    this.currentAiTopic = null;
    this.selectedPlannerMinutes = 120;

    this.timer = new StudyTimer(
      (tickData) => this.handleTimerTick(tickData),
      (completeData) => this.handleTimerComplete(completeData)
    );

    this.initAuth();
    this.initTheme();
    this.initNavigation();
    this.initOverview();
    this.initDailyPlannerUI();
    this.initContestHub();
    this.initProblemSolvingGuidanceChecklist();
    this.initDsaDirectory();
    this.initAiCurriculum();
    this.initTimerControls();
    this.initIndustryNews();
    this.initAdminAndSecurity();
  }

  // --- AUTHENTICATION ---
  initAuth() {
    const authWall = document.getElementById("authWall");
    const loginForm = document.getElementById("authLoginForm");
    const passkeyInput = document.getElementById("authPasskeyInput");
    const errorMsg = document.getElementById("authErrorMessage");
    const userLabel = document.getElementById("headerUserLabel");
    const logoutBtn = document.getElementById("headerLogoutBtn");

    const checkAuthStatus = () => {
      if (AuthService.isAuthenticated()) {
        if (authWall) authWall.style.display = "none";
        const user = AuthService.getCurrentUser();
        if (userLabel) {
          userLabel.textContent = user && user.role === "owner" ? "Harishraja (Owner)" : `Guest (${user?.label || "Authorized"})`;
        }
      } else {
        if (authWall) authWall.style.display = "flex";
      }
    };

    loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = passkeyInput?.value;
      const res = AuthService.authenticate(val);
      if (res.success) {
        if (errorMsg) errorMsg.style.display = "none";
        if (passkeyInput) passkeyInput.value = "";
        checkAuthStatus();
        this.updateOverview();
      } else {
        if (errorMsg) {
          errorMsg.textContent = res.message;
          errorMsg.style.display = "block";
        }
      }
    });

    logoutBtn?.addEventListener("click", () => {
      if (confirm("Are you sure you want to lock the workspace and sign out?")) {
        AuthService.logout();
        checkAuthStatus();
      }
    });

    // Request Access Modal
    const reqModal = document.getElementById("requestAccessModal");
    document.getElementById("openRequestAccessBtn")?.addEventListener("click", () => reqModal?.classList.add("open"));
    document.getElementById("closeRequestAccessBtn")?.addEventListener("click", () => reqModal?.classList.remove("open"));
    document.getElementById("cancelRequestAccessBtn")?.addEventListener("click", () => reqModal?.classList.remove("open"));

    document.getElementById("requestAccessForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reqName")?.value;
      const email = document.getElementById("reqEmail")?.value;
      const reason = document.getElementById("reqReason")?.value;

      AuthService.submitAccessRequest(name, email, reason);
      alert("Access request recorded. The administrator (Harishraja) has been notified in their Administration tab.");
      reqModal?.classList.remove("open");
      document.getElementById("requestAccessForm")?.reset();
    });

    checkAuthStatus();
  }

  // --- THEME ---
  initTheme() {
    const savedTheme = localStorage.getItem("workspace_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    document.getElementById("themeToggleBtn")?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("workspace_theme", next);
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

    document.getElementById("btnGoToGuide")?.addEventListener("click", () => this.switchTab("guide"));
    document.getElementById("overviewStartPomodoro")?.addEventListener("click", () => {
      this.switchTab("timer");
      this.setTimerMode("pomodoro");
      this.timer.start("DSA Deliberate Practice", "DSA");
    });
    document.getElementById("overviewStartInterview")?.addEventListener("click", () => {
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

    if (tabId === "overview") this.updateOverview();
    if (tabId === "dsa") this.renderDsaTable();
    if (tabId === "ai") this.renderAiTable();
    if (tabId === "timer") this.renderSessionHistory();
    if (tabId === "news") this.loadNews();
    if (tabId === "admin") this.renderAdminPanel();
  }

  // --- OVERVIEW ---
  initOverview() {
    this.updateOverview();
  }

  updateOverview() {
    const analytics = StorageManager.calculateAnalytics();

    const readinessElem = document.getElementById("overviewReadiness");
    const readinessBar = document.getElementById("overviewReadinessBar");
    if (readinessElem && readinessBar) {
      readinessElem.textContent = `${analytics.readinessScore}%`;
      readinessBar.style.width = `${analytics.readinessScore}%`;
    }

    const totalHoursElem = document.getElementById("overviewTotalHours");
    const todayHoursElem = document.getElementById("overviewTodayHours");
    const todayBar = document.getElementById("overviewTodayBar");
    if (totalHoursElem) totalHoursElem.textContent = `${analytics.totalHours}h`;
    if (todayHoursElem) todayHoursElem.textContent = `${analytics.todayHours}h`;
    if (todayBar) {
      const todayPct = Math.min(100, Math.round(((analytics.todayMinutes / 60) / analytics.settings.dailyTargetHours) * 100));
      todayBar.style.width = `${todayPct}%`;
    }

    const dsaCountElem = document.getElementById("overviewDsaCount");
    const dsaPercentElem = document.getElementById("overviewDsaPercent");
    const dsaBar = document.getElementById("overviewDsaBar");
    if (dsaCountElem) dsaCountElem.textContent = `${analytics.dsa.mastered} / ${analytics.dsa.total}`;
    if (dsaPercentElem) dsaPercentElem.textContent = `${analytics.dsa.percent}%`;
    if (dsaBar) dsaBar.style.width = `${analytics.dsa.percent}%`;

    const streakElem = document.getElementById("overviewStreak");
    if (streakElem) streakElem.textContent = `${analytics.streak} Day${analytics.streak === 1 ? "" : "s"}`;
  }

  // --- DAILY PLANNER & TIME ALLOCATOR ---
  initDailyPlannerUI() {
    const timeChips = document.querySelectorAll("#plannerTimeChips .time-chip");
    timeChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        timeChips.forEach((c) => {
          c.classList.remove("active", "btn-primary");
          c.classList.add("btn-outline");
        });
        chip.classList.add("active", "btn-primary");
        chip.classList.remove("btn-outline");
        this.selectedPlannerMinutes = parseInt(chip.getAttribute("data-mins"), 10);
      });
    });

    document.getElementById("btnGeneratePlan")?.addEventListener("click", () => {
      const focus = document.getElementById("plannerFocusSelect")?.value || "balanced";
      const plan = DailyPlanner.generateSchedule(this.selectedPlannerMinutes, focus);
      this.renderDailyPlan(plan);
    });

    // Check if a plan exists for today
    const existingPlan = DailyPlanner.getTodayPlan();
    if (existingPlan) {
      this.renderDailyPlan(existingPlan);
    } else {
      const initialPlan = DailyPlanner.generateSchedule(120, "balanced");
      this.renderDailyPlan(initialPlan);
    }
  }

  renderDailyPlan(plan) {
    const container = document.getElementById("plannerScheduleContainer");
    if (!container || !plan || !plan.items) return;

    container.innerHTML = plan.items.map((item, idx) => `
      <div class="planner-item-card ${item.completed ? "completed" : ""}" data-idx="${idx}">
        <div style="display: flex; gap: 12px; align-items: flex-start; flex: 1;">
          <input type="checkbox" class="todo-checkbox planner-task-check" data-idx="${idx}" ${item.completed ? "checked" : ""}>
          <div>
            <div style="display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap;">
              <span class="badge" style="background-color: var(--google-blue-surface); color: var(--google-blue);">${item.timeBox}</span>
              <span style="font-weight: 500; font-size: 14px; ${item.completed ? "text-decoration: line-through; color: var(--text-muted);" : ""}">${item.title}</span>
              <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">[${item.category}]</span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">${item.description}</p>
          </div>
        </div>
        <div style="display: flex; gap: 8px; margin-left: 12px; align-items: center;">
          ${item.link && item.link.startsWith("http") ? `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Watch / Open &rarr;</a>
          ` : ""}
          <button class="btn btn-primary btn-sm btn-start-planner-timer" data-title="${encodeURIComponent(item.title)}" data-mins="${item.durationMinutes}">
            Start Timer
          </button>
        </div>
      </div>
    `).join("");

    // Checkbox toggles
    container.querySelectorAll(".planner-task-check").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const idx = parseInt(cb.getAttribute("data-idx"), 10);
        plan.items[idx].completed = cb.checked;
        DailyPlanner.saveTodayPlan(plan);
        this.renderDailyPlan(plan);
      });
    });

    // Start timer buttons
    container.querySelectorAll(".btn-start-planner-timer").forEach((btn) => {
      btn.addEventListener("click", () => {
        const title = decodeURIComponent(btn.getAttribute("data-title"));
        const mins = parseInt(btn.getAttribute("data-mins"), 10);

        this.switchTab("timer");
        document.getElementById("timerActiveTopicText").textContent = title;
        this.setTimerMode("pomodoro");
        this.timer.setMode("pomodoro", mins);
        this.timer.start(title, "Study Plan");
      });
    });
  }

  // --- CONTEST HUB (CODEFORCES & LEETCODE) ---
  async initContestHub() {
    const container = document.getElementById("contestListContainer");
    if (!container) return;

    container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted);">Checking upcoming Codeforces & LeetCode contests...</div>`;

    document.getElementById("btnEnableNotifications")?.addEventListener("click", () => {
      ContestService.requestNotificationPermission().then((granted) => {
        if (granted) {
          alert("Contest desktop notifications enabled! You will be alerted before upcoming rounds.");
        } else {
          alert("Notification permission denied in browser settings.");
        }
      });
    });

    try {
      const contests = await this.contestService.getAllUpcomingContests();
      if (!contests || contests.length === 0) {
        container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted);">No upcoming contests scheduled in the next few days.</div>`;
        return;
      }

      container.innerHTML = contests.slice(0, 4).map((c) => {
        const dateStr = new Date(c.startTime).toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        const countdown = ContestService.formatCountdown(c.startTime);

        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
            <div>
              <div style="font-size: 11px; font-weight: 700; color: var(--google-blue); text-transform: uppercase;">${c.platform} • ${c.type}</div>
              <div style="font-weight: 500; font-size: 13px;">${c.name}</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${dateStr} (${c.durationMinutes} min)</div>
            </div>
            <div style="text-align: right;">
              <span class="badge" style="background-color: var(--google-green-surface); color: var(--google-green); font-weight: 600; margin-bottom: 6px;">${countdown}</span>
              <div>
                <a href="${c.link}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; font-weight: 500;">Register &rarr;</a>
              </div>
            </div>
          </div>
        `;
      }).join("");

      // Trigger notification if next contest is within 1 hour
      const nextContest = contests[0];
      if (nextContest && nextContest.startTime - Date.now() < 60 * 60 * 1000 && nextContest.startTime - Date.now() > 0) {
        ContestService.sendNotification(
          `Upcoming Contest Alert: ${nextContest.name}`,
          `${nextContest.platform} contest begins in ${ContestService.formatCountdown(nextContest.startTime)}!`
        );
      }
    } catch {
      container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted);">Unable to load live contests. Check internet connectivity.</div>`;
    }
  }

  // --- PROBLEM SOLVING GUIDANCE CHECKLIST (ACTIONABLE TO-DO LIST) ---
  initProblemSolvingGuidanceChecklist() {
    const container = document.getElementById("guidanceTodoList");
    if (!container) return;

    const storageKey = "ascent_guidance_todo_state";
    const getSavedState = () => {
      try {
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : {};
      } catch {
        return {};
      }
    };

    const renderList = () => {
      const state = getSavedState();
      container.innerHTML = GUIDANCE_TODO_ITEMS.map((item) => {
        const isChecked = Boolean(state[item.id]);
        return `
          <div class="guidance-todo-item ${isChecked ? "checked" : ""}">
            <input type="checkbox" class="todo-checkbox guidance-step-check" data-id="${item.id}" ${isChecked ? "checked" : ""}>
            <div class="guidance-todo-content">
              <div class="guidance-todo-title">${item.title}</div>
              <div class="guidance-todo-desc">${item.desc}</div>
            </div>
          </div>
        `;
      }).join("");

      container.querySelectorAll(".guidance-step-check").forEach((cb) => {
        cb.addEventListener("change", () => {
          const id = cb.getAttribute("data-id");
          const cur = getSavedState();
          cur[id] = cb.checked;
          localStorage.setItem(storageKey, JSON.stringify(cur));
          renderList();
        });
      });
    };

    renderList();

    document.getElementById("btnResetGuidanceChecklist")?.addEventListener("click", () => {
      if (confirm("Reset the problem-solving checklist for your next problem?")) {
        localStorage.removeItem(storageKey);
        renderList();
      }
    });

    document.getElementById("btnCopyGuidanceChecklist")?.addEventListener("click", () => {
      const text = GUIDANCE_TODO_ITEMS.map((i) => `[ ] ${i.title}\n    ${i.desc}`).join("\n\n");
      navigator.clipboard.writeText(text).then(() => {
        alert("Checklist copied to clipboard! You can paste it into your notes.");
      });
    });
  }

  // --- DSA DIRECTORY ---
  initDsaDirectory() {
    const topicFilter = document.getElementById("dsaTopicFilter");
    const custTopic = document.getElementById("custTopic");
    DSA_TOPICS.forEach((t) => {
      const opt1 = document.createElement("option");
      opt1.value = t;
      opt1.textContent = t;
      topicFilter?.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = t;
      opt2.textContent = t;
      custTopic?.appendChild(opt2);
    });

    document.getElementById("dsaSearchInput")?.addEventListener("input", () => this.renderDsaTable());
    document.getElementById("dsaTopicFilter")?.addEventListener("change", () => this.renderDsaTable());
    document.getElementById("dsaDifficultyFilter")?.addEventListener("change", () => this.renderDsaTable());
    document.getElementById("dsaStatusFilter")?.addEventListener("change", () => this.renderDsaTable());

    document.getElementById("closeProblemModalBtn")?.addEventListener("click", () => this.closeProblemModal());
    document.getElementById("btnModalSaveProblem")?.addEventListener("click", () => this.saveCurrentProblem());

    document.getElementById("btnModalStartTimer")?.addEventListener("click", () => {
      if (!this.currentDsaProblem) return;
      this.closeProblemModal();
      this.switchTab("timer");
      this.setTimerMode("interview");
      this.timer.start(`Solving: ${this.currentDsaProblem.title}`, "DSA");
    });

    const addModal = document.getElementById("addProblemModal");
    document.getElementById("btnOpenAddProblemModal")?.addEventListener("click", () => addModal?.classList.add("open"));
    document.getElementById("closeAddProblemBtn")?.addEventListener("click", () => addModal?.classList.remove("open"));
    document.getElementById("cancelAddProblemBtn")?.addEventListener("click", () => addModal?.classList.remove("open"));

    document.getElementById("addCustomProblemForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("custTitle")?.value.trim();
      const topic = document.getElementById("custTopic")?.value;
      const difficulty = document.getElementById("custDifficulty")?.value;
      const link = document.getElementById("custLink")?.value.trim();
      const pattern = document.getElementById("custPattern")?.value.trim();
      const insight = document.getElementById("custInsight")?.value.trim();

      const problems = StorageManager.getDSAProblems();
      problems.unshift({
        id: "custom_" + Date.now(),
        title,
        topic,
        difficulty,
        link: link || `https://www.google.com/search?q=${encodeURIComponent(title + " leetcode")}`,
        pattern: pattern || "Algorithmic Pattern",
        keyInsight: insight || "Follow 10-step framework.",
        timeComp: "O(N)",
        spaceComp: "O(1)",
        status: "todo",
        completedSteps: [],
        notes: "",
        solvedAt: null
      });

      StorageManager.saveDSAProblems(problems);
      document.getElementById("addCustomProblemForm")?.reset();
      addModal?.classList.remove("open");
      this.renderDsaTable();
      this.updateOverview();
    });

    this.renderDsaTable();
  }

  renderDsaTable() {
    const tbody = document.getElementById("dsaTableBody");
    if (!tbody) return;

    const problems = StorageManager.getDSAProblems();
    const query = (document.getElementById("dsaSearchInput")?.value || "").toLowerCase().trim();
    const topic = document.getElementById("dsaTopicFilter")?.value || "all";
    const difficulty = document.getElementById("dsaDifficultyFilter")?.value || "all";
    const status = document.getElementById("dsaStatusFilter")?.value || "all";

    const filtered = problems.filter((p) => {
      if (topic !== "all" && p.topic !== topic) return false;
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (status !== "all" && p.status !== status) return false;
      if (query) {
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchPattern = (p.pattern || "").toLowerCase().includes(query);
        const matchTopic = p.topic.toLowerCase().includes(query);
        if (!matchTitle && !matchPattern && !matchTopic) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No matching problems found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((p) => {
      const stepCount = (p.completedSteps || []).length;
      const diffClass = p.difficulty === "Easy" ? "badge-easy" : p.difficulty === "Medium" ? "badge-medium" : "badge-hard";
      const statusLabel = p.status.replace("_", " ");

      return `
        <tr class="clickable" data-id="${p.id}">
          <td><span class="badge badge-status-${p.status}">${statusLabel}</span></td>
          <td style="font-weight: 500;">${p.title}</td>
          <td style="color: var(--text-secondary);">${p.topic}</td>
          <td><span class="badge ${diffClass}">${p.difficulty}</span></td>
          <td style="color: var(--text-secondary);">${p.pattern || "—"}</td>
          <td style="color: var(--text-muted); font-size: 12px;">${p.timeComp || "O(N)"} / ${p.spaceComp || "O(1)"}</td>
          <td style="font-weight: 500;">${stepCount}/10</td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("tr.clickable").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-id");
        this.openProblemModal(id);
      });
    });
  }

  openProblemModal(id) {
    const problems = StorageManager.getDSAProblems();
    const problem = problems.find((p) => p.id === id);
    if (!problem) return;
    this.currentDsaProblem = problem;

    document.getElementById("modalProblemTitle").textContent = problem.title;
    document.getElementById("modalProblemTopic").textContent = problem.topic;

    const diffBadge = document.getElementById("modalProblemDifficulty");
    diffBadge.textContent = problem.difficulty;
    diffBadge.className = `badge ${problem.difficulty === "Easy" ? "badge-easy" : problem.difficulty === "Medium" ? "badge-medium" : "badge-hard"}`;

    document.getElementById("modalProblemLink").href = problem.link || "#";
    document.getElementById("modalProblemPattern").textContent = problem.pattern || "Pattern recognition";
    document.getElementById("modalProblemInsight").textContent = problem.keyInsight || "Follow optimal invariant.";
    document.getElementById("modalProblemTimeComp").textContent = problem.timeComp || "O(N)";
    document.getElementById("modalProblemSpaceComp").textContent = problem.spaceComp || "O(1)";

    document.getElementById("modalProblemStatus").value = problem.status || "todo";
    document.getElementById("modalProblemNotes").value = problem.notes || "";

    const completed = new Set(problem.completedSteps || []);
    const list = document.getElementById("modalStepsList");
    list.innerHTML = DEFAULT_PROBLEM_STEPS.map((s) => `
      <div style="display: flex; align-items: baseline; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--border-subtle);">
        <input type="checkbox" class="step-check" data-step="${s.id}" ${completed.has(s.id) ? "checked" : ""}>
        <div>
          <div style="font-weight: 500; font-size: 13px;">${s.title}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">${s.desc}</div>
        </div>
      </div>
    `).join("");

    const updateCounter = () => {
      const c = list.querySelectorAll(".step-check:checked").length;
      document.getElementById("modalStepsCount").textContent = `${c}/10 Complete`;
    };
    updateCounter();

    list.querySelectorAll(".step-check").forEach((cb) => cb.addEventListener("change", updateCounter));

    document.getElementById("problemDetailModal")?.classList.add("open");
  }

  saveCurrentProblem() {
    if (!this.currentDsaProblem) return;
    const problems = StorageManager.getDSAProblems();
    const idx = problems.findIndex((p) => p.id === this.currentDsaProblem.id);
    if (idx === -1) return;

    const checked = [];
    document.querySelectorAll("#modalStepsList .step-check:checked").forEach((cb) => {
      checked.push(cb.getAttribute("data-step"));
    });

    const status = document.getElementById("modalProblemStatus").value;
    const notes = document.getElementById("modalProblemNotes").value;

    problems[idx] = {
      ...problems[idx],
      completedSteps: checked,
      status,
      notes,
      solvedAt: status === "mastered" ? (problems[idx].solvedAt || Date.now()) : problems[idx].solvedAt
    };

    StorageManager.saveDSAProblems(problems);
    this.closeProblemModal();
    this.renderDsaTable();
    this.updateOverview();
  }

  closeProblemModal() {
    document.getElementById("problemDetailModal")?.classList.remove("open");
    this.currentDsaProblem = null;
  }

  // --- AI CURRICULUM ---
  initAiCurriculum() {
    const modFilter = document.getElementById("aiModuleFilter");
    AI_MODULES.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      modFilter?.appendChild(opt);
    });

    document.getElementById("aiSearchInput")?.addEventListener("input", () => this.renderAiTable());
    document.getElementById("aiModuleFilter")?.addEventListener("change", () => this.renderAiTable());
    document.getElementById("aiStatusFilter")?.addEventListener("change", () => this.renderAiTable());

    document.getElementById("closeAiTopicModalBtn")?.addEventListener("click", () => this.closeAiModal());
    document.getElementById("btnModalSaveAi")?.addEventListener("click", () => this.saveCurrentAiTopic());

    document.getElementById("btnModalStartAiTimer")?.addEventListener("click", () => {
      if (!this.currentAiTopic) return;
      this.closeAiModal();
      this.switchTab("timer");
      this.setTimerMode("pomodoro");
      this.timer.start(`AI Study: ${this.currentAiTopic.title}`, "AI");
    });

    this.renderAiTable();
  }

  renderAiTable() {
    const tbody = document.getElementById("aiTableBody");
    if (!tbody) return;

    const topics = StorageManager.getAITopics();
    const query = (document.getElementById("aiSearchInput")?.value || "").toLowerCase().trim();
    const mod = document.getElementById("aiModuleFilter")?.value || "all";
    const status = document.getElementById("aiStatusFilter")?.value || "all";

    const filtered = topics.filter((t) => {
      if (mod !== "all" && t.module !== mod) return false;
      if (status !== "all" && t.status !== status) return false;
      if (query) {
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchMod = t.module.toLowerCase().includes(query);
        const matchConcepts = (t.keyConcepts || "").toLowerCase().includes(query);
        if (!matchTitle && !matchMod && !matchConcepts) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No matching AI topics found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((t) => {
      const diffClass = t.difficulty === "Easy" ? "badge-easy" : t.difficulty === "Medium" ? "badge-medium" : "badge-hard";
      const stepCount = (t.completedSteps || []).length;

      return `
        <tr class="clickable" data-id="${t.id}">
          <td><span class="badge badge-status-${t.status}">${t.status.replace("_", " ")}</span></td>
          <td style="font-weight: 500;">${t.title}</td>
          <td style="color: var(--text-secondary);">${t.module}</td>
          <td><span class="badge ${diffClass}">${t.difficulty}</span></td>
          <td style="font-weight: 500; color: var(--google-blue);">${t.estimatedHours || 3.0} hrs</td>
          <td style="color: var(--text-secondary); font-size: 12px; max-width: 280px;">${t.practicalExercise || "—"}</td>
          <td style="font-weight: 500;">${stepCount}/5</td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("tr.clickable").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-id");
        this.openAiModal(id);
      });
    });
  }

  openAiModal(id) {
    const topics = StorageManager.getAITopics();
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;
    this.currentAiTopic = topic;

    document.getElementById("modalAiTitle").textContent = topic.title;
    document.getElementById("modalAiModule").textContent = topic.module;
    document.getElementById("modalAiEstimatedHours").textContent = `${topic.estimatedHours || 3.0} Hours Suggested`;

    const diffBadge = document.getElementById("modalAiDifficulty");
    diffBadge.textContent = topic.difficulty;
    diffBadge.className = `badge ${topic.difficulty === "Easy" ? "badge-easy" : topic.difficulty === "Medium" ? "badge-medium" : "badge-hard"}`;

    document.getElementById("modalAiConcepts").textContent = topic.keyConcepts || "Foundational concepts.";
    document.getElementById("modalAiExercise").textContent = topic.practicalExercise || "Implementation details.";

    // Hourly Schedule Breakdown List
    const scheduleContainer = document.getElementById("modalAiHourlyScheduleList");
    if (scheduleContainer && topic.hourlySchedule) {
      scheduleContainer.innerHTML = topic.hourlySchedule.map((s) => `
        <div style="display: flex; gap: 8px; font-size: 13px; padding: 4px 0; border-bottom: 1px solid var(--border-subtle);">
          <strong style="color: var(--google-blue); min-width: 110px;">${s.hour}:</strong>
          <span style="color: var(--text-secondary);">${s.task}</span>
        </div>
      `).join("");
    }

    document.getElementById("modalAiStatus").value = topic.status || "todo";
    document.getElementById("modalAiNotes").value = topic.notes || "";

    const completed = new Set(topic.completedSteps || []);
    const list = document.getElementById("modalAiStepsList");
    list.innerHTML = DEFAULT_AI_STEPS.map((s) => `
      <div style="display: flex; align-items: baseline; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--border-subtle);">
        <input type="checkbox" class="ai-step-check" data-step="${s.id}" ${completed.has(s.id) ? "checked" : ""}>
        <div>
          <div style="font-weight: 500; font-size: 13px;">${s.title}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">${s.desc}</div>
        </div>
      </div>
    `).join("");

    const updateCounter = () => {
      const c = list.querySelectorAll(".ai-step-check:checked").length;
      document.getElementById("modalAiStepsCount").textContent = `${c}/5 Complete`;
    };
    updateCounter();

    list.querySelectorAll(".ai-step-check").forEach((cb) => cb.addEventListener("change", updateCounter));

    document.getElementById("aiTopicModal")?.classList.add("open");
  }

  saveCurrentAiTopic() {
    if (!this.currentAiTopic) return;
    const topics = StorageManager.getAITopics();
    const idx = topics.findIndex((t) => t.id === this.currentAiTopic.id);
    if (idx === -1) return;

    const checked = [];
    document.querySelectorAll("#modalAiStepsList .ai-step-check:checked").forEach((cb) => {
      checked.push(cb.getAttribute("data-step"));
    });

    const status = document.getElementById("modalAiStatus").value;
    const notes = document.getElementById("modalAiNotes").value;

    topics[idx] = {
      ...topics[idx],
      completedSteps: checked,
      status,
      notes,
      solvedAt: status === "mastered" ? (topics[idx].solvedAt || Date.now()) : topics[idx].solvedAt
    };

    StorageManager.saveAITopics(topics);
    this.closeAiModal();
    this.renderAiTable();
    this.updateOverview();
  }

  closeAiModal() {
    document.getElementById("aiTopicModal")?.classList.remove("open");
    this.currentAiTopic = null;
  }

  // --- STUDY TRACKER & TIMER ---
  initTimerControls() {
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
      this.updateTimerBtnState("running");
    });

    pauseBtn?.addEventListener("click", () => {
      this.timer.pause();
      this.updateTimerBtnState("paused");
    });

    resumeBtn?.addEventListener("click", () => {
      this.timer.resume();
      this.updateTimerBtnState("running");
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
      this.updateTimerBtnState("idle");
      this.renderSessionHistory();
      this.updateOverview();
    });

    resetBtn?.addEventListener("click", () => {
      this.timer.reset();
      this.updateTimerBtnState("idle");
    });

    document.getElementById("btnChangeTimerTopic")?.addEventListener("click", () => {
      const current = document.getElementById("timerActiveTopicText")?.textContent;
      const res = prompt("Enter active practice task:", current);
      if (res && res.trim()) {
        document.getElementById("timerActiveTopicText").textContent = res.trim();
        this.timer.sessionTopic = res.trim();
      }
    });

    this.renderSessionHistory();
  }

  setTimerMode(mode) {
    document.querySelectorAll(".timer-mode-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-mode") === mode);
    });

    if (mode === "pomodoro") this.timer.setMode("pomodoro", 25);
    else if (mode === "pomodoro50") this.timer.setMode("pomodoro", 50);
    else if (mode === "interview") this.timer.setMode("interview");
    else this.timer.setMode("stopwatch");

    this.updateTimerBtnState("idle");
  }

  updateTimerBtnState(status) {
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
    if (clock) clock.textContent = tickData.formattedTime;
  }

  handleTimerComplete(completeData) {
    alert(`Focus session complete: ${Math.round(completeData.durationSeconds / 60)} minutes logged for ${completeData.topic}.`);
    StorageManager.addSession(completeData);
    this.updateTimerBtnState("idle");
    this.renderSessionHistory();
    this.updateOverview();
  }

  renderSessionHistory() {
    const container = document.getElementById("sessionHistoryTableContainer");
    if (!container) return;

    const sessions = StorageManager.getSessions();
    const analytics = StorageManager.calculateAnalytics();

    const totalElem = document.getElementById("timerTotalRecorded");
    if (totalElem) totalElem.textContent = `${analytics.totalHours}h`;

    if (sessions.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No recorded study sessions yet. Click Start Session to log practice hours.</div>`;
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Category</th>
            <th>Task Topic</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.slice(0, 15).map((s) => `
            <tr>
              <td style="color: var(--text-secondary); font-size: 12px;">${new Date(s.timestamp).toLocaleString()}</td>
              <td><span class="badge" style="background-color: var(--bg-surface-hover);">${s.category}</span></td>
              <td style="font-weight: 500;">${s.topic}</td>
              <td style="color: var(--google-green); font-weight: 500;">${s.durationMinutes} min</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  // --- INDUSTRY NEWS ---
  initIndustryNews() {
    document.getElementById("refreshNewsBtn")?.addEventListener("click", () => this.loadNews(true));

    document.querySelectorAll(".news-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".news-filter-btn").forEach((b) => {
          b.classList.remove("active", "btn-primary");
          b.classList.add("btn-outline");
        });
        btn.classList.add("active", "btn-primary");
        btn.classList.remove("btn-outline");
        const cat = btn.getAttribute("data-cat");
        this.renderNews(cat);
      });
    });

    this.loadNews();
  }

  async loadNews(force = false) {
    const container = document.getElementById("newsListContainer");
    if (container && (!this.cachedNewsItems || force)) {
      container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted);">Fetching Google & AI updates...</div>`;
    }

    try {
      this.cachedNewsItems = await this.newsService.fetchAllNews(force);
      const activeBtn = document.querySelector(".news-filter-btn.active");
      const cat = activeBtn ? activeBtn.getAttribute("data-cat") : "all";
      this.renderNews(cat);
    } catch {
      if (container) container.innerHTML = `<div style="padding: 24px; color: var(--text-muted);">Unable to load feed. Check connection.</div>`;
    }
  }

  renderNews(category = "all") {
    const container = document.getElementById("newsListContainer");
    if (!container || !this.cachedNewsItems) return;

    const filtered = this.cachedNewsItems.filter((i) => category === "all" || i.category === category);

    container.innerHTML = filtered.map((item) => `
      <div class="news-item">
        <div class="news-meta">${item.source} • ${item.pubDate}</div>
        <div class="news-title">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
        </div>
        <div class="news-desc">${item.snippet}</div>
      </div>
    `).join("");
  }

  // --- ADMINISTRATION & SECURITY ---
  initAdminAndSecurity() {
    document.getElementById("changePasskeyForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const current = document.getElementById("currentPasskeyInput")?.value;
      const next = document.getElementById("newPasskeyInput")?.value;

      if (current !== AuthService.getMasterPasskey()) {
        alert("Current master passkey does not match.");
        return;
      }

      if (AuthService.setMasterPasskey(next)) {
        alert("Master passkey updated successfully. Keep this secret.");
        document.getElementById("changePasskeyForm")?.reset();
      }
    });

    document.getElementById("btnGenerateGuestToken")?.addEventListener("click", () => {
      const label = prompt("Enter an identifier for this guest (e.g. Mentor, Friend):", "Guest");
      if (label && label.trim()) {
        const token = AuthService.generateGuestToken(label.trim());
        alert(`New Authorized Access Token Generated:\n\n${token}\n\nShare this token with ${label} to allow them access.`);
        this.renderAdminPanel();
      }
    });

    const settings = StorageManager.getSettings();
    const dailyInput = document.getElementById("dailyTargetHoursInput");
    const careerInput = document.getElementById("careerTargetHoursInput");

    if (dailyInput) dailyInput.value = settings.dailyTargetHours || 4;
    if (careerInput) careerInput.value = settings.careerGoalHours || 300;

    document.getElementById("studyTargetsForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const daily = parseFloat(dailyInput?.value) || 4;
      const career = parseFloat(careerInput?.value) || 300;

      StorageManager.saveSettings({
        ...settings,
        dailyTargetHours: daily,
        careerGoalHours: career
      });

      alert("Study targets saved.");
      this.updateOverview();
    });

    document.getElementById("btnExportBackup")?.addEventListener("click", () => {
      const str = "data:text/json;charset=utf-8," + encodeURIComponent(StorageManager.exportBackup());
      const a = document.createElement("a");
      a.href = str;
      a.download = `workspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    document.getElementById("importBackupInput")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = (ev) => {
        if (StorageManager.importBackup(ev.target.result)) {
          alert("Backup successfully restored.");
          window.location.reload();
        } else {
          alert("Failed to parse backup JSON file.");
        }
      };
      r.readAsText(file);
    });

    this.renderAdminPanel();
  }

  renderAdminPanel() {
    const tokenContainer = document.getElementById("guestTokenListContainer");
    if (tokenContainer) {
      const tokens = AuthService.getGuestTokens();
      if (tokens.length === 0) {
        tokenContainer.innerHTML = `<div style="color: var(--text-muted);">No active guest tokens generated.</div>`;
      } else {
        tokenContainer.innerHTML = `
          <table class="data-table" style="margin-top: 8px;">
            <thead>
              <tr>
                <th>Token</th>
                <th>Label</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${tokens.map((t) => `
                <tr>
                  <td><code>${t.token}</code></td>
                  <td>${t.label}</td>
                  <td style="color: var(--text-muted); font-size: 11px;">${new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button class="btn btn-outline btn-sm btn-revoke" data-token="${t.token}">Revoke</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;

        tokenContainer.querySelectorAll(".btn-revoke").forEach((btn) => {
          btn.addEventListener("click", () => {
            const token = btn.getAttribute("data-token");
            if (confirm(`Revoke access token ${token}?`)) {
              AuthService.revokeGuestToken(token);
              this.renderAdminPanel();
            }
          });
        });
      }
    }

    const reqContainer = document.getElementById("accessRequestsListContainer");
    if (reqContainer) {
      const reqs = AuthService.getAccessRequests();
      if (reqs.length === 0) {
        reqContainer.innerHTML = `<div style="color: var(--text-muted);">No pending access requests.</div>`;
      } else {
        reqContainer.innerHTML = `
          <table class="data-table" style="margin-top: 8px;">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Email</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${reqs.map((r) => `
                <tr>
                  <td style="font-weight: 500;">${r.name}</td>
                  <td style="color: var(--text-secondary);">${r.email}</td>
                  <td style="font-size: 12px;">${r.reason}</td>
                  <td style="color: var(--text-muted); font-size: 11px;">${r.timestamp}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.workspace = new EngineeringWorkspace();
});
