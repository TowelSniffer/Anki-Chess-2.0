import type { UserConfigOpts } from '$Types/UserConfig';

export class TimerStore {
  // --- State ---
  isRunning = false;
  totalTime; // in ms (initial duration)
  remainingTime; // in ms
  // Controls if the board shows the timer gradient
  visible = $state(false);

  // --- Internal ---
  private animationFrameId: number | null = null;
  private lastTickTimestamp: number | null = null;

  private _internalRemaining;
  private _lastStateUpdate = 0;
  private _config: UserConfigOpts;

  constructor(getConfig: () => UserConfigOpts) {
    this._config = getConfig();
    this.totalTime = this._config.timer;
    this.remainingTime = $state(this._config.timer);
    this._internalRemaining = this._config.timer;
  }

  /*
   * GETTERS
   */

  // Calculates the percentage (0% to 100%) for the CSS gradient
  get percent() {
    if (this.totalTime === 0) return 0;
    const p = 100 - (this.remainingTime / this.totalTime) * 100;
    return Math.min(Math.max(p, 0), 100);
  }

  get isOutOfTime() {
    return this._config?.timer && this.remainingTime === 0;
  }

  // --- Actions ---

  /**
   * Initialize and start the timer
   * @param durationMs - Duration in milliseconds
   */
  start(durationMs: number = this._config.timer) {
    this.stop();

    // Reset totalTime to the initial duration requested
    this.totalTime = durationMs;
    this.remainingTime = durationMs;

    this.visible = true;
    this.isRunning = true;

    this.animationFrameId = requestAnimationFrame((t) => this._loop(t));
  }

  stop() {
    this.isRunning = false;
    this.visible = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastTickTimestamp = null;
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastTickTimestamp = null;
  }

  resume() {
    if (this.remainingTime > 0 && !this.isRunning) {
      this.isRunning = true;
      this.animationFrameId = requestAnimationFrame((t) => this._loop(t));
    }
  }

  /**
   * Smoothly adds time to the clock over (gameStore.aiDelayTime)
   */
  extend(ms: number = this._config.increment, duration: number = this._config.animationTime + 100) {
    if (!this.visible) return;

    this.pause();

    // Base the math on the precise internal state, not the throttled UI state
    const startRemaining = this._internalRemaining;
    const startTotal = this.totalTime;

    const targetRemaining = startRemaining + ms;
    // If we exceed original total, targetTotal must grow to match
    const targetTotal = Math.max(startTotal, targetRemaining);

    // define extend animation duration
    const startTime = performance.now();

    // start the Extension Loop
    const animate = (now: number) => {
      const elapsed = now - startTime;
      // calculate linear progress (0 to 1)
      const rawProgress = Math.min(elapsed / duration, 1);

      // Apply Easing (Cubic Ease Out)
      const progress = 1 - Math.pow(1 - rawProgress, 3);

      // Update the internal tracker
      this._internalRemaining = startRemaining + (targetRemaining - startRemaining) * progress;
      this.totalTime = startTotal + (targetTotal - startTotal) * progress;

      // Apply the same throttle logic from _loop
      if (now - this._lastStateUpdate > 16) {
        this.remainingTime = this._internalRemaining;
        this._lastStateUpdate = now;
      }

      if (rawProgress < 1) {
        // Check rawProgress for completion
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation Complete: Ensure both internal and UI states sync exactly at the end
        this._internalRemaining = targetRemaining;
        this.remainingTime = targetRemaining;
        this.totalTime = targetTotal;
        this.animationFrameId = null;

        // Resume immediately? FIXME could handle elsewhere...
        this.resume();
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  reset() {
    this.stop();
    this.remainingTime = this._config.timer;
    this.totalTime = this._config.timer;
    this._internalRemaining = this._config.timer;
    this._lastStateUpdate = 0;
  }

  destroy() {
    this.reset();
  }

  // --- Loop Logic ---
  private _loop(timestamp: number) {
    if (!this.isRunning) return;
    if (!this.lastTickTimestamp) this.lastTickTimestamp = timestamp;

    const deltaTime = timestamp - this.lastTickTimestamp;
    this.lastTickTimestamp = timestamp;

    // Internal Tracking
    this._internalRemaining = Math.max(0, this._internalRemaining - deltaTime);

    // Throttle Svelte reactivity updates to ~60fps (every 16ms)
    if (timestamp - this._lastStateUpdate > 16) {
      this.remainingTime = this._internalRemaining;
      this._lastStateUpdate = timestamp;
    }

    if (this._internalRemaining === 0) {
      this.remainingTime = 0; // Force exact final state
      this._handleOutOfTime();
    } else {
      this.animationFrameId = requestAnimationFrame((t) => this._loop(t));
    }
  }

  private _handleOutOfTime() {
    this.stop();
  }
}
