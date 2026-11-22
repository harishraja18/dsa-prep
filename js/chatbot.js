// Google Engineering Prep Assistant - 100% Free & Client-Side Offline Chatbot

import { CodeRunner } from "./codeRunner.js";
import { StorageManager } from "./storage.js";
import { INITIAL_JOB_OPENINGS } from "./data/careerOpenings.js";

export class PrepChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  init() {
    this.renderElements();
    this.bindEvents();
    this.addAssistantMessage(
      "Hello! I am your Google & FAANG Prep Assistant. You can ask me how to allocate your free time today (e.g., 'I have 30 minutes free'), ask for hints on today's DSA challenge, or ask how to invite a friend with scoped access."
    );
  }

  renderElements() {
    // 1. Launcher button
    const launcher = document.createElement("button");
    launcher.id = "chatbotLauncherBtn";
    launcher.className = "chatbot-launcher";
    launcher.setAttribute("aria-label", "Open Prep Assistant");
    launcher.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
      <span>Prep Assistant</span>
    `;
    document.body.appendChild(launcher);

    // 2. Chat window container
    const windowEl = document.createElement("div");
    windowEl.id = "chatbotWindow";
    windowEl.className = "chatbot-window";
    windowEl.style.display = "none";
    windowEl.innerHTML = `
      <div class="chatbot-header">
        <div>
          <div style="font-weight: 500; font-size: 14px;">Google Prep Assistant</div>
          <div style="font-size: 11px; color: var(--text-secondary);">100% Free &bull; Personal Study Coach</div>
        </div>
        <button id="chatbotCloseBtn" class="chatbot-close-btn" title="Close Assistant">&times;</button>
      </div>

      <div class="chatbot-messages" id="chatbotMessagesContainer"></div>

      <div class="chatbot-chips-container" id="chatbotChipsContainer">
        <button class="chatbot-chip" data-query="I have 15 minutes free">15 min free</button>
        <button class="chatbot-chip" data-query="I have 45 minutes travel time">45 min commute</button>
        <button class="chatbot-chip" data-query="I have 1 hour free">1 hour free</button>
        <button class="chatbot-chip" data-query="Hint for today's DSA challenge">Today's DSA hint</button>
        <button class="chatbot-chip" data-query="How to invite a friend">Invite a friend</button>
      </div>

      <form id="chatbotInputForm" class="chatbot-input-row">
        <input type="text" id="chatbotTextInput" class="form-control" placeholder="Ask about free time, DSA hints, or strategy..." autocomplete="off">
        <button type="submit" class="btn btn-primary btn-sm" style="flex-shrink: 0;">Send</button>
      </form>
    `;
    document.body.appendChild(windowEl);
  }

  bindEvents() {
    const launcher = document.getElementById("chatbotLauncherBtn");
    const windowEl = document.getElementById("chatbotWindow");
    const closeBtn = document.getElementById("chatbotCloseBtn");
    const form = document.getElementById("chatbotInputForm");
    const input = document.getElementById("chatbotTextInput");
    const chips = document.querySelectorAll(".chatbot-chip");

    launcher?.addEventListener("click", () => this.toggleWindow(true));
    closeBtn?.addEventListener("click", () => this.toggleWindow(false));

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query");
        if (query) {
          this.handleUserQuery(query);
        }
      });
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input?.value.trim();
      if (!val) return;
      input.value = "";
      this.handleUserQuery(val);
    });
  }

  toggleWindow(open) {
    this.isOpen = open;
    const windowEl = document.getElementById("chatbotWindow");
    if (windowEl) {
      windowEl.style.display = open ? "flex" : "none";
      if (open) {
        document.getElementById("chatbotTextInput")?.focus();
        this.scrollToBottom();
      }
    }
  }

  addMessage(sender, text) {
    const container = document.getElementById("chatbotMessagesContainer");
    if (!container) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `chatbot-msg chatbot-msg-${sender}`;

    // Clean formatting for line breaks and bullet points
    const formatted = text
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>")
      .replace(/\* (.*?)(?=<br>|$)/g, "&bull; $1");

    msgDiv.innerHTML = formatted;
    container.appendChild(msgDiv);
    this.scrollToBottom();
  }

  addUserMessage(text) {
    this.addMessage("user", text);
  }

  addAssistantMessage(text) {
    this.addMessage("assistant", text);
  }

  scrollToBottom() {
    const container = document.getElementById("chatbotMessagesContainer");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  handleUserQuery(rawText) {
    this.addUserMessage(rawText);
    const text = rawText.toLowerCase().trim();

    // Small delay to simulate natural conversational pacing
    setTimeout(() => {
      const response = this.generateResponse(text);
      this.addAssistantMessage(response);
    }, 250);
  }

  generateResponse(text) {
    const analytics = StorageManager.calculateAnalytics();
    const todayChallenge = CodeRunner.getTodayChallenge();

    // 1. Free Time & Study Scheduling Queries
    if (
      text.includes("free") ||
      text.includes("time") ||
      text.includes("schedule") ||
      text.includes("min") ||
      text.includes("hour")
    ) {
      // Extract numeric minutes/hours if provided
      let minutes = 30;
      const hourMatch = text.match(/(\d+)\s*(hour|hr)/);
      const minMatch = text.match(/(\d+)\s*(min|minute)/);

      if (hourMatch) {
        minutes = parseInt(hourMatch[1], 10) * 60;
      } else if (minMatch) {
        minutes = parseInt(minMatch[1], 10);
      }

      if (minutes <= 15) {
        return (
          `If you have ${minutes} minutes free right now, here is the highest-ROI allocation:\n\n` +
          `1. Open the "Problem Solving Guidance" tab and dry-run the 10-step checklist.\n` +
          `2. Read the constraints and edge cases for today's challenge: "${todayChallenge.title}".\n` +
          `3. Write down 3 sample test cases on paper (minimal base case, standard case, adversarial duplicate/negative case).\n\n` +
          `This builds analytical discipline without needing a keyboard!`
        );
      } else if (minutes <= 30) {
        return (
          `With ${minutes} minutes available, here is your target plan:\n\n` +
          `1. Solve today's DSA challenge ("${todayChallenge.title}") in the in-browser Daily DSA editor.\n` +
          `2. Aim for O(${todayChallenge.timeComplexity}) time complexity and write code within 20 minutes.\n` +
          `3. Run the automated test cases to verify correctness.\n\n` +
          `Tip: Always state your Big-O proof before typing code!`
        );
      } else if (minutes <= 60) {
        return (
          `With ${minutes} minutes available (ideal for college bus travel or commute):\n\n` +
          `1. Switch to the "Daily Schedule & Timer" tab.\n` +
          `2. Start the ${minutes}-Min College Commute Preset.\n` +
          `3. Watch the curated Google SWE Mock Interview video embedded right on the page without switching to YouTube.\n` +
          `4. Focus on how the candidate clarifies requirements and verifies bounds before running.`
        );
      } else {
        const hours = (minutes / 60).toFixed(1);
        return (
          `With a deep study block of ${hours} hours:\n\n` +
          `1. Hour 1 (DSA Mastery): Solve 1 Medium/Hard Google question (e.g., "${todayChallenge.title}") and 1 FastPrep OA question.\n` +
          `2. Hour 2 (AI Curriculum): Study 1 core module (e.g., Transformer Self-Attention or Backpropagation math).\n` +
          `3. Start your workspace timer to log these hours toward your daily target (${analytics.dailyTargetHours} hrs target, ${analytics.hoursToday} hrs logged today).`
        );
      }
    }

    // 2. Today's DSA Challenge & Hints
    if (
      text.includes("hint") ||
      text.includes("challenge") ||
      text.includes("today") ||
      text.includes("dsa") ||
      text.includes("problem")
    ) {
      const title = todayChallenge?.title || "Daily DSA Problem";
      const diff = todayChallenge?.difficulty || "Medium";
      const cat = todayChallenge?.category || "Data Structures";
      const comp = todayChallenge?.company || "Google / FAANG";
      const summary = todayChallenge?.description ? todayChallenge.description.split("\n")[0] : "";
      const constraints = todayChallenge?.constraints ? todayChallenge.constraints.split("\n")[0] : "";

      return (
        `Today's Google Challenge is: "${title}" (${diff})\n\n` +
        `Category: ${cat} &bull; Target Frequency: ${comp}\n\n` +
        `Summary: ${summary}\n\n` +
        `Constraints: ${constraints}\n\n` +
        `Strategy:\n` +
        `1. Identify constraints to calculate your Big-O budget (e.g. N <= 10^5 implies O(N) or O(N log N)).\n` +
        `2. Write down 3 sample test cases: minimal base case, standard case, and boundary case.\n` +
        `3. State your O(T) time and O(S) space proof before coding.\n\n` +
        `Open the "Daily DSA" tab to type and run automated tests in the browser editor!`
      );
    }

    // 3. Friend Access & Inviting Others
    if (
      text.includes("friend") ||
      text.includes("invite") ||
      text.includes("guest") ||
      text.includes("token") ||
      text.includes("share") ||
      text.includes("access")
    ) {
      return (
        `To invite a friend or grant someone guest access to your workspace:\n\n` +
        `1. Log into your Administration tab using your owner passkey.\n` +
        `2. In the "Scoped Guest Access Tokens" card, click "Generate New Token".\n` +
        `3. Select their permissions: "Careers Only", "DSA Only", or "Full".\n` +
        `4. Click "Copy Link" to copy their 1-Click direct URL (e.g., https://harishraja18.github.io/dsa-prep/?token=ACC-...).\n` +
        `5. Send this link to your friend on WhatsApp, Telegram, or email.\n\n` +
        `When they tap the link on mobile or desktop, it opens automatically with zero setup required!`
      );
    }

    // 4. FAANG Careers & Job Openings
    if (
      text.includes("job") ||
      text.includes("career") ||
      text.includes("faang") ||
      text.includes("opening") ||
      text.includes("google") ||
      text.includes("india")
    ) {
      const indiaJobs = INITIAL_JOB_OPENINGS.filter((j) => j.region === "India").length;
      return (
        `FAANG & Google Career Directory:\n\n` +
        `&bull; There are currently ${INITIAL_JOB_OPENINGS.length} active curated engineering tracks in the directory (${indiaJobs} located in India: Bengaluru, Hyderabad, Gurugram, Pune).\n` +
        `&bull; Each job opening card links directly to the company's real-time applicant tracking portal (careers.google.com, amazon.jobs, metacareers.com).\n` +
        `&bull; Click "Apply on Official Site" to query their live databases immediately.\n\n` +
        `Check the "Careers & Openings" tab to filter by AI Engineer, ML Engineer, or Software Developer.`
      );
    }

    // 5. FastPrep OA Advice
    if (text.includes("oa") || text.includes("fastprep") || text.includes("assessment")) {
      return (
        `FastPrep OA (Online Assessment) Advice:\n\n` +
        `&bull; Google & Amazon OAs typically give 70-90 minutes for 2 algorithmic problems.\n` +
        `&bull; In the "FastPrep OA" tab, review high-frequency patterns: Sliding Window, Topological Sort, and Tree DP.\n` +
        `&bull; Crucial: OAs run against 20-50 hidden adversarial test cases (empty arrays, max constraint integers, duplicate values). Always check boundaries before final submit!`
      );
    }

    // 6. General Strategy / Default
    return (
      `Here is how to make the most of your preparation workspace:\n\n` +
      `&bull; Free Time Optimizer: Type "I have 20 min free" or "1 hour free" for instant task allocation.\n` +
      `&bull; Today's Challenge: Type "today's hint" to get guidance for "${todayChallenge.title}".\n` +
      `&bull; College Commute: Use the 45-min or 60-min timer and watch mock interviews in-page.\n` +
      `&bull; Invite Friends: Type "how to invite a friend" for scoped token instructions.\n\n` +
      `What would you like to focus on right now?`
    );
  }
}
