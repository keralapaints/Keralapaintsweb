import { openPackCache } from "./pack-cache";
import { readHeader, type FilmHeader } from "./pack-format";
import { filmForScreen, fixPackFormat, formatDecided, PORTRAIT_PACK_QUERY } from "./pack-url";
import { deviceHints, memoryAtMost } from "../device";
import { LOADED_EVENT, LOADING_CLASS } from "../preload";
import { PHONE_QUERY } from "../viewport";

export type { FilmHeader } from "./pack-format";
export { filmForScreen, packForScreen, PORTRAIT_PACK_QUERY } from "./pack-url";

/**
 * The scroll-scrubbed films (story transitions and product scenes) as frame packs, and the memory they are held in.
 *
 * A film is a pack of WebP frames (scripts/encode-frames.ts) fetched in one request and drawn on a canvas
 * (lib/media/frame-painter.ts). Frames become usable as their bytes arrive, so a film never waits for its whole download,
 * and nothing depends on byte-range requests, media caches, hardware decoder slots or blob: media URLs, all of which
 * made seeking a <video> slow and uneven across devices. Only films near the reader are held. Every consumer binds
 * its film and says how much it needs it; a film nobody needs is aborted, or kept as one of a few spares and
 * released after that. Decoded frames are a small shared window around the frames on show (filmTuning.decoded).
 */

/**
 * How much a bound consumer needs its film right now.
 * - none: not at all; the film may be released.
 * - warm: fetch it into memory when nothing more urgent is waiting.
 * - ready: fetch it now, and decode its opening frame so its first draw is instant.
 * - now: the film on show; fetched first, its frames decoded around the playhead.
 */
export type FilmNeed = "none" | "warm" | "ready" | "now";

export const filmTuning = {
  /** Films fetched at once; the rest wait their turn, most urgent first. */
  concurrency: 2,
  /** Films of the journey fetched ahead together (prefetchFilms): the next batch starts once the whole batch is in. */
  batch: 5,
  /** Released films kept in memory in case the reader turns back, oldest dropped first. */
  spares: 2,
  /** Decoded frames kept across all films (about 5.8 MB each at 1600x902). */
  decoded: 18,
  /** Frames decoded at once. */
  decoders: 3,
} as const;

/** Devices reporting this much memory (GB) or less are lean. */
const LEAN_MEMORY_GB = 2;

/** Data saver, slow connections and low-memory devices skip speculative downloads. */
export function filmBudget(nav?: Navigator): "full" | "lean" {
  const { saveData, slowConnection, memory } = deviceHints(nav);
  return saveData || slowConnection || memoryAtMost(memory, LEAN_MEMORY_GB) ? "lean" : "full";
}

/** A held film: its frames as they arrive, and the decoded window around the playhead. */
export type Film = {
  readonly url: string;
  readonly fps: number;
  readonly width: number;
  readonly height: number;
  /** The share of the full frame's width this pack holds (the phone strip), as a start and a width in 0..1. */
  readonly crop: { x: number; w: number };
  /** Frames in the film. */
  readonly count: number;
  /** Length in seconds. */
  readonly duration: number;
  /** Frames whose bytes have arrived, counted from the first. */
  readonly loaded: number;
  /** Whether a frame is decoded, without marking it used. */
  has(index: number): boolean;
  /** The decoded frame, if it is in the window. */
  bitmap(index: number): ImageBitmap | undefined;
  /** Decodes a frame into the window; resolves once it can be drawn (or never, if its bytes are not here yet). */
  decode(index: number, urgent?: boolean): Promise<ImageBitmap | undefined>;
};

type Entry = {
  url: string; state: "queued" | "loading" | "held" | "failed"; urgent: boolean; now: boolean;
  controller?: AbortController; spareSince?: number;
  /** Download progress, 0..1, while loading. */
  progress: number;
  header?: FilmHeader;
  offsets: number[];
  /** The bytes so far; dropped once every frame has been cut from it. */
  buffer: Uint8Array<ArrayBuffer>;
  received: number;
  /** The next frame whose bytes have not all arrived. */
  nextFrame: number;
  film?: Film;
  frames: (Blob | undefined)[];
  decoded: Map<number, ImageBitmap>;
  decoding: Map<number, Promise<ImageBitmap | undefined>>;
  waiting: Map<number, (bitmap: ImageBitmap | undefined) => void>;
};
type Binding = { url: string; need: FilmNeed; onFilm?: () => void };

