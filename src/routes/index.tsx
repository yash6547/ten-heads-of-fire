import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Settings, Maximize, Minimize, ArrowLeft, Swords, UserRound } from "lucide-react";
import { Backdrop } from "@/components/art/Backdrop";
import { Ravan } from "@/components/art/Ravan";
import { Arena } from "@/components/Arena";
import { FaceEditor } from "@/components/FaceEditor";
import { SettingsPanel, useAudioState, type Density } from "@/components/SettingsPanel";
import { FX } from "@/lib/fx";
import { audio } from "@/lib/audio-manager";
import { canTransition, type Phase } from "@/lib/experience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ravan Dahan — Jai Shri Ram | Interactive Dussehra" },
      { name: "description", content: "Put your face on the ten-headed Ravan, watch Shri Ram's arrow fly and enjoy a cinematic Dussehra Ravan Dahan with fire, fireworks and sound." },
      { property: "og:title", content: "Ravan Dahan — Interactive Dussehra Experience" },
      { property: "og:description", content: "Customize the ten-headed Ravan and celebrate Vijayadashami with a cinematic Dahan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Experience,
});

const DENSITY: Record<Density, number> = { low: 0.4, medium: 0.7, high: 1 };

function Experience() {
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const [faceUrl, setFaceUrl] = useState<string | null>(null);
  const [previewFace, setPreviewFace] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [density, setDensity] = useState<Density>("high");
  const [fs, setFs] = useState(false);
  const [fsSupported, setFsSupported] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const s = useAudioState();

  const go = useCallback((p: Phase) => {
    if (!canTransition(phaseRef.current, p)) return false;
    phaseRef.current = p;
    setPhase(p);
    return true;
  }, []);

  const toast = useCallback((m: string) => { setToastMsg(m); window.setTimeout(() => setToastMsg((c) => (c === m ? null : c)), 4500); }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setReduced(true);
    if (window.innerWidth < 640) setDensity("medium");
    setFsSupported(!!document.fullscreenEnabled);
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    // unlock audio on first interaction (autoplay policy)
    const unlock = () => {
      if (audio.unlocked) return;
      audio.unlock();
      audio.playMusic(audio.currentMusic ?? "festiveAmbience");
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audio.stopAll(200, true);
    };
  }, []);

  const toggleFs = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen();
    } catch { toast("Fullscreen isn't available in this browser."); }
  };

  const effDensity = reduced ? 0.35 : DENSITY[density];
  const inArena = !["idle", "customizing"].includes(phase);

  return (
    <div ref={rootRef} className={`relative min-h-screen overflow-x-hidden bg-background ${reduced ? "reduced" : ""}`}>
      <header className="relative z-40 flex items-center justify-between gap-2 px-3 py-3 sm:px-6">
        <button className="flex items-center gap-2 font-display text-lg tracking-wider text-gold" onClick={() => { if (phase === "customizing" || phase === "ready" || phase === "complete") { go("idle"); } }} disabled={!["customizing", "ready", "complete"].includes(phase)}>
          <span className="text-2xl" aria-hidden>🏹</span>
          <span>Ravan Dahan</span>
        </button>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-icon" aria-label={s.muted ? "Unmute sound" : "Mute sound"} aria-pressed={s.muted}
            onClick={() => { audio.unlock(); audio.setSettings({ muted: !s.muted }); if (!audio.currentMusic) audio.playMusic("festiveAmbience"); }}>
            {s.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button className="btn btn-ghost btn-icon" aria-label="Open settings" aria-expanded={showSettings} onClick={() => setShowSettings((v) => !v)}>
            <Settings className="h-4 w-4" />
          </button>
          {fsSupported && (
            <button className="btn btn-ghost btn-icon" aria-label={fs ? "Exit fullscreen" : "Enter fullscreen"} onClick={toggleFs}>
              {fs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          )}
        </div>
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} reduced={reduced} setReduced={setReduced} density={density} setDensity={setDensity} />
        )}
      </header>

      {phase === "idle" && <Home faceUrl={faceUrl} density={effDensity} reduced={reduced} onCustomize={() => go("customizing")} onArena={() => { audio.play("templeBell"); go("ready"); }} />}

      {phase === "customizing" && (
        <main className="mx-auto grid max-w-6xl gap-4 px-3 pb-8 sm:px-6 lg:grid-cols-[360px_1fr]">
          <section className="panel p-5 anim-rise">
            <FaceEditor applied={faceUrl} onPreview={setPreviewFace} onApply={(u) => { setFaceUrl(u); toast(u ? "Face applied to all ten heads." : "Photo removed."); }} />
          </section>
          <section className="panel relative flex min-h-[420px] flex-col overflow-hidden anim-rise" style={{ animationDelay: ".1s" }}>
            <Backdrop className="absolute inset-0 h-full w-full" />
            <div className="relative z-10 flex items-center justify-between p-4">
              <span className="rounded-full bg-night/60 px-3 py-1 text-xs text-gold">{previewFace && previewFace !== faceUrl ? "Live preview (not applied yet)" : faceUrl ? "Face applied" : "Classic Ravan"}</span>
            </div>
            <div className="relative z-10 flex flex-1 items-end justify-center px-4">
              <Ravan faceUrl={previewFace ?? faceUrl} className="h-[min(62vh,560px)] w-auto" />
            </div>
            <div className="relative z-10 flex flex-wrap justify-between gap-2 p-4">
              <button className="btn btn-ghost" onClick={() => go("idle")}><ArrowLeft className="h-4 w-4" />Back</button>
              <button className="btn btn-primary" onClick={() => { if (previewFace && previewFace !== faceUrl) setFaceUrl(previewFace); audio.play("templeBell"); go("ready"); }}>
                <Swords className="h-4 w-4" />Continue to the arena
              </button>
            </div>
          </section>
        </main>
      )}

      {inArena && (
        <main className="mx-auto max-w-7xl px-3 pb-8 sm:px-6">
          <Arena phase={phase} go={go} faceUrl={faceUrl} density={effDensity} reduced={reduced} toast={toast} />
        </main>
      )}

      {toastMsg && (
        <div role="status" className="panel fixed bottom-4 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 px-4 py-3 text-sm anim-rise">{toastMsg}</div>
      )}
    </div>
  );
}

