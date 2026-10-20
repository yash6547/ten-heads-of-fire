import { SOUNDS, type SoundKey } from "./sounds.config";

export interface AudioSettings {
  master: number;
  music: number;
  sfx: number;
  muted: boolean;
  musicEnabled: boolean;
}

type Listener = () => void;

/** Centralized audio service. All playback goes through here. */
class AudioManager {
  settings: AudioSettings = { master: 0.8, music: 0.45, sfx: 0.9, muted: false, musicEnabled: true };
  unlocked = false;
  failed = new Set<SoundKey>();
  currentMusic: SoundKey | null = null;
  private els = new Map<SoundKey, HTMLAudioElement>();
  private fades = new Map<HTMLAudioElement, number>();
  private oneShots = new Set<HTMLAudioElement>();
  private listeners = new Set<Listener>();

  subscribe(l: Listener) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
  private emit() { this.listeners.forEach((l) => l()); }

  private el(key: SoundKey) {
    let a = this.els.get(key);
    if (!a) {
      const def = SOUNDS[key];
      a = new Audio(def.src);
      a.preload = "auto";
      a.loop = !!("loop" in def && def.loop);
      a.addEventListener("error", () => { this.failed.add(key); this.emit(); });
      this.els.set(key, a);
    }
    return a;
  }

  private target(key: SoundKey) {
    const s = this.settings;
    if (s.muted) return 0;
    const def = SOUNDS[key];
    const cat = def.category === "music" ? s.music : s.sfx;
    return Math.max(0, Math.min(1, s.master * cat * def.volume));
  }

  private fade(a: HTMLAudioElement, to: number, ms: number, done?: () => void) {
    const prev = this.fades.get(a);
    if (prev) cancelAnimationFrame(prev);
    const from = a.volume, t0 = performance.now();
    if (ms <= 0) { a.volume = to; done?.(); return; }
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      a.volume = from + (to - from) * k;
      if (k < 1) this.fades.set(a, requestAnimationFrame(step));
      else { this.fades.delete(a); done?.(); }
    };
    this.fades.set(a, requestAnimationFrame(step));
  }

  unlock() {
    if (typeof window === "undefined" || this.unlocked) return;
    this.unlocked = true;
    (Object.keys(SOUNDS) as SoundKey[]).forEach((k) => this.el(k).load());
    this.emit();
  }

  /** Play a sound. restart=false keeps an already-playing instance (prevents overlap). */
  play(key: SoundKey, opts: { fadeIn?: number; restart?: boolean } = {}) {
    if (typeof window === "undefined" || !this.unlocked) return;
    const def = SOUNDS[key];
    if (def.category === "music" && !this.settings.musicEnabled) return;
    const a = this.el(key);
    if (opts.restart === false && !a.paused) return;
    const vol = this.target(key);
    a.currentTime = 0;
    a.volume = opts.fadeIn ? 0 : vol;
    a.play().catch(() => { /* blocked or missing: experience continues silently */ });
    if (opts.fadeIn) this.fade(a, vol, opts.fadeIn);
  }

  /** Overlapping one-shot (e.g. many firework bursts). Capped to avoid clutter. */
  playLayered(key: SoundKey, volScale = 1) {
    if (typeof window === "undefined" || !this.unlocked || this.oneShots.size >= 5) return;
    const a = new Audio(SOUNDS[key].src);
    a.volume = this.target(key) * volScale;
    this.oneShots.add(a);
    const clean = () => this.oneShots.delete(a);
    a.addEventListener("ended", clean);
    a.addEventListener("error", () => { clean(); this.failed.add(key); });
    a.play().catch(clean);
  }

  stop(key: SoundKey, fadeOut = 400) {
    const a = this.els.get(key);
    if (!a || a.paused) return;
    this.fade(a, 0, fadeOut, () => { a.pause(); a.currentTime = 0; });
  }

  /** Stop all sound effects (keeps music unless includeMusic). */
  stopAll(fadeOut = 500, includeMusic = false) {
    (Object.keys(SOUNDS) as SoundKey[]).forEach((k) => {
      if (!includeMusic && SOUNDS[k].category === "music") return;
      this.stop(k, fadeOut);
    });
    this.oneShots.forEach((a) => a.pause());
    this.oneShots.clear();
  }

  playMusic(key: SoundKey) {
    if (this.currentMusic && this.currentMusic !== key) this.stop(this.currentMusic, 900);
    this.currentMusic = key;
    this.play(key, { fadeIn: 1500, restart: false });
    this.emit();
  }

  setSettings(p: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...p };
    this.els.forEach((a, k) => { if (!a.paused) this.fade(a, this.target(k), 150); });
    this.oneShots.forEach((a) => { if (this.settings.muted) a.volume = 0; });
    if (p.musicEnabled === false && this.currentMusic) this.stop(this.currentMusic, 600);
    if (p.musicEnabled === true && this.currentMusic) this.play(this.currentMusic, { fadeIn: 1200, restart: false });
    this.emit();
  }
}

export const audio = new AudioManager();
