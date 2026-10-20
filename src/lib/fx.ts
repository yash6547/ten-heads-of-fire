/** Canvas visual-effects engine: flames, embers, sparks, smoke, fireworks. */
export type Rect = { x: number; y: number; w: number; h: number };
export interface EmitterRates { flame?: number; ember?: number; smoke?: number; spark?: number }
interface Emitter { id: string; region: () => Rect | null; rates: EmitterRates; acc: Record<string, number> }

const FLAME = 0, EMBER = 1, SPARK = 2, SMOKE = 3, ROCKET = 4, GLOW = 5;
interface P { k: number; x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; hue: number; seed: number; ty?: number }

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
  private raf = 0;
  private last = 0;
  private sprites: HTMLCanvasElement[] = [];
  private sp(i: number) { return this.sprites[i]!; }
  private smokeSprite!: HTMLCanvasElement;
  private fwSprites = new Map<number, HTMLCanvasElement>();
  w = 0; h = 0; dpr = 1;
  density = 1;
  flash = 0;
  ambient = 0; // ambient floating embers per second
  onBurst?: (big: boolean) => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.sprites = [
      sprite("rgba(255,250,220,1)"), sprite("rgba(255,214,110,1)"), sprite("rgba(255,140,40,1)"),
      sprite("rgba(230,70,25,1)"), sprite("rgba(140,30,15,1)"),
    ];
    this.smokeSprite = sprite("rgba(70,66,72,0.5)", 96);
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
      this.last = now;
      this.tick(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
  destroy() { this.stop(); this.ps = []; this.emitters.clear(); }

  addEmitter(id: string, region: () => Rect | null, rates: EmitterRates) {
    this.emitters.set(id, { id, region, rates, acc: {} });
  }
  setRates(id: string, rates: EmitterRates) { const e = this.emitters.get(id); if (e) e.rates = rates; }
  removeEmitter(id: string) { this.emitters.delete(id); }
  clear() { this.ps = []; this.emitters.clear(); this.flash = 0; }

  private get scale() { return Math.max(0.5, this.h / 800); }
  private get cap() { return Math.round(2600 * this.density); }

  private spawn(k: number, x: number, y: number, o: Partial<P> = {}) {
    if (this.ps.length > this.cap) return;
    const sc = this.scale;
    const p: P = { k, x, y, vx: 0, vy: 0, life: 0, max: 1, s: 1, hue: 0, seed: Math.random() * 100, ...o };
    if (!o.max) {
      if (k === FLAME) { p.vx = (Math.random() - 0.5) * 30 * sc; p.vy = -(70 + Math.random() * 110) * sc; p.max = 0.5 + Math.random() * 0.7; p.s = (18 + Math.random() * 28) * sc; }
      if (k === EMBER) { p.vx = (Math.random() - 0.5) * 50 * sc; p.vy = -(40 + Math.random() * 120) * sc; p.max = 1.5 + Math.random() * 2.5; p.s = (1.2 + Math.random() * 2.2) * sc; }
      if (k === SPARK) { const a = Math.random() * Math.PI * 2, v = (150 + Math.random() * 380) * sc; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - 120 * sc; p.max = 0.4 + Math.random() * 0.8; p.s = (1 + Math.random() * 1.8) * sc; }
      if (k === SMOKE) { p.vx = (Math.random() - 0.5) * 20 * sc + 8 * sc; p.vy = -(25 + Math.random() * 45) * sc; p.max = 3 + Math.random() * 3; p.s = (30 + Math.random() * 40) * sc; }
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

  firework(x?: number, ty?: number) {
    const hue = [45, 30, 0, 320, 200, 120, 55][Math.floor(Math.random() * 7)] ?? 45;
    const sx = x ?? this.w * (0.1 + Math.random() * 0.8);
    const tY = ty ?? this.h * (0.12 + Math.random() * 0.3);
    this.spawn(ROCKET, sx, this.h, { vx: (Math.random() - 0.5) * 40, vy: -(this.h * 0.9), max: 3, s: 2, hue, ty: tY });
  }

  private fwSprite(hue: number) {
    let s = this.fwSprites.get(hue);
    if (!s) { s = sprite(`hsla(${hue},100%,65%,1)`, 32); this.fwSprites.set(hue, s); }
    return s;
  }

  private explode(p: P) {
    const n = Math.round(90 * this.density);
    const sc = this.scale;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.1;
      const v = (120 + Math.random() * 140) * sc;
      this.ps.push({ k: SPARK, x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 1.2 + Math.random() * 0.8, s: 2 * sc, hue: p.hue, seed: 1 });
    }
    this.glowAt(p.x, p.y, 120 * sc, 0.5);
    this.onBurst?.(false);
  }

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
          this.spawn(k, x, y);
        }
      }
    }
    if (this.ambient) {
      if (Math.random() < this.ambient * this.density * dt)
        this.spawn(EMBER, Math.random() * this.w, this.h + 5, { vx: (Math.random() - 0.5) * 15, vy: -(20 + Math.random() * 40), max: 6 + Math.random() * 6, s: 1 + Math.random() * 1.8 });
    }

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const g = 160 * this.scale;
    const alive: P[] = [];
    // smoke pass
    ctx.globalCompositeOperation = "source-over";
    for (const p of this.ps) {
      p.life += dt;
      if (p.life >= p.max) {
        if (p.k === ROCKET) this.explode(p);
        continue;
      }
      if (p.k === SMOKE) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.s += 22 * this.scale * dt;
        const t = p.life / p.max;
        ctx.globalAlpha = Math.sin(Math.PI * t) * 0.55;
        ctx.drawImage(this.smokeSprite, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
      }
      alive.push(p);
    }
    ctx.globalCompositeOperation = "lighter";
    for (const p of alive) {
      const t = p.life / p.max;
      switch (p.k) {
        case FLAME: {
          p.x += (p.vx + Math.sin(p.life * 9 + p.seed) * 25 * this.scale) * dt; p.y += p.vy * dt;
          const s = p.s * (1 - t * 0.7);
          const idx = Math.min(4, Math.floor(t * 5));
          ctx.globalAlpha = (1 - t) * 0.75;
          ctx.drawImage(this.sp(idx), p.x - s, p.y - s * 1.3, s * 2, s * 2.6);
          break;
        }
        case EMBER: {
          p.vx += Math.sin(p.life * 3 + p.seed) * 20 * dt;
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
          if (p.hue && p.seed === 1) {
            const s = p.s * 3;
            ctx.drawImage(this.fwSprite(p.hue), p.x - s, p.y - s, s * 2, s * 2);
          } else {
            ctx.strokeStyle = t < 0.4 ? "#fff6c8" : "#ffab3d";
            ctx.lineWidth = p.s;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(p.x, p.y); ctx.stroke();
          }
          break;
        }
        case ROCKET: {
          p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= 0.985;
          this.spawn(EMBER, p.x, p.y, { vx: 0, vy: 20, max: 0.5, s: 1.2 });
          if (p.y <= (p.ty ?? 0)) p.life = p.max;
          ctx.globalAlpha = 1;
          ctx.drawImage(this.sp(1), p.x - 6, p.y - 6, 12, 12);
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
