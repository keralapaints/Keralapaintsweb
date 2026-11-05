"use client";

import { useEffect, useRef } from "react";
import { bindFilm } from "@/lib/media/film-cache";
import { productFilmNeed, productFilmSpans } from "@/lib/media/media-window";
import { splashScene } from "@/lib/product/product-data";
import { splashCopy } from "@/data/products";
import { splashCopyProgress, livingStart, productOffset, splashTimeline } from "@/lib/product/product-scroll";
import { createFramePainter } from "@/lib/media/frame-painter";
import { createCopyReveal } from "@/lib/copy-reveal";

import { invalidateScrollFrame, onScrollFrame } from "@/lib/scroll-frame";
import { NARROW_QUERY } from "@/lib/viewport";
import { phoneCameraX } from "@/lib/media/phone-camera";

type Props = { reduced: boolean; onCover: (covered: boolean) => void };

/** Everything that moves as the room opens over the range (product-world.css, --pr-room). */
const ROOM_TARGETS = ".pr-splash, .pr-splash-plate, .pr-splash-film, .pr-carousel, .pr-hero, .pr-copy, .pr-counter, .pr-tagline";

/** The collection recedes as a central room aperture opens into the paint film. */
export function ProductSplash({ reduced, onCover }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLCanvasElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = root.current;
    const section = scene?.closest<HTMLElement>(".product-world");
    // Static scenes never cover the carousel.
    if (!scene || !section || reduced) return;
    let phase = "";
    let covered = false;
    let offset = 0;
    const canvas = film.current;
    const schedule = invalidateScrollFrame;
    const painter = canvas ? createFramePainter(canvas, { onDraw: schedule }) : null;
    const source = canvas ? bindFilm(splashScene.film, { onFilm: schedule }) : null;
    // Narrow screens frame the room around the bucket (lib/media/phone-camera).
    const narrow = window.matchMedia(NARROW_QUERY);
    const copyRoot = copy.current;
    // The copy outlasts the scene (splashCopyProgress keeps it over the next room's film), so it is shown by its own reveal.
    const copyReveal = copyRoot ? createCopyReveal(copyRoot, (amount) => {
      copyRoot.style.visibility = amount > 0 ? "visible" : "hidden";
      copyRoot.setAttribute("aria-hidden", String(amount === 0));
    }) : null;
    let room = "";
    const paintEntrance = (progress: number) => {
      // Written on each element that reads it (product-world.css @property --pr-room does not inherit), so the opening
      // restyles about ten elements a frame rather than the whole Product Range.
      const amount = progress.toFixed(4);
      if (amount !== room) {
        room = amount;
        section.querySelectorAll<HTMLElement>(ROOM_TARGETS).forEach((target) => target.style.setProperty("--pr-room", amount));
      }
      const next = progress <= 0 ? "idle" : progress >= 1 ? "shown" : "entering";
      if (next !== phase) { phase = next; section.dataset.splashScene = next; }
      const nextCovered = progress > 0;
      if (covered !== nextCovered) { covered = nextCovered; onCover(covered); }
      scene.setAttribute("aria-hidden", String(offset >= livingStart || progress < 1));
    };
    const update = (bounds: DOMRect = section.getBoundingClientRect()) => {
      offset = productOffset(bounds);
      const splash = splashTimeline(offset);
      const visible = splash.visible && offset < livingStart;
      const film = splash.film;
      // Show one film at a time at the matching-frame handoff, including reverse scrolling.
      scene.style.visibility = offset >= livingStart ? "hidden" : "";
      source?.need(productFilmNeed(offset, productFilmSpans.splash));
      // Follow the same scroll sample as the film: pausing or reversing a swipe must also stop or reverse the room.
      paintEntrance(splash.room);
      copyReveal?.update(splashCopyProgress(offset));
      // Keep one clean still on screen while the film is unavailable.
      scene.style.setProperty("--pr-splash-still", String(Number(film >= .5)));
      const cameraX = narrow.matches ? phoneCameraX("12-to-13", film) : .5;
      scene.style.setProperty("--pr-splash-focal", `${cameraX * 100}%`);
      if (visible && painter && source?.film) {
        // The room is anchored to the bottom edge (product-world.css .pr-splash-film).
        painter.setFocal(cameraX, 1);
        painter.seek(source, film * source.film.duration);
        scene.dataset.film = film > 0 && painter.visible && !painter.stalled ? "scrubbing" : "idle";
      } else scene.dataset.film = "idle";
    };
    const stopFrames = onScrollFrame((scroll) => update(scroll.product ?? undefined));
    window.addEventListener("resize", schedule);
    update();
    return () => {
      painter?.destroy();
      source?.destroy();
      copyReveal?.destroy();
      stopFrames();
      window.removeEventListener("resize", schedule);
      delete section.dataset.splashScene;
      section.querySelectorAll<HTMLElement>(ROOM_TARGETS).forEach((target) => target.style.removeProperty("--pr-room"));
      scene.style.removeProperty("visibility");
      scene.style.removeProperty("--pr-splash-focal");
      scene.removeAttribute("aria-hidden");
      copyRoot?.style.removeProperty("visibility");
      copyRoot?.removeAttribute("aria-hidden");
      if (covered) onCover(false);
    };
  }, [reduced, onCover]);

  // Scene 13 of the brief, verbatim: one centred headline with a gold full stop and its line beneath.
  const copyBlock = <div ref={copy} className="pr-splash-copy">
    <h3 className="pr-splash-heading" aria-label={splashCopy.lines.join(" ")}>
      {splashCopy.lines.map((line, index) => <span className="line-mask" key={line}><span className="headline-line">{line}{index === splashCopy.lines.length - 1 && <span className="pr-splash-stop">.</span>}</span></span>)}
    </h3>
    <p className="pr-splash-line" data-copy-detail>{splashCopy.paragraph}</p>
  </div>;

  return <>
  <div ref={root} className={reduced ? "pr-splash pr-splash-static" : "pr-splash"} data-film="idle">
    <div className="footage-window">
    {/* Native DOM media; the artwork above stays untouched. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="pr-splash-plate" src={reduced ? splashScene.end : splashScene.poster} alt="" loading="lazy" decoding="async" />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {!reduced && <img className="pr-splash-plate pr-splash-plate-end" src={splashScene.end} alt="" loading="lazy" decoding="async" />}
    {/* Its frames come from the film cache as the scene approaches (lib/media/media-window) and are drawn here. */}
    {!reduced && <canvas ref={film} className="pr-splash-film" aria-hidden="true" />}
    <div className="pr-splash-grade" />
    </div>
    {reduced && copyBlock}
  </div>
  {/* Outside the scene's clipped aperture, so it can stay over the next room's film (product-world.css). */}
  {!reduced && copyBlock}
  </>;
}