const entries = new Map<string, Entry>();
const bindings = new Set<Binding>();
let loading = 0;
/** Called whenever a download ends (held or failed). */
const settled = new Set<() => void>();
/** Decoded frames in order of use, oldest first. */
const recent: { url: string; index: number }[] = [];
let decoders = 0;
const decodeQueue: { entry: Entry; index: number; urgent: boolean; resolve(bitmap: ImageBitmap | undefined): void }[] = [];

/** While the curtain is down only the film on show (the opening) loads. */
const gated = () => typeof document !== "undefined" && document.documentElement.classList.contains(LOADING_CLASS);

/** The held film, if its header has arrived. */
export function heldFilm(url: string) {
  const entry = entries.get(url);
  return entry && entry.state !== "failed" ? entry.film : undefined;
}

/** Download progress of a film, 0..1; 0 for a film that has not been requested. */
export function filmProgress(url: string) {
  const entry = entries.get(url);
  if (!entry) return 0;
  return entry.state === "held" ? 1 : entry.progress;
}

function pump() {
  for (;;) {
    const all = [...entries.values()];
    const queued = all.filter((entry) => entry.state === "queued");
    // The film on show never waits for a slot: after a jump it starts beside whatever is already downloading.
    if (loading >= filmTuning.concurrency && !(queued.some((entry) => entry.now) && !all.some((entry) => entry.now && entry.state === "loading"))) return;
    // Films wanted soon take the whole connection; a warmed film only starts once none of them is waiting or loading.
    const busy = all.some((entry) => entry.urgent && (entry.state === "queued" || entry.state === "loading"));
    // The film on show has the connection to itself until it is in; nothing else starts beside it.
    if (all.some((entry) => entry.now && entry.state === "loading")) return;
    const next = gated() ? queued.find((entry) => entry.now) : queued.find((entry) => entry.now) ?? queued.find((entry) => entry.urgent) ?? (busy ? undefined : queued[0]);
    if (!next) return;
    void load(next);
  }
}

/** Appends a chunk of the download, growing the buffer when its length was not announced. */
function receive(entry: Entry, chunk: Uint8Array<ArrayBuffer>) {
  if (entry.received + chunk.byteLength > entry.buffer.byteLength) {
    const grown = new Uint8Array(Math.max(entry.buffer.byteLength * 2, entry.received + chunk.byteLength));
    grown.set(entry.buffer.subarray(0, entry.received));
    entry.buffer = grown;
  }
  entry.buffer.set(chunk, entry.received);
  entry.received += chunk.byteLength;
}

/** Reads the header once it is complete, and cuts every frame whose bytes are complete into a Blob. */
function advance(entry: Entry) {
  if (!entry.header) {
    const read = readHeader(entry.buffer, entry.received, entry.url);
    if (!read) return;
    entry.header = read.header;
    let offset = read.end;
    entry.offsets = entry.header.sizes.map((size) => { const start = offset; offset += size; return start; });
    entry.frames = entry.header.sizes.map(() => undefined);
    entry.film = createFilm(entry);
    // A scene that stopped scrolling before its film arrived draws it now (its update runs on scroll otherwise).
    bindings.forEach((binding) => { if (binding.url === entry.url) binding.onFilm?.(); });
  }
  const { header, offsets } = entry;
  while (entry.nextFrame < offsets.length) {
    const index = entry.nextFrame;
    const end = offsets[index] + header.sizes[index];
    if (entry.received < end) break;
    entry.frames[index] = new Blob([entry.buffer.subarray(offsets[index], end)], { type: header.type });
    entry.nextFrame++;
    entry.waiting.get(index)?.(undefined);
  }
  // Every frame is its own Blob now; the download buffer is dropped by load() once it may have been cached.
}

