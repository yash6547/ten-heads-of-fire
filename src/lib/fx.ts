/** Canvas visual-effects engine: layered flames, embers, sparks, smoke, glow and varied fireworks. */
export type Rect = { x: number; y: number; w: number; h: number };
export interface EmitterRates { flame?: number; ember?: number; smoke?: number; spark?: number }
export interface EmitterOpts {
  /** flame size multiplier (default 1) */
  flameScale?: number;
  /** tall, fast-rising flame columns */
  tall?: boolean;
  /** persistent heat-glow radius in stage px (0 = off) */
  glow?: number;
}
interface Emitter { id: string; region: () => Rect | null; rates: EmitterRates; opts: EmitterOpts; acc: Record<string, number>; seed: number }

const FLAME = 0, EMBER = 1, SPARK = 2, SMOKE = 3, ROCKET = 4, GLOW = 5, FW = 6, WILLOW = 7, CRACKLE = 8, TRAIL = 9;
interface P {
  k: number; x: number; y: number; vx: number; vy: number; life: number; max: number; s: number;
  hue: number; seed: number; ty?: number; delay?: number; tw?: number; px?: number; py?: number; type?: FWType;
}

export type FWType = "chrys" | "willow" | "peony" | "crackle" | "ring";
export interface FWOpts { x?: number; ty?: number; type?: FWType; scale?: number; hue?: number }
/** 0 = small, 1 = medium, 2 = large */
export type BurstSize = 0 | 1 | 2;

const HUES = [45, 30, 0, 320, 200, 120, 55, 15, 280];

function sprite(color: string, size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, color);
  grd.addColorStop(0.4, color.replace(/[\d.]+\)$/, "0.45)"));
  grd.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

