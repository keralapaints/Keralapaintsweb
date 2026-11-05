import { scenes, transitions } from "@/lib/story/scene-data";
import { createSegments } from "@/lib/story/story-timeline";

/** The story's scroll timeline: each scene's reading hold, then its film's travel into the next scene. */
export const segments = createSegments(scenes.map((scene, index) => ({ hold: scene.hold, travel: transitions[index]?.travel ?? 0 })));
/** Length of the whole timeline, in timeline units. */
export const total = segments[segments.length - 1].end;
/** Each scrubbed film once, in journey order. */
export const files = [...new Set(transitions.map((transition) => transition.file))];
/** The frame packs the scroll scrubs, by file. */
export const packSources = Object.fromEntries(transitions.map((transition) => [transition.file, transition.frames]));
/** Duration of an animated chapter or product jump, in seconds. */
export const NAVIGATION_SECONDS = 1.4;
