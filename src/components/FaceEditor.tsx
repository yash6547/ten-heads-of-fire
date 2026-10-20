import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw, RotateCw, Trash2, ZoomIn, ZoomOut, Check, Undo2 } from "lucide-react";

const W = 300, H = 360, RX = 100, RY = 125;
const MAX_BYTES = 15 * 1024 * 1024;

interface Props {
  onPreview: (url: string | null) => void;
  onApply: (url: string | null) => void;
  applied: string | null;
}

/** Local-only face cropper. The photo never leaves the browser. */
export function FaceEditor({ onPreview, onApply, applied }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const baseScale = img ? Math.max((RX * 2) / img.width, (RY * 2) / img.height) : 1;

  const drawTo = useCallback((g: CanvasRenderingContext2D, k: number, cx: number, cy: number) => {
    if (!img) return;
    g.save();
    g.translate(cx + off.x * k, cy + off.y * k);
    g.rotate((rot * Math.PI) / 180);
    const s = zoom * baseScale * k;
    g.scale(s, s);
    g.drawImage(img, -img.width / 2, -img.height / 2);
    g.restore();
  }, [img, off, zoom, rot, baseScale]);

  // draw editor
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, W, H);
    g.fillStyle = "#11163a"; g.fillRect(0, 0, W, H);
    drawTo(g, 1, W / 2, H / 2);
    g.save();
    g.fillStyle = "rgba(6,8,24,0.72)";
    g.beginPath(); g.rect(0, 0, W, H); g.ellipse(W / 2, H / 2, RX, RY, 0, 0, Math.PI * 2); g.fill("evenodd");
    g.strokeStyle = "#f2c35a"; g.lineWidth = 2; g.setLineDash([6, 6]);
    g.beginPath(); g.ellipse(W / 2, H / 2, RX, RY, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
    if (!img) {
      g.fillStyle = "#f5e6c4"; g.font = "15px Mukta, sans-serif"; g.textAlign = "center";
      g.fillText("Upload a photo to begin", W / 2, H / 2);
    }
  }, [drawTo, img]);

  const exportCrop = useCallback(() => {
    if (!img) return null;
    const c = document.createElement("canvas");
    c.width = 240; c.height = 300;
    const g = c.getContext("2d")!;
    g.beginPath(); g.ellipse(120, 150, 120, 150, 0, 0, Math.PI * 2); g.clip();
    drawTo(g, 240 / (RX * 2), 120, 150);
    return c.toDataURL("image/png");
  }, [img, drawTo]);

  // live preview (throttled to animation frames)
  useEffect(() => {
    if (!img) { onPreview(null); return; }
    const id = requestAnimationFrame(() => onPreview(exportCrop()));
    return () => cancelAnimationFrame(id);
  }, [img, exportCrop, onPreview]);

  const reset = () => { setOff({ x: 0, y: 0 }); setZoom(1); setRot(0); };

  const onFile = (f?: File) => {
    setError(null);
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp|gif|bmp|avif)$/i.test(f.type)) { setError("Please choose a PNG, JPG, WEBP or GIF image."); return; }
    if (f.size > MAX_BYTES) { setError("That image is larger than 15 MB. Please pick a smaller one."); return; }
    setLoading(true);
    const url = URL.createObjectURL(f);
    const i = new Image();
    i.onload = () => { setImg(i); reset(); setLoading(false); };
    i.onerror = () => { setError("This image couldn't be opened. Try another file."); setLoading(false); URL.revokeObjectURL(url); };
    i.src = url;
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 3;
    const m: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (m[e.key]) { e.preventDefault(); setOff((o) => ({ x: o.x + m[e.key][0], y: o.y + m[e.key][1] })); }
    if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(4, z + 0.05));
    if (e.key === "-") setZoom((z) => Math.max(0.3, z - 0.05));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl text-gold">Add a face</h2>
        <p className="text-sm text-muted-foreground">Your photo stays on this device. It is never uploaded.</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="relative mx-auto">
        <canvas
          ref={canvasRef} width={W} height={H} tabIndex={0}
          aria-label="Face crop area. Drag or use arrow keys to move, plus and minus to zoom."
          className="max-w-full touch-none rounded-xl border border-border bg-night"
          style={{ cursor: img ? "grab" : "default", width: W, aspectRatio: `${W}/${H}`, height: "auto" }}
          onKeyDown={onKey}
          onPointerDown={(e) => { if (!img) return; (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y }; }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const r = (e.target as HTMLElement).getBoundingClientRect(); const k = W / r.width;
            setOff({ x: drag.current.ox + (e.clientX - drag.current.x) * k, y: drag.current.oy + (e.clientY - drag.current.y) * k });
          }}
          onPointerUp={() => { drag.current = null; }}
          onWheel={(e) => { if (img) setZoom((z) => Math.min(4, Math.max(0.3, z - e.deltaY * 0.001))); }}
        />
        {loading && <div className="absolute inset-0 grid place-items-center rounded-xl bg-night/70 text-sm">Loading photo…</div>}
      </div>
      {error && <p role="alert" className="rounded-lg border border-destructive/50 bg-destructive/15 px-3 py-2 text-sm">{error}</p>}

      <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
        <ImagePlus className="h-4 w-4" /> {img ? "Replace photo" : "Upload photo"}
      </button>

      <fieldset disabled={!img} className="flex flex-col gap-3 disabled:opacity-50">
        <label className="flex items-center gap-3 text-sm">
          <ZoomOut className="h-4 w-4 shrink-0" aria-hidden />
          <span className="sr-only">Zoom</span>
          <input type="range" min={0.3} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-full" />
          <ZoomIn className="h-4 w-4 shrink-0" aria-hidden />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
          <span className="sr-only">Rotation</span>
          <input type="range" min={-180} max={180} step={1} value={rot} onChange={(e) => setRot(+e.target.value)} className="w-full" />
          <RotateCw className="h-4 w-4 shrink-0" aria-hidden />
        </label>
        <p className="text-xs text-muted-foreground">Drag the photo to line the face up inside the oval.</p>
        <div className="grid grid-cols-3 gap-2">
          <button className="btn btn-primary col-span-3" onClick={() => onApply(exportCrop())}><Check className="h-4 w-4" /> Apply to all 10 heads</button>
          <button className="btn btn-ghost px-2 text-sm" onClick={reset}><Undo2 className="h-4 w-4" /> Reset</button>
          <button className="btn btn-ghost col-span-2 px-2 text-sm" onClick={() => { setImg(null); onApply(null); }}><Trash2 className="h-4 w-4" /> Remove photo</button>
        </div>
      </fieldset>
      {!img && applied && (
        <button className="btn btn-ghost text-sm" onClick={() => onApply(null)}><Trash2 className="h-4 w-4" /> Remove applied face</button>
      )}
    </div>
  );
}
