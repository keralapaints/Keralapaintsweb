import gsap from "gsap";
import { revealOffset, staggeredReveal } from "./story/story-timeline";

/**
 * Scene copy plays its whole reveal once its scene is reached, instead of following the scroll: the scroll only
 * decides whether the copy is shown (its timeline amount has passed `threshold`), and the line lift, stagger and fade
 * then run on their own clock, so a reader who stops scrolling never sees half-revealed text. Scrolling back past
 * the threshold plays it out the same way, lines leaving in reverse order.
 */
export const copyTiming = { in: .75, out: .3, threshold: .5 } as const;

export type TimedReveal = { update(scroll: number): void; readonly amount: number; destroy(): void };

/** Headline lines lift 18px and details 10px, staggered in reading order; `onAmount` follows the played amount. */
export function createTimedReveal(lines: HTMLElement[], details: HTMLElement[], onAmount?: (amount: number) => void): TimedReveal {
  const elements = [...lines, ...details];
  const targets = elements.map((element, index) => ({ element, offset: revealOffset(index, elements.length), lift: index < lines.length ? 18 : 10 }));
  const state = { amount: 0 };
  let shown: boolean | null = null;
  gsap.set(lines, { opacity: 0, y: 18 });
  gsap.set(details, { opacity: 0, y: 10 });
  const apply = () => {
    targets.forEach(({ element, offset, lift }) => {
      const t = staggeredReveal(state.amount, offset);
      gsap.set(element, { opacity: t, y: (1 - t) * lift });
    });
    onAmount?.(state.amount);
  };
  return {
    update(scroll: number) {
      const next = scroll >= copyTiming.threshold;
      if (next === shown) return;
      shown = next;
      const target = next ? 1 : 0;
      // A reversal part-way through turns around from where it is, at the same pace.
      const duration = (next ? copyTiming.in : copyTiming.out) * Math.abs(target - state.amount);
      gsap.to(state, { amount: target, duration, ease: "none", overwrite: true, onUpdate: apply, onComplete: apply });
    },
    get amount() { return state.amount; },
    destroy() {
      gsap.killTweensOf(state);
      gsap.set(elements, { clearProps: "opacity,transform" });
    },
  };
}

/** The timed reveal for a copy block marked up with `.headline-line` and `[data-copy-detail]`. */
export function createCopyReveal(root: HTMLElement, onAmount?: (amount: number) => void) {
  return createTimedReveal(
    Array.from(root.querySelectorAll<HTMLElement>(".headline-line")),
    Array.from(root.querySelectorAll<HTMLElement>("[data-copy-detail]")),
    onAmount,
  );
}
