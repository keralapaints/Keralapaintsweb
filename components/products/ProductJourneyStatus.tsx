"use client";

import { useEffect, useRef } from "react";
import { clamp } from "@/lib/math";
import { journeyCaptions } from "@/data/products";
import { pad } from "@/lib/media/media";
import { JOURNEY_CHAPTERS, scenes } from "@/lib/story/scene-data";
import { homeScenes } from "@/lib/product/product-data";
import { footerStart, homeScenePhases, productOffset, productScrollRange, splashStart, wallZoomStart } from "@/lib/product/product-scroll";
import { onScrollFrame } from "@/lib/scroll-frame";

/** The story footer continues above every layer of the pinned product journey. */
export function ProductJourneyStatus() {
  const root = useRef<HTMLElement>(null);
  const number = useRef<HTMLSpanElement>(null);
  const title = useRef<HTMLSpanElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const status = root.current;
    const section = status?.closest<HTMLElement>(".product-world");
    if (!status || !section) return;
    let frame = 0;
    let previous = "";
    const update = (bounds: DOMRect = section.getBoundingClientRect()) => {
      frame = 0;
      const offset = productOffset(bounds);
      // The rail announces the products as soon as the window starts to open (the story's rail yields to it).
      status.hidden = offset < .06 || offset > productScrollRange + 1;
      if (status.hidden) return;
      let scene = 12;
      let label: string = journeyCaptions.range;
      if (offset >= splashStart) { scene = 13; label = journeyCaptions.splash; }
      homeScenePhases.forEach((phase, index) => {
        if (offset >= phase.start) { scene = homeScenes[index].number; label = homeScenes[index].title.join(" "); }
      });
      if (offset >= wallZoomStart) { scene = 17; label = journeyCaptions.enquiry; }
      if (offset >= footerStart) { scene = JOURNEY_CHAPTERS; label = journeyCaptions.footer; }
      if (label !== previous) {
        previous = label;
        if (number.current) number.current.textContent = pad(scene);
        if (title.current) title.current.textContent = label;
        if (cue.current) cue.current.textContent = scene === JOURNEY_CHAPTERS ? journeyCaptions.end : journeyCaptions.scroll;
      }
      const fraction = clamp(offset / productScrollRange);
      progress.current?.style.setProperty("transform", `scaleX(${(scenes.length + (JOURNEY_CHAPTERS - scenes.length) * fraction) / JOURNEY_CHAPTERS})`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => update()); };
    const sizing = new ResizeObserver(schedule);
    sizing.observe(section);
    const stopFrames = onScrollFrame((scroll) => update(scroll.product ?? undefined));
    update();
    return () => { cancelAnimationFrame(frame); sizing.disconnect(); stopFrames(); };
  }, []);

  return <aside ref={root} className="story-status pr-journey-status" aria-label="Product journey progress" hidden>
    <div className="story-caption"><span ref={number}>12</span><span className="caption-rule" /><span ref={title}>{journeyCaptions.range}</span></div>
    <span ref={cue} className="scroll-invitation">{journeyCaptions.scroll}</span>
    <span className="story-total">/ {JOURNEY_CHAPTERS}</span>
    <span className="progress-track"><span ref={progress} /></span>
  </aside>;
}
