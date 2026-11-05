import { clamp, smootherstep } from "../math";
import { scrollScale } from "../scroll-scale";
import { motion } from "../story/story-timeline";

/**
 * The pinned product stage, in viewport heights of scroll: the upward reveal over the last story scene, the
 * carousel hold, and the splash scene (the room wiping in over the carousel, then its film).
 */
export const productPhases = { reveal: .75, hold: 1.8, splash: 2.75 } as const;
/** Mobile entrance progress follows scroll position and retraces exactly in reverse. */
export function productRevealProgress(offset: number) {
  return clamp(offset / productPhases.reveal);
}
// Scroll units after the film ends: a short reading pause before the next room moves.
const SPLASH_END_HOLD = 1.2;
/** Complete the entrance after a deliberate crossing; retain its target in the boundary dead band. */
export function productRevealTarget(offset: number, previous: number) {
  return offset >= .08 ? 1 : offset <= 0 ? 0 : Math.max(0, previous);
}
/** Space for the room's directional entrance before its film starts. */
export const splashDissolve = .85;
export const splashStart = productPhases.reveal + productPhases.hold;
/** Where the splash film starts scrubbing, once the room stands. */
export const splashFilmStart = splashStart + splashDissolve;
/**
 * The carousel is a stop on the way down: the rest lies mid-hold, so leaving it in either direction takes a
 * deliberate scroll. It is a CSS snap point (product-world.css .pr-stop) and the #product-range landing offset.
 */
export const carouselStop = {
  start: productPhases.reveal,
  rest: productPhases.reveal + productPhases.hold / 2,
  end: splashStart,
} as const;
export const splashFilmEnd = splashStart + productPhases.splash;
export const livingStart = splashFilmEnd + SPLASH_END_HOLD;
/**
 * The first room has a much larger camera/paint move than the splash. Give it more travel so the handoff
 * does not accelerate visually; later room moves also get more travel without extending stationary holds.
 */
export const livingScrollDuration = 3;
const roomPace = [{ duration: livingScrollDuration, hold: .85 }, { duration: 2.4, hold: 1 }, { duration: 2.4, hold: 1.1 }];
export const homeScenePhases = roomPace.reduce<{ start: number; duration: number; hold: number }[]>((phases, pace) => {
  const previous = phases[phases.length - 1];
  return [...phases, { start: previous ? previous.start + previous.duration + previous.hold : livingStart, ...pace }];
}, []);
export const wallZoomStart = homeScenePhases[2].start + homeScenePhases[2].duration + homeScenePhases[2].hold;
const endingPhases = { zoom: 1.6, formHold: 1, footerReveal: .9, footerHold: .3 } as const;
export const enquiryStart = wallZoomStart + endingPhases.zoom;
export const footerStart = enquiryStart + endingPhases.formHold;
export const productScrollRange = footerStart + endingPhases.footerReveal + endingPhases.footerHold;

/**
 * Pixels of scroll per unit of the Product Range timeline. The section is the pinned stage plus the range at the
 * phone scroll scale ((range × scale + 1) stage heights, product-world.css), so a unit is scale × one stage height.
 */
export function productUnit(bounds: { height: number }, scale = scrollScale()) {
  return bounds.height * scale / (productScrollRange * scale + 1);
}

/** Units of the Product Range scrolled past the section's top: 0 → productScrollRange while its stage is pinned. */
export function productOffset(bounds: { top: number; height: number }, scale = scrollScale()) {
  return -bounds.top / productUnit(bounds, scale);
}

/** The blue-to-red room join still needs a short exposure dissolve. */
const roomHandoff = .12;

/**
 * The splash scene over the carousel: the room enters, then its film scrubs once the room stands.
 * Reverse scrolling retraces it and returns the carousel untouched.
 */
export function splashTimeline(offset: number) {
  const room = offset >= splashFilmStart ? 1 : smootherstep(clamp((offset - splashStart) / splashDissolve));
  const film = clamp((offset - splashFilmStart) / (splashFilmEnd - splashFilmStart));
  return { room, film, visible: offset > splashStart, shown: offset >= splashFilmStart };
}

/** Reversible film progress, reading holds and copy, all driven by the same scroll offset. */
export function homeSceneTimeline(offset: number, index: number) {
  const phase = homeScenePhases[index];
  const next = homeScenePhases[index + 1];
  const progress = clamp((offset - phase.start) / phase.duration);
  // The red-to-family film already includes its tracked wall transition.
  const blend = index !== 1 ? Number(offset >= phase.start) : smootherstep(progress / roomHandoff);
  // The film begins in the previous room: do not put the destination's copy over it.
  // Reveal with the incoming scene, retain it through the reading hold, and keep it over the next room's film until
  // that room has nearly arrived (motion.textExit), as the story's copy does. The ending covers the last room outright.
  const copyEnd = next ? next.start + next.duration * motion.textExit : wallZoomStart;
  const copy = Number(progress >= motion.textEntry && offset < copyEnd);
  const coveredAt = next ? next.start + (index === 0 ? next.duration * roomHandoff : 0) : wallZoomStart;
  return { progress, blend, copy, visible: blend > 0 && (next ? offset < coveredAt : offset <= coveredAt) };
}

/** Move the camera over the held family-room frame for the form and closing brand. */
export function endingTimeline(offset: number) {
  const progress = clamp((offset - wallZoomStart) / endingPhases.zoom);
  const zoom = smootherstep(progress);
  const footer = smootherstep(clamp((offset - footerStart) / endingPhases.footerReveal));
  const form = smootherstep(clamp((offset - (enquiryStart - .65)) / .65)) * (1 - smootherstep(clamp((offset - footerStart) / .4)));
  // The ending starts on the exact held family frame. An opaque handoff avoids
  // doubling that frame while the new camera scale begins to move.
  return { progress, zoom, form, footer, visible: offset > wallZoomStart, blend: Number(offset > wallZoomStart) };
}

/**
 * The enquiry form arrives as separate pieces of glass: piece `index` of `count` starts on its own cue as the
 * form's progress rises and lands with a small overshoot (a spring), so the pose can be written straight into
 * CSS as the amount travelled (0 far away, 1 settled, briefly a hair past 1). Reverse scrolling retraces it.
 */
export function formPieceProgress(form: number, index: number, count: number, span = .5) {
  const cue = count <= 1 ? 0 : ((1 - span) * index) / (count - 1);
  const t = clamp((form - cue) / span);
  const back = 1.25;
  return form >= .999 ? 1 : 1 + (back + 1) * Math.pow(t - 1, 3) + back * Math.pow(t - 1, 2);
}

/** The next room starts only after the splash's settle; reverse scrolling retraces the same move. */
export function livingTimeline(offset: number) {
  const progress = clamp((offset - livingStart) / livingScrollDuration);
  return { progress, blend: Number(offset >= livingStart), travel: smootherstep(progress) };
}

/** Keep the copy through the final-frame hold and over the next room's film until that room has nearly arrived. */
export function splashCopyProgress(offset: number) {
  const progress = splashTimeline(offset).film;
  const leave = livingStart + homeScenePhases[0].duration * motion.textExit;
  return clamp(progress / .3) * (1 - smootherstep(clamp((offset - (leave - .2)) / .2)));
}
 