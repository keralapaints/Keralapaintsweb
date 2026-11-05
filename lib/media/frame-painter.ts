import type { Film, FilmBinding } from "./film-cache";
import { clamp } from "../math";

/**
 * Draws a scroll-scrubbed film (lib/media/film-cache) on a canvas: the frame for a film time, cover-fitted to the canvas's
 * box around a focal point, exactly as `object-fit: cover; object-position` would place a <video>.
 *
 * A seek is a lookup: the frame is drawn at once when it is decoded, otherwise the nearest decoded frame stands in
 * while it decodes, and the frames ahead in the direction of travel are decoded before they are asked for. A frame
 * is never cleared for a poster: the last picture stays until the next one can be drawn, so a slow connection shows
 * a film pausing, never a jump.
 */
export const painterTuning = {
  /** Frames decoded ahead of the playhead in the direction of travel, and behind it. */
  ahead: 4,
  behind: 1,
  /** A decoded frame this many frames from the target stands in while the target decodes (any distance: a fast scroll skips frames rather than freezing). */
  tolerance: Infinity,
  /** A film whose picture is further behind the scroll than this (frames), because its bytes have not arrived, gives way to its scene's stills. */
  stall: 12,
} as const;

/** The frame at a film time. */
export const frameFor = (time: number, fps: number, count: number) => clamp(Math.round(time * fps), 0, Math.max(0, count - 1));

export type Focal = { x: number; y: number };
export type Rect = { sx: number; sy: number; sw: number; sh: number };

/**
 * The part of a pack frame that covers a box, in pack pixels: `object-fit: cover` with `object-position` at
 * `focal` (fractions of the full film frame). A phone pack holds only a strip of the frame (`crop`); a box wider
 * than that strip is covered by the whole strip, cropped a little more top and bottom instead.
 */
export function coverRect(box: { width: number; height: number }, frame: Pick<Film, "width" | "height" | "crop">, focal: Focal): Rect {
  const full = frame.width / frame.crop.w;
  const aspect = box.width / Math.max(1, box.height);
  let sw = Math.min(full, frame.height * aspect);
  let sh = sw / aspect;
  if (sh > frame.height) { sh = frame.height; sw = sh * aspect; }
  let sx = focal.x * (full - sw) - frame.crop.x * full;
  if (sw > frame.width) { sw = frame.width; sh = sw / aspect; }
  sx = clamp(sx, 0, frame.width - sw);
  const sy = clamp(focal.y * (frame.height - sh), 0, frame.height - sh);
  return { sx, sy, sw, sh };
}

/** The decoded frame nearest `index` within `tolerance`, or undefined. */
export function nearestDecoded(film: Pick<Film, "has" | "count">, index: number, tolerance = painterTuning.tolerance) {
  const reach = Math.min(tolerance, Math.max(index, film.count - 1 - index));
  for (let distance = 1; distance <= reach; distance++) {
    if (index + distance < film.count && film.has(index + distance)) return index + distance;
    if (index - distance >= 0 && film.has(index - distance)) return index - distance;
  }
  return undefined;
}

export type FramePainter = {
  /** Draws the frame for a film time (or the nearest decoded one), decoding ahead. */
  seek(source: FilmBinding | Film | undefined, time: number): void;
  /** Sets the camera for the next seek, as fractions like CSS object-position. */
  setFocal(x: number, y: number): void;
  /** A frame is on the canvas. */
  readonly visible: boolean;
  /** The film and frame on the canvas. */
  readonly film: Film | undefined;
  readonly frameIndex: number;
  readonly frameTime: number;
  /** The frame on the canvas is the one last asked for. */
  readonly settled: boolean;
  /**
   * Frames between the picture on the canvas and the frame last asked for: 0 when settled, Infinity when nothing
   * is drawn or another film is.
   */
  readonly lag: number;
  /** The frame last asked for has not been downloaded yet (its film is still arriving); decoding is not the wait. */
  readonly starved: boolean;
  /**
   * The film has fallen behind the scroll because its bytes are not here: a scene then lets its stills dissolve
   * instead. A fast scroll through a downloaded film never stalls; it skips frames.
   */
  readonly stalled: boolean;
  /** Clears the canvas; the next seek starts afresh. */
  reset(): void;
  destroy(): void;
};

