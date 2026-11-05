"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import { endingScene } from "@/lib/product/product-data";
import { bindFilm } from "@/lib/media/film-cache";
import { productFilmNeed, productFilmSpans } from "@/lib/media/media-window";
import { endingTimeline, formPieceProgress, productOffset } from "@/lib/product/product-scroll";
import { enquiryCopy } from "@/data/enquiry";
import { createCopyReveal } from "@/lib/copy-reveal";
import { createFramePainter } from "@/lib/media/frame-painter";

import "./home-scenes.css";
import "./enquiry-ending.css";
import { invalidateScrollFrame, onScrollFrame } from "@/lib/scroll-frame";
import { NARROW_QUERY } from "@/lib/viewport";
import { cameraX as pathX, endingCameraPath } from "@/lib/media/phone-camera";
import { createFieldHold } from "./field-hold";
import { EnquiryForm } from "./EnquiryForm";
import { EnquiryFooter } from "./EnquiryFooter";

/** Soft points of light drifting over the wall, laid out on a golden-angle spiral so none of them line up. */
const sparks = Array.from({ length: 18 }, (_, i) => ({
  left: `${((i * 137.508) % 360) / 3.6}%`, top: `${(i * 61.8) % 100}%`, size: `${8 + ((i * 7) % 22)}px`,
  dx: `${-30 + ((i * 53) % 60)}px`, dy: `${-70 - ((i * 29) % 60)}px`, duration: `${13 + ((i * 3) % 9)}s`, delay: `${-(i * 1.7)}s`,
}));

