"use client";

import { useSyncExternalStore } from "react";

const eventName = "story:motion-preference";
const storageKey = "kerala-paints-reduced-motion";

function subscribe(notify: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  window.addEventListener(eventName, notify);
  window.addEventListener("storage", notify);
  return () => {
    media.removeEventListener("change", notify);
    window.removeEventListener(eventName, notify);
    window.removeEventListener("storage", notify);
  };
}

function snapshot(): "system" | "reduced" | "full" {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "system";
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "true") return "reduced";
    if (saved === "false") return "full";
  } catch { /* Storage can be unavailable in private contexts. */ }
  return document.documentElement.dataset.motionChoice === "reduced" ? "reduced" : "full";
}

export function useMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, () => "full" as const);
}

export function setReducedMotion(reduced: boolean) {
  document.documentElement.dataset.motionChoice = reduced ? "reduced" : "full";
  try { localStorage.setItem(storageKey, String(reduced)); } catch { /* The current session preference still works. */ }
  window.dispatchEvent(new Event(eventName));
}
