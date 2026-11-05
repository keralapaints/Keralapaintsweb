import { useEffect } from "react";

type AutoplayConditions = {
  active: boolean; entered: boolean; suspended: boolean; reduced: boolean; constrained: boolean; interacting: boolean; covered: boolean;
  position: number; step: (direction: 1 | -1) => void;
};

/** Steps the ring forward every 4.5s while it is on screen, entered and left alone; any move restarts the wait. */
export function useCarouselAutoplay({ active, entered, suspended, reduced, constrained, interacting, covered, position, step }: AutoplayConditions) {
  useEffect(() => {
    if (!active || !entered || suspended || reduced || constrained || interacting || covered) return;
    const timer = window.setTimeout(() => step(1), 4500);
    return () => window.clearTimeout(timer);
  }, [active, entered, suspended, reduced, constrained, interacting, covered, position, step]);
}
