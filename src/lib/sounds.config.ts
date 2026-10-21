/**
 * CENTRAL SOUND CONFIGURATION — the only place audio paths live.
 * To replace a sound, overwrite the file at the same path in /public/sounds/.
 * To add a sound, drop a file in the right category folder and add an entry here.
 * See public/sounds/README.md for the event each sound is tied to.
 */
export type SoundCategory = "music" | "sfx";
export interface SoundDef {
  src: string;
  category: SoundCategory;
  /** per-sound base volume 0..1 (multiplied with master + category volume) */
  volume: number;
  loop?: boolean;
}

const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") + "/sounds";

export const SOUNDS = {
  festiveAmbience: { src: `${base}/background/festive-ambience.mp3`, category: "music", volume: 0.55, loop: true },
  devotional: { src: `${base}/background/devotional-instrumental.mp3`, category: "music", volume: 0.7, loop: true },
  templeBell: { src: `${base}/intro/temple-bell.mp3`, category: "sfx", volume: 0.7 },
  bowDraw: { src: `${base}/bow-arrow/bow-draw.mp3`, category: "sfx", volume: 0.8 },
  arrowRelease: { src: `${base}/bow-arrow/arrow-release.mp3`, category: "sfx", volume: 0.9 },
  arrowFlight: { src: `${base}/bow-arrow/arrow-flight.mp3`, category: "sfx", volume: 0.8 },
  arrowImpact: { src: `${base}/impact/arrow-impact.mp3`, category: "sfx", volume: 1 },
  ignition: { src: `${base}/fire/ignition.mp3`, category: "sfx", volume: 0.9 },
  fireCrackle: { src: `${base}/fire/fire-crackle.mp3`, category: "sfx", volume: 0.7, loop: true },
  fireRoar: { src: `${base}/fire/fire-roar.mp3`, category: "sfx", volume: 0.65, loop: true },
  fireRumble: { src: `${base}/fire/fire-rumble.mp3`, category: "sfx", volume: 0.55, loop: true },
  burningBurst: { src: `${base}/fire/burning-burst.mp3`, category: "sfx", volume: 1 },
  smokeWhoosh: { src: `${base}/smoke/smoke-whoosh.mp3`, category: "sfx", volume: 0.6 },
  fireworkLaunch: { src: `${base}/fireworks/firework-launch.mp3`, category: "sfx", volume: 0.5 },
  fireworkLaunch2: { src: `${base}/fireworks/firework-launch-2.mp3`, category: "sfx", volume: 0.5 },
  fireworkLaunch3: { src: `${base}/fireworks/firework-launch-3.mp3`, category: "sfx", volume: 0.5 },
  fireworkBurstSmall: { src: `${base}/fireworks/firework-burst-small.mp3`, category: "sfx", volume: 0.55 },
  fireworkBurstMedium: { src: `${base}/fireworks/firework-burst-medium.mp3`, category: "sfx", volume: 0.65 },
  fireworkBurstLarge: { src: `${base}/fireworks/firework-burst-large.mp3`, category: "sfx", volume: 0.8 },
  fireworkCrackle: { src: `${base}/fireworks/firework-crackle.mp3`, category: "sfx", volume: 0.45 },
  fireworksFinale: { src: `${base}/fireworks/fireworks-finale.mp3`, category: "sfx", volume: 0.75 },
  victory: { src: `${base}/finale/victory-celebration.mp3`, category: "sfx", volume: 0.85 },
} satisfies Record<string, SoundDef>;

export type SoundKey = keyof typeof SOUNDS;
export const MUSIC_TRACKS: { key: SoundKey; label: string }[] = [
  { key: "festiveAmbience", label: "Festive ambience" },
  { key: "devotional", label: "Devotional flute" },
];