export class FX {
  private ctx: CanvasRenderingContext2D;
  private ps: P[] = [];
  private emitters = new Map<string, Emitter>();
  private pending: { at: number; x: number; y: number; hue: number; scale: number }[] = [];
  private raf = 0;
  private last = 0;
  private now = 0;
  private sprites: HTMLCanvasElement[] = [];
  private sp(i: number) { return this.sprites[i]!; }
  private smokeSprite!: HTMLCanvasElement;
  private fwSprites = new Map<number, HTMLCanvasElement>();
  w = 0; h = 0; dpr = 1;
  density = 1;
  flash = 0;
  ambient = 0; // ambient floating embers per second
  onBurst?: (size: BurstSize, type: FWType) => void;
  onLaunch?: (scale: number) => void;
  onCrackle?: () => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.sprites = [
      sprite("rgba(255,252,235,1)"), sprite("rgba(255,224,130,1)"), sprite("rgba(255,150,45,1)"),
      sprite("rgba(235,80,25,1)"), sprite("rgba(150,35,15,1)"),
    ];
    this.smokeSprite = sprite("rgba(48,42,50,0.55)", 96);
    this.resize();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = r.width; this.h = r.height;
    this.canvas.width = Math.max(1, r.width * this.dpr);
    this.canvas.height = Math.max(1, r.height * this.dpr);
  }

  start() {
    if (this.raf) return;
    this.last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now; this.now = now;
      this.tick(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
  destroy() { this.stop(); this.ps = []; this.emitters.clear(); this.pending = []; }

  addEmitter(id: string, region: () => Rect | null, rates: EmitterRates, opts: EmitterOpts = {}) {
    this.emitters.set(id, { id, region, rates, opts, acc: {}, seed: Math.random() * 100 });
  }
  setRates(id: string, rates: EmitterRates) { const e = this.emitters.get(id); if (e) e.rates = rates; }
  setOpts(id: string, opts: EmitterOpts) { const e = this.emitters.get(id); if (e) e.opts = { ...e.opts, ...opts }; }
  removeEmitter(id: string) { this.emitters.delete(id); }
  clear() { this.ps = []; this.emitters.clear(); this.pending = []; this.flash = 0; }

  private get scale() { return Math.max(0.5, this.h / 800); }
  private get cap() { return Math.round(3200 * this.density); }

  private spawn(k: number, x: number, y: number, o: Partial<P> = {}) {
    if (this.ps.length > this.cap) return;
    const sc = this.scale;
    const p: P = { k, x, y, vx: 0, vy: 0, life: 0, max: 1, s: 1, hue: 0, seed: Math.random() * 100, ...o };
    if (!o.max) {
      if (k === FLAME) { p.vx = (Math.random() - 0.5) * 40 * sc; p.vy = -(90 + Math.random() * 160) * sc; p.max = 0.5 + Math.random() * 0.8; p.s = (20 + Math.random() * 34) * sc; }
      if (k === EMBER) { p.vx = (Math.random() - 0.5) * 60 * sc; p.vy = -(50 + Math.random() * 140) * sc; p.max = 1.5 + Math.random() * 2.5; p.s = (1.2 + Math.random() * 2.2) * sc; }
      if (k === SPARK) { const a = Math.random() * Math.PI * 2, v = (150 + Math.random() * 380) * sc; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - 120 * sc; p.max = 0.4 + Math.random() * 0.8; p.s = (1 + Math.random() * 1.8) * sc; }
      if (k === SMOKE) { p.vx = (Math.random() - 0.5) * 24 * sc + 10 * sc; p.vy = -(30 + Math.random() * 55) * sc; p.max = 3 + Math.random() * 3.5; p.s = (34 + Math.random() * 46) * sc; }
    }
    this.ps.push(p);
  }

  burst(x: number, y: number, n = { sparks: 60, embers: 40, flames: 20, smoke: 6 }) {
    const d = this.density;
    for (let i = 0; i < n.sparks * d; i++) this.spawn(SPARK, x, y);
    for (let i = 0; i < n.embers * d; i++) this.spawn(EMBER, x + (Math.random() - 0.5) * 40, y);
    for (let i = 0; i < n.flames * d; i++) this.spawn(FLAME, x + (Math.random() - 0.5) * 50 * this.scale, y + (Math.random() - 0.5) * 30);
    for (let i = 0; i < n.smoke * d; i++) this.spawn(SMOKE, x + (Math.random() - 0.5) * 60, y);
  }

  glowAt(x: number, y: number, size: number, life = 0.35) {
    this.spawn(GLOW, x, y, { max: life, s: size, vx: 0, vy: 0 });
  }

  trail(x: number, y: number) {
    this.spawn(EMBER, x, y, { vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, max: 0.5 + Math.random() * 0.4, s: 1.5 + Math.random() * 1.5 });
    this.spawn(GLOW, x, y, { max: 0.25, s: 14 * this.scale });
  }

  // ---------------- fireworks ----------------
  firework(opts: FWOpts = {}) {
    const scale = opts.scale ?? 0.7 + Math.random() * 0.6;
    const type = opts.type ?? (["chrys", "willow", "peony", "crackle", "ring"] as FWType[])[Math.floor(Math.random() * 5)]!;
    const hue = opts.hue ?? (type === "willow" ? 45 : HUES[Math.floor(Math.random() * HUES.length)]!);
    const sx = opts.x ?? this.w * (0.08 + Math.random() * 0.84);
    const tY = opts.ty ?? this.h * (0.1 + Math.random() * 0.32);
    const sc = this.scale;
    const flight = 1.0 + Math.random() * 0.5;
    const g = 240 * sc;
    const y0 = this.h + 4;
    const vy = (tY - y0) / flight + 0.5 * g * flight;
    this.spawn(ROCKET, sx, y0, {
      vx: (Math.random() - 0.5) * 36 * sc, vy, max: flight, s: scale, hue, ty: tY, type,
    });
    this.onLaunch?.(scale);
  }

  private fwSprite(hue: number) {
    let s = this.fwSprites.get(hue);
    if (!s) { s = sprite(`hsla(${hue},100%,65%,1)`, 32); this.fwSprites.set(hue, s); }
    return s;
  }

  private fwSpark(x: number, y: number, a: number, v: number, hue: number, life: number, kind: number, tw = 0) {
    this.ps.push({
      k: kind, x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      life: 0, max: life, s: (1.1 + Math.random() * 1.2) * this.scale, hue, seed: Math.random() * 100, tw,
    });
  }

  private explode(p: P) {
    const d = this.density * p.s;
    const sc = this.scale;
    const type = p.type ?? "chrys";
    const size: BurstSize = p.s < 0.85 ? 0 : p.s < 1.25 ? 1 : 2;
    const rnd = Math.random;
    switch (type) {
      case "chrys": {
        const n = Math.round(110 * d);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + rnd() * 0.15;
          this.fwSpark(p.x, p.y, a, (110 + rnd() * 170) * sc, p.hue, 1.1 + rnd() * 0.9, FW);
        }
        break;
      }
      case "peony": {
        const n = Math.round(150 * d);
        for (let i = 0; i < n; i++) {
          const a = rnd() * Math.PI * 2;
          const v = (70 + rnd() * 190) * sc;
          this.fwSpark(p.x, p.y, a, v, rnd() < 0.25 ? 55 : p.hue, 0.9 + rnd() * 0.7, FW);
        }
        break;
      }
      case "willow": {
        const n = Math.round(70 * d);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + rnd() * 0.2;
          this.fwSpark(p.x, p.y, a, (90 + rnd() * 140) * sc, 45 + rnd() * 10, 2.4 + rnd() * 1.3, WILLOW);
        }
        break;
      }
      case "ring": {
        const n = Math.round(80 * d);
        const v = (170 + rnd() * 40) * sc;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          this.fwSpark(p.x, p.y, a, v * (0.95 + rnd() * 0.1), p.hue, 1.0 + rnd() * 0.4, FW);
        }
        break;
      }
      case "crackle": {
        const n = Math.round(70 * d);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + rnd() * 0.2;
          this.fwSpark(p.x, p.y, a, (100 + rnd() * 150) * sc, p.hue, 1.0 + rnd() * 0.7, FW, 1);
        }
        const nc = Math.round(45 * d);
        for (let i = 0; i < nc; i++) {
          const a = rnd() * Math.PI * 2, v = (40 + rnd() * 200) * sc;
          this.ps.push({
            k: CRACKLE, x: p.x, y: p.y, px: p.x, py: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
            life: 0, max: 0.5 + rnd() * 0.5, delay: 0.45 + rnd() * 0.8, s: (1 + rnd()) * sc, hue: 50, seed: rnd() * 100,
          });
        }
        this.onCrackle?.();
        break;
      }
    }
    this.glowAt(p.x, p.y, (90 + 70 * p.s) * sc, 0.5);
    // secondary mini-bursts for medium/large shells
    if (size >= 1) {
      const nSec = size === 2 ? 3 : 2;
      for (let i = 0; i < nSec; i++) {
        this.pending.push({
          at: this.now + 350 + rnd() * 550,
          x: p.x + (rnd() - 0.5) * 160 * sc,
          y: p.y + (rnd() - 0.5) * 120 * sc,
          hue: HUES[Math.floor(rnd() * HUES.length)]!,
          scale: p.s * 0.45,
        });
      }
    }
    this.onBurst?.(size, type);
  }

  private secondaryBoom(x: number, y: number, hue: number, scale: number) {
    const n = Math.round(34 * this.density * scale * 2);
    const sc = this.scale;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      this.fwSpark(x, y, a, (60 + Math.random() * 110) * sc, hue, 0.7 + Math.random() * 0.5, FW);
    }
    this.glowAt(x, y, 60 * sc * scale * 2, 0.35);
    this.onBurst?.(0, "chrys");
  }

  // ---------------- main loop ----------------
  private tick(dt: number) {
    const { ctx } = this;
    // emitters
    for (const e of this.emitters.values()) {
      const r = e.region();
      if (!r) continue;
      for (const key of ["flame", "ember", "smoke", "spark"] as const) {
        const rate = (e.rates[key] ?? 0) * this.density;
        if (!rate) continue;
        e.acc[key] = (e.acc[key] ?? 0) + rate * dt;
        while (e.acc[key] >= 1) {
          e.acc[key] -= 1;
          const k = key === "flame" ? FLAME : key === "ember" ? EMBER : key === "smoke" ? SMOKE : SPARK;
          const x = r.x + Math.random() * r.w;
          const y = r.y + (k === SMOKE ? Math.random() * r.h * 0.3 : Math.random() * r.h);
          if (k === FLAME) {
            const fs = e.opts.flameScale ?? 1;
            const tall = e.opts.tall;
            this.spawn(FLAME, x, y, {
              vy: -(90 + Math.random() * 160) * this.scale * (tall ? 1.7 : 1),
              s: (20 + Math.random() * 34) * this.scale * fs,
              max: 0.5 + Math.random() * 0.8 * (tall ? 1.4 : 1),
            });
          } else {
            this.spawn(k, x, y);
          }
        }
      }
    }
    if (this.ambient) {
      if (Math.random() < this.ambient * this.density * dt)
        this.spawn(EMBER, Math.random() * this.w, this.h + 5, { vx: (Math.random() - 0.5) * 15, vy: -(20 + Math.random() * 40), max: 6 + Math.random() * 6, s: 1 + Math.random() * 1.8 });
    }
    // pending secondary bursts
    if (this.pending.length) {
      const due = this.pending.filter((q) => q.at <= this.now);
      this.pending = this.pending.filter((q) => q.at > this.now);
      for (const q of due) this.secondaryBoom(q.x, q.y, q.hue, q.scale);
    }

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const g = 160 * this.scale;
    const alive: P[] = [];

    // persistent heat glows (additive, behind particles)
    ctx.globalCompositeOperation = "lighter";
    for (const e of this.emitters.values()) {
      if (!e.opts.glow) continue;
      const r = e.region();
      if (!r) continue;
      const flick = 0.72 + 0.2 * Math.sin(this.now * 0.013 + e.seed) + 0.08 * Math.sin(this.now * 0.047 + e.seed * 2);
      const rad = e.opts.glow * this.scale * flick;
      ctx.globalAlpha = 0.2 * flick * Math.min(1, this.density + 0.3);
      ctx.drawImage(this.sp(2), r.x + r.w / 2 - rad, r.y + r.h * 0.55 - rad, rad * 2, rad * 2);
    }

    // smoke pass (normal blending, under fire)
    ctx.globalCompositeOperation = "source-over";
    for (const p of this.ps) {
      p.life += dt;
      if (p.k === CRACKLE && p.delay && p.life < p.delay) { alive.push(p); continue; }
      if (p.life >= p.max + (p.delay ?? 0)) {
        if (p.k === ROCKET) this.explode(p);
        continue;
      }
      if (p.k === SMOKE) {
        p.x += (p.vx + Math.sin(p.life * 1.7 + p.seed) * 12 * this.scale) * dt; p.y += p.vy * dt; p.s += 26 * this.scale * dt;
        const t = p.life / p.max;
        ctx.globalAlpha = Math.sin(Math.PI * t) * 0.5;
        ctx.drawImage(this.smokeSprite, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
      }
      alive.push(p);
    }
    ctx.globalCompositeOperation = "lighter";
    for (const p of alive) {
      const t = Math.max(0, (p.life - (p.delay ?? 0))) / p.max;
      switch (p.k) {
        case FLAME: {
          p.x += (p.vx + Math.sin(p.life * 9 + p.seed) * 28 * this.scale + Math.sin(p.life * 23 + p.seed * 3) * 12 * this.scale) * dt;
          p.y += p.vy * dt; p.vy *= 0.995;
          const s = p.s * (1 - t * 0.6);
          const idx = Math.min(4, Math.floor(t * 5));
          ctx.globalAlpha = (1 - t) * 0.8;
          ctx.drawImage(this.sp(idx), p.x - s, p.y - s * 1.4, s * 2, s * 2.8);
          if (t < 0.5) { // white-hot core
            ctx.globalAlpha = (0.5 - t) * 1.5;
            const cs = s * 0.55;
            ctx.drawImage(this.sp(0), p.x - cs, p.y - cs * 0.6, cs * 2, cs * 2);
          }
          break;
        }
        case EMBER: {
          p.vx += Math.sin(p.life * 3 + p.seed) * 24 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          ctx.globalAlpha = (1 - t) * (0.6 + 0.4 * Math.sin(p.life * 12 + p.seed));
          const s = p.s * 4;
          ctx.drawImage(this.sp(t < 0.5 ? 1 : 2), p.x - s, p.y - s, s * 2, s * 2);
          break;
        }
        case SPARK: {
          const px = p.x, py = p.y;
          p.vy += g * dt; p.vx *= 0.985; p.vy *= 0.985;
          p.x += p.vx * dt; p.y += p.vy * dt;
          ctx.globalAlpha = 1 - t;
          ctx.strokeStyle = t < 0.4 ? "#fff6c8" : "#ffab3d";
          ctx.lineWidth = p.s;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(p.x, p.y); ctx.stroke();
          break;
        }
        case ROCKET: {
          p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 240 * this.scale * dt * 0.4;
          // launch trail
          this.spawn(TRAIL, p.x + (Math.random() - 0.5) * 3, p.y + 4, {
            vx: (Math.random() - 0.5) * 20, vy: 30 + Math.random() * 30,
            max: 0.3 + Math.random() * 0.35, s: (0.9 + Math.random()) * this.scale, hue: 48,
          });
          if (p.y <= (p.ty ?? 0) || p.vy > -40 * this.scale) p.life = p.max;
          ctx.globalAlpha = 1;
          const hs = 5 * this.scale;
          ctx.drawImage(this.sp(1), p.x - hs, p.y - hs, hs * 2, hs * 2);
          ctx.drawImage(this.sp(0), p.x - hs * 0.5, p.y - hs * 0.5, hs, hs);
          break;
        }
        case TRAIL: {
          p.x += p.vx * dt; p.y += p.vy * dt;
          ctx.globalAlpha = (1 - t) * 0.8;
          const s = p.s * 2.2;
          ctx.drawImage(this.fwSprite(p.hue), p.x - s, p.y - s, s * 2, s * 2);
          break;
        }
        case FW: case WILLOW: {
          p.px = p.x; p.py = p.y;
          const grav = p.k === WILLOW ? 105 * this.scale : 65 * this.scale;
          p.vy += grav * dt;
          const drag = p.k === WILLOW ? 0.988 : 0.982;
          p.vx *= drag; p.vy *= drag;
          if (p.k === WILLOW) p.vx += Math.sin(p.life * 2.2 + p.seed) * 8 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          let a = 1 - t;
          if (p.tw) a *= 0.45 + 0.55 * Math.max(0, Math.sin(p.life * 34 + p.seed * 12));
          ctx.globalAlpha = a;
          ctx.strokeStyle = `hsla(${p.hue},100%,${p.k === WILLOW ? 62 : 68}%,${a})`;
          ctx.lineWidth = p.s;
          ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
          const s = p.s * 1.6;
          ctx.drawImage(this.fwSprite(p.hue), p.x - s, p.y - s, s * 2, s * 2);
          break;
        }
        case CRACKLE: {
          if (p.life < (p.delay ?? 0)) break;
          p.px = p.x; p.py = p.y;
          p.vy += 80 * this.scale * dt; p.vx *= 0.98; p.vy *= 0.98;
          p.x += p.vx * dt; p.y += p.vy * dt;
          const blink = Math.sin(p.life * 46 + p.seed * 20) > -0.2 ? 1 : 0.08;
          ctx.globalAlpha = (1 - t) * blink;
          const s = p.s * 1.8;
          ctx.drawImage(this.sp(0), p.x - s, p.y - s, s * 2, s * 2);
          break;
        }
        case GLOW: {
          ctx.globalAlpha = (1 - t) * 0.8;
          ctx.drawImage(this.sp(1), p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
          break;
        }
      }
    }
    this.ps = alive;
    if (this.flash > 0) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.min(1, this.flash) * 0.7;
      ctx.fillStyle = "#fff1c2";
      ctx.fillRect(0, 0, this.w, this.h);
      this.flash = Math.max(0, this.flash - dt * 3);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}
