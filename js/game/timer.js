export class GameTimer {
  constructor(onUpdate) {
    this.startedAt = 0;
    this.elapsedMs = 0;
    this.isRunning = false;
    this.animationFrameId = null;
    this.onUpdate = onUpdate;
  }

  start() {
    if (this.isRunning) return;
    this.startedAt = performance.now();
    this.isRunning = true;
    this._tick();
  }

  stop() {
    if (!this.isRunning) return;
    this.elapsedMs = Math.round(performance.now() - this.startedAt);
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  getDuration() {
    if (this.isRunning) {
      return Math.round(performance.now() - this.startedAt);
    }
    return Math.round(this.elapsedMs);
  }

  _tick() {
    if (!this.isRunning) return;
    
    if (this.onUpdate) {
      this.onUpdate(this.getDuration());
    }
    
    this.animationFrameId = requestAnimationFrame(() => this._tick());
  }
}
