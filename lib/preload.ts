import { scenes, type Scene } from "./story/scene-data";

/** One bar of the overall progress: bytes received against bytes expected. */
export type PreloadState = { loaded: number; total: number };

/** The single native hero loop and its opening scroll pack must both be usable. */
export function heroPlaybackProgress(frames: number, video?: { readyState: number; failed: boolean; buffered: number }) {
  if (!video) return 0;
  if (frames >= 1 && (video.failed || video.readyState >= 3)) return 1;
  return Math.max(0, Math.min(.95, video.buffered, frames));
}

/** The supplied brand artwork, prepared in white for the dark scenes. */
export const BRAND_LOGO = "/images/brand/kerala-paints-white.svg";
export const LOADED_EVENT = "story:loaded";
/** Class on <html> while the preloader holds the page (see app/styles/base.css and components/story/smooth-scroll). */
export const LOADING_CLASS = "is-loading";

export const posterFor = (scene: Scene, phone: boolean) => phone ? scene.smallPoster : scene.poster;

/**
 * The opening experience: the curtain waits for these and nothing else. The first still, the still the first
 * scroll arrives at, the fonts, and the opening film playable in the hero loop and the first transition.
 * Later films, the Product Range and the ending load behind the open page (lib/media/film-cache, ProductWorld).
 */
export const criticalScenes = scenes.slice(0, 2);

/** Rough weights of the opening pieces, so the bar moves like a byte count while the film buffers. */
export const criticalWeights = { fonts: 100_000, poster: 150_000, hero: 5_700_000 } as const;

/** Every image the curtain waits for, for a phone or a larger screen. */
export function criticalImages(phone: boolean) {
  return [BRAND_LOGO, ...criticalScenes.map((scene) => posterFor(scene, phone))];
}

/** Byte-weighted completion in 0..1. Nothing to load counts as complete. */
export function preloadProgress(states: PreloadState[]) {
  const total = states.reduce((sum, state) => sum + Math.max(0, state.total), 0);
  if (total <= 0) return 1;
  const loaded = states.reduce((sum, state) => sum + Math.min(Math.max(0, state.loaded), Math.max(0, state.total)), 0);
  return Math.min(1, loaded / total);
}