function createFilm(entry: Entry): Film {
  const header = entry.header!;
  return {
    url: entry.url,
    fps: header.fps, width: header.width, height: header.height, crop: header.crop,
    count: header.sizes.length,
    duration: header.sizes.length / header.fps,
    get loaded() { return entry.nextFrame; },
    has(index) { return entry.decoded.has(index); },
    bitmap(index) {
      const bitmap = entry.decoded.get(index);
      if (bitmap) touch(entry.url, index);
      return bitmap;
    },
    decode(index, urgent = false) {
      const have = entry.decoded.get(index);
      if (have) { touch(entry.url, index); return Promise.resolve(have); }
      const pending = entry.decoding.get(index);
      if (pending) return pending;
      // Frames decoded ahead are dropped rather than queued behind a fast scroll; the playhead's own frame never is.
      if (!urgent && decodeQueue.length >= filmTuning.decoders * 3) return Promise.resolve(undefined);
      const promise = new Promise<ImageBitmap | undefined>((resolve) => {
        const start = () => {
          entry.waiting.delete(index);
          // Only the latest playhead frame of a film is worth decoding: a fast scroll asks for a new one every
          // frame, and queued ones it has already passed would only hold the current one back.
          if (urgent) {
            for (let i = decodeQueue.length - 1; i >= 0; i--) {
              const item = decodeQueue[i];
              if (item.entry === entry && item.urgent) { decodeQueue.splice(i, 1); item.resolve(undefined); }
            }
          }
          decodeQueue.push({ entry, index, urgent, resolve });
          decodeQueue.sort((a, b) => Number(b.urgent) - Number(a.urgent));
          runDecoders();
        };
        if (entry.frames[index]) start();
        else if (entry.state === "failed" || entries.get(entry.url) !== entry) resolve(undefined);
        // The bytes are still on their way: decode once they are in (or give up with the film).
        else entry.waiting.set(index, (bitmap) => (bitmap ? resolve(bitmap) : start()));
      });
      entry.decoding.set(index, promise);
      void promise.finally(() => { if (entry.decoding.get(index) === promise) entry.decoding.delete(index); });
      return promise;
    },
  };
}

function touch(url: string, index: number) {
  const at = recent.findIndex((item) => item.url === url && item.index === index);
  if (at >= 0) recent.splice(at, 1);
  recent.push({ url, index });
}

/** Drops the least recently used decoded frames beyond the window. */
function trimDecoded() {
  while (recent.length > filmTuning.decoded) {
    const { url, index } = recent.shift()!;
    const entry = entries.get(url);
    const bitmap = entry?.decoded.get(index);
    if (bitmap) { entry!.decoded.delete(index); bitmap.close(); }
  }
}

function runDecoders() {
  while (decoders < filmTuning.decoders && decodeQueue.length) {
    const { entry, index, resolve: settle } = decodeQueue.shift()!;
    const blob = entry.frames[index];
    if (!blob || entries.get(entry.url) !== entry) { settle(undefined); continue; }
    decoders++;
    void decodeBlob(blob).then((bitmap) => {
      decoders--;
      if (bitmap && entries.get(entry.url) === entry) {
        entry.decoded.set(index, bitmap);
        touch(entry.url, index);
        trimDecoded();
        settle(entry.decoded.get(index));
      } else { bitmap?.close(); settle(undefined); }
      runDecoders();
    });
  }
}

/** Decodes off the main thread where the browser can; a browser without createImageBitmap draws nothing. */
async function decodeBlob(blob: Blob): Promise<ImageBitmap | undefined> {
  if (typeof createImageBitmap !== "function") return undefined;
  try { return await createImageBitmap(blob); } catch { return undefined; }
}

