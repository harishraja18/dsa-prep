// Professional Study Hours & Deep Work Tracker with Web Audio Synthesis

export class StudyTimer {
  constructor(onTick, onComplete) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.timerId = null;
    this.mode = "stopwatch"; // 'stopwatch' | 'pomodoro' | 'interview'
    this.status = "idle"; // 'idle' | 'running' | 'paused'
    this.elapsedSeconds = 0;
    this.targetSeconds = 25 * 60; // 25 mins for pomodoro, 45 mins for mock interview
    this.startTime = null;
    this.sessionTopic = "DSA Preparation";
    this.sessionCategory = "DSA"; // 'DSA' | 'AI' | 'Mock' | 'General'
  }

  // Synthesize pleasant completion chime via Web Audio API (Zero external assets needed)
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
    this.triggerTick();
  }

  start(topic = "DSA Preparation", category = "DSA") {
    if (this.status === "running") return;
    this.sessionTopic = topic;
    this.sessionCategory = category;
    this.status = "running";
    this.startTime = Date.now() - (this.elapsedSeconds * 1000);

    this.timerId = setInterval(() => {
      this.elapsedSeconds++;

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

      this.triggerTick();
    }, 1000);

    this.triggerTick();
  }

  pause() {
    if (this.status !== "running") return;
    this.status = "paused";
    clearInterval(this.timerId);
    this.timerId = null;
    this.triggerTick();
  }

  resume() {
    if (this.status !== "paused") return;
    this.start(this.sessionTopic, this.sessionCategory);
  }

  reset() {
    clearInterval(this.timerId);
    this.timerId = null;
    this.status = "idle";
    this.elapsedSeconds = 0;
    this.triggerTick();
  }

  stop() {
    const recordedSeconds = this.elapsedSeconds;
    this.pause();
    this.reset();
    return recordedSeconds;
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
