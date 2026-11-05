"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scenes } from "@/lib/story/scene-data";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { StoryScene } from "./StoryScene";
import { StoryStatus } from "./StoryStatus";
import { startCinematicStory, type StoryRestore } from "./cinematic-story";
import { startReducedStory } from "./reduced-story";

/**
 * The ten-scene story. With full motion the stage is pinned and scrolling scrubs the films between scenes
 * (cinematic-story); with reduced motion the scenes are ordinary sections (reduced-story).
 */
export function StoryExperience() {
  const motionPreference = useMotionPreference();
  const previousPreference = useRef(motionPreference);
  const root = useRef<HTMLElement>(null);
  const currentNumber = useRef<HTMLSpanElement>(null);
  const currentTitle = useRef<HTMLSpanElement>(null);
  const progressLine = useRef<HTMLSpanElement>(null);
  /** The hero's idle-loop video; it is never drawn on the scroll-scrubbed film canvas. */
  const heroVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const status = { number: currentNumber, title: currentTitle, progress: progressLine };

    const restore: StoryRestore = {
      changed: previousPreference.current !== motionPreference,
      product: document.getElementById("product-range")?.dataset.active === "true",
      index: Math.max(0, Number(container.dataset.currentScene ?? 1) - 1),
    };
    previousPreference.current = motionPreference;

    document.documentElement.dataset.motion = motionPreference === "full" ? "full" : "reduced";
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    let disposed = false;

    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (motionPreference !== "full") return;
      return startCinematicStory(container, status, heroVideo.current, restore, () => disposed);
    });
    media.add(motionPreference === "full" ? "(prefers-reduced-motion: reduce)" : "all", () =>
      startReducedStory(container, status, restore));

    return () => {
      disposed = true;
      media.revert();
    };
  }, [motionPreference]);

  return <main ref={root} className="story-root" aria-label="Beyond beautiful walls — the Kerala Paints story">
    <div className="story-stage">
      {scenes.map((scene) => <StoryScene key={scene.id} scene={scene} />)}
      <div className="video-stage" aria-hidden="true">
        {/* The hero idle loop, separate from the scroll-scrubbed film canvas. */}
        <div className="hero-loop-stage">
          <video ref={heroVideo} className="hero-loop-video" muted playsInline preload="none" disablePictureInPicture tabIndex={-1} />
        </div>
        {/* The scroll-scrubbed films, drawn frame by frame (lib/media/frame-painter). */}
        <canvas className="story-canvas" />
      </div>
    </div>
    <StoryStatus numberRef={currentNumber} titleRef={currentTitle} progressRef={progressLine} />
  </main>;
}