async function load(entry: Entry) {
  entry.state = "loading";
  entry.controller = new AbortController();
  loading++;
  let complete = false;
  let cached = false;
  try {
    // (Without Cache Storage, node and insecure pages, the fetch starts at once.)
    const cache = typeof caches === "undefined" ? null : await openPackCache();
    let response = cache ? await cache.match(entry.url).catch(() => undefined) : undefined;
    cached = !!response;
    response ??= await fetch(entry.url, { signal: entry.controller.signal, priority: entry.urgent ? "high" : "low" });
    if (response.ok && response.body) {
      const total = Number(response.headers.get("content-length")) || 0;
      entry.buffer = new Uint8Array(total || 1 << 20);
      const reader = response.body.getReader();
      for (;;) {
        // While the film on show is downloading, every other download stops reading: the connection is left to
        // the film the reader is looking at (the paused stream backs up and resumes where it stopped).
        while (!cached && !entry.now && entries.get(entry.url) === entry && [...entries.values()].some((other) => other !== entry && other.now && other.state === "loading")) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        if (entries.get(entry.url) !== entry) { entry.controller.abort(); break; }
        const { done, value } = await reader.read();
        if (done) break;
        receive(entry, value);
        if (total) entry.progress = entry.received / total;
        if (entries.get(entry.url) !== entry) { entry.controller.abort(); break; }
        advance(entry);
      }
      complete = entries.get(entry.url) === entry && !!entry.header && entry.nextFrame === entry.frames.length;
      // A pack that came from the network is kept for the next visit, from the bytes already in hand.
      if (complete && !cached && cache && entry.header) {
        const bytes = entry.buffer.slice(0, entry.received);
        void cache.put(entry.url, new Response(bytes, { headers: { "Content-Type": "application/octet-stream", "Content-Length": String(bytes.byteLength) } })).catch(() => undefined);
      }
      if (complete) entry.buffer = new Uint8Array(0);
    }
  } catch { /* Aborted, offline, missing or malformed: handled below. */ }
  loading--;
  entry.controller = undefined;
  // A released film is simply dropped; the next one in the queue starts either way.
  if (entries.get(entry.url) === entry) {
    if (complete) { entry.state = "held"; entry.progress = 1; }
    else {
      // A film that cannot be fetched shows its stills; the story never waits on it.
      entry.state = "failed";
      entry.waiting.forEach((settle) => settle(undefined));
      entry.waiting.clear();
    }
    review(entry.url);
    settled.forEach((listener) => listener());
  }
  pump();
}

/** Fetch, keep, spare or release a film according to the consumers bound to it. */
function review(url: string) {
  const entry = entries.get(url);
  if (!entry) return;
  const users = [...bindings].filter((binding) => binding.url === url && binding.need !== "none");
  if (users.length) {
    entry.spareSince = undefined;
    entry.urgent = users.some((binding) => binding.need === "now" || binding.need === "ready");
    entry.now = users.some((binding) => binding.need === "now");
    return;
  }
  entry.now = false;
  if (entry.state === "held") {
    entry.spareSince ??= performance.now();
    const spares = [...entries.values()].filter((item) => item.spareSince !== undefined).sort((a, b) => a.spareSince! - b.spareSince!);
    spares.slice(0, Math.max(0, spares.length - filmTuning.spares)).forEach(release);
    return;
  }
  release(entry);
}

function release(entry: Entry) {
  entries.delete(entry.url);
  entry.controller?.abort();
  entry.decoded.forEach((bitmap) => bitmap.close());
  entry.decoded.clear();
  for (let i = recent.length - 1; i >= 0; i--) if (recent[i].url === entry.url) recent.splice(i, 1);
  entry.waiting.forEach((settle) => settle(undefined));
  entry.waiting.clear();
  entry.buffer = new Uint8Array(0);
  entry.frames = [];
}

function request(url: string, urgent: boolean, now: boolean) {
  const entry = entries.get(url);
  if (entry) { entry.urgent ||= urgent; entry.now ||= now; entry.spareSince = undefined; return; }
  entries.set(url, { url, state: "queued", urgent, now, progress: 0, offsets: [], buffer: new Uint8Array(0), received: 0, nextFrame: 0, frames: [], decoded: new Map(), decoding: new Map(), waiting: new Map() });
  pump();
}

