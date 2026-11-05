import { PHONE_QUERY } from "./viewport";

/**
 * Phones travel a longer scroll distance per timeline unit (PHONE_SCROLL_SCALE).
 * Touch remains native; pacing comes from distance, not intercepted gestures or synthetic inertia.
 * CSS mirrors this as --scroll-scale (app/styles/cinematic.css),
 * which sizes the Product Range section.
 */
export const PHONE_SCROLL_SCALE = 1.5;

let phone: MediaQueryList | undefined;

/** Scroll distance of one timeline unit, as a share of the stage height. */
export function scrollScale() {
  if (typeof window === "undefined") return 1;
  phone ??= window.matchMedia(PHONE_QUERY);
  return phone.matches ? PHONE_SCROLL_SCALE : 1;
}
