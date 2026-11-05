import { storyScenes, type SceneContent } from "@/data/story";
import { filmId, packUrl, stillUrl } from "../media/media";

/** A story scene: its content (data/story) numbered and given its stills. */
export type Scene = SceneContent & { number: number; pdfPage: number; poster: string; smallPoster: string };

/** Chapters in the whole journey: the ten story scenes, then the product world through the footer. */
export const JOURNEY_CHAPTERS = 18;

export const scenes: Scene[] = storyScenes.map((scene, index) => ({
  ...scene,
  number: index + 1,
  pdfPage: index < 5 ? index + 1 : index + 2,
  poster: stillUrl(index + 1),
  smallPoster: stillUrl(index + 1, true),
}));

/** `frames` is the pack the scroll scrubs. */
export type Transition = { file: string; frames: string; from: number; to: number; start: number; end: number; travel: number };

// Website numbering: omit PDF page 6, then shift the remaining pages by one.
// Separate opening films meet at Scene 2's wall reading hold.
// HD replacements: the opener has 109 frames and the remaining story packs 78, all at 15 fps.
const bridges = [
  // The longer opening clip needs similar frames per scroll unit to the later films.
  { from: 1, to: 2, end: 7.2, travel: 2.2 },
  { from: 2, to: 3, end: 77 / 15, travel: 1.8 },
  { from: 3, to: 4, end: 77 / 15, travel: 1.6 },
  { from: 4, to: 5, end: 77 / 15, travel: 1.6 },
  // The cave-to-manufacturing move needs more travel to avoid rushing past human discovery.
  { from: 5, to: 6, end: 77 / 15, travel: 2.2 },
  { from: 6, to: 7, end: 77 / 15, travel: 1.6 },
  { from: 7, to: 8, end: 77 / 15, travel: 1.6 },
  { from: 8, to: 9, end: 77 / 15, travel: 1.6 },
  { from: 9, to: 10, end: 77 / 15, travel: 1.8 },
];

export const transitions: Transition[] = bridges.map((bridge) => ({
  ...bridge, start: 0, file: filmId(bridge.from, bridge.to), frames: packUrl(bridge.from, bridge.to),
}));
