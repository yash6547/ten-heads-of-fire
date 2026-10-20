import { describe, expect, it } from "vitest";
import { canTransition, TIMELINE } from "./experience";

describe("experience flow", () => {
  it("manual mode goes straight from ready to ignition", () => {
    expect(canTransition("ready", "ignition")).toBe(true);
  });
  it("cannot start a second dahan while one is burning", () => {
    expect(canTransition("progressive_burn", "arrow_flight")).toBe(false);
    expect(canTransition("progressive_burn", "ignition")).toBe(false);
  });
  it("burn sequence lasts between 12 and 18 seconds", () => {
    expect(TIMELINE.finale).toBeGreaterThanOrEqual(12000);
    expect(TIMELINE.finale).toBeLessThanOrEqual(18000);
  });
});