function Home({ faceUrl, density, reduced, onCustomize, onArena }: { faceUrl: string | null; density: number; reduced: boolean; onCustomize: () => void; onArena: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const fx = new FX(canvasRef.current!);
    fx.density = density; fx.ambient = reduced ? 0 : 18;
    fx.start();
    const onR = () => fx.resize();
    window.addEventListener("resize", onR);
    return () => { window.removeEventListener("resize", onR); fx.destroy(); };
  }, [density, reduced]);

  return (
    <main className="relative -mt-[64px] flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-8 text-center">
      <Backdrop className="absolute inset-0 h-full w-full" />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
      <div className="relative z-20 flex flex-col items-center">
        <p className="font-deva text-lg text-gold anim-rise sm:text-xl">जय श्री राम</p>
        <h1 className="font-display text-5xl font-bold tracking-wide text-gold-gradient anim-rise sm:text-7xl" style={{ animationDelay: ".1s" }}>Jai Shri Ram</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground anim-rise sm:text-base" style={{ animationDelay: ".2s" }}>
          Celebrate Vijayadashami. Put any face on the ten-headed Ravan and watch good triumph over evil.
        </p>
      </div>
      <div className="relative z-20 my-4 anim-rise" style={{ animationDelay: ".3s" }}>
        <div className="absolute inset-x-10 bottom-0 top-1/3 rounded-full bg-saffron/20 blur-3xl" aria-hidden />
        <Ravan faceUrl={faceUrl} className="relative h-[46vh] max-h-[460px] min-h-[260px] w-auto anim-float" />
      </div>
      <div className="relative z-20 flex flex-wrap justify-center gap-3 anim-rise" style={{ animationDelay: ".45s" }}>
        <button className="btn btn-primary px-6 py-3 text-base" onClick={onCustomize}><UserRound className="h-5 w-5" />Customize Your Ravan</button>
        <button className="btn btn-ghost px-6 py-3 text-base" onClick={onArena}><Swords className="h-5 w-5" />Enter the Arena</button>
      </div>
      <p className="relative z-20 mt-4 text-xs text-muted-foreground">Sound starts after your first tap. Use the speaker button to mute.</p>
    </main>
  );
}
