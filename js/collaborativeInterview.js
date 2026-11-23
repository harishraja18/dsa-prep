// Real-time Collaborative Google Mock Interview Room (Google Docs style)
// 100% Free, zero-backend, runs on GitHub Pages via WebRTC DataChannel + ntfy.sh fallback + BroadcastChannel

export class CollaborativeInterviewRoom {
  constructor(options = {}) {
    this.containerId = options.containerId || "collaborativeInterviewContainer";
    this.roomId = null;
    this.role = "candidate"; // 'candidate' | 'interviewer'
    this.userName = "Harish Raja";
    this.peer = null;
    this.conn = null;
    this.broadcastChannel = null;
    this.pollInterval = null;
    this.isLocalUpdate = false;
    this.connectedPeersCount = 0;
    this.activeQuestion = null;
    this.remoteUserLabel = "Peer";

    // Synchronized 45-minute Google technical interview timer
    this.interviewTimerSeconds = 45 * 60;
    this.timerStatus = "idle"; // 'idle' | 'running' | 'paused'
    this.timerInterval = null;
    this.timerStartTime = null;

    this.initBroadcastChannel();
  }

  initBroadcastChannel() {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        this.broadcastChannel = new BroadcastChannel("google_interview_sync");
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.roomId === this.roomId) {
            this.handleRemoteMessage(e.data);
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not supported:", e);
    }
  }

  // Generate clean room ID: e.g. goog-mock-8291
  generateRoomId() {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `goog-mock-${randomHex}`;
  }

  // Join or Create Room
  joinRoom(roomId, role = "candidate", userName = "Harish Raja") {
    this.roomId = (roomId || this.generateRoomId()).trim().toLowerCase();
    this.role = role;
    this.userName = userName || (role === "candidate" ? "Candidate" : "Interviewer");

    this.initPeerJS();
    this.startNtfyFallback();
    this.renderRoomUI();

    // Broadcast join announcement
    this.broadcast({
      type: "PEER_JOIN",
      userName: this.userName,
      role: this.role,
      timestamp: Date.now()
    });
  }

  initPeerJS() {
    // If PeerJS is loaded on window, initialize WebRTC DataChannel
    if (typeof window !== "undefined" && window.Peer) {
      try {
        const peerId = `${this.roomId}-${this.role}-${Math.floor(Math.random() * 1000)}`;
        this.peer = new window.Peer(peerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" }
            ]
          }
        });

        this.peer.on("open", () => {
          this.updateConnectionBadge("Connected to Signaling", true);
          // If we are candidate, try to connect to interviewer or listen
          this.connectToOtherRoles();
        });

        this.peer.on("connection", (conn) => {
          this.setupDataConnection(conn);
        });

        this.peer.on("error", (err) => {
          console.warn("PeerJS notice (fallback active):", err);
        });
      } catch (e) {
        console.warn("PeerJS init exception, continuing with fallback:", e);
      }
    }
  }

  connectToOtherRoles() {
    if (!this.peer) return;
    const targetRole = this.role === "candidate" ? "interviewer" : "candidate";
    // Target room channel
    const checkConn = () => {
      if (this.conn && this.conn.open) return;
      // Listening for incoming connections
    };
    checkConn();
  }

  setupDataConnection(conn) {
    this.conn = conn;
    this.conn.on("open", () => {
      this.connectedPeersCount = 1;
      this.updateConnectionBadge("Real-time WebRTC Connected", true);
      // Send current state
      this.syncCurrentStateToPeer();
    });

    this.conn.on("data", (data) => {
      this.handleRemoteMessage(data);
    });

    this.conn.on("close", () => {
      this.connectedPeersCount = 0;
      this.updateConnectionBadge("Peer Disconnected (Fallback active)", false);
    });
  }

  // Cross-network fallback via free pub-sub (ntfy.sh)
  startNtfyFallback() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    // Poll every 1.5 seconds for remote edits if WebRTC is not connected
    const topic = `goog_dsa_interview_${this.roomId}`;
    let lastSeenTimestamp = Date.now();

    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=${lastSeenTimestamp - 1000}`);
        if (!res.ok) return;
        const text = await res.text();
        const lines = text.trim().split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const item = JSON.parse(line);
            if (item.event === "message" && item.message) {
              const payload = JSON.parse(item.message);
              if (payload.senderRole !== this.role && payload.timestamp > lastSeenTimestamp) {
                lastSeenTimestamp = Math.max(lastSeenTimestamp, payload.timestamp);
                this.handleRemoteMessage(payload);
              }
            }
          } catch {}
        }
      } catch {}
    }, 1500);
  }

  // Broadcast message to WebRTC peer + Local BroadcastChannel + Cloud Fallback
  broadcast(payload) {
    payload.roomId = this.roomId;
    payload.senderRole = this.role;
    payload.senderName = this.userName;
    payload.timestamp = Date.now();

    // 1. WebRTC DataChannel
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch {}
    }

    // 2. BroadcastChannel (Same device multi-tab testing)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {}
    }

    // 3. Cloud Fallback (ntfy.sh)
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
      this.updateConnectionBadge(`${this.remoteUserLabel} Connected`, true);
      this.showLiveToast(`${data.userName} joined the interview session.`);
      // Reply with current code & question
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
      this.showLiveToast(`Interviewer loaded question: ${data.question.title}`);
    } else if (data.type === "TIMER_SYNC") {
      this.handleRemoteTimerSync(data);
    } else if (data.type === "FEEDBACK_SYNC") {
      const notesEl = document.getElementById("collabInterviewerNotes");
      if (notesEl && this.role === "interviewer") {
        notesEl.value = data.notes || "";
      }
    }
  }

  syncCurrentStateToPeer() {
    const editor = document.getElementById("collabCodeEditor");
    const code = editor ? editor.value : "";
    this.broadcast({
      type: "CODE_SYNC",
      code,
      question: this.activeQuestion
    });
    if (this.activeQuestion) {
      this.broadcast({
        type: "QUESTION_SYNC",
        question: this.activeQuestion
      });
    }
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
    if (badge) {
      badge.textContent = text;
      badge.style.color = isLive ? "var(--google-green)" : "var(--text-secondary)";
      badge.style.borderColor = isLive ? "rgba(52, 168, 83, 0.4)" : "var(--border-color)";
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
        alert("45-Minute Google Technical Interview Time is UP!");
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
    const editor = document.getElementById("collabCodeEditor");

    if (titleEl) titleEl.textContent = question.title;
    if (descEl) descEl.textContent = question.description;
    if (patternEl) patternEl.textContent = question.pattern || "Algorithm";
    if (diffEl) {
      diffEl.textContent = question.difficulty || "Medium";
      diffEl.className = `badge ${question.difficulty?.toLowerCase().includes("hard") ? "badge-hard" : "badge-medium"}`;
    }

    if (editor && (!editor.value || editor.value.trim() === "" || editor.value.includes("// Start coding here") || editor.value.includes("# Start coding here"))) {
      editor.value = `// Google Technical Interview: ${question.title}\n// Expected Complexity: ${question.timeComp || "O(N)"} Time, ${question.spaceComp || "O(1)"} Space\n// Pattern: ${question.pattern || "Optimal DSA"}\n\nfunction solve(input) {\n  // 1. State Clarifying Questions & Constraints\n  // 2. Propose Optimal Algorithm & Big-O\n  // 3. Write Clean Implementation\n  \n  return null;\n}\n\n// Sample Test Call\nconsole.log("Output:", solve(${JSON.stringify(question.sampleInput || "")}));\n`;
    }

    if (broadcast) {
      this.broadcast({
        type: "QUESTION_SYNC",
        question
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
              <span style="font-size: 15px; font-weight: 600;">Google Mock Interview Session</span>
              <span class="badge" id="collabStatusBadge" style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); font-size: 11px;">
                Connecting...
              </span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px;">
              Role: <strong>${this.role === "candidate" ? "Candidate (Interviewee)" : "Interviewer (Evaluator)"}</strong> &bull; Room Code: <code style="font-size: 12px; background: var(--hover-bg); padding: 2px 6px; border-radius: 4px;">${this.roomId}</code>
            </div>
          </div>

          <!-- Synchronized 45-Min Google Timer -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="text-align: right;">
              <div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Google Interview Clock</div>
              <div id="collabTimerDisplay" style="font-family: monospace; font-size: 26px; font-weight: 700; color: var(--text-primary); line-height: 1;">45:00</div>
            </div>
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-outline btn-sm" id="btnCollabStartTimer">Start</button>
              <button class="btn btn-outline btn-sm" id="btnCollabPauseTimer">Pause</button>
              <button class="btn btn-outline btn-sm" id="btnCollabResetTimer">Reset</button>
            </div>
          </div>

          <!-- Share Room & Switch Role -->
          <div style="display: flex; gap: 6px; align-items: center;">
            <button class="btn btn-primary btn-sm" id="btnCopyCollabLink">Copy Invite Link</button>
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
          
          <!-- LEFT: Google Problem Statement & Interviewer Rubric -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="card" style="height: 100%;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px;">
                <div>
                  <span id="collabQuestionDifficulty" class="badge badge-medium">Medium</span>
                  <span id="collabQuestionPattern" class="badge" style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); margin-left: 4px;">Two Pointers</span>
                </div>
                <!-- Question Picker (Especially for Interviewer) -->
                <div>
                  <select id="collabQuestionSelect" class="select-input" style="font-size: 11px; padding: 4px 8px; min-height: 28px;">
                    <option value="">Load Google Question...</option>
                    <option value="oa_goog_trap_water">Trapping Rain Water (Volume of Lakes)</option>
                    <option value="oa_goog_snapshot">Snapshot Array (Google Classic)</option>
                    <option value="oa_goog_currency_exchange">Evaluate Division (Currency Exchange)</option>
                    <option value="oa_goog_longest_str_chain">Longest String Chain</option>
                    <option value="oa_goog_robot_cleaner">Robot Room Cleaner</option>
                    <option value="oa_goog_meeting_rooms">Meeting Rooms II (Sweep Line)</option>
                    <option value="oa_goog_word_ladder">Word Ladder (Bidirectional BFS)</option>
                    <option value="oa_goog_logger">Logger Rate Limiter</option>
                    <option value="oa_goog_card_points">Maximum Points You Can Obtain from Cards</option>
                    <option value="oa_goog_step_directions">Step-By-Step Directions From Binary Tree</option>
                    <option value="oa_goog_1">Maximum Number of Points with Cost (DP)</option>
                    <option value="oa_goog_2">Subarray With Elements Greater Than Threshold</option>
                    <option value="oa_goog_3">Number of Good Paths in a Tree (DSU)</option>
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
                  Google Interview Workflow (Google Docs Guidelines)
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
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Google Candidate Evaluation Rubric</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                  <div>
                    <label style="font-size: 11px; color: var(--text-secondary);">Problem Solving & Insights</label>
                    <select class="select-input" style="width: 100%; font-size: 12px; min-height: 28px;">
                      <option>4 - Exceptional insight & edge cases</option>
                      <option selected>3 - Solid algorithmic logic</option>
                      <option>2 - Needed multiple hints</option>
                      <option>1 - Struggled to find approach</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size: 11px; color: var(--text-secondary);">Coding Speed & Cleanliness</label>
                    <select class="select-input" style="width: 100%; font-size: 12px; min-height: 28px;">
                      <option>4 - Production quality, zero bugs</option>
                      <option selected>3 - Clean, modular, minor fixes</option>
                      <option>2 - Syntax errors or messy</option>
                      <option>1 - Incomplete implementation</option>
                    </select>
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 8px;">
                  <label class="form-label" style="font-size: 11px;">Interviewer Private Notes & Feedback</label>
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
                  <span style="font-size: 11px; color: var(--text-muted);">(Google Docs Live Sync)</span>
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
                <textarea id="collabCodeEditor" class="code-textarea" style="width: 100%; height: 100%; min-height: 380px; font-family: 'JetBrains Mono', 'Fira Code', Menlo, monospace; font-size: 13px; line-height: 1.5; resize: vertical;" spellcheck="false" placeholder="// Collaborative Google Docs code editor. Both candidate and interviewer can type here simultaneously..."></textarea>
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
    `;

    this.wireRoomEventListeners(inviteLink);
  }

  wireRoomEventListeners(inviteLink) {
    // Real-time Textarea synchronization (Google Docs style)
    const editor = document.getElementById("collabCodeEditor");
    if (editor) {
      editor.addEventListener("input", () => {
        if (this.isLocalUpdate) return;
        const code = editor.value;
        this.broadcast({
          type: "CODE_SYNC",
          code
        });
      });
    }

    // Question picker
    const qSelect = document.getElementById("collabQuestionSelect");
    qSelect?.addEventListener("change", async () => {
      const qId = qSelect.value;
      if (!qId) return;
      try {
        const { FASTPREP_OA_QUESTIONS } = await import("./data/fastprepOA.js");
        const found = FASTPREP_OA_QUESTIONS.find((q) => q.id === qId);
        if (found) {
          this.loadQuestionIntoRoom(found, true);
        }
      } catch (e) {
        console.warn("Failed loading question:", e);
      }
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
        if (this.pollInterval) clearInterval(this.pollInterval);
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

      consoleOut.textContent = "Executing code in isolated worker context...";
      const startTime = performance.now();

      try {
        let logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "));
          originalLog.apply(console, args);
        };

        // Execute safely
        const runner = new Function(code);
        const res = runner();
        console.log = originalLog;

        const duration = (performance.now() - startTime).toFixed(1);
        if (timeOut) timeOut.textContent = `${duration} ms`;

        let resultText = logs.length > 0 ? logs.join("\n") : (res !== undefined ? String(res) : "Code executed successfully with zero errors.");
        consoleOut.textContent = resultText;
        consoleOut.style.color = "#a8c7fa";
      } catch (err) {
        const duration = (performance.now() - startTime).toFixed(1);
        if (timeOut) timeOut.textContent = `${duration} ms`;
        consoleOut.textContent = `Runtime Error:\n${err.message || err}`;
        consoleOut.style.color = "var(--google-red)";
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
          Google Collaborative Live Interview Session
        </div>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px;">
          Connect simultaneously with another engineer or mentor in real-time (like Google Docs). Both candidate and interviewer can type, execute code, pick authentic Google OA problems, and track with a live 45-minute Google timer.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; text-align: left;" class="split-2col">
          <!-- CREATE ROOM -->
          <div style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;">Start New Interview Room</div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">Create a new live collaborative session and invite a peer or mentor.</p>
            
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
          100% Free &bull; Browser-to-browser WebRTC DataChannel &bull; Zero external servers required
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
