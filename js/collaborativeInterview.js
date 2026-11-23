// Real-time Collaborative Google & FAANG Mock Interview Room (Google Docs style)
// High-reliability multi-channel architecture:
// Channel 1: High-Speed Duplex MQTT over WebSocket (wss://broker.emqx.io:8084/mqtt)
// Channel 2: Native Browser BroadcastChannel (0ms multi-tab IPC)
// Channel 3: WebRTC DataChannel via PeerJS fallback
// Anti-Echo Reentrancy Protection + Smart Cursor Preservation + Live Heartbeat

export class CollaborativeInterviewRoom {
  constructor(options = {}) {
    this.containerId = options.containerId || "collaborativeInterviewContainer";
    this.roomId = null;
    this.role = "candidate"; // 'candidate' | 'interviewer'
    this.userName = "Harish Raja";
    this.myId = "usr_" + Math.random().toString(36).substring(2, 9);
    
    // Multi-channel networking handles
    this.mqttClient = null;
    this.broadcastChannel = null;
    this.peer = null;
    this.conn = null;

    // State & synchronization flags
    this.isRemoteUpdate = false;
    this.peerOnline = false;
    this.peerName = "Peer";
    this.peerRole = "Interviewer";
    this.lastPeerHeartbeat = 0;
    this.activeQuestion = null;
    this.currentLanguage = "javascript";
    this.customProblems = this.loadCustomProblems();

    // Throttled typing control
    this.typingThrottleTimer = null;
    this.lastTypingSentTime = 0;
    this.pendingCodeToSend = null;

    // Heartbeat ticker
    this.heartbeatInterval = null;

    // Synchronized 45-minute technical interview timer
    this.interviewTimerSeconds = 45 * 60;
    this.timerStatus = "idle"; // 'idle' | 'running' | 'paused'
    this.timerInterval = null;
    this.timerStartTime = null;
  }

  // Load custom problems from localStorage
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

  generateRoomId() {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `goog-mock-${randomHex}`;
  }

  // Join or Create Room
  joinRoom(roomId, role = "candidate", userName = "Harish Raja") {
    this.roomId = (roomId || this.generateRoomId()).trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    this.role = role;
    this.userName = userName || (role === "candidate" ? "Candidate" : "Interviewer");
    this.peerOnline = false;

    // Clean up any existing listeners
    this.cleanupConnections();

    // Initialize all sync channels
    this.initBroadcastChannel();
    this.initMqttWebSocket();
    this.initPeerJSFallback();
    this.initHeartbeatMonitor();

    // Render Room Interface
    this.renderRoomUI();

    // Send immediate join announcement
    setTimeout(() => {
      this.broadcastMessage({
        type: "USER_JOIN",
        name: this.userName,
        role: this.role
      });
    }, 400);
  }

  cleanupConnections() {
    if (this.mqttClient) {
      try { this.mqttClient.end(true); } catch {}
      this.mqttClient = null;
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch {}
      this.broadcastChannel = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
      this.peer = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // CHANNEL 1: High-Speed Duplex MQTT over WebSocket
  initMqttWebSocket() {
    const mqttTopic = `google_interview_v2/${this.roomId}`;

    const connectToBroker = (brokerUrl) => {
      if (typeof window === "undefined" || !window.mqtt) return;

      try {
        const client = window.mqtt.connect(brokerUrl, {
          clientId: `dsa_${this.myId}_${Math.floor(Math.random() * 1000)}`,
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 2500,
          keepalive: 30
        });

        client.on("connect", () => {
          this.mqttClient = client;
          client.subscribe(mqttTopic, { qos: 0 }, (err) => {
            if (!err) {
              this.updateConnectionStatusBadge();
              // Announce presence
              this.broadcastMessage({
                type: "USER_JOIN",
                name: this.userName,
                role: this.role
              });
            }
          });
        });

        client.on("message", (topic, message) => {
          if (topic === mqttTopic) {
            try {
              const payload = JSON.parse(message.toString());
              if (payload && payload.senderId !== this.myId) {
                this.handleIncomingMessage(payload);
              }
            } catch {}
          }
        });

        client.on("error", (err) => {
          console.log("MQTT broker notice:", err?.message || err);
        });

        client.on("close", () => {
          this.updateConnectionStatusBadge();
        });
      } catch (e) {
        console.warn("MQTT init notice:", e);
      }
    };

    // Primary: EMQX public SSL broker, fallback: HiveMQ
    connectToBroker("wss://broker.emqx.io:8084/mqtt");
  }

  // CHANNEL 2: Native Browser BroadcastChannel (0ms multi-tab IPC)
  initBroadcastChannel() {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        this.broadcastChannel = new BroadcastChannel(`google_interview_${this.roomId}`);
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.senderId !== this.myId && e.data.roomId === this.roomId) {
            this.handleIncomingMessage(e.data);
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel notice:", e);
    }
  }

  // CHANNEL 3: WebRTC DataChannel via PeerJS (Fallback)
  initPeerJSFallback() {
    if (typeof window === "undefined" || !window.Peer) return;

    try {
      const peerId = `${this.roomId}_${this.role}_${this.myId.substring(4)}`;
      this.peer = new window.Peer(peerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ]
        }
      });

