import manifest from "./frames-manifest.json";
import { versioned } from "./media";
import { PHONE_QUERY } from "../viewport";

/**
 * Which copy of a film a screen takes: the phone strip or the full frame, AVIF or WebP. The pack format is decided
 * once per page (formatDecided) and fixed by the first pack asked for (fixPackFormat, from lib/media/film-cache).
 */

/**
 * The copy of a film for a screen: phones take the `-phone` pack (the fixed strip of each frame a portrait phone shows,
 * at the same pixel size, about a third of the pixels), in WebP; larger screens whose browser decodes AVIF take the
 * `.avif.bin` pack (the same frames in about 60% of the WebP bytes). A phone's processor, not its connection, is what
 * keeps up with the scroll: an AVIF frame takes two to three times as long to decode as a WebP one (Safari decodes AVIF
 * in software), so phones spend the extra bytes. See scripts/encode-frames.ts.
 */
export function packForScreen(url: string, phone: boolean, avif: boolean) {
  let pack = url;
  if (avif && !phone) pack = pack.replace(/\.bin$/, ".avif.bin");
  if (phone) {
    const portrait = pack.replace(/(\.avif)?\.(bin|mp4)$/, "-phone$1.$2");
    // A film encoded full-frame has a phone pack identical to the desktop one; share the single download.
    const hash = packHash(portrait);
    if (!hash || hash !== packHash(pack)) pack = portrait;
  }
  return pack;
}

const packHash = (url: string) => (manifest.files as Record<string, string>)[url.split("/").pop() ?? ""];

/** A 2x2 AVIF; a browser that turns it into a bitmap can draw the AVIF packs. */
const TINY_AVIF = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAAD5bWV0YQAAAAAAAAAvaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAFBpY3R1cmVIYW5kbGVyAAAAAA5waXRtAAAAAAABAAAAHmlsb2MAAAAARAAAAQABAAAAAQAAASEAAAAVAAAAKGlpbmYAAAAAAAEAAAAaaW5mZQIAAAAAAQAAYXYwMUNvbG9yAAAAAGppcHJwAAAAS2lwY28AAAAUaXNwZQAAAAAAAAACAAAAAgAAABBwaXhpAAAAAAMICAgAAAAMYXYxQ4EADAAAAAATY29scm5jbHgAAgACAAIAAAAAF2lwbWEAAAAAAAAAAQABBAECgwQAAAAdbWRhdAoFGAA2wCAyDByAAABYAABAA1LteA==";
/**
 * The pack format this page uses: AVIF once the tiny AVIF has decoded, WebP until then and otherwise. The first
 * pack asked for fixes it for the page, so every pack of a page matches (a film is never fetched in both).
 */
let format: "webp" | "avif" = "webp";
let formatFixed = false;
/**
 * Settles once the format is known (the test decode succeeds or fails), or after 1.5 s at the latest: every film
 * waits for it before asking for its pack, so a fast machine that binds its films before the test image has decoded
 * still takes the smaller packs.
 */
export const formatDecided: Promise<void> = typeof window === "undefined" || typeof createImageBitmap !== "function"
  ? Promise.resolve()
  : Promise.race([
    fetch(TINY_AVIF).then((response) => response.blob()).then((blob) => createImageBitmap(blob)).then(() => { if (!formatFixed) format = "avif"; }, () => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, 1500)),
  ]);

/** Fixes the pack format for the page: called as the first pack is asked for, so a later AVIF result changes nothing. */
export function fixPackFormat() {
  formatFixed = true;
}

/** The copy of a film this screen draws (see packForScreen), versioned. */
export function filmForScreen(url: string) {
  if (typeof window === "undefined") return url;
  const query = url.endsWith(".bin") ? PORTRAIT_PACK_QUERY : PHONE_QUERY;
  return versioned(packForScreen(url, window.matchMedia(query).matches, format === "avif"));
}

/** Keep the conservative tall-phone cutoff; full-height footage fits safely inside these strips. */
export const PORTRAIT_PACK_QUERY = `${PHONE_QUERY} and (max-aspect-ratio: 17/30)`;
