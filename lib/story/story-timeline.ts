import { clamp, smoothstep } from "../math";

export type Timing = { hold: number; travel: number };
export type Segment = Timing & { index: number; start: number; holdEnd: number; end: number };

export const motion = {
  // Lenis already smooths scroll; a second timed scrub adds input latency.
  scrub: true,
  // Let the destination become recognizable before introducing its copy.
  textHandoff: 0.88,
  // A scene's copy stays through its film until the next scene has nearly arrived, then gives way just before the
  // next copy enters: never a long stretch of film with no words on it.
  textExit: 0.78,
  textEntry: 0.88,
  // Hero exit bridge: peak opacity of the warm window bloom and the peak softness, in CSS px.
  heroLightPeak: 0.32,
  heroSoftnessPx: 0.4,
} as const;


export function createSegments(timings: Timing[]): Segment[] {
  let cursor = 0;
  return timings.map((timing, index) => {
    const segment = { ...timing, index, start: cursor, holdEnd: cursor + timing.hold, end: cursor + timing.hold + timing.travel };
    cursor = segment.end;
    return segment;
  });
}

export function sampleTimeline(segments: Segment[], position: number) {
  const segment = segments.find((item) => position < item.end) ?? segments[segments.length - 1];
  const progress = segment.travel > 0 ? clamp((position - segment.holdEnd) / segment.travel) : 0;
  const inTransition = segment.travel > 0 && position > segment.holdEnd;
  return {
    index: segment.index,
    inTransition,
    progress,
    currentOpacity: textReveal(segment.index, segment.index, inTransition, progress),
    nextOpacity: textReveal(segment.index + 1, segment.index, inTransition, progress),
    // A missing film must not leave two camera positions superimposed indefinitely.
    nextBackground: inTransition ? Number(progress >= motion.textHandoff) : 0,
  };
}

/** A reading hold belongs to the clip that just finished, including its exact last frame. */
export function storyFilmSample<T extends { start: number; end: number }>(films: T[], index: number, inTransition: boolean, progress: number) {
  const completed = index > 0 && !inTransition;
  const filmIndex = Math.min(completed ? index - 1 : index, films.length - 1);
  const film = films[filmIndex];
  return { filmIndex, time: completed || index >= films.length ? film.end : film.start + (film.end - film.start) * clamp(progress) };
}

/** Keep departing copy until its scene is nearly gone, then reveal incoming copy as its scene takes over. */
export function textReveal(scene: number, index: number, inTransition: boolean, progress: number): number {
  if (!inTransition) return scene === index ? 1 : 0;
  if (scene === index) return Number(progress < motion.textExit);
  if (scene === index + 1) return Number(progress >= motion.textEntry);
  return 0;
}

/** Where element `n` of `count` starts revealing within a scene's amount: lines lead, details follow. */
export function revealOffset(n: number, count: number, maxOffset = 0.45): number {
  return count <= 1 ? 0 : (maxOffset * n) / (count - 1);
}

/** An element's own eased amount, so a block reveals line by line and hides in reverse order. */
export function staggeredReveal(amount: number, offset: number, span = 0.55): number {
  return smoothstep((amount - offset) / span);
}
