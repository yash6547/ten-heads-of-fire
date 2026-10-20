import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { audio } from "@/lib/audio-manager";
import { MUSIC_TRACKS, type SoundKey } from "@/lib/sounds.config";

export function useAudioState() {
  return useSyncExternalStore(
    (l) => audio.subscribe(l),
    () => `${JSON.stringify(audio.settings)}|${audio.currentMusic}|${audio.failed.size}|${audio.unlocked}`,
    () => "ssr",
  ) && { ...audio.settings, currentMusic: audio.currentMusic, failed: [...audio.failed], unlocked: audio.unlocked };
}

export type Density = "low" | "medium" | "high";

interface Props {
  onClose: () => void;
  reduced: boolean; setReduced: (v: boolean) => void;
  density: Density; setDensity: (d: Density) => void;
}

export function SettingsPanel({ onClose, reduced, setReduced, density, setDensity }: Props) {
  const s = useAudioState();
  const slider = (label: string, key: "master" | "music" | "sfx") => (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex justify-between"><span>{label}</span><span className="text-muted-foreground">{Math.round(s[key] * 100)}%</span></span>
      <input type="range" min={0} max={1} step={0.01} value={s[key]} onChange={(e) => audio.setSettings({ [key]: +e.target.value })} />
    </label>
  );
  return (
    <div role="dialog" aria-label="Sound and display settings" className="panel absolute right-3 top-16 z-50 w-[min(340px,calc(100vw-1.5rem))] p-5 anim-rise">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-gold">Settings</h2>
        <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close settings"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex flex-col gap-4">
        <label className="flex items-center justify-between text-sm">
          Mute all sound
          <input type="checkbox" className="h-5 w-5 accent-saffron" checked={s.muted} onChange={(e) => audio.setSettings({ muted: e.target.checked })} />
        </label>
        {slider("Master volume", "master")}
        <label className="flex items-center justify-between text-sm">
          Background music
          <input type="checkbox" className="h-5 w-5 accent-saffron" checked={s.musicEnabled} onChange={(e) => audio.setSettings({ musicEnabled: e.target.checked })} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MUSIC_TRACKS.map((t) => (
            <button key={t.key} disabled={!s.musicEnabled}
              className={`btn px-2 py-2 text-xs ${s.currentMusic === t.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => { audio.unlock(); audio.playMusic(t.key as SoundKey); }}>
              {t.label}
            </button>
          ))}
        </div>
        {slider("Music volume", "music")}
        {slider("Sound effects volume", "sfx")}
        <hr className="border-border" />
        <label className="flex items-center justify-between text-sm">
          Reduce motion
          <input type="checkbox" className="h-5 w-5 accent-saffron" checked={reduced} onChange={(e) => setReduced(e.target.checked)} />
        </label>
        <div className="text-sm">
          <p className="mb-2">Effects detail</p>
          <div className="grid grid-cols-3 gap-2">
            {(["low", "medium", "high"] as Density[]).map((d) => (
              <button key={d} className={`btn px-2 py-1.5 text-xs capitalize ${density === d ? "btn-primary" : "btn-ghost"}`} onClick={() => setDensity(d)}>{d}</button>
            ))}
          </div>
        </div>
        {s.failed.length > 0 && (
          <p className="rounded-lg bg-destructive/15 p-2 text-xs">Some sounds failed to load: {s.failed.join(", ")}. The experience continues without them.</p>
        )}
      </div>
    </div>
  );
}
