// Professional Study Hours & Deep Work Tracker with Web Audio Synthesis & Background Worker
// Immune to browser background throttling via Web Worker + Date.now() wall-clock delta

export class StudyTimer {
  constructor(onTick, onComplete) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.worker = null;
    this.fallbackInterval = null;
    this.mode = "stopwatch"; // 'stopwatch' | 'pomodoro' | 'interview'
    this.status = "idle"; // 'idle' | 'running' | 'paused'
    this.elapsedSeconds = 0;
    this.targetSeconds = 25 * 60; // 25 mins for pomodoro, 45 mins for mock interview
    this.startTime = null;
    this.sessionTopic = "DSA Preparation";
    this.sessionCategory = "DSA"; // 'DSA' | 'AI' | 'Mock' | 'General'
    this.originalDocumentTitle = typeof document !== "undefined" ? document.title : "Google Engineering Prep";

    this.initWorker();
    this.initVisibilityListener();
    this.restoreActiveSession();
  }

  // Create an inline Web Worker ticker (Web Workers are NOT throttled by background tabs in Chrome/Safari/Firefox)
  initWorker() {
    try {
      if (typeof window !== "undefined" && window.Worker && window.Blob) {
        const workerBlob = new Blob([
          `
          let intervalId = null;
          self.onmessage = function(e) {
            if (e.data === 'start') {
              if (intervalId) clearInterval(intervalId);
              intervalId = setInterval(function() {
                self.postMessage('tick');
              }, 1000);
            } else if (e.data === 'stop') {
              if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
              }
            }
          };
          `
        ], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(workerBlob);
        this.worker = new Worker(workerUrl);
        this.worker.onmessage = (e) => {
          if (e.data === "tick") {
            this.handleTick();
          }
        };
      }
    } catch (e) {
      console.warn("Background Web Worker unavailable, using fallback interval:", e);
      this.worker = null;
    }
  }

  // Immediately synchronize wall-clock time whenever user switches back to this tab
  initVisibilityListener() {
    if (typeof document === "undefined") return;

    const syncTime = () => {
      if (this.status === "running" && this.startTime) {
        const actualElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.elapsedSeconds = Math.max(0, actualElapsed);
        this.checkCompletion();
        this.triggerTick();
      }
    };

    document.addEventListener("visibilitychange", syncTime);
    window.addEventListener("focus", syncTime);
  }

  // Synthesize pleasant completion chime via Web Audio API
  playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Play 3 ascending notes: C5, E5, G5
      playTone(523.25, 0.0, 0.4);
      playTone(659.25, 0.2, 0.4);
      playTone(783.99, 0.4, 0.6);
    } catch (e) {
      console.log("Audio alert not available:", e);
    }
  }

  setMode(mode, customMinutes = null) {
    this.reset();
    this.mode = mode;
    if (mode === "pomodoro") {
      this.targetSeconds = (customMinutes || 25) * 60;
    } else if (mode === "interview") {
      this.targetSeconds = 45 * 60; // 45-min Google technical interview
    } else {
      this.targetSeconds = 0;
    }
    this.persistActiveSession();
    this.triggerTick();
  }

  start(topic = "DSA Preparation", category = "DSA") {
    if (this.status === "running") return;
    this.sessionTopic = topic;
    this.sessionCategory = category;
    this.status = "running";
    this.startTime = Date.now() - (this.elapsedSeconds * 1000);

    // Start background worker
    if (this.worker) {
      this.worker.postMessage("start");
    } else {
      if (this.fallbackInterval) clearInterval(this.fallbackInterval);
      this.fallbackInterval = setInterval(() => this.handleTick(), 1000);
    }

    this.persistActiveSession();
    this.triggerTick();
  }

  handleTick() {
    if (this.status !== "running" || !this.startTime) return;

    // Strict wall-clock delta calculation: guarantees zero drift when tab is backgrounded!
    const actualElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.elapsedSeconds = Math.max(0, actualElapsed);

    this.checkCompletion();
    this.triggerTick();
  }

  checkCompletion() {
    if (this.mode !== "stopwatch" && this.elapsedSeconds >= this.targetSeconds) {
      this.stop();
      this.playChime();
      if (this.onComplete) {
        this.onComplete({
          mode: this.mode,
          durationSeconds: this.elapsedSeconds,
          topic: this.sessionTopic,
          category: this.sessionCategory
        });
      }
    }
  }

  pause() {
    if (this.status !== "running") return;
    this.status = "paused";
    if (this.startTime) {
      this.elapsedSeconds = Math.max(0, Math.floor((Date.now() - this.startTime) / 1000));
    }
    this.stopTicker();
    this.updateDocumentTitle(false);
    this.persistActiveSession();
    this.triggerTick();
  }

  resume() {
    if (this.status !== "paused") return;
    this.start(this.sessionTopic, this.sessionCategory);
  }

  reset() {
    this.stopTicker();
    this.status = "idle";
    this.elapsedSeconds = 0;
    this.startTime = null;
    this.updateDocumentTitle(false);
    this.clearPersistedSession();
    this.triggerTick();
  }

  stop() {
    const recordedSeconds = this.elapsedSeconds;
    this.stopTicker();
    this.status = "idle";
    this.elapsedSeconds = 0;
    this.startTime = null;
    this.updateDocumentTitle(false);
    this.clearPersistedSession();
    this.triggerTick();
    return recordedSeconds;
  }

  stopTicker() {
    if (this.worker) {
      this.worker.postMessage("stop");
    }
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }

  persistActiveSession() {
    try {
      if (typeof localStorage === "undefined") return;
      if (this.status === "idle") {
        this.clearPersistedSession();
        return;
      }
      const data = {
        mode: this.mode,
        status: this.status,
        elapsedSeconds: this.elapsedSeconds,
        targetSeconds: this.targetSeconds,
        startTime: this.startTime,
        sessionTopic: this.sessionTopic,
        sessionCategory: this.sessionCategory,
        timestamp: Date.now()
      };
      localStorage.setItem("active_study_timer", JSON.stringify(data));
    } catch {}
  }

  restoreActiveSession() {
    try {
      if (typeof localStorage === "undefined") return;
      const raw = localStorage.getItem("active_study_timer");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data) return;

      this.mode = data.mode || "stopwatch";
      this.targetSeconds = data.targetSeconds || 25 * 60;
      this.sessionTopic = data.sessionTopic || "DSA Preparation";
      this.sessionCategory = data.sessionCategory || "DSA";

      if (data.status === "running" && data.startTime) {
        const elapsedSinceStart = Math.floor((Date.now() - data.startTime) / 1000);
        if (this.mode !== "stopwatch" && elapsedSinceStart >= this.targetSeconds) {
          // Completed while page was closed
          this.status = "idle";
          this.elapsedSeconds = 0;
          this.clearPersistedSession();
        } else {
          this.elapsedSeconds = Math.max(0, elapsedSinceStart);
          this.start(this.sessionTopic, this.sessionCategory);
        }
      } else if (data.status === "paused") {
        this.status = "paused";
        this.elapsedSeconds = data.elapsedSeconds || 0;
      }
    } catch {}
  }

  clearPersistedSession() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("active_study_timer");
      }
    } catch {}
  }

  updateDocumentTitle(isRunning, formattedTime = "") {
    if (typeof document === "undefined") return;
    if (isRunning && formattedTime) {
      document.title = `(${formattedTime}) Google Prep`;
    } else {
      document.title = this.originalDocumentTitle || "Google Engineering Prep";
    }
  }

  triggerTick() {
    let displaySeconds = this.elapsedSeconds;
    if (this.mode !== "stopwatch") {
      displaySeconds = Math.max(0, this.targetSeconds - this.elapsedSeconds);
    }

    const hours = Math.floor(displaySeconds / 3600);
    const minutes = Math.floor((displaySeconds % 3600) / 60);
    const seconds = displaySeconds % 60;

    const formattedTime = hours > 0
      ? `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      : `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    let progressPercent = 0;
    if (this.mode !== "stopwatch" && this.targetSeconds > 0) {
      progressPercent = Math.min(100, Math.round((this.elapsedSeconds / this.targetSeconds) * 100));
    }

    this.updateDocumentTitle(this.status === "running", formattedTime);

    if (this.onTick) {
      this.onTick({
        status: this.status,
        mode: this.mode,
        elapsedSeconds: this.elapsedSeconds,
        remainingSeconds: displaySeconds,
        formattedTime,
        progressPercent,
        sessionTopic: this.sessionTopic,
        sessionCategory: this.sessionCategory
      });
    }
  }
}
