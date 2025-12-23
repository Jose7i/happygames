
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {}

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.2; // Keep it subtle
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createOscillator(type: OscillatorType, freq: number, duration: number, vol: number = 0.5) {
    if (!this.ctx || !this.masterGain) return null;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    return { osc, gain };
  }

  playHover() {
    if (!this.ctx) this.init();
    this.resume();
    // High blip
    const sound = this.createOscillator('sine', 800, 0.05, 0.1);
    if (sound) {
        sound.osc.start();
        sound.osc.stop(this.ctx!.currentTime + 0.05);
    }
  }

  playClick() {
    if (!this.ctx) this.init();
    this.resume();
    // Sci-fi confirm
    const sound = this.createOscillator('square', 440, 0.15, 0.15);
    if (sound) {
        sound.osc.frequency.setValueAtTime(440, this.ctx!.currentTime);
        sound.osc.frequency.exponentialRampToValueAtTime(880, this.ctx!.currentTime + 0.1);
        sound.osc.start();
        sound.osc.stop(this.ctx!.currentTime + 0.15);
    }
  }

  playExplosion() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    const duration = 0.8;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Pinkish noise
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Compensate for gain loss
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }

  playLaser() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    const now = this.ctx.currentTime;
    
    // Pew sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playPowerup(type: 'shield' | 'score' | 'slow') {
      if (!this.ctx) return;
      this.resume();
      
      const now = this.ctx.currentTime;
      
      if (type === 'score') {
          // Coin / High chime
          const s1 = this.createOscillator('sine', 1000, 0.1, 0.1);
          const s2 = this.createOscillator('sine', 1500, 0.2, 0.1);
          if (s1) { s1.osc.start(now); s1.osc.stop(now + 0.1); }
          if (s2) { s2.osc.start(now + 0.08); s2.osc.stop(now + 0.25); }
      } else if (type === 'shield') {
          // Shield energize
          const s = this.createOscillator('triangle', 300, 0.5, 0.15);
          if (s) {
              s.osc.frequency.linearRampToValueAtTime(600, now + 0.5);
              s.gain.gain.setValueAtTime(0, now);
              s.gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
              s.gain.gain.linearRampToValueAtTime(0, now + 0.5);
              s.osc.start(now);
              s.osc.stop(now + 0.5);
          }
      } else if (type === 'slow') {
          // Time warp down
          const s = this.createOscillator('sine', 400, 0.6, 0.15);
          if (s) {
              s.osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
              // LFO effect on gain for wobble
              s.osc.start(now);
              s.osc.stop(now + 0.6);
          }
      }
  }

  playShieldBreak() {
      if (!this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const s = this.createOscillator('sawtooth', 600, 0.3, 0.15);
      if (s) {
          s.osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
          s.osc.start(now);
          s.osc.stop(now + 0.3);
      }
  }
}

let lastOut = 0;
export const audioManager = new AudioManager();
