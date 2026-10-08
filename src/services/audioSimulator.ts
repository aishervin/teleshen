/**
 * Web Audio synthesizer for Telegram voice notes and UI sound effects
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private activeOscillator: OscillatorNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play outgoing message sent click/whoosh
  playSent() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // AudioContext policy safe fallback
    }
  }

  // Play notification beep
  playReceive() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.06); // A5
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {
      // AudioContext policy safe fallback
    }
  }

  // Play synthetic voice speech tone
  playVoiceSnippet(durationSeconds: number, onProgress: (progress: number) => void, onEnd: () => void) {
    try {
      this.initCtx();
      if (!this.ctx) {
        onEnd();
        return () => {};
      }

      const startTime = Date.now();
      const totalMs = durationSeconds * 1000;
      let isPlaying = true;

      // Soft melodic ambient voice simulator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();

      const interval = setInterval(() => {
        if (!isPlaying) return;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / totalMs);
        onProgress(progress);

        if (this.ctx) {
          // modulate pitch subtly like natural human speech cadence
          const freq = 220 + Math.sin(elapsed / 120) * 45;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        }

        if (progress >= 1) {
          clearInterval(interval);
          isPlaying = false;
          try {
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx?.currentTime || 0 + 0.05);
            osc.stop();
          } catch {
            // ignore
          }
          onEnd();
        }
      }, 50);

      return () => {
        isPlaying = false;
        clearInterval(interval);
        try {
          osc.stop();
        } catch {
          // ignore
        }
      };
    } catch {
      onEnd();
      return () => {};
    }
  }
}

export const soundEngine = new SoundEngine();
