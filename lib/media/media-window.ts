import type { FilmNeed } from "./film-cache";
import { endingScene, homeScenes, splashScene } from "../product/product-data";
import { homeScenePhases, livingStart, productScrollRange, splashStart, wallZoomStart } from "../product/product-scroll";
import { transitions } from "../story/scene-data";

/** Every scrubbed film of the journey in reading order: the story's nine, then the splash, the rooms and the wall. */
export const journeyFilms = [...new Set([...transitions.map((transition) => transition.frames), splashScene.film, ...homeScenes.map((scene) => scene.film), endingScene.film])];

/**
 * Which story film an element needs while the reader is in segment `current`: the film that plays next is needed
 * now, the previous film and next two decoded ahead, and the third ahead warmed.
 * Everything further away is released to keep decoder and memory use bounded.
 */
export function storyFilmNeed(file: number, current: number): FilmNeed {
  const distance = file - current;
  if (distance === 0) return "now";
  if (distance === -1 || distance === 1 || distance === 2) return "ready";
  if (distance === 3) return "warm";
  return "none";
}

/** Where a film is on screen, in viewport heights past the Product Range's top (the unit of lib/product/product-scroll). */
export type FilmSpan = { start: number; end: number };

/** How far ahead of its span (and behind it, for reverse scrolling) a product film is warmed, attached and due. */
// A reader scrolls about a screen a second and a room's film is 1-5 MB: over Wi-Fi it needs a few screens of lead.
export const productFilmLead = { now: .25, ready: 2.5, warm: 4.5, trail: 1.5 } as const;

// Each room stays on screen until the next one has faded in over it (see homeSceneTimeline).
const roomEnd = (index: number) => {
  const next = homeScenePhases[index + 1];
  return next ? next.start + next.duration * .3 : wallZoomStart + .25;
};

export const productFilmSpans = {
  splash: { start: splashStart, end: livingStart + homeScenePhases[0].duration },
  living: { start: homeScenePhases[0].start, end: roomEnd(0) },
  colour: { start: homeScenePhases[1].start, end: roomEnd(1) },
  family: { start: homeScenePhases[2].start, end: roomEnd(2) },
  // The wall's last frame holds behind the enquiry form and the footer, to the end of the range.
  ending: { start: wallZoomStart, end: productScrollRange + 1 },
} satisfies Record<string, FilmSpan>;

export function productFilmNeed(offset: number, span: FilmSpan): FilmNeed {
  if (!Number.isFinite(offset) || offset > span.end + productFilmLead.trail) return "none";
  if (offset >= span.start - productFilmLead.now && offset <= span.end) return "now";
  if (offset >= span.start - productFilmLead.ready) return "ready";
  if (offset >= span.start - productFilmLead.warm) return "warm";
  return "none";
}
