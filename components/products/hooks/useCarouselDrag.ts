import { useCallback, useRef, type PointerEvent } from "react";

/** Horizontal travel (px) that makes a press a carousel drag, and that a released drag needs to change product. */
const DRAG_START_PX = 8;
const SWIPE_PX = 35;

/** Pointer handlers for the carousel ring: a press, a sideways drag the ring follows, and a release that steps it. */
export function useCarouselDrag(step: (direction: 1 | -1) => void, setInteracting: (interacting: boolean) => void) {
  const dragStart = useRef<{ x: number; y: number; dx: number; horizontal: boolean } | null>(null);

  // A sideways drag of 35px or more steps the ring, even when the browser takes the end of the gesture over as a
  // scroll (pointercancel); the ring then springs back from the drag offset into its new position.
  const finishDrag = useCallback((carousel: HTMLElement, cancelled: boolean) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (cancelled) setInteracting(false);
    delete carousel.dataset.dragging;
    carousel.style.removeProperty("--pr-drag");
    if (start?.horizontal && Math.abs(start.dx) > SWIPE_PX) step(start.dx < 0 ? 1 : -1);
  }, [step, setInteracting]);

  return {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      setInteracting(true);
      dragStart.current = { x: event.clientX, y: event.clientY, dx: 0, horizontal: false };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    // The ring follows a sideways drag (a thumb's swipe is rarely level), so the swipe is felt before it lands.
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      const start = dragStart.current;
      if (!start) return;
      const dx = event.clientX - start.x;
      if (!start.horizontal && Math.abs(dx) > DRAG_START_PX && Math.abs(dx) > Math.abs(event.clientY - start.y) * .8) {
        start.horizontal = true;
        event.currentTarget.dataset.dragging = "true";
      }
      if (!start.horizontal) return;
      start.dx = dx;
      event.currentTarget.style.setProperty("--pr-drag", `${(dx * .35).toFixed(1)}px`);
    },
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => finishDrag(event.currentTarget, true),
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") setInteracting(false);
      const start = dragStart.current;
      if (start && !start.horizontal) {
        const dx = event.clientX - start.x;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
          start.dx = dx;
          start.horizontal = true;
        }
      }
      finishDrag(event.currentTarget, false);
    },
  };
}
