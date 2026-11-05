import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { productOffset, productPhases, productRevealProgress, productRevealTarget } from "@/lib/product/product-scroll";
import { onScrollFrame } from "@/lib/scroll-frame";
import { PHONE_QUERY } from "@/lib/viewport";

/** The parts of the stage that fade in after it (product-world.css `[data-splash="revealing"]`), besides the stage itself. */
const ENTRY_TARGETS = ".pr-counter, .pr-copy, .pr-tagline, .pr-arrow, .pr-slider";
// Seconds: finish the entrance promptly enough to remain visible through a touch fling.
const ENTRY_SECONDS = .45;

/** The story before the range is running its cinematic (pinned, scroll-scrubbed) mode. */
export const followsCinematicStory = (element: HTMLElement) => element.previousElementSibling?.getAttribute("data-cinematic") === "true";

// A soft upward settle introduces the collection, followed by its copy and controls.
// Phones follow scroll directly; desktop keeps its timed settle.
export function useProductReveal(section: RefObject<HTMLElement | null>, stage: RefObject<HTMLDivElement | null>, reduced: boolean, setEntered: (entered: boolean) => void) {
  useEffect(() => {
    const element = section.current;
    const view = stage.current;
    if (!element || !view) return;
    const phone = window.matchMedia(PHONE_QUERY);
    const outgoing = element.previousElementSibling?.querySelector<HTMLElement>(".story-stage");
    const outgoingCopy = Array.from(outgoing?.querySelectorAll<HTMLElement>(".scene-content") ?? []);
    let frame = 0;
    let lastProgress = -1;
    let enabled = false;
    let revealTarget = -1;
    const reveal = { progress: 0 };
    // The section's box comes from the shared scroll frame (lib/scroll-frame), measured once for every scene.
    const paintReveal = () => {
      const progress = reveal.progress;
      // No repeated style writes or React updates during the rest of the long product timeline.
      if (progress === lastProgress) return;
      lastProgress = progress;
      // Written on each element that reads it, never on an ancestor: the properties do not inherit (product-world.css
      // @property), so a frame restyles these few elements instead of the whole stage and the story behind it.
      const entry = progress.toFixed(4);
      [view, ...view.querySelectorAll<HTMLElement>(ENTRY_TARGETS)].forEach((target) => target.style.setProperty("--pr-entry", entry));
      if (outgoing) {
        outgoingCopy.forEach((copy) => {
          if (enabled) copy.style.setProperty("--pr-outgoing-copy", String(1 - progress));
          else copy.style.removeProperty("--pr-outgoing-copy");
        });
        outgoing.inert = enabled && progress > .5;
      }
      element.dataset.splash = !enabled || progress >= 1 ? "complete" : progress > 0 ? "revealing" : "waiting";
      view.style.visibility = progress === 0 ? "hidden" : "visible";
      view.inert = progress < .92;
      setEntered(progress >= .92);
    };
    const update = (bounds: DOMRect = element.getBoundingClientRect()) => {
      frame = 0;
      enabled = followsCinematicStory(element) && !reduced;
      const offset = enabled ? productOffset(bounds) : 1;
      if (!enabled || phone.matches) {
        gsap.killTweensOf(reveal);
        revealTarget = -1;
        reveal.progress = enabled ? productRevealProgress(offset) : 1;
        paintReveal();
        return;
      }
      // Scroll triggers a complete entrance, even when a wheel gesture stops midway.
      // Reverse out when returning to the story, with a small hysteresis band.
      const target = !enabled ? 1 : productRevealTarget(offset, revealTarget);
      if (target !== revealTarget || (offset >= productPhases.reveal && reveal.progress < 1)) {
        revealTarget = target;
        gsap.to(reveal, { progress: target, duration: !enabled || offset >= productPhases.reveal ? 0 : target ? ENTRY_SECONDS : .4,
          ease: target ? "power3.out" : "power2.inOut", overwrite: true, onUpdate: paintReveal, onComplete: paintReveal });
      }
      paintReveal();
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(() => update()); };
    const resize = () => {
      lastProgress = -1;
      schedule();
    };
    const observer = new MutationObserver(schedule);
    if (element.previousElementSibling) observer.observe(element.previousElementSibling, { attributes: true, attributeFilter: ["data-cinematic", "style"] });
    const stopFrames = onScrollFrame((scroll) => update(scroll.product ?? undefined));
    window.addEventListener("resize", resize);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      gsap.killTweensOf(reveal);
      observer.disconnect();
      stopFrames();
      window.removeEventListener("resize", resize);
      view.style.removeProperty("visibility");
      [view, ...view.querySelectorAll<HTMLElement>(ENTRY_TARGETS)].forEach((target) => target.style.removeProperty("--pr-entry"));
      if (outgoing) outgoing.inert = false;
      outgoingCopy.forEach((copy) => copy.style.removeProperty("--pr-outgoing-copy"));
      view.inert = false;
    };
  }, [section, stage, reduced, setEntered]);
}
