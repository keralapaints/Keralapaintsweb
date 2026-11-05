import framesManifest from "./frames-manifest.json";
import mediaManifest from "./media-manifest.json";

/**
 * Where the site's films and stills live, in one scheme for the whole journey (scenes 1–16).
 *
 * Every film bridges two numbered scenes and is scrubbed by scroll: the story's `01-to-02` … `09-to-10`, then the
 * product world's `12-to-13` (range → splash), `13-to-14` (splash → living room), `14-to-15` (→ feature wall),
 * `15-to-16` (→ family room). The enquiry camera zoom holds that film's final frame. A still is the frame a scene rests
 * on: film `A-to-B` starts on still `A` and ends on still `B`, so stills double as posters and reduced-motion artwork.
 * The story stills also come as `-small` encodes for phones.
 *
 * Files: public/frames/NN-to-MM.bin frame packs (scripts/encode-frames.ts) scrubbed by the scroll, public/films/hero-idle.mp4
 * played by the hero idle loop, and public/stills/NN.webp (scripts/refresh-hd-stills.py).
 */
/** Two-digit scene and chapter numbers: 1 → "01". */
export const pad = (scene: number) => String(scene).padStart(2, "0");

export const filmId = (from: number, to: number) => `${pad(from)}-to-${pad(to)}`;
/** The film as a pack of WebP frames drawn on a canvas as the reader scrolls (scripts/encode-frames.ts). */
export const packUrl = (from: number, to: number) => `/frames/${filmId(from, to)}.bin`;
export const stillUrl = (scene: number, small = false) => versioned(`/stills/${pad(scene)}${small ? "-small" : ""}.webp`);

/**
 * A media URL with its content hash (`?v=`, from lib/media/frames-manifest.json or lib/media/media-manifest.json, written by the
 * encode scripts): the URL changes when the file does, so it can be cached for good by the host and the browser.
 */
export function versioned(url: string) {
  const name = url.split("/").pop() ?? "";
  const hash = (framesManifest.files as Record<string, string>)[name] ?? (mediaManifest as Record<string, string>)[name];
  return hash ? `${url}?v=${hash}` : url;
}