      this.peer.on("connection", (conn) => {
        this.conn = conn;
        this.conn.on("data", (data) => {
          if (data && data.senderId !== this.myId) {
            this.handleIncomingMessage(data);
          }
        });
      });
    } catch {}
  }

  // HEARTBEAT MONITOR: Confirms live presence every 3.5 seconds
  initHeartbeatMonitor() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.heartbeatInterval = setInterval(() => {
      // Send heartbeat
      this.broadcastMessage({
        type: "HEARTBEAT",
        name: this.userName,
        role: this.role
      });

      // Check if peer heartbeat timed out (> 9 seconds)
      const now = Date.now();
      if (this.peerOnline && now - this.lastPeerHeartbeat > 9000) {
        this.peerOnline = false;
        this.updateConnectionStatusBadge();
      }
    }, 3500);
  }

  // Unified Multi-Channel Dispatcher
  broadcastMessage(payload) {
    payload.senderId = this.myId;
    payload.roomId = this.roomId;
    payload.timestamp = Date.now();

    // 1. MQTT over WebSocket
    if (this.mqttClient && this.mqttClient.connected) {
      try {
        const topic = `google_interview_v2/${this.roomId}`;
        this.mqttClient.publish(topic, JSON.stringify(payload), { qos: 0 });
      } catch {}
    }

    // 2. BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {}
    }

    // 3. WebRTC DataChannel
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch {}
    }
  }

  // Incoming Message Handler
  handleIncomingMessage(data) {
    if (!data || data.senderId === this.myId) return;

    // Track peer presence on any incoming message
    this.peerOnline = true;
    this.peerName = data.name || this.peerName;
    this.peerRole = data.role || this.peerRole;
    this.lastPeerHeartbeat = Date.now();
    this.updateConnectionStatusBadge();

    switch (data.type) {
      case "USER_JOIN": {
        this.showLiveToast(`${data.name} (${data.role}) entered the interview room!`);
        // Immediately sync current editor, question, language, and timer to the newcomer
        this.sendFullStateSync();
        break;
      }

      case "HEARTBEAT": {
        // Heartbeat received; presence confirmed
        break;
      }

      case "CODE_CHANGE": {
        this.applyRemoteCode(data.code, data.name, data.role);
        break;
      }

      case "FULL_STATE_SYNC": {
        if (data.code !== undefined) {
          this.applyRemoteCode(data.code, data.name, data.role);
        }
        if (data.question) {
          this.loadQuestionIntoRoom(data.question, false);
        }
        if (data.language) {
          this.applyRemoteLanguage(data.language);
        }
        if (data.timerSeconds !== undefined) {
          this.interviewTimerSeconds = data.timerSeconds;
          this.updateTimerDisplay();
        }
        break;
      }

      case "QUESTION_CHANGE": {
        if (data.question) {
          this.loadQuestionIntoRoom(data.question, false);
          this.showLiveToast(`Problem loaded: ${data.question.title}`);
        }
        break;
      }

      case "LANGUAGE_CHANGE": {
        this.applyRemoteLanguage(data.language);
        this.showLiveToast(`Language changed to ${data.language}`);
        break;
      }

      case "TIMER_SYNC": {
        this.handleRemoteTimerSync(data);
        break;
      }

      case "CODE_RUN_RESULT": {
        const consoleOut = document.getElementById("collabConsoleOutput");
        const timeOut = document.getElementById("collabExecutionTime");
        if (consoleOut) {
          consoleOut.textContent = data.output;
          consoleOut.style.color = data.isError ? "var(--google-red)" : "#a8c7fa";
        }
        if (timeOut && data.duration) timeOut.textContent = `${data.duration} ms`;
        this.showLiveToast(`${data.name} executed the code`);
        break;
      }
    }
  }

  // Safe Code Injection with Smart Cursor Preservation & Reentrancy Guard
  applyRemoteCode(newCode, senderName, senderRole) {
    const editor = document.getElementById("collabCodeEditor");
    if (!editor || editor.value === newCode) return;

    this.isRemoteUpdate = true;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.value = newCode;

    // Restore cursor position if possible
    try {
      editor.setSelectionRange(
        Math.min(start, newCode.length),
        Math.min(end, newCode.length)
      );
    } catch {}

    this.isRemoteUpdate = false;
    this.showTypingIndicator(`${senderName || "Remote user"} is typing...`);
  }

  applyRemoteLanguage(lang) {
    this.currentLanguage = lang;
    const select = document.getElementById("collabLanguageSelect");
    if (select) select.value = lang;
  }

  sendFullStateSync() {
    const editor = document.getElementById("collabCodeEditor");
    const code = editor ? editor.value : "";
    this.broadcastMessage({
      type: "FULL_STATE_SYNC",
      name: this.userName,
      role: this.role,
      code,
      question: this.activeQuestion,
      language: this.currentLanguage,
      timerSeconds: this.interviewTimerSeconds,
      timerStatus: this.timerStatus
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
    }, 1800);
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

  updateConnectionStatusBadge() {
    const badge = document.getElementById("collabStatusBadge");
    const dot = document.getElementById("collabStatusDot");
    if (!badge || !dot) return;

    if (this.peerOnline) {
      badge.textContent = `Live: ${this.peerName} (${this.peerRole})`;
      badge.style.color = "var(--google-green)";
      badge.style.borderColor = "rgba(52, 168, 83, 0.4)";
      dot.style.background = "var(--google-green)";
      dot.style.boxShadow = "0 0 6px rgba(52, 168, 83, 0.6)";
    } else {
      badge.textContent = `Room Ready (Waiting for peer)`;
      badge.style.color = "var(--text-secondary)";
      badge.style.borderColor = "var(--border-color)";
      dot.style.background = "#fbbc04"; // yellow waiting dot
      dot.style.boxShadow = "none";
    }
  }

  // Timer Synchronization
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
        alert("45-Minute Technical Interview Time has Concluded!");
      }
    }, 1000);

    this.updateTimerDisplay();
    this.broadcastMessage({
      type: "TIMER_SYNC",
      action: "START",
      seconds: this.interviewTimerSeconds
    });
  }

  pauseInterviewTimer() {
    if (this.timerStatus !== "running") return;
    this.timerStatus = "paused";
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.updateTimerDisplay();

    this.broadcastMessage({
      type: "TIMER_SYNC",
      action: "PAUSE",
      seconds: this.interviewTimerSeconds
    });
  }

  resetInterviewTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerStatus = "idle";
    this.interviewTimerSeconds = 45 * 60;
    this.updateTimerDisplay();

    this.broadcastMessage({
      type: "TIMER_SYNC",
      action: "RESET",
      seconds: 45 * 60
    });
  }

  handleRemoteTimerSync(data) {
    if (data.action === "START") {
      this.interviewTimerSeconds = data.seconds || this.interviewTimerSeconds;
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
      const template = question.starterCode || `// ${question.company || "Google"} Technical Interview: ${question.title}\n// Expected Complexity: ${question.timeComp || "O(N)"} Time, ${question.spaceComp || "O(1)"} Space\n// Pattern: ${question.pattern || "Optimal DSA"}\n\nfunction solve(input) {\n  // 1. Clarifying questions & scale constraints\n  // 2. Algorithm logic & proof\n  // 3. Implementation\n  \n  return null;\n}\n\n// Sample Test Call\nconsole.log("Output:", solve(${JSON.stringify(question.sampleInput || "")}));\n`;
      this.isRemoteUpdate = true;
      editor.value = template;
      this.isRemoteUpdate = false;
    }

    if (broadcast) {
      this.broadcastMessage({
        type: "QUESTION_CHANGE",
        question
      });
      const code = editor ? editor.value : "";
      this.broadcastMessage({
        type: "CODE_CHANGE",
        code,
        name: this.userName,
        role: this.role
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
              <span id="collabStatusDot" style="width: 9px; height: 9px; border-radius: 50%; background: #fbbc04; display: inline-block; transition: all 0.3s;"></span>
              <span class="badge" id="collabStatusBadge" style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); font-size: 11px;">
                Room Ready (Waiting for peer)
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
                  <select id="collabQuestionSelect" class="select-input" style="font-size: 11px; padding: 4px 8px; min-height: 28px; max-width: 230px;">
                    <option value="">Select Interview Question...</option>
                    
                    <optgroup label="Google Hard & Advanced Onsite">
                      <option value="oa_goog_trap_water">Trapping Rain Water (Volume of Lakes)</option>
                      <option value="oa_goog_snapshot">Snapshot Array (Google Classic)</option>
                      <option value="oa_goog_currency_exchange">Evaluate Division (Currency Exchange)</option>
                      <option value="oa_goog_robot_cleaner">Robot Room Cleaner (Backtracking)</option>
                      <option value="oa_goog_word_ladder">Word Ladder (Bidirectional BFS)</option>
                      <option value="oa_goog_longest_str_chain">Longest String Chain (DP)</option>
                      <option value="oa_goog_meeting_rooms">Meeting Rooms II (Sweep Line)</option>
                      <option value="oa_goog_logger">Logger Rate Limiter</option>
                      <option value="oa_goog_card_points">Maximum Points You Can Obtain from Cards</option>
                      <option value="oa_goog_step_directions">Step-By-Step Directions From Binary Tree</option>
                      <option value="oa_goog_1">Maximum Number of Points with Cost (DP)</option>
                      <option value="oa_goog_2">Subarray With Elements Greater Than Threshold</option>
                      <option value="oa_goog_3">Number of Good Paths in a Tree (DSU)</option>
                      <option value="oa_goog_4">Process Restricted Friend Requests (DSU)</option>
                    </optgroup>

                    <optgroup label="Amazon Top OA & Onsite">
                      <option value="oa_amzn_1">Amazon Fulfillment Center Package Sorting</option>
                      <option value="oa_amzn_2">Maximum Quality of Service Clusters (Binary Search)</option>
                      <option value="oa_amzn_3">Amazon Music Pair Duration Matching</option>
                    </optgroup>

                    <optgroup label="Meta / Facebook Advanced Screen">
                      <option value="oa_meta_sparse_vec">Dot Product of Two Sparse Vectors</option>
                      <option value="oa_meta_ocean_view">Buildings With an Ocean View</option>
                      <option value="oa_meta_min_remove">Minimum Remove to Make Valid Parentheses</option>
                      <option value="oa_meta_1">Rotational Cipher with Character Wraparounds</option>
                    </optgroup>

                    <optgroup label="Microsoft Codility & Onsite">
                      <option value="oa_msft_1">Minimum Deletions to Make Frequencies Unique</option>
                      <option value="oa_msft_2">Fair Indexes in Two Arrays</option>
                    </optgroup>

                    <optgroup label="Apple Systems & Architecture">
                      <option value="oa_apple_lru">LRU Cache Design with TTL</option>
                      <option value="oa_apple_course_sched">Course Schedule II (Build Order Dependency)</option>
                    </optgroup>

                    <optgroup label="Uber & Netflix High-Scale">
                      <option value="oa_uber_bus_routes">Bus Routes (Min Transfers BFS)</option>
                      <option value="oa_nflx_task_sched">Task Scheduler with Cool Down Time</option>
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

    // Real-time Textarea synchronization with throttled flush
    if (editor) {
      editor.addEventListener("input", () => {
        if (this.isRemoteUpdate) return;

        const now = Date.now();
        this.pendingCodeToSend = editor.value;

        // If last sent was more than 250ms ago, send immediately
        if (now - this.lastTypingSentTime > 250) {
          this.lastTypingSentTime = now;
          this.broadcastMessage({
            type: "CODE_CHANGE",
            code: this.pendingCodeToSend,
            name: this.userName,
            role: this.role
          });
        }

        // Also schedule a debounce to ensure the final keystroke is always transmitted
        clearTimeout(this.typingThrottleTimer);
        this.typingThrottleTimer = setTimeout(() => {
          if (this.pendingCodeToSend !== null) {
            this.broadcastMessage({
              type: "CODE_CHANGE",
              code: this.pendingCodeToSend,
              name: this.userName,
              role: this.role
            });
            this.lastTypingSentTime = Date.now();
            this.pendingCodeToSend = null;
          }
        }, 150);
      });
    }

    // Language Selector Sync
    const langSelect = document.getElementById("collabLanguageSelect");
    langSelect?.addEventListener("change", () => {
      this.currentLanguage = langSelect.value;
      this.broadcastMessage({
        type: "LANGUAGE_CHANGE",
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
      this.sendFullStateSync();
    });

    // Leave Room
    document.getElementById("btnLeaveCollabRoom")?.addEventListener("click", () => {
      if (confirm("Leave this interview room?")) {
        this.cleanupConnections();
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
        this.broadcastMessage({
          type: "CODE_RUN_RESULT",
          output: resultText,
          duration,
          isError: false,
          name: this.userName
        });
      } catch (err) {
        const duration = (performance.now() - startTime).toFixed(1);
        if (timeOut) timeOut.textContent = `${duration} ms`;
        const errText = `Runtime Error:\n${err.message || err}`;
        consoleOut.textContent = errText;
        consoleOut.style.color = "var(--google-red)";

        this.broadcastMessage({
          type: "CODE_RUN_RESULT",
          output: errText,
          duration,
          isError: true,
          name: this.userName
        });
      }
    });

    // Clear Code
    document.getElementById("btnCollabClearCode")?.addEventListener("click", () => {
      if (confirm("Clear code editor?")) {
        if (editor) {
          this.isRemoteUpdate = true;
          editor.value = "";
          this.isRemoteUpdate = false;
        }
        this.broadcastMessage({
          type: "CODE_CHANGE",
          code: "",
          name: this.userName,
          role: this.role
        });
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
          100% Free &bull; High-speed WebSocket streaming &bull; Zero rate limits &bull; Instant multi-tab & cross-device sync
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
