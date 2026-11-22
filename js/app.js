// Google Engineering Workspace - Unified Application Controller

import { DSA_TOPICS, DEFAULT_PROBLEM_STEPS } from "./data/dsaRoadmap.js";
import { AI_MODULES, DEFAULT_AI_STEPS } from "./data/aiRoadmap.js";
import { INITIAL_JOB_OPENINGS } from "./data/careerOpenings.js";
import { FASTPREP_OA_QUESTIONS } from "./data/fastprepOA.js";
import { DAILY_CHALLENGES, CodeRunner } from "./codeRunner.js";
import { StorageManager } from "./storage.js";
import { StudyTimer } from "./timer.js";
import { NewsService } from "./newsService.js";
import { AuthService } from "./auth.js";
import { ContestService } from "./contestService.js";
import { DailyPlanner } from "./dailyPlanner.js";
import { PrepChatbot } from "./chatbot.js";

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
    this.currentDailyChallenge = CodeRunner.getTodayChallenge();
    this.currentDailyLanguage = "javascript";

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
    this.initDailyDsaEditor();
    this.initCareersPortal();
    this.initFastprepArchive();
    this.initProblemSolvingGuidanceChecklist();
    this.initDsaDirectory();
    this.initAiCurriculum();
    this.initTimerControls();
    this.initIndustryNews();
    this.initAdminAndSecurity();
    this.chatbot = new PrepChatbot();
  }

  // --- AUTHENTICATION & SCOPES ---
  initAuth() {
    const authWall = document.getElementById("authWall");
    const loginForm = document.getElementById("authLoginForm");
    const passkeyInput = document.getElementById("authPasskeyInput");
    const errorMsg = document.getElementById("authErrorMessage");
    const userLabel = document.getElementById("headerUserLabel");
    const logoutBtn = document.getElementById("headerLogoutBtn");

    const enforcePermissions = () => {
      const user = AuthService.getCurrentUser();
      if (!user) return;

      const navButtons = document.querySelectorAll(".nav-tab-btn");
      if (user.role === "guest" && user.scope && user.scope !== "full") {
        navButtons.forEach((btn) => {
          const tab = btn.getAttribute("data-tab");
          if (user.scope === "careers_only") {
            const allowed = tab === "careers" || tab === "overview";
            btn.style.display = allowed ? "inline-flex" : "none";
          } else if (user.scope === "dsa_only") {
            const allowed = tab === "daily-dsa" || tab === "guide" || tab === "dsa" || tab === "overview";
            btn.style.display = allowed ? "inline-flex" : "none";
          } else if (user.scope === "ai_only") {
            const allowed = tab === "ai" || tab === "overview";
            btn.style.display = allowed ? "inline-flex" : "none";
          }
        });

        // Hide admin tab for guests
        document.querySelector('.nav-tab-btn[data-tab="admin"]')?.setAttribute("style", "display: none !important;");

        if (user.scope === "careers_only") this.switchTab("careers");
        else if (user.scope === "dsa_only") this.switchTab("daily-dsa");
        else if (user.scope === "ai_only") this.switchTab("ai");
      } else {
        navButtons.forEach((btn) => btn.style.display = "inline-flex");
      }
    };

    const checkAuthStatus = () => {
      if (AuthService.isAuthenticated()) {
        if (authWall) authWall.style.display = "none";
        const user = AuthService.getCurrentUser();
        if (userLabel) {
          userLabel.textContent = user && user.role === "owner" ? "Harishraja (Owner)" : `Guest (${user?.label || "Authorized"})`;
        }
        enforcePermissions();
      } else {
        if (authWall) authWall.style.display = "flex";
      }
    };

    // Auto-login via URL Magic Link: ?token=ACC-... or ?passkey=google2026 or ?access=...
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const autoKey = urlParams.get("token") || urlParams.get("access") || urlParams.get("passkey");
      if (autoKey) {
        const res = AuthService.authenticate(autoKey);
        if (res.success) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    } catch {
      // Quietly ignore URL search errors
    }

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
    document.getElementById("openRequestAccessBtn")?.addEventListener("click", () => {
      reqModal?.classList.add("open");
      document.getElementById("reqName")?.focus();
    });
    document.getElementById("closeRequestAccessBtn")?.addEventListener("click", () => reqModal?.classList.remove("open"));
    document.getElementById("cancelRequestAccessBtn")?.addEventListener("click", () => reqModal?.classList.remove("open"));
    reqModal?.addEventListener("click", (e) => {
      if (e.target === reqModal) reqModal.classList.remove("open");
    });

    document.getElementById("requestAccessForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reqName")?.value.trim();
      const email = document.getElementById("reqEmail")?.value.trim();
      const targetRole = document.getElementById("reqTargetRole")?.value || "Software Developer";
      const targetCompany = document.getElementById("reqTargetCompany")?.value || "Google";
      const scope = document.getElementById("reqScope")?.value || "careers_only";
      const reason = document.getElementById("reqReason")?.value.trim();

      AuthService.submitRegistration({
        name,
        email,
        targetRole,
        targetCompany,
        requestedScope: scope,
        goals: reason
      });

      StorageManager.logPeerActivity(`New candidate registration submitted by ${name} (${targetRole})`, "Registration");

      const successNotice = document.getElementById("authSuccessNotice");
      const successText = document.getElementById("authSuccessNoticeText");
      if (successNotice && successText) {
        successText.textContent = `Thank you, ${name}! Your registration for ${targetRole} (${scope}) has been queued for Harishraja's approval.`;
        successNotice.style.display = "block";
      }

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
    document.getElementById("btnGoToDailyDsa")?.addEventListener("click", () => this.switchTab("daily-dsa"));
    document.getElementById("btnGoToCareers")?.addEventListener("click", () => this.switchTab("careers"));
    document.getElementById("btnGoToFastprep")?.addEventListener("click", () => this.switchTab("fastprep"));

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
    if (tabId === "daily-dsa") this.renderDailyDsaChallenge();
    if (tabId === "careers") this.renderJobOpenings();
    if (tabId === "fastprep") this.renderFastprepQuestions();
    if (tabId === "dsa") this.renderDsaTable();
    if (tabId === "ai") this.renderAiTable();
    if (tabId === "timer") this.renderSessionHistory();
    if (tabId === "news") this.loadNews();
    if (tabId === "admin") this.renderAdminPanel();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- OVERVIEW ---
  initOverview() {
    this.updateOverview();

    document.getElementById("peerChatForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("peerChatInput");
      const tag = document.getElementById("peerChatTagSelect")?.value || "Study Update";
      const val = input?.value.trim();
      if (!val) return;
      StorageManager.postPeerChatMessage(val, tag);
      StorageManager.logPeerActivity(`Posted update: "${val.slice(0, 35)}..."`, tag);
      input.value = "";
      this.renderPeerRoom();
    });
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

    this.renderPeerRoom();
  }

  renderPeerRoom() {
    const chatContainer = document.getElementById("peerChatMessagesList");
    const actContainer = document.getElementById("peerActivityStreamList");

    if (chatContainer) {
      const msgs = StorageManager.getPeerChatMessages();
      chatContainer.innerHTML = msgs.map((m) => `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
            <span style="font-weight: 500; font-size: 12px; color: ${m.role === 'owner' ? 'var(--google-blue)' : 'var(--text-primary)'};">${m.userName}</span>
            <span style="font-size: 10px; color: var(--text-muted);">${m.timestamp}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-primary); margin-bottom: 4px;">${m.message}</div>
          <span class="badge" style="background-color: var(--bg-surface-hover); color: var(--text-secondary); font-size: 10px; padding: 1px 6px;">${m.tag}</span>
        </div>
      `).join("");
    }

    if (actContainer) {
      const acts = StorageManager.getPeerActivities();
      actContainer.innerHTML = acts.map((a) => `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <div style="font-size: 12px;">
            <span style="font-weight: 500;">${a.userName}:</span>
            <span style="color: var(--text-secondary);">${a.action}</span>
          </div>
          <div style="font-size: 10px; color: var(--text-muted); white-space: nowrap;">${a.timestamp}</div>
        </div>
      `).join("");
    }
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
        
        const focusAttr = chip.getAttribute("data-focus");
        if (focusAttr) {
          const select = document.getElementById("plannerFocusSelect");
          if (select) select.value = focusAttr;
        }
      });
    });

    document.getElementById("btnGeneratePlan")?.addEventListener("click", () => {
      const focus = document.getElementById("plannerFocusSelect")?.value || "balanced";
      const plan = DailyPlanner.generateSchedule(this.selectedPlannerMinutes, focus);
      this.renderDailyPlan(plan);
    });

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

    if (plan.items.length === 0) {
      container.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted);">No remaining tasks for today. Click "Generate Today's Schedule" to plan new focus blocks!</div>`;
      return;
    }

    container.innerHTML = plan.items.map((item, idx) => `
      <div class="planner-item-card ${item.completed ? "completed" : ""}" data-id="${item.id}">
        <div style="display: flex; gap: 12px; align-items: flex-start; flex: 1;">
          <input type="checkbox" class="todo-checkbox planner-task-check" data-idx="${idx}" ${item.completed ? "checked" : ""}>
          <div style="flex: 1;">
            <div style="display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap;">
              <span class="badge" style="background-color: var(--google-blue-surface); color: var(--google-blue);">${item.timeBox}</span>
              <span style="font-weight: 500; font-size: 14px; ${item.completed ? "text-decoration: line-through; color: var(--text-muted);" : ""}">${item.title}</span>
              <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">[${item.category}]</span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">${item.description}</p>
            
            ${item.isCommuteVideo && item.youtubeId ? `
              <!-- Embedded In-Page Video Player for Travel / Commute Mode -->
              <div class="commute-video-wrapper">
                <iframe src="https://www.youtube-nocookie.com/embed/${item.youtubeId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="${item.title}"></iframe>
              </div>
            ` : ""}
          </div>
        </div>
        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm btn-start-planner-timer" data-title="${encodeURIComponent(item.title)}" data-mins="${item.durationMinutes}">
            Start Timer
          </button>
          <button class="btn btn-outline btn-sm btn-delete-plan-item" data-id="${item.id}" title="Remove task from today's plan" style="color: var(--google-red);">
            &times;
          </button>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".planner-task-check").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const idx = parseInt(cb.getAttribute("data-idx"), 10);
        plan.items[idx].completed = cb.checked;
        DailyPlanner.saveTodayPlan(plan);
        this.renderDailyPlan(plan);
      });
    });

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

    container.querySelectorAll(".btn-delete-plan-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const updated = DailyPlanner.deletePlanItem(id);
        if (updated) this.renderDailyPlan(updated);
      });
    });
  }

  // --- CONTEST HUB ---
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
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-sm); flex-wrap: wrap; gap: 8px;">
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

  // --- DAILY DSA CODE TEXT EDITOR & VERIFICATION ---
  initDailyDsaEditor() {
    const challengeSelect = document.getElementById("dailyDsaChallengeSelect");
    if (challengeSelect) {
      challengeSelect.innerHTML = DAILY_CHALLENGES.map((c) => `
        <option value="${c.id}">${c.title} (${c.difficulty})</option>
      `).join("");

      challengeSelect.addEventListener("change", (e) => {
        const id = e.target.value;
        const found = DAILY_CHALLENGES.find((c) => c.id === id);
        if (found) {
          this.currentDailyChallenge = found;
          this.renderDailyDsaChallenge();
        }
      });
    }

    document.getElementById("btnNextChallenge")?.addEventListener("click", () => {
      const idx = DAILY_CHALLENGES.findIndex((c) => c.id === this.currentDailyChallenge.id);
      const nextIdx = (idx + 1) % DAILY_CHALLENGES.length;
      this.currentDailyChallenge = DAILY_CHALLENGES[nextIdx];
      if (challengeSelect) challengeSelect.value = this.currentDailyChallenge.id;
      this.renderDailyDsaChallenge();
    });

    const langSelect = document.getElementById("codeEditorLanguage");
    langSelect?.addEventListener("change", (e) => {
      this.currentDailyLanguage = e.target.value;
      this.resetDailyStarterCode();
    });

    const textarea = document.getElementById("codeEditorTextarea");
    textarea?.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }
    });

    document.getElementById("btnResetCode")?.addEventListener("click", () => {
      if (confirm("Reset code editor to starter template?")) {
        this.resetDailyStarterCode();
      }
    });

    document.getElementById("btnRunCode")?.addEventListener("click", () => {
      this.runDailyDsaVerification();
    });

    this.renderDailyDsaChallenge();
  }

  renderDailyDsaChallenge() {
    const c = this.currentDailyChallenge;
    if (!c) return;

    document.getElementById("dailyDsaHeading").textContent = `Today's DSA Problem: ${c.title}`;
    document.getElementById("dailyDsaDifficulty").textContent = c.difficulty;
    document.getElementById("dailyDsaDifficulty").className = `badge ${c.difficulty === "Easy" ? "badge-easy" : c.difficulty === "Medium" ? "badge-medium" : "badge-hard"}`;
    document.getElementById("dailyDsaCategory").textContent = c.category;
    document.getElementById("dailyDsaCompany").textContent = c.company;
    document.getElementById("dailyDsaDescription").textContent = c.description;
    document.getElementById("dailyDsaConstraints").textContent = c.constraints;

    this.resetDailyStarterCode();
  }

  resetDailyStarterCode() {
    const c = this.currentDailyChallenge;
    const lang = this.currentDailyLanguage;
    const textarea = document.getElementById("codeEditorTextarea");
    if (textarea && c && c.starterCode) {
      textarea.value = c.starterCode[lang] || c.starterCode["javascript"];
    }
    const resultsBox = document.getElementById("codeResultsBox");
    if (resultsBox) resultsBox.style.display = "none";
  }

  runDailyDsaVerification() {
    const textarea = document.getElementById("codeEditorTextarea");
    const resultsBox = document.getElementById("codeResultsBox");
    const summary = document.getElementById("codeResultsSummary");
    const details = document.getElementById("codeResultsDetails");

    if (!textarea || !resultsBox || !summary || !details) return;

    const userCode = textarea.value;
    const res = CodeRunner.runTests(this.currentDailyChallenge, this.currentDailyLanguage, userCode);

    StorageManager.logPeerActivity(
      `${res.success ? "Solved" : "Tested"} "${this.currentDailyChallenge.title}" (${res.passedCount}/${res.totalCount} passed)`,
      "Daily DSA"
    );

    resultsBox.style.display = "block";

    if (res.error) {
      summary.style.color = "var(--google-red)";
      summary.textContent = "Evaluation Error";
      details.innerHTML = `<div style="color: var(--google-red);">${res.error}</div>`;
      return;
    }

    if (res.success) {
      summary.style.color = "var(--google-green)";
      summary.textContent = `ACCEPTED: ${res.passedCount} / ${res.totalCount} Test Cases Passed!`;

      const problems = StorageManager.getDSAProblems();
      const match = problems.find((p) => p.title.toLowerCase() === this.currentDailyChallenge.title.toLowerCase());
      if (match) {
        match.status = "mastered";
        match.notes = `Solved in code editor (${this.currentDailyLanguage}):\n\n` + userCode;
        match.solvedAt = Date.now();
        StorageManager.saveDSAProblems(problems);
        this.updateOverview();
      }
    } else {
      summary.style.color = "var(--google-red)";
      summary.textContent = `FAILED: ${res.passedCount} / ${res.totalCount} Test Cases Passed`;
    }

    details.innerHTML = res.results.map((r) => `
      <div style="padding: 8px 0; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-weight: 700; color: ${r.passed ? "var(--google-green)" : "var(--google-red)"};">
            Test Case ${r.testCaseIndex}: ${r.passed ? "PASSED" : "FAILED"}
          </span>
          <div style="color: var(--text-secondary); margin-top: 2px;">Input: <code>${r.input}</code></div>
          <div style="color: var(--text-secondary);">Expected: <code>${r.expected}</code></div>
          <div style="color: var(--text-primary);">Your Output: <code>${r.actual}</code></div>
        </div>
        <div style="font-size: 11px; color: var(--text-muted);">${r.runtimeMs} ms</div>
      </div>
    `).join("");
  }

  // --- FAANG & GOOGLE JOB OPENINGS ---
  initCareersPortal() {
    document.getElementById("jobsSearchInput")?.addEventListener("input", () => this.renderJobOpenings());
    document.getElementById("jobsCompanyFilter")?.addEventListener("change", () => this.renderJobOpenings());
    document.getElementById("jobsRoleFilter")?.addEventListener("change", () => this.renderJobOpenings());
    document.getElementById("jobsLocationFilter")?.addEventListener("change", () => this.renderJobOpenings());

    this.renderJobOpenings();
  }

  renderJobOpenings() {
    const container = document.getElementById("jobsGridContainer");
    const countElem = document.getElementById("totalJobsCount");
    if (!container) return;

    const query = (document.getElementById("jobsSearchInput")?.value || "").toLowerCase().trim();
    const companyFilter = document.getElementById("jobsCompanyFilter")?.value || "all";
    const roleFilter = document.getElementById("jobsRoleFilter")?.value || "all";
    const locationFilter = document.getElementById("jobsLocationFilter")?.value || "all";

    const filtered = INITIAL_JOB_OPENINGS.filter((j) => {
      if (companyFilter === "google_only" && !j.isGoogle) return false;
      if (companyFilter !== "all" && companyFilter !== "google_only" && j.company !== companyFilter) return false;
      if (roleFilter !== "all" && j.roleCategory !== roleFilter) return false;
      if (locationFilter === "India" && j.region !== "India") return false;
      if (locationFilter === "Global" && j.region !== "Global") return false;

      if (query) {
        const matchTitle = j.title.toLowerCase().includes(query);
        const matchComp = j.company.toLowerCase().includes(query);
        const matchLoc = j.location.toLowerCase().includes(query);
        const matchDesc = j.description.toLowerCase().includes(query);
        if (!matchTitle && !matchComp && !matchLoc && !matchDesc) return false;
      }
      return true;
    });

    if (countElem) countElem.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 32px;">No matching job openings found for selected criteria.</div>`;
      return;
    }

    container.innerHTML = filtered.map((job) => `
      <div class="job-card ${job.isGoogle ? "google-job" : ""}">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
            <span class="job-company">${job.company} &bull; ${job.team}</span>
            <span class="badge" style="background-color: var(--bg-surface-hover); color: var(--text-secondary); border: 1px solid var(--border-color);">${job.roleCategory}</span>
          </div>

          <h3 class="job-title">${job.title}</h3>

          <div class="job-meta" style="margin-bottom: 8px;">
            <span>Location: ${job.location}</span>
            <span style="color: var(--border-color); margin: 0 4px;">&bull;</span>
            <span>Experience: ${job.experienceLevel}</span>
          </div>

          ${job.applyPriority ? `
            <div style="margin-bottom: 10px;">
              <span class="badge" style="background-color: var(--bg-surface-hover); color: var(--text-primary); border: 1px solid var(--border-color); font-weight: 500;">
                Priority: ${job.applyPriority}
              </span>
            </div>
          ` : ""}

          <p class="job-desc">${job.description}</p>

          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; background-color: var(--bg-surface-hover); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <strong>Requirements:</strong> ${job.qualifications}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
          <span style="font-size: 11px; color: var(--text-muted);">${job.sourcePortal}</span>
          <a href="${job.applyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
            Apply on Official Site &rarr;
          </a>
        </div>
      </div>
    `).join("");
  }

  // --- FASTPREP OA ARCHIVE ---
  initFastprepArchive() {
    document.getElementById("fastprepCompanyFilter")?.addEventListener("change", () => this.renderFastprepQuestions());
    this.renderFastprepQuestions();
  }

  renderFastprepQuestions() {
    const container = document.getElementById("fastprepContainer");
    if (!container) return;

    const companyFilter = document.getElementById("fastprepCompanyFilter")?.value || "all";
    const filtered = FASTPREP_OA_QUESTIONS.filter((q) => {
      if (companyFilter !== "all" && q.company !== companyFilter) return false;
      return true;
    });

    container.innerHTML = filtered.map((oa) => `
      <div class="oa-card">
        <div class="oa-card-header">
          <div>
            <span class="badge" style="background-color: var(--google-blue-surface); color: var(--google-blue); font-weight: 700;">${oa.company} OA</span>
            <span class="badge" style="background-color: var(--bg-surface-hover); margin-left: 6px;">${oa.round}</span>
            <span class="badge badge-${oa.difficulty.includes("Hard") ? "hard" : "medium"}" style="margin-left: 6px;">${oa.difficulty}</span>
          </div>
          <span style="font-size: 12px; font-weight: 600; color: var(--google-green);">${oa.frequency}</span>
        </div>

        <h3 style="font-size: 17px; font-weight: 500; margin-bottom: 8px;">${oa.title}</h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">${oa.description}</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background-color: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 12px; font-size: 12.5px;" class="split-2col">
          <div>
            <strong style="color: var(--google-blue);">Optimal Pattern:</strong>
            <div style="color: var(--text-primary); margin-top: 2px;">${oa.pattern}</div>
          </div>
          <div>
            <strong style="color: var(--text-secondary);">Complexities:</strong>
            <div style="color: var(--text-primary); margin-top: 2px;">Time: <code>${oa.timeComp}</code> | Space: <code>${oa.spaceComp}</code></div>
          </div>
        </div>

        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
          <strong>Approach:</strong> ${oa.approach}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 12px; flex-wrap: wrap; gap: 8px;">
          <span style="color: var(--text-muted);">Sample: <code>${oa.sampleInput}</code> &rarr; <strong>${oa.expectedOutput}</strong></span>
          <a href="${oa.leetcodeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
            Practice Equivalent on LeetCode &rarr;
          </a>
        </div>
      </div>
    `).join("");
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
    const mins = Math.max(1, Math.round(completeData.durationSeconds / 60));
    alert(`Focus session complete: ${mins} minutes logged for ${completeData.topic}.`);
    StorageManager.addSession(completeData);
    StorageManager.logPeerActivity(`Completed ${mins}-min focus session (${completeData.topic})`, completeData.category || "Study Timer");
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

    const genModal = document.getElementById("generateTokenModal");
    const closeGenModal = () => {
      genModal?.classList.remove("open");
      const resContainer = document.getElementById("genTokenResultContainer");
      if (resContainer) resContainer.style.display = "none";
      document.getElementById("genTokenForm")?.reset();
    };

    document.getElementById("btnGenerateGuestToken")?.addEventListener("click", () => {
      const resContainer = document.getElementById("genTokenResultContainer");
      if (resContainer) resContainer.style.display = "none";
      genModal?.classList.add("open");
    });
    document.getElementById("closeGenTokenBtn")?.addEventListener("click", closeGenModal);
    document.getElementById("cancelGenTokenBtn")?.addEventListener("click", closeGenModal);

    document.getElementById("genTokenForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const label = document.getElementById("tokenGuestLabel")?.value.trim() || "Guest";
      const scope = document.getElementById("tokenScopeSelect")?.value || "full";

      const token = AuthService.generateGuestToken(label, scope);
      const origin = window.location.origin + window.location.pathname;
      const magicLink = `${origin}?token=${token}`;

      const resContainer = document.getElementById("genTokenResultContainer");
      const tokenDisplay = document.getElementById("genTokenDisplay");
      const linkDisplay = document.getElementById("genLinkDisplay");

      if (tokenDisplay) tokenDisplay.value = token;
      if (linkDisplay) linkDisplay.value = magicLink;
      if (resContainer) resContainer.style.display = "block";

      this.renderAdminPanel();
    });

    document.getElementById("copyTokenOnlyBtn")?.addEventListener("click", () => {
      const val = document.getElementById("genTokenDisplay")?.value;
      if (val) {
        navigator.clipboard.writeText(val).then(() => {
          alert(`Copied token to clipboard:\n${val}`);
        });
      }
    });

    document.getElementById("copyMagicLinkBtn")?.addEventListener("click", () => {
      const val = document.getElementById("genLinkDisplay")?.value;
      if (val) {
        navigator.clipboard.writeText(val).then(() => {
          alert(`Copied 1-Click Login Link to clipboard:\n${val}\n\nSend this link to your phone or guest!`);
        });
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
        tokenContainer.innerHTML = `<div style="color: var(--text-muted); padding: 8px 0;">No active guest tokens generated.</div>`;
      } else {
        tokenContainer.innerHTML = `
          <div class="table-container" style="width: 100%; overflow-x: auto; margin-top: 8px;">
            <table class="data-table" style="min-width: 480px; width: 100%;">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Label</th>
                  <th>Permission Scope</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${tokens.map((t) => `
                  <tr>
                    <td><code>${t.token}</code></td>
                    <td>${t.label}</td>
                    <td><span class="badge" style="background-color: var(--bg-surface-hover); color: var(--text-secondary); border: 1px solid var(--border-color);">${t.scope || "full"}</span></td>
                    <td style="color: var(--text-muted); font-size: 11px;">${new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style="display: flex; gap: 6px; flex-wrap: wrap;">
                      <button class="btn btn-outline btn-sm btn-copy-link" data-token="${t.token}">Copy Link</button>
                      <button class="btn btn-outline btn-sm btn-revoke" data-token="${t.token}">Revoke</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `;

        tokenContainer.querySelectorAll(".btn-copy-link").forEach((btn) => {
          btn.addEventListener("click", () => {
            const token = btn.getAttribute("data-token");
            const origin = window.location.origin + window.location.pathname;
            const magicLink = `${origin}?token=${token}`;
            navigator.clipboard.writeText(magicLink).then(() => {
              btn.textContent = "Copied!";
              setTimeout(() => { btn.textContent = "Copy Link"; }, 2000);
            });
          });
        });

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
        reqContainer.innerHTML = `<div style="color: var(--text-muted); padding: 8px 0;">No pending access requests.</div>`;
      } else {
        reqContainer.innerHTML = `
          <div class="table-container" style="width: 100%; overflow-x: auto; margin-top: 8px;">
            <table class="data-table" style="min-width: 580px; width: 100%;">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Email & Target</th>
                  <th>Permission Scope</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${reqs.map((r) => {
                  let statusBadge = `<span class="badge" style="background-color: var(--bg-surface-hover); color: var(--text-secondary); border: 1px solid var(--border-color);">Pending</span>`;
                  if (r.status === "approved") {
                    statusBadge = `<span class="badge" style="background-color: var(--google-green-surface); color: var(--google-green); font-weight: 500;">Approved</span>`;
                  } else if (r.status === "rejected") {
                    statusBadge = `<span class="badge" style="background-color: var(--google-red-surface); color: var(--google-red);">Rejected</span>`;
                  }

                  let actionBtns = "";
                  if (r.status === "pending") {
                    actionBtns = `
                      <button class="btn btn-primary btn-sm btn-approve-req" data-id="${r.id}">Approve</button>
                      <button class="btn btn-outline btn-sm btn-reject-req" data-id="${r.id}">Reject</button>
                    `;
                  } else if (r.status === "approved" && r.approvedToken) {
                    actionBtns = `
                      <button class="btn btn-outline btn-sm btn-copy-req-link" data-token="${r.approvedToken}">Copy Link</button>
                    `;
                  } else {
                    actionBtns = `<span style="font-size: 11px; color: var(--text-muted);">None</span>`;
                  }

                  return `
                    <tr>
                      <td>
                        <div style="font-weight: 500;">${r.name}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">${r.reason || ""}</div>
                      </td>
                      <td style="color: var(--text-secondary); font-size: 12px;">
                        <div>${r.email}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">${r.targetRole || "SWE"} &bull; ${r.targetCompany || "Google"}</div>
                      </td>
                      <td>
                        <span class="badge" style="background-color: var(--bg-surface-hover); color: var(--text-primary); border: 1px solid var(--border-color);">${r.requestedScope || "careers_only"}</span>
                      </td>
                      <td>${statusBadge}</td>
                      <td style="display: flex; gap: 6px; flex-wrap: wrap;">
                        ${actionBtns}
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        `;

        reqContainer.querySelectorAll(".btn-approve-req").forEach((btn) => {
          btn.addEventListener("click", () => {
            const reqId = btn.getAttribute("data-id");
            const res = AuthService.approveRegistration(reqId);
            if (res) {
              const origin = window.location.origin + window.location.pathname;
              const magicLink = `${origin}?token=${res.token}`;
              navigator.clipboard.writeText(magicLink);
              alert(
                `Access Approved for ${res.name}!\n\n` +
                `Permission Scope: ${res.scope}\n` +
                `Generated Token: ${res.token}\n` +
                `Direct 1-Click Link: ${magicLink}\n\n` +
                `The link has been copied to your clipboard. Send it to ${res.name}!`
              );
              this.renderAdminPanel();
            }
          });
        });

        reqContainer.querySelectorAll(".btn-reject-req").forEach((btn) => {
          btn.addEventListener("click", () => {
            const reqId = btn.getAttribute("data-id");
            if (confirm("Reject this access request?")) {
              AuthService.rejectRegistration(reqId);
              this.renderAdminPanel();
            }
          });
        });

        reqContainer.querySelectorAll(".btn-copy-req-link").forEach((btn) => {
          btn.addEventListener("click", () => {
            const token = btn.getAttribute("data-token");
            const origin = window.location.origin + window.location.pathname;
            const magicLink = `${origin}?token=${token}`;
            navigator.clipboard.writeText(magicLink).then(() => {
              btn.textContent = "Copied!";
              setTimeout(() => { btn.textContent = "Copy Link"; }, 2000);
            });
          });
        });
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.workspace = new EngineeringWorkspace();
});