export function EnquiryEnding({ reduced }: { reduced: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLCanvasElement>(null);
  const formScene = useRef<HTMLElement>(null);
  const footerScene = useRef<HTMLElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const tiltFrame = useRef(0);

  useEffect(() => {
    const section = root.current;
    const panel = surface.current;
    const product = section?.closest<HTMLElement>(".product-world");
    if (!section || !panel || !product || reduced) return;
    // Once the form is reached its glass pieces, liquid wipe and copy play in on the reveal's clock, and play out when
    // it is left (lib/copy-reveal): a reader who stops scrolling never sees a half-built form. The footer likewise.
    // Every value below is written on the element that reads it (enquiry-ending.css @property: they do not inherit), so a
    // frame of the zoom or the wipe restyles those elements only, not the hundred inside the ending.
    const orbit = section.querySelector<HTMLElement>(".enquiry-orbit");
    const wall = Array.from(section.querySelectorAll<HTMLElement>(".ending-wall, .ending-film"));
    const shade = section.querySelector<HTMLElement>(".ending-shade");
    const formReveal = createCopyReveal(panel, (amount) => {
      const shown = String(amount > 0 ? 1 : 0);
      formScene.current?.style.setProperty("--form-opacity", shown);
      orbit?.style.setProperty("--form-opacity", shown);
      panel.style.setProperty("--liquid-size", `${Math.hypot(section.clientWidth, section.clientHeight) * 2.7 * amount}px`);
      section.dataset.settled = String(amount >= .999);
      // Each piece of glass makes its own flight, cued in reading order.
      const pieces = deck.current?.querySelectorAll<HTMLElement>(".enquiry-piece") ?? [];
      pieces.forEach((piece, index) => piece.style.setProperty("--in", formPieceProgress(amount, index, pieces.length).toFixed(4)));
      panel.inert = amount < .85;
      formScene.current?.setAttribute("aria-hidden", String(amount === 0));
    });
    const footerReveal = footerScene.current ? createCopyReveal(footerScene.current, (amount) => {
      footerScene.current?.style.setProperty("--footer-opacity", String(amount > 0 ? 1 : 0));
      footerScene.current?.setAttribute("aria-hidden", String(amount === 0));
      // Start the sign's own repeating clock once the entrance finishes, even if scrolling has stopped.
      footerScene.current?.setAttribute("data-sign-lit", String(amount === 1));
    }) : null;
    const canvas = film.current;
    const schedule = invalidateScrollFrame;
    const painter = canvas ? createFramePainter(canvas, { onDraw: schedule }) : null;
    const source = canvas ? bindFilm(endingScene.film, { onFilm: schedule }) : null;
    // Narrow screens glide from the family room's subject to the wall as it zooms (lib/media/phone-camera).
    const narrow = window.matchMedia(NARROW_QUERY);
    // A field in use on a touch screen holds the page and the timeline where they were (field-hold.ts).
    const hold = createFieldHold(panel, product, schedule);
    const update = (bounds: DOMRect = product.getBoundingClientRect()) => {
      const offset = hold.heldOffset() ?? productOffset(bounds);
      const { zoom, form, footer, visible, blend } = endingTimeline(offset);
      source?.need(productFilmNeed(offset, productFilmSpans.ending));
      section.style.visibility = visible ? "visible" : "hidden";
      section.style.setProperty("--ending-blend", String(blend));
      shade?.style.setProperty("--wall-shade", String(zoom * .16));
      wall.forEach((layer) => layer.style.setProperty("--wall-framing", String(zoom)));
      const cameraX = narrow.matches ? pathX(endingCameraPath, zoom) : .5;
      section.style.setProperty("--ending-focal", `${cameraX * 100}%`);
      // Freeze the family room's last frame; only the camera moves into the wall.
      if (visible && painter && source?.film) {
        painter.setFocal(cameraX, 1);
        painter.seek(source, source.film.duration);
        section.dataset.ready = String(painter.visible && !painter.stalled);
      } else section.dataset.ready = "false";
      formReveal.update(form);
      footerReveal?.update(footer);
    };
    const stopFrames = onScrollFrame((scroll) => update(scroll.product ?? undefined));
    window.addEventListener("resize", schedule);
    const stopHold = hold.listen();
    update();
    return () => {
      hold.release();
      stopFrames();
      stopHold();
      window.removeEventListener("resize", schedule);
      painter?.destroy(); source?.destroy(); formReveal.destroy(); footerReveal?.destroy();
    };
  }, [reduced]);

  // The deck leans a few degrees towards the pointer; a CSS transition smooths the follow.
  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    cancelAnimationFrame(tiltFrame.current);
    tiltFrame.current = requestAnimationFrame(() => { deck.current?.style.setProperty("--tilt-x", x.toFixed(3)); deck.current?.style.setProperty("--tilt-y", y.toFixed(3)); });
  };
  const untilt = () => { cancelAnimationFrame(tiltFrame.current); deck.current?.style.removeProperty("--tilt-x"); deck.current?.style.removeProperty("--tilt-y"); };
  useEffect(() => () => cancelAnimationFrame(tiltFrame.current), []);

  return <div ref={root} className={`home-ending${reduced ? " home-ending-static" : ""}`}>
    <div className="footage-window">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="ending-wall" src={reduced ? endingScene.end : endingScene.poster} alt="" loading="lazy" />
    {/* The shared family-room pack supplies its held final frame; CSS moves the camera over it. */}
    {!reduced && <canvas ref={film} className="ending-film" aria-hidden="true" />}
    <div className="ending-shade" aria-hidden="true" />
    </div>
    <section ref={formScene} id="enquiry" className="enquiry-scene" data-scene="17" aria-labelledby="enquiry-heading">
      <div ref={surface} className="enquiry-surface" onPointerMove={tilt} onPointerLeave={untilt}>
        <div className="enquiry-sparks" aria-hidden="true">
          {sparks.map((spark, index) => <i key={index} className="enquiry-spark" style={{ left: spark.left, top: spark.top, "--s": spark.size, "--dx": spark.dx, "--dy": spark.dy, "--d": spark.duration, "--delay": spark.delay } as CSSProperties} />)}
        </div>
        <div className="enquiry-intro"><h2 id="enquiry-heading" className="home-heading">{enquiryCopy.heading.map((line, index) => <span className="line-mask" key={line}><span className="headline-line">{line}{index === enquiryCopy.heading.length - 1 && <em>.</em>}</span></span>)}</h2><p data-copy-detail>{enquiryCopy.intro[0]}<br className="desktop-break" />{enquiryCopy.intro[1]}</p></div>
        <EnquiryForm deckRef={deck} />
      </div>
    </section>
    <EnquiryFooter footerRef={footerScene} />
  </div>;
}