export function createFramePainter(canvas: HTMLCanvasElement, options: { onDraw?: () => void } = {}): FramePainter {
  const context = canvas.getContext("2d", { alpha: false });
  let box = { width: canvas.clientWidth, height: canvas.clientHeight };
  let focal: Focal = { x: .5, y: .5 };
  let drawn: { film: Film; index: number } | null = null;
  let wanted: { film: Film; index: number } | null = null;
  let direction = 1;
  let focalChanged = false;
  let rect: (Rect & { key: string }) | null = null;
  // A slow download can span hundreds of paint ticks; subscribe once per pending frame.
  const pending = new WeakMap<Film, Set<number>>();

  const layout = (film: Film) => {
    const key = `${film.url}|${box.width}x${box.height}|${focal.x.toFixed(4)},${focal.y.toFixed(4)}`;
    if (rect?.key !== key) rect = { key, ...coverRect(box, film, focal) };
    const width = Math.max(1, Math.round(rect.sw));
    const height = Math.max(1, Math.round(rect.sh));
    // Sizing the backing store to the covered part of the frame draws every source pixel once and never upscales;
    // the compositor scales the canvas to its box, as it scales a video.
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    return rect;
  };
  const draw = (film: Film, index: number) => {
    const bitmap = film.bitmap(index);
    if (!bitmap || !context) return false;
    const { sx, sy, sw, sh } = layout(film);
    // Resizing the backing store resets context settings, so restore these after layout.
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    drawn = { film, index };
    focalChanged = false;
    // What is on the canvas, for styling and inspection (data-film, data-frame).
    canvas.dataset.film = film.url;
    canvas.dataset.frame = String(index);
    options.onDraw?.();
    return true;
  };
  const redraw = () => { if (drawn) draw(drawn.film, drawn.index); };
  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
    const next = { width: canvas.clientWidth, height: canvas.clientHeight };
    if (next.width === box.width && next.height === box.height) return;
    box = next;
    redraw();
  }) : null;
  observer?.observe(canvas);

  return {
    seek(source, time) {
      const film = source && "need" in source ? source.film : source;
      if (!film) return;
      const index = frameFor(time, film.fps, film.count);
      if (wanted && wanted.film === film && index !== wanted.index) direction = index > wanted.index ? 1 : -1;
      wanted = { film, index };
      if (drawn && drawn.film === film && drawn.index === index) {
        if (focalChanged) redraw();
        return;
      }
      if (!draw(film, index)) {
        let frames = pending.get(film);
        if (!frames) { frames = new Set(); pending.set(film, frames); }
        if (!frames.has(index)) {
          const waiting = frames;
          waiting.add(index);
          void film.decode(index, true).then((bitmap) => {
            waiting.delete(index);
            if (bitmap && wanted?.film === film && wanted.index === index && !(drawn?.film === film && drawn.index === index)) draw(film, index);
          });
        }
        // Meanwhile the nearest decoded frame stands in, unless what is drawn is at least as close.
        const near = nearestDecoded(film, index);
        if (near !== undefined && !(drawn?.film === film && Math.abs(drawn.index - index) <= Math.abs(near - index))) draw(film, near);
        if (focalChanged) redraw();
      }
      for (let step = 1; step <= painterTuning.ahead; step++) {
        const next = index + step * direction;
        if (next >= 0 && next < film.count && !film.has(next)) void film.decode(next);
      }
      for (let step = 1; step <= painterTuning.behind; step++) {
        const previous = index - step * direction;
        if (previous >= 0 && previous < film.count && !film.has(previous)) void film.decode(previous);
      }
    },
    setFocal(x, y) {
      if (focal.x === x && focal.y === y) return;
      focal = { x, y };
      // Each scene sets its camera before seeking. Paint both together instead of
      // drawing the previous frame, then immediately drawing the new one again.
      focalChanged = true;
    },
    get visible() { return drawn !== null; },
    get film() { return drawn?.film; },
    get frameIndex() { return drawn?.index ?? -1; },
    get frameTime() { return drawn ? drawn.index / drawn.film.fps : -1; },
    get settled() { return !!drawn && !!wanted && drawn.film === wanted.film && drawn.index === wanted.index; },
    get lag() { return drawn && wanted && drawn.film === wanted.film ? Math.abs(drawn.index - wanted.index) : Infinity; },
    get starved() { return !!wanted && wanted.index >= wanted.film.loaded; },
    get stalled() { return !!wanted && wanted.index >= wanted.film.loaded && !(drawn && drawn.film === wanted.film && Math.abs(drawn.index - wanted.index) <= painterTuning.stall); },
    reset() {
      drawn = null;
      wanted = null;
      delete canvas.dataset.film;
      delete canvas.dataset.frame;
      context?.clearRect(0, 0, canvas.width, canvas.height);
    },
    destroy() {
      observer?.disconnect();
      drawn = null;
      wanted = null;
    },
  };
}
