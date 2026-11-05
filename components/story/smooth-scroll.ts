import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { LOADED_EVENT, LOADING_CLASS } from "@/lib/preload";
import { MENU_EVENT, SCROLL_TO_EVENT } from "@/lib/events";

const SCROLL_KEY = "story:scroll";
// Dimensionless easing intensity and input multipliers used by aquabottle.netlify.app.
const SCROLL_LERP = 0.1;
const WHEEL_MULTIPLIER = 1;
const TOUCH_MULTIPLIER = 2;

/** The page's smooth scroller. It stays stopped while the menu or the preloader curtain holds the page. */
export function createSmoothScroll() {
  // Match the reference's wheel glide and native touch scrolling. With syncTouch off,
  // touch distance and release inertia belong to the browser, not the touch multiplier.
  const lenis = new Lenis({
    lerp: SCROLL_LERP,
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: WHEEL_MULTIPLIER,
    touchMultiplier: TOUCH_MULTIPLIER,
    syncTouch: false,
  });
  gsap.ticker.lagSmoothing(0);
  // The story and the Product Range get their heights from script, so the browser's own restoration would
  // land short; the position is kept in session storage instead and restored once the heights are in place.
  history.scrollRestoration = "manual";
  // The open menu and the preloader curtain both hold the page still.
  const held = () => ["menu-open", LOADING_CLASS].some((name) => document.documentElement.classList.contains(name));
  if (held()) lenis.stop();
  lenis.on("scroll", ScrollTrigger.update);

  return {
    lenis, held,
    destroy() {
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      history.scrollRestoration = "auto";
    },
  };
}

export function saveScroll() {
  try { sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ y: Math.round(window.scrollY), path: location.pathname, width: window.innerWidth })); } catch { /* storage unavailable: nothing to restore */ }
}

/** The scroll offset saved on this page at this window width, or null. */
export function savedScroll() {
  let saved: { y?: number; path?: string; width?: number } | null = null;
  try { saved = JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? "null"); } catch { saved = null; }
  if (!saved || saved.path !== location.pathname || saved.width !== window.innerWidth || typeof saved.y !== "number" || !(saved.y > 0)) return null;
  return saved.y;
}

/**
 * Page-level events the scroller answers: the menu, tab visibility, the preloader lifting, and scroll requests from
 * sections after the timeline. `freeze` pauses the hero's idle loop. Returns the cleanup.
 */
export function listenToPage({ lenis, held }: ReturnType<typeof createSmoothScroll>, freeze: () => void) {
  // A restored mobile tab can retain a stopped scroller after its visibility event.
  // Recover only stale stops; a real menu/preloader lock must still own the page.
  const resume = () => {
    if (!document.hidden && !held() && lenis.isStopped) lenis.start();
  };
  const onPageShow = () => {
    lenis.resize();
    resume();
  };
  const onMenu = (event: Event) => {
    const open = (event as CustomEvent<{ open: boolean }>).detail.open;
    if (open) { lenis.stop(); freeze(); }
    else resume();
  };
  const onVisibility = () => {
    if (document.hidden) { saveScroll(); lenis.stop(); freeze(); }
    else resume();
  };
  // The preloader lifts its curtain; the paint loop wakes the idle hero loop on its own.
  const onLoaded = () => {
    resume();
  };
  // Sections after the timeline (Product Range) ask the smooth scroller for a position.
  const onScrollTo = (event: Event) => {
    const top = (event as CustomEvent<{ top?: number }>).detail?.top;
    if (typeof top === "number" && Number.isFinite(top)) lenis.scrollTo(top, { duration: 1.1, force: true });
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener(MENU_EVENT, onMenu);
  window.addEventListener(LOADED_EVENT, onLoaded);
  window.addEventListener("pagehide", saveScroll);
  window.addEventListener("pageshow", onPageShow);
  window.addEventListener("touchstart", resume, { passive: true });
  window.addEventListener(SCROLL_TO_EVENT, onScrollTo);
  return () => {
    window.removeEventListener("pagehide", saveScroll);
    window.removeEventListener("pageshow", onPageShow);
    window.removeEventListener("touchstart", resume);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener(MENU_EVENT, onMenu);
    window.removeEventListener(LOADED_EVENT, onLoaded);
    window.removeEventListener(SCROLL_TO_EVENT, onScrollTo);
  };
}
