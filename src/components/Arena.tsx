import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Flame, Download, Share2, RotateCcw, UserRound, Sparkles } from "lucide-react";
import { Backdrop } from "./art/Backdrop";
import { Ravan, HEADS, HEAD_BURN_ORDER, REGIONS, IMPACT_POINT, type BurnMap, type PartId, type PartState } from "./art/Ravan";
import { Ram, ARROW_NOCK } from "./art/Ram";
import { FX, type Rect } from "@/lib/fx";
import { audio } from "@/lib/audio-manager";
import { TIMELINE, isRunning, type Phase } from "@/lib/experience";
import { downloadSvgAsPng, shareExperience } from "@/lib/share";

type Mode = "arrow" | "manual";
interface Props {
  phase: Phase;
  go: (p: Phase) => boolean;
  faceUrl: string | null;
  density: number;
  reduced: boolean;
  toast: (m: string) => void;
}

const STAGE_LABEL: Partial<Record<Phase, string>> = {
  ready: "Ready", arrow_flight: "Shri Ram draws the bow…", ignition: "Ignition!", progressive_burn: "Ravan is burning", finale: "Vijayadashami!", complete: "Vijayadashami!",
};

export function Arena({ phase, go, faceUrl, density, reduced, toast }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ravanRef = useRef<SVGSVGElement>(null);
  const cleanRef = useRef<SVGSVGElement>(null);
  const ramRef = useRef<SVGSVGElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<FX | null>(null);
  const timers = useRef<number[]>([]);
  const arrowRaf = useRef(0);
  const fwTimer = useRef(0);
  const lastBurstSnd = useRef(0);
  const [burn, setBurn] = useState<BurnMap>({});
  const [drawn, setDrawn] = useState(false);
  const [nocked, setNocked] = useState(false);
  const [mode, setMode] = useState<Mode>("arrow");
  const [confirming, setConfirming] = useState(false);
  const [shake, setShake] = useState(0);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ---------- FX lifecycle ----------
  useEffect(() => {
    const fx = new FX(canvasRef.current!);
    fxRef.current = fx;
    fx.start();
    fx.onBurst = () => {
      const now = performance.now();
      if (now - lastBurstSnd.current > 280) { lastBurstSnd.current = now; audio.playLayered("fireworkBurst", 0.7); }
    };
    const ro = new ResizeObserver(() => fx.resize());
    ro.observe(stageRef.current!);
    return () => {
      ro.disconnect();
      fx.destroy();
      timers.current.forEach(clearTimeout);
      clearInterval(fwTimer.current);
      cancelAnimationFrame(arrowRaf.current);
      audio.stopAll(400);
    };
  }, []);

  useEffect(() => {
    const fx = fxRef.current; if (!fx) return;
    fx.density = density;
    fx.ambient = reduced ? 0 : 5;
  }, [density, reduced]);

  // ---------- coordinate mapping (responsive: recomputed every frame) ----------
  const mapPt = useCallback((svg: SVGSVGElement | null, x: number, y: number) => {
    const stage = stageRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !stage || !m) return null;
    const p = new DOMPoint(x, y).matrixTransform(m);
    const r = stage.getBoundingClientRect();
    return { x: p.x - r.left, y: p.y - r.top };
  }, []);
  const regionOf = useCallback((pid: string, shrinkTop = 0): (() => Rect | null) => () => {
    const r = REGIONS[pid];
    const a = mapPt(ravanRef.current, r.x, r.y + r.h * shrinkTop);
    const b = mapPt(ravanRef.current, r.x + r.w, r.y + r.h);
    return a && b ? { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y } : null;
  }, [mapPt]);

  const at = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const setPart = (ids: PartId[], st: PartState) => setBurn((b) => { const n = { ...b }; ids.forEach((i) => (n[i] = st)); return n; });
  const doShake = () => { if (!reduced) setShake((s) => s + 1); };

  // ---------- reset ----------
  const resetAll = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    clearInterval(fwTimer.current);
    cancelAnimationFrame(arrowRaf.current);
    if (arrowRef.current) arrowRef.current.style.opacity = "0";
    fxRef.current?.clear();
    audio.stopAll(500);
    setBurn({}); setDrawn(false); setNocked(false); setConfirming(false); setProgress(0);
  }, []);

  // ---------- the burn sequence ----------
  const runBurn = useCallback((fromArrow: boolean) => {
    if (!go("ignition")) return;
    const fx = fxRef.current!;
    const T = TIMELINE;
    const t0 = performance.now();
    const prog = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / T.finale);
      setProgress(k);
      if (k >= 1) clearInterval(prog);
    }, 120);
    timers.current.push(prog as unknown as number);

    const ip = mapPt(ravanRef.current, IMPACT_POINT.x, IMPACT_POINT.y);
    fx.flash = fromArrow ? 1 : 0.6;
    if (ip) { fx.burst(ip.x, ip.y); fx.glowAt(ip.x, ip.y, 160, 0.6); }
    if (fromArrow) audio.play("arrowImpact");
    audio.play("ignition");
    doShake();
    fx.addEmitter("impact", () => { const p = mapPt(ravanRef.current, IMPACT_POINT.x, IMPACT_POINT.y); return p ? { x: p.x - 15, y: p.y - 10, w: 30, h: 20 } : null; }, { flame: 30, ember: 10 });

    at(T.legs, () => {
      go("progressive_burn");
      setPart(["legs"], "burning");
      fx.addEmitter("legs", regionOf("legs", 0.4), { flame: 55, ember: 14, smoke: 2 });
      audio.play("fireCrackle", { fadeIn: 800, restart: false });
    });
    at(T.torso, () => {
      setPart(["torso"], "burning");
      fx.removeEmitter("impact");
      fx.setRates("legs", { flame: 70, ember: 18, smoke: 5 });
      fx.addEmitter("torso", regionOf("torso", 0.15), { flame: 60, ember: 16, smoke: 4 });
      audio.play("smokeWhoosh");
    });
    at(T.arms, () => {
      setPart(["legs"], "charred");
      setPart(["armL", "armR"], "burning");
      fx.addEmitter("armL", regionOf("armL"), { flame: 30, ember: 8, smoke: 2 });
      fx.addEmitter("armR", regionOf("armR"), { flame: 30, ember: 8, smoke: 2 });
      audio.play("fireRoar", { fadeIn: 1200, restart: false });
    });
    at(T.legsGone, () => { setPart(["legs"], "gone"); setPart(["torso"], "charred"); fx.setRates("legs", { flame: 15, ember: 10, smoke: 6 }); });
    HEAD_BURN_ORDER.forEach((hi, k) => {
      const start = T.headsStart + k * T.headGap;
      const pid = `head${hi}` as PartId;
      at(start, () => {
        setPart([pid], "burning");
        fx.addEmitter(pid, regionOf(pid, 0.2), { flame: 20, ember: 7, smoke: 1.5 });
        const h = HEADS[hi]; const p = mapPt(ravanRef.current, h.x, h.y);
        if (p) fx.burst(p.x, p.y, { sparks: 14, embers: 10, flames: 6, smoke: 1 });
      });
      at(start + 1500, () => setPart([pid], "charred"));
      at(start + 2800, () => { setPart([pid], "gone"); fx.setRates(pid, { flame: 4, ember: 6, smoke: 2 }); });
    });
    at(T.torsoGone, () => { setPart(["torso"], "gone"); setPart(["armL", "armR"], "charred"); fx.setRates("torso", { flame: 20, ember: 12, smoke: 6 }); });
    at(T.armsGone, () => { setPart(["armL", "armR"], "gone"); fx.setRates("armL", { flame: 6, ember: 6 }); fx.setRates("armR", { flame: 6, ember: 6 }); });
    at(T.finalBurst, () => {
      fx.flash = 0.8; doShake();
      [IMPACT_POINT, { x: 300, y: 150 }, { x: 160, y: 200 }, { x: 440, y: 200 }, { x: 300, y: 560 }].forEach((pt) => {
        const p = mapPt(ravanRef.current, pt.x, pt.y);
        if (p) fx.burst(p.x, p.y, { sparks: 70, embers: 50, flames: 35, smoke: 10 });
      });
      audio.play("burningBurst");
      audio.play("smokeWhoosh");
      audio.play("fireworksFinale");
      let n = 0;
      fwTimer.current = window.setInterval(() => {
        fx.firework();
        if (n++ % 2 === 0) audio.playLayered("fireworkLaunch", 0.5);
      }, reduced ? 1100 : 420);
    });
    at(T.finalBurst + 1500, () => {
      const all = ["legs", "torso", "armL", "armR", ...HEADS.map((_, i) => `head${i}`)] as PartId[];
      setPart(all, "gone");
    });
    at(T.extinguish, () => {
      ["legs", "torso", "armL", "armR", ...HEADS.map((_, i) => `head${i}`)].forEach((id) => fx.setRates(id, { ember: 3, smoke: 1.5 }));
      audio.stop("fireCrackle", 2200);
      audio.stop("fireRoar", 2600);
    });
    at(T.finale, () => {
      go("finale");
      audio.play("victory");
      audio.play("templeBell");
      clearInterval(fwTimer.current);
      fwTimer.current = window.setInterval(() => fx.firework(), reduced ? 2000 : 900);
    });
    at(T.finale + 6000, () => {
      fx.clear();
      fx.ambient = reduced ? 0 : 8;
      go("complete");
    });
  }, [go, mapPt, regionOf, reduced]);

  // ---------- arrow sequence ----------
  const startArrow = useCallback(() => {
    if (!go("arrow_flight")) return;
    setNocked(true);
    audio.play("bowDraw");
    at(120, () => setDrawn(true));
    at(1350, () => {
      setNocked(false); setDrawn(false);
      audio.play("arrowRelease");
      audio.play("arrowFlight");
      const el = arrowRef.current!;
      const fx = fxRef.current!;
      const dur = reduced ? 600 : 950;
      const t0 = performance.now();
      const step = (now: number) => {
        const s = mapPt(ramRef.current, ARROW_NOCK.x, ARROW_NOCK.y);
        const e = mapPt(ravanRef.current, IMPACT_POINT.x, IMPACT_POINT.y);
        if (!s || !e) return;
        const k = Math.min(1, (now - t0) / dur);
        const t = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // ease
        const lift = Math.hypot(e.x - s.x, e.y - s.y) * 0.22;
        const c = { x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - lift };
        const x = (1 - t) ** 2 * s.x + 2 * (1 - t) * t * c.x + t * t * e.x;
        const y = (1 - t) ** 2 * s.y + 2 * (1 - t) * t * c.y + t * t * e.y;
        const dx = 2 * (1 - t) * (c.x - s.x) + 2 * t * (e.x - c.x);
        const dy = 2 * (1 - t) * (c.y - s.y) + 2 * t * (e.y - c.y);
        el.style.opacity = "1";
        el.style.transform = `translate(${x}px, ${y}px) rotate(${Math.atan2(dy, dx)}rad)`;
        fx.trail(x, y);
        if (k < 1) arrowRaf.current = requestAnimationFrame(step);
        else { el.style.opacity = "0"; runBurn(true); }
      };
      arrowRaf.current = requestAnimationFrame(step);
    });
  }, [go, mapPt, reduced, runBurn]);

  const begin = () => { setConfirming(false); if (mode === "arrow") startArrow(); else runBurn(false); };

  const watchAgain = () => {
    resetAll();
    if (go("ready")) at(400, () => (mode === "arrow" ? startArrow() : runBurn(false)));
  };
  const customizeAgain = () => { resetAll(); go("customizing"); };

  const onDownload = async () => {
    if (!cleanRef.current) return;
    setBusy(true);
    try { await downloadSvgAsPng(cleanRef.current); toast("Image downloaded."); }
    catch (e) { toast(`Download failed: ${(e as Error).message}`); }
    finally { setBusy(false); }
  };
  const onShare = async () => {
    const r = await shareExperience();
    if (r === "copied") toast("Link copied to your clipboard.");
    else if (r === "failed") toast(`Sharing isn't available here. Copy this link: ${window.location.href}`);
    else if (r === "shared") toast("Thanks for sharing!");
  };

  const running = isRunning(phase);
  const showFinale = phase === "finale" || phase === "complete";

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[1fr_320px]">
      <div
        ref={stageRef}
        key={shake}
        className={`panel relative w-full overflow-hidden aspect-[4/5] sm:aspect-[16/10] max-h-[78vh] ${shake ? "anim-shake" : ""}`}
      >
        <Backdrop className="absolute inset-0 h-full w-full" />
        <Ram ref={ramRef} drawn={drawn} arrowNocked={nocked} className="absolute bottom-[6%] left-[2%] h-[42%] sm:h-[58%] z-10 drop-shadow-[0_0_25px_rgba(255,200,100,.25)]" />
        <Ravan ref={ravanRef} faceUrl={faceUrl} burn={burn} className="absolute bottom-[3%] right-[1%] h-[70%] sm:right-[6%] sm:h-[92%] z-10" />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
        <div ref={arrowRef} className="pointer-events-none absolute left-0 top-0 z-30 opacity-0" style={{ willChange: "transform" }}>
          <svg width="90" height="14" viewBox="0 0 90 14" style={{ transform: "translate(-80px,-7px)" }} aria-hidden>
            <defs><linearGradient id="arrow-glow" x1="0" x2="1"><stop offset="0" stopColor="#ffd77a" stopOpacity="0" /><stop offset="1" stopColor="#fff2c0" /></linearGradient></defs>
            <rect x="0" y="5.5" width="78" height="3" fill="url(#arrow-glow)" />
            <path d="M76,1 L90,7 L76,13 Z" fill="#f2c35a" />
            <path d="M2,7 L10,1 L14,1 L8,7 L14,13 L10,13 Z" fill="#c4161c" />
          </svg>
        </div>
        <div className="absolute left-3 top-3 z-30 rounded-full bg-night/60 px-3 py-1 text-xs tracking-wide text-gold backdrop-blur" aria-live="polite">
          {STAGE_LABEL[phase]}
        </div>
        {running && (
          <div className="absolute inset-x-6 bottom-3 z-30 h-1.5 overflow-hidden rounded-full bg-night/60" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Dahan progress">
            <div className="h-full bg-[image:var(--gradient-gold)] transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
        {showFinale && (
          <div className="absolute inset-0 z-40 grid place-items-center bg-night/40 p-4">
            <div className="panel anim-rise flex max-w-md flex-col items-center gap-3 p-6 text-center">
              <Sparkles className="h-8 w-8 text-gold anim-glow" />
              <h2 className="font-display text-4xl text-gold-gradient sm:text-5xl">Vijayadashami</h2>
              <p className="font-display text-lg text-foreground/90">Burai par Achhai ki Vijay</p>
              <p className="font-deva text-gold">बुराई पर अच्छाई की विजय</p>
              <div className="mt-2 grid w-full grid-cols-2 gap-2">
                <button className="btn btn-primary" onClick={watchAgain}><RotateCcw className="h-4 w-4" />Watch again</button>
                <button className="btn btn-ghost" onClick={customizeAgain}><UserRound className="h-4 w-4" />Customize again</button>
                <button className="btn btn-ghost" onClick={onDownload} disabled={busy}><Download className="h-4 w-4" />{busy ? "Preparing…" : "Download Ravan"}</button>
                <button className="btn btn-ghost" onClick={onShare}><Share2 className="h-4 w-4" />Share</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* pristine copy used for downloads */}
      <div className="hidden"><Ravan ref={cleanRef} faceUrl={faceUrl} /></div>

      <aside className="panel flex flex-col gap-4 p-5">
        <div>
          <h2 className="font-display text-xl text-gold">Ravan Dahan</h2>
          <p className="text-sm text-muted-foreground">Choose how the fire begins.</p>
        </div>
        <div role="radiogroup" aria-label="Dahan mode" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {([
            ["arrow", "Shri Ram's arrow", "The arrow ignites Ravan", Crosshair],
            ["manual", "Manual ignite", "Light the fire yourself", Flame],
          ] as const).map(([m, title, desc, Icon]) => (
            <button key={m} role="radio" aria-checked={mode === m} disabled={phase !== "ready"}
              onClick={() => setMode(m)}
              className={`rounded-xl border p-3 text-left transition ${mode === m ? "border-gold bg-secondary shadow-[var(--shadow-glow)]" : "border-border hover:border-gold/60"} disabled:opacity-50`}>
              <Icon className="mb-1 h-5 w-5 text-saffron" />
              <div className="font-semibold">{title}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </button>
          ))}
        </div>

        {phase === "ready" && !confirming && (
          <button className="btn btn-primary py-3 text-base" onClick={() => setConfirming(true)}>
            {mode === "arrow" ? <><Crosshair className="h-5 w-5" />Release the arrow</> : <><Flame className="h-5 w-5" />Ignite Ravan</>}
          </button>
        )}
        {phase === "ready" && confirming && (
          <div className="anim-rise rounded-xl border border-gold/50 bg-secondary/60 p-3 text-sm">
            <p className="mb-3">Ready? The Dahan lasts about 15 seconds and can't be paused.</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn btn-primary" onClick={begin} autoFocus>{mode === "arrow" ? "Release" : "Ignite"}</button>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          </div>
        )}
        {running && <p className="rounded-xl bg-secondary/60 p-3 text-sm" aria-live="polite">The Dahan is in progress…</p>}
        {(phase === "finale" || phase === "complete") && (
          <button className="btn btn-ghost" onClick={() => { resetAll(); go("ready"); }}><RotateCcw className="h-4 w-4" />Rebuild Ravan</button>
        )}
        <button className="btn btn-ghost" disabled={running} onClick={customizeAgain}><UserRound className="h-4 w-4" />{faceUrl ? "Change face" : "Add a face"}</button>
        <p className="mt-auto text-xs text-muted-foreground">Tip: open Settings (gear icon) to change volumes, turn music off or reduce motion.</p>
      </aside>
    </div>
  );
}
