"use client";

import { useEffect, useRef, useState } from "react";
import { homeScenes } from "@/lib/product/product-data";
import { homeSceneTimeline, productOffset } from "@/lib/product/product-scroll";
import { bindFilm } from "@/lib/media/film-cache";
import { productFilmNeed, productFilmSpans } from "@/lib/media/media-window";
import { createFramePainter } from "@/lib/media/frame-painter";
import { createCopyReveal } from "@/lib/copy-reveal";
import { HomeFeatures } from "./SceneDetails";
import "./home-scenes.css";
import { invalidateScrollFrame, onScrollFrame } from "@/lib/scroll-frame";
import { NARROW_QUERY } from "@/lib/viewport";
import { phoneCameraX } from "@/lib/media/phone-camera";

type Props = { reduced: boolean };

function HomeScene({ reduced, index }: Props & { index: number }) {
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const film = useRef<HTMLCanvasElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const data = homeScenes[index];

  useEffect(() => {
    const scene = root.current;
    const section = scene?.closest<HTMLElement>(".product-world");
    if (!scene || !section || reduced) return;
    const canvas = film.current;
    const schedule = invalidateScrollFrame;
    const painter = canvas ? createFramePainter(canvas, { onDraw: schedule }) : null;
    const source = canvas ? bindFilm(data.film, { onFilm: schedule }) : null;
    // Narrow screens follow the subject across the landscape frame (lib/media/phone-camera).
    const narrow = window.matchMedia(NARROW_QUERY);
    let visible = false;
    // The room stays switched on while its copy plays out over the next room's film (homeSceneTimeline copy); its own
    // picture is covered by then, and its copy sits above every room's picture (home-scenes.css).
    const show = (amount: number) => {
      const on = visible || amount > 0;
      scene.style.visibility = on ? "visible" : "hidden";
      scene.setAttribute("aria-hidden", String(!on));
      if (content.current) content.current.inert = amount < .85;
    };
    // The copy, its benefits row and the grade behind it follow the played reveal, not the scroll (lib/copy-reveal).
    // --home-copy and --home-blend do not inherit (home-scenes.css @property): they are written on the elements that read them.
    const copyTargets = Array.from(scene.querySelectorAll<HTMLElement>(".home-grade, .home-benefits"));
    const picture = scene.querySelector<HTMLElement>(".footage-window");
    const copyReveal = content.current ? createCopyReveal(content.current, (amount) => {
      copyTargets.forEach((target) => target.style.setProperty("--home-copy", String(amount)));
      show(amount);
    }) : null;
    const update = (bounds: DOMRect = section.getBoundingClientRect()) => {
      const offset = productOffset(bounds);
      const { progress, blend, copy, visible: shown } = homeSceneTimeline(offset, index);
      visible = shown;
      source?.need(productFilmNeed(offset, productFilmSpans[data.id]));
      picture?.style.setProperty("--home-blend", String(blend));
      const cameraX = narrow.matches ? phoneCameraX(`${13 + index}-to-${14 + index}`, progress) : .5;
      scene.style.setProperty("--home-focal", `${cameraX * 100}%`);
      copyReveal?.update(copy);
      show(copyReveal?.amount ?? 0);
      // Use one camera position while frames load, never a double-exposed room.
      scene.style.setProperty("--home-still", String(Number(progress >= .5)));
      if (visible && painter && source?.film) {
        painter.setFocal(cameraX, 1);
        painter.seek(source, progress * source.film.duration);
        scene.dataset.ready = String(painter.visible && !painter.stalled);
      } else scene.dataset.ready = "false";
    };
    const sizing = new ResizeObserver(schedule);
    sizing.observe(scene);
    const stopFrames = onScrollFrame((scroll) => update(scroll.product ?? undefined));
    window.addEventListener("resize", schedule);
    update();
    return () => {
      sizing.disconnect();
      stopFrames();
      window.removeEventListener("resize", schedule);
      painter?.destroy();
      source?.destroy();
      copyReveal?.destroy();
      scene.style.removeProperty("--home-focal");
    };
  }, [reduced, index, data]);

  return <section ref={root} className={`home-scene home-scene-${data.id}${reduced ? " home-scene-static" : ""}`} data-scene={data.number} aria-labelledby={`home-${data.id}-heading`}>
    <div className="footage-window">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="home-poster" src={reduced ? data.end : data.poster} alt={data.alt} loading="lazy" />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {!reduced && <img className="home-poster home-poster-end" src={data.end} alt="" loading="lazy" decoding="async" />}
    {/* Its frames come from the film cache as the room approaches (lib/media/media-window) and are drawn here. */}
    {!reduced && <canvas ref={film} className="home-film" aria-hidden="true" />}
    <div className="home-grade" />
    </div>
    <div ref={content} className="home-copy">
      <h2 id={`home-${data.id}-heading`} className="home-heading">{data.title.map((line, lineIndex) => <span className="line-mask" key={line}><span className="headline-line">{line}{(lineIndex === 1 || data.id === "family") && <em>.</em>}</span></span>)}</h2>
      <p className="home-description" data-copy-detail>{data.description}</p>
      {data.id !== "living" && <div className="home-benefits" data-expanded={benefitsOpen}>
        <button className="home-benefits-toggle" type="button" aria-expanded={benefitsOpen}
          aria-controls={`home-${data.id}-benefits`} onClick={() => setBenefitsOpen(!benefitsOpen)}>
          Why this finish <span aria-hidden="true">{benefitsOpen ? "−" : "+"}</span>
        </button>
        <div id={`home-${data.id}-benefits`} className="home-benefits-content"><HomeFeatures detailed={data.id === "colour"} /></div>
      </div>}
      {data.signoff && <p className="home-signoff" data-copy-detail>{data.signoff}</p>}
      {data.cta && <a className="home-cta" data-copy-detail href="#enquiry">{data.cta}<span aria-hidden="true">⟶</span></a>}
    </div>
  </section>;
}

export function HomeScenes(props: Props) {
  return <>{homeScenes.map((scene, index) => <HomeScene key={scene.id} {...props} index={index} />)}</>;
}
