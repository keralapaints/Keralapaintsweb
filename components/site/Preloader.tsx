"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { PHONE_QUERY } from "@/lib/viewport";
import { site } from "@/data/site";
import { BRAND_LOGO, LOADED_EVENT, LOADING_CLASS, criticalImages, criticalWeights, heroPlaybackProgress, preloadProgress, type PreloadState } from "@/lib/preload";
import { transitions } from "@/lib/story/scene-data";
import { filmForScreen, filmProgress } from "@/lib/media/film-cache";

const POLL_MS = 120;
// The curtain waits for the opening only. A connection that delivers nothing for this long (a hung request, a dropped
// network) lifts it early, and so does a slow one after the longest wait: the stills stand in until the hero film plays.
const STALL_MS = 8_000;
const MAX_WAIT_MS = 12_000;
const FADE_MS = 700;

/** Regions the viewer must not reach (by keyboard or scroll) while the curtain is down. */
const heldRegions = () => Array.from(document.querySelectorAll<HTMLElement>(".site-header, .story-root, .product-world"));

/** The share of the opening frame pack the curtain waits for: enough for the first scroll wherever the loop is. */
const OPENING_SHARE = .4;

/**
 * How far the opening is towards playing, 0..1. At the top: the native idle loop must be able to play from the DOM
 * elements the story owns, and the opening frame pack (lib/media/film-cache) must have its first frames in. A page that
 * opens elsewhere (a reload restores the reader mid-way, a hash lands on a scene) waits for the film on show there
 * instead (`data-film` on the story root) and not for the loop, which is not on screen. Reduced motion shows stills
 * only, so there is no film to wait for.
 */
function heroProgress() {
  const root = document.querySelector<HTMLElement>(".story-root");
  if (!root) return 0;
  if (root.dataset.cinematic !== "true") return 1;
  // The pack on show, as the story settled it (format and screen copy); until it says, the opening pack.
  const pack = root.dataset.pack || filmForScreen(transitions[0].frames);
  const frames = Math.min(1, filmProgress(pack) / OPENING_SHARE);
  if (root.dataset.heroState && root.dataset.heroState !== "hero") return frames >= 1 ? 1 : Math.min(.95, frames);
  const video = root.querySelector<HTMLVideoElement>(".hero-loop-video");
  if (!video) return 0;
  const buffered = video.buffered.length && Number.isFinite(video.duration) && video.duration > 0
    ? video.buffered.end(video.buffered.length - 1) / video.duration : 0;
  // Buffering alone never completes the bar; only playable films do.
  return heroPlaybackProgress(frames, { readyState: video.readyState, failed: !!video.error, buffered });
}

/**
 * Full-screen curtain shown until the opening experience is ready: the fonts, the first two stills and the hero film.
 * It is server-rendered so the first paint is never the half-loaded page; the client lifts it, and everything later
 * in the journey keeps loading behind the open page.
 */
export function Preloader() {
  const motionPreference = useMotionPreference();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");
  // Hydration can flip the motion preference once; a later change must never bring the curtain back.
  const lifted = useRef(false);

  useEffect(() => {
    if (lifted.current) return;
    const html = document.documentElement;
    const cinematic = motionPreference === "full";
    const fonts: PreloadState = { loaded: 0, total: criticalWeights.fonts };
    const hero: PreloadState = { loaded: 0, total: criticalWeights.hero };
    const started = performance.now();
    let shown = 0;
    let finished = false;
    // Set when this run is torn down (the preference flips during hydration): its pending decodes must not report.
    let cancelled = false;
    let poll = 0;
    let lastProgress = started;
    const images: PreloadState[] = [];

    html.classList.add(LOADING_CLASS);
    heldRegions().forEach((region) => { region.inert = true; });

    const release = () => {
      html.classList.remove(LOADING_CLASS);
      heldRegions().forEach((region) => { region.inert = false; });
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      lifted.current = true;
      window.clearInterval(poll);
      release();
      setProgress(1);
      setPhase("leaving");
      window.dispatchEvent(new CustomEvent(LOADED_EVENT));
      window.setTimeout(() => setPhase("done"), cinematic ? FADE_MS : 0);
    };

    // The bar only ever moves forward.
    const report = () => {
      if (finished || cancelled) return;
      const value = preloadProgress([...images, fonts, hero]);
      if (value > shown) { shown = value; setProgress(value); lastProgress = performance.now(); }
      if (value >= 1) finish();
    };

    // Image objects share the browser's request with the page's own <img> of the same URL, so nothing downloads twice.
    criticalImages(window.matchMedia(PHONE_QUERY).matches).forEach((url) => {
      const state: PreloadState = { loaded: 0, total: criticalWeights.poster };
      const image = new window.Image();
      image.fetchPriority = "high";
      image.src = url;
      // A missing still must never trap the viewer behind the curtain.
      void image.decode().catch(() => undefined).then(() => { state.loaded = state.total; report(); });
      images.push(state);
    });

    void document.fonts.ready.then(() => { fonts.loaded = fonts.total; report(); });
    poll = window.setInterval(() => {
      hero.loaded = hero.total * heroProgress();
      report();
      const now = performance.now();
      if (now - lastProgress > STALL_MS || now - started > MAX_WAIT_MS) finish();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      if (!finished) release();
    };
  }, [motionPreference]);

  if (phase === "done") return null;
  const percent = Math.min(100, Math.floor(progress * 100));
  return <div className="preloader" data-phase={phase} role="progressbar" aria-label="Loading the Kerala Paints story"
    aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-busy={phase === "loading"}
    style={{ "--preload": progress } as CSSProperties}>
    <div className="preloader-inner">
      <div className="preloader-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BRAND_LOGO} srcSet={`${BRAND_LOGO} 820w`} sizes="(max-width: 916px) 110px, (max-width: 1416px) 12vw, 170px" width={820} height={500} alt={site.logoAlt} fetchPriority="high" />
      </div>
      <div className="preloader-track" aria-hidden="true"><span className="preloader-fill" /></div>
      <p className="preloader-caption"><span>{site.loading}</span><b>{percent}%</b></p>
    </div>
    <noscript><style>{".preloader{display:none}"}</style></noscript>
  </div>;
}
