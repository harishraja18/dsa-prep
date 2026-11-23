// Real-time Collaborative Google & FAANG Mock Interview Room (Google Docs style)
// 100% Free, zero-backend, runs on GitHub Pages via WebRTC DataChannel + Real-Time SSE Cloud Relay + BroadcastChannel

export class CollaborativeInterviewRoom {
  constructor(options = {}) {
    this.containerId = options.containerId || "collaborativeInterviewContainer";
    this.roomId = null;
    this.role = "candidate"; // 'candidate' | 'interviewer'
    this.userName = "Harish Raja";
    this.peer = null;
    this.conn = null;
    this.broadcastChannel = null;
    this.eventSource = null;
    this.isLocalUpdate = false;
    this.connectedPeersCount = 0;
    this.activeQuestion = null;
    this.remoteUserLabel = "Peer";
    this.currentLanguage = "javascript";
    this.debounceTimer = null;
    this.customProblems = this.loadCustomProblems();

    // Synchronized 45-minute Google technical interview timer
    this.interviewTimerSeconds = 45 * 60;
    this.timerStatus = "idle"; // 'idle' | 'running' | 'paused'
    this.timerInterval = null;
    this.timerStartTime = null;
  }

  // Load custom user-created problems from localStorage
  loadCustomProblems() {
    try {
      const data = localStorage.getItem("custom_interview_problems");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCustomProblem(problem) {
    try {
      this.customProblems.unshift(problem);
      localStorage.setItem("custom_interview_problems", JSON.stringify(this.customProblems));
    } catch {}
  }

  // Generate clean room ID: e.g. goog-mock-8291
  generateRoomId() {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `goog-mock-${randomHex}`;
  }

  // Join or Create Room
  joinRoom(roomId, role = "candidate", userName = "Harish Raja") {
    this.roomId = (roomId || this.generateRoomId()).trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    this.role = role;
    this.userName = userName || (role === "candidate" ? "Candidate" : "Interviewer");

    this.initBroadcastChannel();
    this.initEventSourceStreaming();
    this.initDeterministicPeerJS();
    this.renderRoomUI();

    // Broadcast join announcement across all channels
    setTimeout(() => {
      this.broadcast({
        type: "PEER_JOIN",
        userName: this.userName,
        role: this.role,
        timestamp: Date.now()
      });
    }, 500);
  }

  // Multi-tab sync on same device (0ms latency native browser IPC)
  initBroadcastChannel() {
    try {
      if (this.broadcastChannel) this.broadcastChannel.close();
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        this.broadcastChannel = new BroadcastChannel(`interview_sync_${this.roomId}`);
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.roomId === this.roomId) {
            this.handleRemoteMessage(e.data);
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel initialization notice:", e);
    }
  }

  // Real-time Cloud Streaming via Server-Sent Events (SSE)
  // Keeps an open HTTP stream so updates are pushed instantly (<50ms) across different devices & networks!
  initEventSourceStreaming() {
    try {
      if (this.eventSource) this.eventSource.close();
      const topic = `goog_dsa_interview_${this.roomId}`;
      this.eventSource = new EventSource(`https://ntfy.sh/${topic}/sse`);

      this.eventSource.onmessage = (e) => {
        try {
          const item = JSON.parse(e.data);
          if (item && item.message) {
            const payload = JSON.parse(item.message);
            if (payload.senderRole !== this.role && payload.roomId === this.roomId) {
              this.handleRemoteMessage(payload);
            }
          }
        } catch {}
      };

      this.eventSource.onerror = () => {
        // SSE will automatically reconnect in the background
      };
    } catch (e) {
      console.warn("SSE init notice:", e);
    }
  }

  // Deterministic PeerJS WebRTC Connection
  // Candidate PeerID: <roomId>-cand
  // Interviewer PeerID: <roomId>-int
  initDeterministicPeerJS() {
    if (typeof window === "undefined" || !window.Peer) return;

    try {
      if (this.peer) this.peer.destroy();

      const rolePrefix = this.role === "candidate" ? "cand" : "int";
      const targetRolePrefix = this.role === "candidate" ? "int" : "cand";
      const myPeerId = `${this.roomId}-${rolePrefix}`;
      const targetPeerId = `${this.roomId}-${targetRolePrefix}`;

      this.peer = new window.Peer(myPeerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" }
          ]
        }
      });

      this.peer.on("open", () => {
        this.updateConnectionBadge("Live Signaling Ready", true);

        // Attempt connection to the other role with retry
        let attempts = 0;
        const connectInterval = setInterval(() => {
          if (this.conn && this.conn.open) {
            clearInterval(connectInterval);
            return;
          }
          if (attempts > 15) {
            clearInterval(connectInterval);
            return;
          }
          attempts++;
          try {
            const conn = this.peer.connect(targetPeerId, { reliable: true });
            if (conn) {
              conn.on("open", () => {
                clearInterval(connectInterval);
                this.setupDataConnection(conn);
              });
            }
          } catch {}
        }, 2000);
      });

      this.peer.on("connection", (conn) => {
        this.setupDataConnection(conn);
      });

      this.peer.on("error", (err) => {
        // Fallback SSE and BroadcastChannel handle communication seamlessly
        console.log("PeerJS notice (Cloud SSE Fallback active):", err?.type || err);
      });
    } catch (e) {
      console.warn("PeerJS exception (Cloud SSE active):", e);
    }
  }

  setupDataConnection(conn) {
    this.conn = conn;
    this.connectedPeersCount = 1;
    this.updateConnectionBadge("Direct WebRTC Live Sync", true);

    this.conn.on("data", (data) => {
      this.handleRemoteMessage(data);
    });

    this.conn.on("close", () => {
      this.conn = null;
      this.updateConnectionBadge("Cloud Live Sync Active", true);
    });

    // Send initial sync
    this.syncCurrentStateToPeer();
  }

  // Unified broadcast: WebRTC + SSE Cloud Relay + BroadcastChannel
  broadcast(payload) {
    payload.roomId = this.roomId;
    payload.senderRole = this.role;
    payload.senderName = this.userName;
    payload.timestamp = Date.now();

    // 1. Direct WebRTC DataChannel
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch {}
    }

    // 2. BroadcastChannel (Same-device multi-tab testing)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {}
    }

    // 3. Cloud SSE Relay via ntfy.sh
    try {
      const topic = `goog_dsa_interview_${this.roomId}`;
      fetch(`https://ntfy.sh/${topic}`, {
        method: "POST",
        headers: { "Priority": "min" },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch {}
  }

  handleRemoteMessage(data) {
    if (!data || data.senderRole === this.role) return;

    if (data.type === "PEER_JOIN") {
      this.connectedPeersCount = 1;
      this.remoteUserLabel = `${data.userName} (${data.role === "interviewer" ? "Interviewer" : "Candidate"})`;
      this.updateConnectionBadge(`${this.remoteUserLabel} Live`, true);
      this.showLiveToast(`${data.userName} joined the live session!`);
      // Reply with current code & question so peer is synced
      this.syncCurrentStateToPeer();
    } else if (data.type === "CODE_SYNC") {
      const editor = document.getElementById("collabCodeEditor");
      if (editor && editor.value !== data.code) {
        this.isLocalUpdate = true;
        const cursor = editor.selectionStart;
        editor.value = data.code;
        try { editor.setSelectionRange(cursor, cursor); } catch {}
        this.isLocalUpdate = false;
        this.showTypingIndicator(`${data.senderName} (${data.senderRole}) is typing...`);
      }
    } else if (data.type === "QUESTION_SYNC") {
      this.loadQuestionIntoRoom(data.question, false);
      this.showLiveToast(`Problem loaded: ${data.question.title}`);
    } else if (data.type === "LANGUAGE_SYNC") {
      const langSelect = document.getElementById("collabLanguageSelect");
      if (langSelect && langSelect.value !== data.language) {
        langSelect.value = data.language;
        this.currentLanguage = data.language;
        this.showLiveToast(`Language changed to ${data.language}`);
      }
    } else if (data.type === "TIMER_SYNC") {
      this.handleRemoteTimerSync(data);
    } else if (data.type === "CODE_RUN_RESULT") {
      const consoleOut = document.getElementById("collabConsoleOutput");
      const timeOut = document.getElementById("collabExecutionTime");
      if (consoleOut) {
        consoleOut.textContent = data.output;
        consoleOut.style.color = data.isError ? "var(--google-red)" : "#a8c7fa";
      }
      if (timeOut && data.duration) timeOut.textContent = `${data.duration} ms`;
      this.showLiveToast(`${data.senderName} executed the code`);
    }
  }

  syncCurrentStateToPeer() {
    const editor = document.getElementById("collabCodeEditor");
    const code = editor ? editor.value : "";
    this.broadcast({
      type: "CODE_SYNC",
      code
    });
    if (this.activeQuestion) {
      this.broadcast({
        type: "QUESTION_SYNC",
        question: this.activeQuestion
      });
    }
    this.broadcast({
      type: "LANGUAGE_SYNC",
      language: this.currentLanguage
    });
  }

  showTypingIndicator(msg) {
    const ind = document.getElementById("collabTypingIndicator");
    if (!ind) return;
    ind.textContent = msg;
    ind.style.opacity = "1";
    clearTimeout(this._typingTimeout);
    this._typingTimeout = setTimeout(() => {
      if (ind) ind.style.opacity = "0";
    }, 2000);
  }

  showLiveToast(msg) {
    const toast = document.getElementById("collabLiveToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      if (toast) toast.style.display = "none";
    }, 3500);
  }

  updateConnectionBadge(text, isLive) {
    const badge = document.getElementById("collabStatusBadge");
    const dot = document.getElementById("collabStatusDot");
    if (badge) {
      badge.textContent = text;
      badge.style.color = isLive ? "var(--google-green)" : "var(--text-secondary)";
      badge.style.borderColor = isLive ? "rgba(52, 168, 83, 0.4)" : "var(--border-color)";
    }
    if (dot) {
      dot.style.background = isLive ? "var(--google-green)" : "var(--text-muted)";
    }
  }

  // Timer controls
  startInterviewTimer() {
    if (this.timerStatus === "running") return;
    this.timerStatus = "running";
    this.timerStartTime = Date.now() - ((45 * 60 - this.interviewTimerSeconds) * 1000);

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.timerStartTime) / 1000);
      this.interviewTimerSeconds = Math.max(0, 45 * 60 - elapsed);
      this.updateTimerDisplay();

      if (this.interviewTimerSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.timerStatus = "idle";
        alert("45-Minute Interview Time is UP!");
      }
    }, 1000);

    this.updateTimerDisplay();
    this.broadcast({
      type: "TIMER_SYNC",
      action: "START",
      remainingSeconds: this.interviewTimerSeconds,
      timestamp: Date.now()
    });
  }

  pauseInterviewTimer() {
    if (this.timerStatus !== "running") return;
    this.timerStatus = "paused";
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.updateTimerDisplay();

    this.broadcast({
      type: "TIMER_SYNC",
      action: "PAUSE",
      remainingSeconds: this.interviewTimerSeconds,
      timestamp: Date.now()
    });
  }

  resetInterviewTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerStatus = "idle";
    this.interviewTimerSeconds = 45 * 60;
    this.updateTimerDisplay();

    this.broadcast({
      type: "TIMER_SYNC",
      action: "RESET",
      remainingSeconds: 45 * 60,
      timestamp: Date.now()
    });
  }

  handleRemoteTimerSync(data) {
    if (data.action === "START") {
      this.interviewTimerSeconds = data.remainingSeconds;
      this.startInterviewTimer();
    } else if (data.action === "PAUSE") {
      this.pauseInterviewTimer();
    } else if (data.action === "RESET") {
      this.resetInterviewTimer();
    }
  }

  updateTimerDisplay() {
    const el = document.getElementById("collabTimerDisplay");
    if (!el) return;
    const mins = Math.floor(this.interviewTimerSeconds / 60);
    const secs = this.interviewTimerSeconds % 60;
    el.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    if (this.interviewTimerSeconds <= 300) {
      el.style.color = "var(--google-red)";
    } else {
      el.style.color = "var(--text-primary)";
    }
  }

  // Load Question into Room
  loadQuestionIntoRoom(question, broadcast = true) {
    this.activeQuestion = question;
    const titleEl = document.getElementById("collabQuestionTitle");
    const descEl = document.getElementById("collabQuestionDesc");
    const patternEl = document.getElementById("collabQuestionPattern");
    const diffEl = document.getElementById("collabQuestionDifficulty");
    const companyEl = document.getElementById("collabQuestionCompany");
    const editor = document.getElementById("collabCodeEditor");

    if (titleEl) titleEl.textContent = question.title;
    if (descEl) descEl.textContent = question.description;
    if (patternEl) patternEl.textContent = question.pattern || "Algorithm";
    if (companyEl) companyEl.textContent = question.company || "Google / FAANG";
    if (diffEl) {
      diffEl.textContent = question.difficulty || "Medium";
      diffEl.className = `badge ${question.difficulty?.toLowerCase().includes("hard") ? "badge-hard" : "badge-medium"}`;
    }

    if (editor) {
      const template = question.starterCode || `// ${question.company || "Google"} Technical Interview: ${question.title}\n// Expected Complexity: ${question.timeComp || "O(N)"} Time, ${question.spaceComp || "O(1)"} Space\n// Pattern: ${question.pattern || "Optimal DSA"}\n\nfunction solve(input) {\n  // 1. Clarifying questions & constraints\n  // 2. Optimal logic & dry-run\n  // 3. Implementation\n  \n  return null;\n}\n\n// Sample Test Call\nconsole.log("Output:", solve(${JSON.stringify(question.sampleInput || "")}));\n`;
      editor.value = template;
    }

    if (broadcast) {
      this.broadcast({
        type: "QUESTION_SYNC",
        question
      });
      const code = editor ? editor.value : "";
      this.broadcast({
        type: "CODE_SYNC",
        code
      });
    }
  }

  renderRoomUI() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const origin = window.location.origin + window.location.pathname;
    const inviteLink = `${origin}?interview=${this.roomId}`;

    container.innerHTML = `
      <div class="collab-interview-layout" style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Live Header Bar -->
        <div class="card" style="padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: var(--bg-surface); border-left: 4px solid var(--google-blue);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 15px; font-weight: 600;">Live Collaborative Mock Interview Session</span>
              <span class="user-status-dot" id="collabStatusDot" style="width: 8px; height: 8px; border-radius: 50%; background: var(--google-green); display: inline-block;"></span>
              <span class="badge" id="collabStatusBadge" style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); font-size: 11px;">
                Connecting Live Sync...
              </span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px;">
              Role: <strong>${this.role === "candidate" ? "Candidate (Interviewee)" : "Interviewer (Evaluator)"}</strong> &bull; Room Code: <code style="font-size: 12px; background: var(--hover-bg); padding: 2px 6px; border-radius: 4px;">${this.roomId}</code>
            </div>
          </div>

          <!-- Synchronized 45-Min Technical Clock -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="text-align: right;">
              <div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Interview Clock</div>
              <div id="collabTimerDisplay" style="font-family: monospace; font-size: 26px; font-weight: 700; color: var(--text-primary); line-height: 1;">45:00</div>
            </div>
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-outline btn-sm" id="btnCollabStartTimer">Start</button>
              <button class="btn btn-outline btn-sm" id="btnCollabPauseTimer">Pause</button>
              <button class="btn btn-outline btn-sm" id="btnCollabResetTimer">Reset</button>
            </div>
          </div>

          <!-- Share Room & Switch Role -->
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" id="btnCopyCollabLink">Copy Invite Link</button>
            <button class="btn btn-outline btn-sm" id="btnOpenCustomProblemModal">+ Create Custom Problem</button>
            <button class="btn btn-outline btn-sm" id="btnToggleCollabRole">Switch to ${this.role === "candidate" ? "Interviewer" : "Candidate"}</button>
            <button class="btn btn-outline btn-sm" id="btnLeaveCollabRoom">Leave Room</button>
          </div>
        </div>

        <!-- Live Status Indicators -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding: 0 4px;">
          <div id="collabTypingIndicator" style="color: var(--google-blue); font-weight: 500; opacity: 0; transition: opacity 0.2s;">
            Remote user is typing...
          </div>
          <div id="collabLiveToast" style="display: none; background: var(--google-green-surface); color: var(--google-green); padding: 4px 10px; border-radius: 4px; font-weight: 500;"></div>
        </div>

        <!-- Main Interview Grid: Problem & Code Editor -->
        <div style="display: grid; grid-template-columns: 1fr 1.35fr; gap: 16px;" class="split-2col">
          
          <!-- LEFT: Problem Statement & Interviewer Rubric -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="card" style="height: 100%;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px; flex-wrap: wrap;">
                <div>
                  <span id="collabQuestionCompany" class="badge" style="background: var(--hover-bg); font-weight: 600;">Google</span>
                  <span id="collabQuestionDifficulty" class="badge badge-medium" style="margin-left: 4px;">Medium</span>
                  <span id="collabQuestionPattern" class="badge" style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); margin-left: 4px;">Two Pointers</span>
                </div>
                <!-- Question Picker -->
                <div>
                  <select id="collabQuestionSelect" class="select-input" style="font-size: 11px; padding: 4px 8px; min-height: 28px; max-width: 220px;">
                    <option value="">Select Interview Question...</option>
                    
                    <optgroup label="Google High-Frequency (OA & Onsite)">
                      <option value="oa_goog_trap_water">Trapping Rain Water (Volume of Lakes)</option>
                      <option value="oa_goog_snapshot">Snapshot Array (Google Classic)</option>
                      <option value="oa_goog_currency_exchange">Evaluate Division (Currency Exchange)</option>
                      <option value="oa_goog_longest_str_chain">Longest String Chain (DP)</option>
                      <option value="oa_goog_robot_cleaner">Robot Room Cleaner (Backtracking)</option>
                      <option value="oa_goog_meeting_rooms">Meeting Rooms II (Sweep Line)</option>
                      <option value="oa_goog_word_ladder">Word Ladder (Bidirectional BFS)</option>
                      <option value="oa_goog_logger">Logger Rate Limiter</option>
                      <option value="oa_goog_card_points">Maximum Points You Can Obtain from Cards</option>
                      <option value="oa_goog_step_directions">Step-By-Step Directions From Binary Tree</option>
                      <option value="oa_goog_1">Maximum Number of Points with Cost (DP)</option>
                      <option value="oa_goog_2">Subarray With Elements Greater Than Threshold</option>
                      <option value="oa_goog_3">Number of Good Paths in a Tree (DSU)</option>
                      <option value="oa_goog_4">Process Restricted Friend Requests (DSU)</option>
                    </optgroup>

                    <optgroup label="Amazon Top OA & Phone Screen">
                      <option value="oa_amzn_1">Amazon Fulfillment Center Package Sorting</option>
                      <option value="oa_amzn_2">Maximum Quality of Service Clusters (Binary Search)</option>
                      <option value="oa_amzn_3">Amazon Music Pair Duration Matching</option>
                    </optgroup>

                    <optgroup label="Microsoft Top OA & Codility">
                      <option value="oa_msft_1">Minimum Deletions to Make Frequencies Unique</option>
                      <option value="oa_msft_2">Fair Indexes in Two Arrays</option>
                    </optgroup>

                    <optgroup label="Meta / Facebook Screening">
                      <option value="oa_meta_1">Rotational Cipher with Character Wraparounds</option>
                    </optgroup>

                    ${this.customProblems.length > 0 ? `
                      <optgroup label="Your Custom Created Problems">
                        ${this.customProblems.map((cp, idx) => `<option value="custom_${idx}">[Custom] ${cp.title}</option>`).join("")}
                      </optgroup>
                    ` : ""}
                  </select>
                </div>
              </div>

              <h3 id="collabQuestionTitle" style="font-size: 17px; font-weight: 600; margin-bottom: 10px;">
                Trapping Rain Water (Volume of Lakes)
              </h3>

              <div id="collabQuestionDesc" style="font-size: 13px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 16px; white-space: pre-wrap;">
Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining. In Google interviews, this is often framed as calculating the volume of water pooled in terrain profiles or mountain lakes.
              </div>

              <!-- Interview Structured Checkpoints -->
              <div style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; margin-top: 14px;">
                <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--google-blue);">
                  Technical Interview Guidelines (Google Docs Flow)
                </div>
                <ul style="font-size: 12px; color: var(--text-secondary); padding-left: 18px; margin: 0; line-height: 1.5;">
                  <li><strong>00-05m:</strong> Clarify inputs, negative values, scale bounds & memory constraints.</li>
                  <li><strong>05-15m:</strong> Discuss naive baseline vs optimal algorithmic approach & prove Big-O.</li>
                  <li><strong>15-35m:</strong> Live collaborative coding. Explain code line-by-line as you type.</li>
                  <li><strong>35-42m:</strong> Dry-run through sample edge cases with state tracing.</li>
                  <li><strong>42-45m:</strong> Final complexity analysis & Googleyness Q&A.</li>
                </ul>
              </div>

              <!-- Interviewer Scorecard (Shown when role === 'interviewer') -->
              <div id="collabInterviewerScorecard" style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-color); ${this.role === "interviewer" ? "display: block;" : "display: none;"}">
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Candidate Evaluation Rubric (4 Pillars)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                  <div>
                    <label style="font-size: 11px; color: var(--text-secondary);">Problem Solving & Logic</label>
                    <select class="select-input" style="width: 100%; font-size: 12px; min-height: 28px;">
                      <option>4 - Exceptional insight & edge cases</option>
                      <option selected>3 - Solid algorithmic logic</option>
                      <option>2 - Needed multiple hints</option>
                      <option>1 - Struggled to find approach</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size: 11px; color: var(--text-secondary);">Coding Cleanliness & Bugs</label>
                    <select class="select-input" style="width: 100%; font-size: 12px; min-height: 28px;">
                      <option>4 - Production quality, zero bugs</option>
                      <option selected>3 - Clean, modular, minor fixes</option>
                      <option>2 - Syntax errors or messy</option>
                      <option>1 - Incomplete implementation</option>
                    </select>
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 8px;">
                  <label class="form-label" style="font-size: 11px;">Interviewer Private Feedback & Decision</label>
                  <textarea id="collabInterviewerNotes" class="form-control" style="min-height: 70px; font-size: 12px;" placeholder="Document candidate's thought process, how they responded to hints, and final recommendation (Strong Hire / Hire / No Hire)..."></textarea>
                </div>
              </div>

            </div>
          </div>

          <!-- RIGHT: Real-time Collaborative Code Editor (Google Docs Style) -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div class="card" style="height: 100%; display: flex; flex-direction: column;">
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 13px; font-weight: 600;">Shared Live Code Editor</span>
                  <span style="font-size: 11px; color: var(--google-blue); font-weight: 500;">(Real-time Google Docs Sync)</span>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <select id="collabLanguageSelect" class="select-input" style="font-size: 11px; padding: 4px 8px; min-height: 28px;">
                    <option value="javascript">JavaScript (Node)</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ 20</option>
                    <option value="java">Java 17</option>
                  </select>
                  <button class="btn btn-primary btn-sm" id="btnCollabRunCode">Run Code</button>
                  <button class="btn btn-outline btn-sm" id="btnCollabClearCode">Clear</button>
                </div>
              </div>

              <!-- Shared Live Code Area -->
              <div style="position: relative; flex: 1; min-height: 380px;">
                <textarea id="collabCodeEditor" class="code-textarea" style="width: 100%; height: 100%; min-height: 380px; font-family: 'JetBrains Mono', 'Fira Code', Menlo, monospace; font-size: 13px; line-height: 1.5; resize: vertical;" spellcheck="false" placeholder="// Real-time collaborative code editor. Both candidate and interviewer can type here simultaneously..."></textarea>
              </div>

              <!-- Live Execution Console -->
              <div style="margin-top: 10px; background: #18191c; color: #e8eaed; border-radius: var(--radius-sm); border: 1px solid var(--border-color); padding: 10px 12px; font-family: monospace; font-size: 12px; min-height: 90px; max-height: 140px; overflow-y: auto;">
                <div style="color: var(--text-muted); font-size: 11px; margin-bottom: 4px; display: flex; justify-content: space-between;">
                  <span>Execution Output Console</span>
                  <span id="collabExecutionTime" style="color: var(--google-green);"></span>
                </div>
                <pre id="collabConsoleOutput" style="margin: 0; white-space: pre-wrap; word-break: break-all; color: #a8c7fa;">Ready to run code. Click 'Run Code' to execute test cases.</pre>
              </div>

            </div>
          </div>

        </div>

      </div>

      <!-- Create Custom Problem Modal -->
      <div class="modal-overlay" id="customProblemModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 100000; justify-content: center; align-items: center; padding: 20px;">
        <div class="modal-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); max-width: 540px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: var(--shadow-lg);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="font-size: 17px; font-weight: 600;">Create Custom Interview Problem</div>
            <button class="modal-close" id="btnCloseCustomProblemModal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-secondary);">&times;</button>
          </div>
          
          <form id="customProblemForm">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px;">Problem Title</label>
              <input type="text" id="custProbTitle" class="form-control" placeholder="e.g. Design LRU Cache with TTL Expiry" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="font-size: 12px;">Company Tag</label>
                <select id="custProbCompany" class="select-input" style="width: 100%;">
                  <option value="Google">Google</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Meta">Meta</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Apple">Apple</option>
                  <option value="Uber">Uber</option>
                  <option value="Netflix">Netflix</option>
                  <option value="Other FAANG">Other FAANG</option>
                </select>
              </div>
              <div>
                <label class="form-label" style="font-size: 12px;">Difficulty</label>
                <select id="custProbDifficulty" class="select-input" style="width: 100%;">
                  <option value="Easy">Easy</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px;">Algorithmic Pattern / Topic</label>
              <input type="text" id="custProbPattern" class="form-control" placeholder="e.g. Hash Map + Doubly Linked List, Monotonic Queue">
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px;">Problem Description & Constraints</label>
              <textarea id="custProbDesc" class="form-control" style="min-height: 90px; font-size: 12px;" placeholder="Explain the problem statement, inputs, outputs, and edge guarantees..." required></textarea>
            </div>

            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" style="font-size: 12px;">Starter Code Template (Optional)</label>
              <textarea id="custProbStarterCode" class="form-control" style="min-height: 70px; font-family: monospace; font-size: 12px;" placeholder="function solve(input) {\n  // Your code here\n}"></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
              <button type="button" class="btn btn-outline" id="btnCancelCustomProblem">Cancel</button>
              <button type="submit" class="btn btn-primary">Publish to Interview Room</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.wireRoomEventListeners(inviteLink);
  }

  wireRoomEventListeners(inviteLink) {
    const editor = document.getElementById("collabCodeEditor");

    // Real-time Textarea synchronization (Google Docs style)
    // Sends live updates smoothly with a 100ms debounce
    if (editor) {
      editor.addEventListener("input", () => {
        if (this.isLocalUpdate) return;
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          const code = editor.value;
          this.broadcast({
            type: "CODE_SYNC",
            code
          });
        }, 100);
      });
    }

    // Language Selector Sync
    const langSelect = document.getElementById("collabLanguageSelect");
    langSelect?.addEventListener("change", () => {
      this.currentLanguage = langSelect.value;
      this.broadcast({
        type: "LANGUAGE_SYNC",
        language: this.currentLanguage
      });
      this.showLiveToast(`Switched language to ${this.currentLanguage}`);
    });

    // Question picker
    const qSelect = document.getElementById("collabQuestionSelect");
    qSelect?.addEventListener("change", async () => {
      const qVal = qSelect.value;
      if (!qVal) return;

      if (qVal.startsWith("custom_")) {
        const idx = parseInt(qVal.replace("custom_", ""), 10);
        const customQ = this.customProblems[idx];
        if (customQ) {
          this.loadQuestionIntoRoom(customQ, true);
        }
        return;
      }

      try {
        const { FASTPREP_OA_QUESTIONS } = await import("./data/fastprepOA.js");
        const found = FASTPREP_OA_QUESTIONS.find((q) => q.id === qVal);
        if (found) {
          this.loadQuestionIntoRoom(found, true);
        }
      } catch (e) {
        console.warn("Failed loading question:", e);
      }
    });

    // Custom Problem Modal Open & Close
    const customModal = document.getElementById("customProblemModal");
    const openCustomBtn = document.getElementById("btnOpenCustomProblemModal");
    const closeCustomBtn = document.getElementById("btnCloseCustomProblemModal");
    const cancelCustomBtn = document.getElementById("btnCancelCustomProblem");
    const customForm = document.getElementById("customProblemForm");

    openCustomBtn?.addEventListener("click", () => {
      if (customModal) customModal.style.display = "flex";
      document.getElementById("custProbTitle")?.focus();
    });

    const closeCustom = () => {
      if (customModal) customModal.style.display = "none";
    };

    closeCustomBtn?.addEventListener("click", closeCustom);
    cancelCustomBtn?.addEventListener("click", closeCustom);

    // Custom Problem Submission
    customForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("custProbTitle")?.value.trim();
      const company = document.getElementById("custProbCompany")?.value || "Google";
      const difficulty = document.getElementById("custProbDifficulty")?.value || "Medium";
      const pattern = document.getElementById("custProbPattern")?.value.trim() || "Optimal Algorithm";
      const description = document.getElementById("custProbDesc")?.value.trim();
      const starterCode = document.getElementById("custProbStarterCode")?.value.trim();

      const newProb = {
        id: `custom_${Date.now()}`,
        title,
        company,
        difficulty,
        pattern,
        description,
        starterCode: starterCode || `// ${company} Interview: ${title}\nfunction solve(input) {\n  // Implement solution\n  return null;\n}\n`
      };

      this.saveCustomProblem(newProb);
      closeCustom();
      customForm.reset();

      // Load question immediately into current room and broadcast to peer
      this.loadQuestionIntoRoom(newProb, true);
      this.showLiveToast(`Custom problem "${title}" published live!`);

      // Re-render UI to update custom problems dropdown
      this.renderRoomUI();
      this.loadQuestionIntoRoom(newProb, false);
    });

    // Copy Invite Link
    document.getElementById("btnCopyCollabLink")?.addEventListener("click", () => {
      navigator.clipboard.writeText(inviteLink).then(() => {
        const btn = document.getElementById("btnCopyCollabLink");
        if (btn) {
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = "Copy Invite Link"; }, 2000);
        }
      });
    });

    // Switch Role
    document.getElementById("btnToggleCollabRole")?.addEventListener("click", () => {
      this.role = this.role === "candidate" ? "interviewer" : "candidate";
      this.renderRoomUI();
      this.syncCurrentStateToPeer();
    });

    // Leave Room
    document.getElementById("btnLeaveCollabRoom")?.addEventListener("click", () => {
      if (confirm("Leave this interview room?")) {
        if (this.eventSource) this.eventSource.close();
        if (this.broadcastChannel) this.broadcastChannel.close();
        if (this.peer) this.peer.destroy();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.renderLobbyUI();
      }
    });

    // Timer controls
    document.getElementById("btnCollabStartTimer")?.addEventListener("click", () => this.startInterviewTimer());
    document.getElementById("btnCollabPauseTimer")?.addEventListener("click", () => this.pauseInterviewTimer());
    document.getElementById("btnCollabResetTimer")?.addEventListener("click", () => this.resetInterviewTimer());

    // Run Code
    document.getElementById("btnCollabRunCode")?.addEventListener("click", () => {
      const code = editor ? editor.value : "";
      const consoleOut = document.getElementById("collabConsoleOutput");
      const timeOut = document.getElementById("collabExecutionTime");
      if (!consoleOut) return;

      consoleOut.textContent = "Executing code...";
      const startTime = performance.now();

      try {
        let logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "));
          originalLog.apply(console, args);
        };

        const runner = new Function(code);
        const res = runner();
        console.log = originalLog;

        const duration = (performance.now() - startTime).toFixed(1);
        if (timeOut) timeOut.textContent = `${duration} ms`;

        let resultText = logs.length > 0 ? logs.join("\n") : (res !== undefined ? String(res) : "Code executed successfully with zero errors.");
        consoleOut.textContent = resultText;
        consoleOut.style.color = "#a8c7fa";

        // Broadcast execution result to peer so interviewer sees candidate's console output live!
        this.broadcast({
          type: "CODE_RUN_RESULT",
          output: resultText,
          duration,
          isError: false
        });
      } catch (err) {
        const duration = (performance.now() - startTime).toFixed(1);
        if (timeOut) timeOut.textContent = `${duration} ms`;
        const errText = `Runtime Error:\n${err.message || err}`;
        consoleOut.textContent = errText;
        consoleOut.style.color = "var(--google-red)";

        this.broadcast({
          type: "CODE_RUN_RESULT",
          output: errText,
          duration,
          isError: true
        });
      }
    });

    // Clear Code
    document.getElementById("btnCollabClearCode")?.addEventListener("click", () => {
      if (confirm("Clear code editor?")) {
        if (editor) editor.value = "";
        this.broadcast({ type: "CODE_SYNC", code: "" });
      }
    });
  }

  renderLobbyUI() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const defaultRoomId = this.generateRoomId();
    container.innerHTML = `
      <div class="card" style="max-width: 680px; margin: 0 auto; padding: 28px; text-align: center;">
        <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">
          Live Collaborative Mock Interview Session
        </div>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px;">
          Connect simultaneously with another engineer, peer, or mentor in real-time (Google Docs style). Both candidate and interviewer can type live, execute code, load authentic FAANG problems, create custom problems, and time with a synchronized 45-minute clock.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; text-align: left;" class="split-2col">
          <!-- CREATE ROOM -->
          <div style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;">Start New Interview Room</div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">Generate a live collaborative session and invite a peer.</p>
            
            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" style="font-size: 11px;">Select Your Role</label>
              <select id="lobbyCreateRole" class="select-input" style="width: 100%; font-size: 12px;">
                <option value="candidate" selected>Candidate (I am coding & interviewing)</option>
                <option value="interviewer">Interviewer (I am evaluating & giving hints)</option>
              </select>
            </div>

            <button class="btn btn-primary" id="btnLobbyCreateRoom" style="width: 100%;">
              Create Live Room
            </button>
          </div>

          <!-- JOIN ROOM -->
          <div style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;">Join Existing Room</div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">Enter room code or link received from your peer.</p>

            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" style="font-size: 11px;">Room Code</label>
              <input type="text" id="lobbyJoinRoomId" class="form-control" placeholder="e.g. goog-mock-8291" style="font-size: 12px; font-family: monospace;">
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" style="font-size: 11px;">Select Your Role</label>
              <select id="lobbyJoinRole" class="select-input" style="width: 100%; font-size: 12px;">
                <option value="interviewer" selected>Interviewer (Evaluating)</option>
                <option value="candidate">Candidate (Coding)</option>
              </select>
            </div>

            <button class="btn btn-outline" id="btnLobbyJoinRoom" style="width: 100%;">
              Join Live Room
            </button>
          </div>
        </div>

        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
          100% Free &bull; Real-time WebRTC + Cloud SSE Streaming &bull; Multi-tab same-device testing supported
        </div>
      </div>
    `;

    document.getElementById("btnLobbyCreateRoom")?.addEventListener("click", () => {
      const role = document.getElementById("lobbyCreateRole")?.value || "candidate";
      this.joinRoom(defaultRoomId, role);
    });

    document.getElementById("btnLobbyJoinRoom")?.addEventListener("click", () => {
      const codeInput = document.getElementById("lobbyJoinRoomId")?.value.trim();
      const role = document.getElementById("lobbyJoinRole")?.value || "interviewer";
      if (!codeInput) {
        alert("Please enter a valid room code.");
        return;
      }
      this.joinRoom(codeInput, role);
    });
  }
}
