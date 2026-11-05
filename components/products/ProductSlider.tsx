"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { clamp } from "@/lib/math";
import { products } from "@/lib/product/product-data";

const LAST = products.length - 1;
// Movement below this (px) is a tap, not the start of a scrub or a page scroll.
const PRESS_SLOP = 6;

/** Knob physics, kept outside React state: it repaints a CSS variable straight onto the slider element. */
function createMotion(start: number) {
  const motion = {
    element: null as HTMLDivElement | null,
    knob: start,
    velocity: 0,
    goal: start,
    dragging: false,
    pending: Math.round(start * LAST),
    frame: 0,
    stamp: 0,
    paint(value: number) { motion.element?.style.setProperty("--pr-knob", value.toFixed(4)); },
    snap(value: number) { motion.knob = value; motion.goal = value; motion.velocity = 0; motion.paint(value); },
    run() { if (!motion.frame) motion.frame = window.requestAnimationFrame(motion.tick); },
    stop() { window.cancelAnimationFrame(motion.frame); motion.frame = 0; motion.stamp = 0; },
    tick(now: number) {
      motion.frame = 0;
      const dt = Math.min(32, now - (motion.stamp || now)) / 1000;
      motion.stamp = now;
      const distance = motion.goal - motion.knob;
      if (motion.dragging) {
        // Heavy follow: the knob eases towards the finger rather than sticking to it.
        motion.knob += distance * (1 - Math.exp(-dt / .045));
        motion.velocity = 0;
      } else {
        // Lightly underdamped spring: a touch of overshoot as it lands on the stop.
        motion.velocity += (distance * 240 - motion.velocity * 24) * dt;
        motion.knob += motion.velocity * dt;
        if (Math.abs(distance) < .0005 && Math.abs(motion.velocity) < .002) {
          motion.knob = motion.goal;
          motion.velocity = 0;
          motion.paint(motion.knob);
          motion.stamp = 0;
          return;
        }
      }
      motion.paint(motion.knob);
      motion.frame = window.requestAnimationFrame(motion.tick);
    },
  };
  return motion;
}

/**
 * A hairline slider across the range: one tick per product, a knob that scrubs between them.
 * The knob trails the pointer with a little weight while dragging and springs onto the nearest stop when released.
 */
export function ProductSlider({ activeIndex, onSelect, reduced, disabled = false }: { activeIndex: number; onSelect: (id: string) => void; reduced: boolean; disabled?: boolean }) {
  const store = useRef(createMotion(activeIndex / LAST));
  // Where the pointer went down, until the gesture is known to be a tap, a scrub or a page scroll.
  const pressed = useRef<{ x: number; y: number } | null>(null);
  const [track, setTrack] = useState<HTMLDivElement | null>(null);

  // Follow the range when it moves on its own (autoplay, arrows, keyboard, header menu).
  useEffect(() => {
    const motion = store.current;
    motion.pending = activeIndex;
    motion.goal = activeIndex / LAST;
    if (reduced) { motion.snap(motion.goal); return; }
    if (!motion.dragging) motion.run();
  }, [activeIndex, reduced]);
  useEffect(() => { const motion = store.current; return () => motion.stop(); }, []);

  const fraction = (clientX: number) => {
    const motion = store.current;
    const bounds = track?.getBoundingClientRect();
    return bounds && bounds.width > 0 ? clamp((clientX - bounds.left) / bounds.width) : motion.goal;
  };
  const settle = (index: number) => {
    const motion = store.current;
    if (index !== motion.pending) { motion.pending = index; onSelect(products[index].id); }
  };
  const aim = (value: number) => {
    const motion = store.current;
    motion.goal = value;
    settle(Math.round(value * LAST));
    if (reduced) motion.snap(value); else motion.run();
  };

  // A touch on the slider is not yet a scrub. On phones the track crosses the band a thumb scrolls the page with, so
  // the knob follows only once the gesture is clearly sideways, or on a tap; a vertical flick leaves the range alone.
  const scrub = (element: HTMLDivElement, clientX: number) => {
    // Focus is what pauses autoplay while scrubbing on touch (preventDefault on pointerdown stops the implicit focus).
    element.focus({ preventScroll: true });
    const motion = store.current;
    motion.dragging = true;
    element.dataset.dragging = "true";
    aim(fraction(clientX));
  };
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pressed.current = { x: event.clientX, y: event.clientY };
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (store.current.dragging) { aim(fraction(event.clientX)); return; }
    const start = pressed.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < PRESS_SLOP && Math.abs(dy) < PRESS_SLOP) return;
    pressed.current = null;
    // Sideways: scrub from here. Otherwise the browser is scrolling the page (touch-action: pan-y) and the press is over.
    if (Math.abs(dx) > Math.abs(dy)) scrub(event.currentTarget, event.clientX);
  };
  const up = (event: PointerEvent<HTMLDivElement>) => {
    const motion = store.current;
    const start = pressed.current;
    pressed.current = null;
    // A press released without moving is a tap on the track: pick the product under it.
    if (start && event.type === "pointerup") {
      event.currentTarget.focus({ preventScroll: true });
      aim(fraction(event.clientX));
      return;
    }
    if (!motion.dragging) return;
    motion.dragging = false;
    delete event.currentTarget.dataset.dragging;
    motion.goal = motion.pending / LAST;
    if (reduced) motion.snap(motion.goal); else motion.run();
  };

  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    const motion = store.current;
    const next = event.key === "ArrowRight" || event.key === "ArrowUp" ? motion.pending + 1
      : event.key === "ArrowLeft" || event.key === "ArrowDown" ? motion.pending - 1
      : event.key === "Home" ? 0 : event.key === "End" ? LAST : null;
    if (next === null) return;
    event.preventDefault();
    settle(clamp(next, 0, LAST));
  };

  const product = products[activeIndex];
  return <div ref={(element) => { const motion = store.current; motion.element = element; if (element) motion.paint(motion.knob); }} className="pr-slider" role="slider" tabIndex={disabled ? -1 : 0} inert={disabled} aria-disabled={disabled} aria-label="Product range"
    aria-valuemin={1} aria-valuemax={products.length} aria-valuenow={activeIndex + 1} aria-valuetext={product.title}
    aria-orientation="horizontal"
    onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} onKeyDown={keys}>
    <div ref={setTrack} className="pr-slider-track">
      {products.map((entry, index) => <span key={entry.id} className="pr-tick" data-lit={index <= activeIndex || undefined}
        style={{ "--pr-tick": index / LAST } as CSSProperties} />)}
      <span className="pr-knob" />
      <span className="pr-slider-label" aria-hidden="true"><span key={product.id}>{product.short.replace("\n", " ")}</span></span>
    </div>
  </div>;
}