/** A consumer's hold on a film: `need` may be called every frame, as only a change of need does any work. */
export type FilmBinding = {
  /** The pack this screen draws (see filmForScreen). */
  readonly url: string;
  need(need: FilmNeed): void;
  /** The film, once its header has arrived. */
  readonly film: Film | undefined;
  /** Download progress, 0..1. */
  readonly progress: number;
  /** The film could not be fetched. */
  readonly failed: boolean;
  destroy(): void;
};

/**
 * Binds a consumer to a film (its screen copy: see filmForScreen). The film is fetched when it is warmed, and
 * decoded ahead as it is needed. `onFilm` is called once the film's header is in and it can be sought.
 * The pack URL is settled by the first need, once the pack format is known (formatDecided).
 */
export function bindFilm(film: string, options: { onFilm?: () => void } = {}): FilmBinding {
  const lean = filmBudget() === "lean";
  let url: string | undefined;
  const binding: Binding = { url: "", need: "none", onFilm: options.onFilm };
  const settle = () => { if (!url) { fixPackFormat(); url = filmForScreen(film); binding.url = url; } return url; };
  bindings.add(binding);
  const screen = typeof window === "undefined" ? null : window.matchMedia(PORTRAIT_PACK_QUERY);
  const changeScreen = () => {
    if (!url || !bindings.has(binding)) return;
    const next = filmForScreen(film);
    if (next === url) return;
    const previous = url;
    url = next;
    binding.url = next;
    const need = binding.need;
    if (need !== "none") request(next, need !== "warm", need === "now");
    review(previous);
    pump();
    if (need === "ready" || need === "now") void heldFilm(next)?.decode(0, need === "now");
    options.onFilm?.();
  };
  screen?.addEventListener("change", changeScreen);
  return {
    get url() { return url ?? filmForScreen(film); },
    need(wanted) {
      // A lean device never warms: it holds the film on show and the one it is about to show.
      const need = lean && wanted === "warm" ? "none" : wanted;
      if (need === binding.need) return;
      binding.need = need;
      void formatDecided.then(() => {
        if (binding.need !== need || !bindings.has(binding)) return;
        const pack = settle();
        if (need !== "none") request(pack, need !== "warm", need === "now");
        review(pack);
        pump();
        if (need === "ready" || need === "now") void heldFilm(pack)?.decode(0, need === "now");
      });
    },
    get film() { return url ? heldFilm(url) : undefined; },
    get progress() { return url ? filmProgress(url) : 0; },
    get failed() { return !!url && entries.get(url)?.state === "failed"; },
    destroy() {
      screen?.removeEventListener("change", changeScreen);
      binding.need = "none";
      bindings.delete(binding);
      if (url) review(url);
    },
  };
}

/**
 * Fetches the whole journey ahead, `filmTuning.batch` films at a time in the order given: the next batch starts
 * once every film of the batch is in (or has failed). The films stay in memory for the page's life. The film on show
 * always goes first (lib/media/film-cache pump), so a reader who outruns the prefetch is never queued behind it. Lean
 * devices (filmBudget) and phones use the moving scene window instead. Returns cleanup.
 */
export function prefetchFilms(films: string[], batch: number = filmTuning.batch) {
  // Phones use the moving scene window: retaining the whole journey competes for memory
  // and downloads distant films that a short visit may never reach.
  if (filmBudget() === "lean" || (typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches)) return () => {};
  const holds = films.map((film) => bindFilm(film));
  let next = 0;
  const step = () => {
    const current = holds.slice(Math.max(0, next - batch), next);
    if (current.some((hold) => hold.progress < 1 && !hold.failed)) return;
    if (next >= holds.length) { settled.delete(step); return; }
    holds.slice(next, next + batch).forEach((hold) => hold.need("warm"));
    next += batch;
  };
  settled.add(step);
  step();
  return () => {
    settled.delete(step);
    holds.forEach((hold) => hold.destroy());
  };
}

// Once the curtain lifts, the queued films start.
if (typeof window !== "undefined") window.addEventListener(LOADED_EVENT, () => pump());
