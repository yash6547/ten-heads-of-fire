/** Experience state flow. */
export type Phase =
  | "idle" | "customizing" | "ready" | "arrow_flight" | "ignition" | "progressive_burn" | "finale" | "complete";

const NEXT: Record<Phase, Phase[]> = {
  idle: ["customizing", "ready"],
  customizing: ["idle", "ready"],
  ready: ["arrow_flight", "ignition", "customizing", "idle"],
  arrow_flight: ["ignition", "ready"],
  ignition: ["progressive_burn", "ready"],
  progressive_burn: ["finale", "ready"],
  finale: ["complete", "ready", "customizing"],
  complete: ["ready", "customizing", "idle"],
};

export function canTransition(from: Phase, to: Phase) {
  return NEXT[from].includes(to);
}

export const isRunning = (p: Phase) => p === "arrow_flight" || p === "ignition" || p === "progressive_burn";

/** Burn timeline (ms after ignition). Total ≈ 15.5 s before the finale screen. */
export const TIMELINE = {
  legs: 400,
  torso: 2600,
  arms: 4200,
  legsGone: 5800,
  headsStart: 7000,
  headGap: 380,
  torsoGone: 8400,
  armsGone: 9000,
  finalBurst: 11800,
  extinguish: 14300,
  finale: 15500,
};
