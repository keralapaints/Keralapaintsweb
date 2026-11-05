import gsap from "gsap";

/** What every Product Range scene needs each frame, read once for all of them. */
export type ScrollFrame = {
  scrollY: number;
  width: number;
  height: number;
  /** The Product Range section's box (`.product-world`), or null before it is mounted. */
  product: DOMRect | null;
};

type Subscriber = (frame: ScrollFrame) => void;
const subscribers = new Set<Subscriber>();
let y = Number.NaN;
let width = 0;
let height = 0;
let section: HTMLElement | null = null;
let ticking = false;
let measured: ScrollFrame | null = null;
let measuredTick = -1;
let invalidated = false;

/** Request a scene refresh on the shared scroll tick when media or layout changes without scrolling. */
export function invalidateScrollFrame() {
  invalidated = true;
}

/**
 * The scroll position, the viewport and the Product Range's box, read once per animation frame and shared by every
 * scene. The story (components/story/cinematic-story) takes the measurement at the start of its (prioritised) tick,
 * before anything writes to the page: reads that follow writes make the browser lay the page out again, and each scene reading for itself
 * between the writes of the scene before it cost up to eight forced layouts a frame.
 */
export function measureScrollFrame(): ScrollFrame {
  if (measured && measuredTick === gsap.ticker.frame) return measured;
  if (!section?.isConnected) section = document.querySelector<HTMLElement>(".product-world");
  measured = { scrollY: window.scrollY, width: window.innerWidth, height: window.innerHeight, product: section?.getBoundingClientRect() ?? null };
  measuredTick = gsap.ticker.frame;
  return measured;
}

/** One tick for every scene: they all update from the same measurement. */
const tick = () => {
  const frame = measureScrollFrame();
  if (!invalidated && frame.scrollY === y && frame.width === width && frame.height === height) return;
  // A draw can request another refresh; clear before subscribers so that request survives this tick.
  invalidated = false;
  y = frame.scrollY;
  width = frame.width;
  height = frame.height;
  subscribers.forEach((update) => update(frame));
};

/**
 * Runs `update` in the same animation frame as the story's scroll: components/story/cinematic-story advances Lenis first in the GSAP
 * ticker (prioritised), so Product Range scenes follow the scroll exactly as the story does, instead of a frame later
 * from the browser's scroll event. `update` runs when scroll or viewport size changes, or media requests a refresh.
 */
export function onScrollFrame(update: Subscriber) {
  subscribers.add(update);
  y = Number.NaN;
  if (!ticking) { gsap.ticker.add(tick); ticking = true; }
  return () => {
    subscribers.delete(update);
    if (!subscribers.size && ticking) { gsap.ticker.remove(tick); ticking = false; }
  };
}
