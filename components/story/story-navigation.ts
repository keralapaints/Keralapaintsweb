import type Lenis from "lenis";
import { scenes } from "@/lib/story/scene-data";
import { carouselStop, enquiryStart, productUnit } from "@/lib/product/product-scroll";
import { NAVIGATION_SECONDS, segments, total } from "./story-layout";

type Options = {
  container: HTMLElement;
  lenis: Lenis;
  /** Scroll distance of one timeline unit. */
  unitHeight: () => number;
  /** Moves the hero state machine straight to a timeline position (no handoff). */
  navigateHero: (position: number) => void;
};

/** In-page links and hash changes: scene and product anchors scroll the smooth scroller to their place. */
export function createStoryNavigation({ container, lenis, unitHeight, navigateHero }: Options) {
  const jumpTo = (target: number | HTMLElement, immediate: boolean, offset = 0) =>
    lenis.scrollTo(target, { offset, immediate, force: true, duration: immediate ? 0 : NAVIGATION_SECONDS });

  /** Scrolls to a scene or product anchor; false when the hash is not one of them. */
  const goToHash = (hash: string, immediate = false) => {
    // Land past the splash so product links open the fully revealed range.
    // Explicitly finish the hero state machine before jumping beyond it.
    if (hash === "#product-range" || hash === "#enquiry") {
      const product = document.getElementById("product-range");
      if (!product) return false;
      navigateHero(total);
      lenis.resize();
      jumpTo(product, immediate, productUnit(product.getBoundingClientRect()) * (hash === "#product-range" ? carouselStop.rest : enquiryStart + .1));
      return true;
    }
    const sceneIndex = scenes.findIndex((scene) => `#${scene.id}` === hash);
    if (sceneIndex < 0) return false;
    const position = sceneIndex === 0 ? 0 : segments[sceneIndex].start + 0.12;
    navigateHero(position);
    jumpTo(container.getBoundingClientRect().top + window.scrollY + position * unitHeight(), immediate);
    return true;
  };

  const onLink = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = anchor?.getAttribute("href");
    if (!hash || event.defaultPrevented || anchor?.getAttribute("aria-disabled") === "true") return;
    if (hash === "#") {
      event.preventDefault();
      history.pushState(null, "", "#");
      lenis.scrollTo(0, { force: true });
    } else if (goToHash(hash)) {
      event.preventDefault();
      history.pushState(null, "", hash);
    }
  };

  const onHash = () => {
    if (location.hash === "" || location.hash === "#") lenis.scrollTo(0, { immediate: true, force: true });
    else goToHash(location.hash, true);
  };

  document.addEventListener("click", onLink);
  window.addEventListener("hashchange", onHash);

  return {
    goToHash,
    destroy() {
      document.removeEventListener("click", onLink);
      window.removeEventListener("hashchange", onHash);
    },
  };
}
