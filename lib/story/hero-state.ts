import { clamp, smoothstep } from "../math";

export type HeroPhase = "hero" | "exiting" | "scroll";

export const heroTiming = {
  topThreshold: 0.002,
  // Blend the idle loop into the moving film within the existing first transition.
  blendFraction: 0.18,
} as const;

/** One scroll coordinate owns the hero and the story. No timers or scroll rebasing. */
export function createHeroState(travel: number, onExit?: () => number) {
  let phase: HeroPhase = "hero";
  let offset = 0;
  let previous = 0;
  let direction = 0;
  let disposed = false;

  return {
    navigate(position: number) {
      previous = Math.max(0, position);
      offset = 0;
      phase = previous <= heroTiming.topThreshold ? "hero" : "scroll";
    },
    step(input: number, suspended = false) {
      const raw = suspended || disposed ? previous : Math.max(0, input);
      const delta = raw - previous;
      if (Math.abs(delta) > 0.00001) direction = Math.sign(delta);
      if (phase === "hero" && raw > heroTiming.topThreshold) {
        // Preserve the visible loop frame, but converge to the normal timeline at Scene 2.
        // A restored page beyond the opening needs no loop offset.
        offset = raw < travel ? clamp(onExit?.() ?? 0, 0, travel) : 0;
      }
      const progress = clamp(raw / travel);
      const settle = smoothstep(progress / heroTiming.blendFraction);
      phase = raw <= heroTiming.topThreshold ? "hero" : settle < 1 ? "exiting" : "scroll";
      previous = raw;
      const position = phase === "hero" ? 0 : raw < travel
        ? offset + (travel - offset) * progress : raw;
      return {
        phase, position, offset, direction, settle,
        ambientOpacity: phase === "hero" ? 1 : 1 - settle,
      };
    },
    get phase() { return phase; },
    destroy() { disposed = true; },
  };
}
