import manifest from "./frames-manifest.json";

/**
 * Packs are kept in the browser's Cache Storage between visits, whatever the host's cache headers (the dev server
 * sends none, some hosts send weak ones): a return visit reads them from disk and downloads nothing. The cache is
 * named after the manifest version, so a re-encode starts a new one and the old is deleted.
 */
const CACHE_NAME = `kerala-paints-frames-${manifest.version}`;
let packCache: Promise<Cache | null> | undefined;
export function openPackCache() {
  packCache ??= (async () => {
    try {
      if (typeof caches === "undefined" || !window.isSecureContext) return null;
      const cache = await caches.open(CACHE_NAME);
      for (const name of await caches.keys()) if (name.startsWith("kerala-paints-frames-") && name !== CACHE_NAME) void caches.delete(name);
      return cache;
    } catch { return null; }
  })();
  return packCache;
}
