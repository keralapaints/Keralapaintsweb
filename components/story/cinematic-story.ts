import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JOURNEY_CHAPTERS, scenes } from "@/lib/story/scene-data";
import { clamp } from "@/lib/math";
import { motion, sampleTimeline, textReveal } from "@/lib/story/story-timeline";
import { heroTiming } from "@/lib/story/hero-state";
import { scrollScale } from "@/lib/scroll-scale";
import { measureScrollFrame } from "@/lib/scroll-frame";
import { segments, total } from "./story-layout";
import { createStoryPanels } from "./story-panels";
import { createStoryFilms } from "./story-films";
import { createHeroHandoff } from "./hero-handoff";
import { createStoryDebug } from "./story-debug";
import { createSmoothScroll, listenToPage, savedScroll } from "./smooth-scroll";
import { createStoryNavigation } from "./story-navigation";
import { showChapter, showProgress, type StatusRefs } from "./story-status";

/** Where to land when the motion preference changes mid-page: the scene shown, or the Product Range. */
export type StoryRestore = { changed: boolean; product: boolean; index: number };

/**
 * The cinematic story: the stage is pinned while the scroll scrubs the films between scenes and plays each scene's
 * copy. One paint per frame, driven from the GSAP ticker. Returns its cleanup.
 */
export function startCinematicStory(container: HTMLElement, status: StatusRefs, heroVideo: HTMLVideoElement | null,
  restore: StoryRestore, isDisposed: () => boolean) {
  const stage = container.querySelector<HTMLElement>(".story-stage")!;
  let stageHeight = 1;
  // Scroll distance of one timeline unit: a stage height, or a share of it on phones (lib/scroll-scale).
  const unitHeight = () => stageHeight * scrollScale();
  container.dataset.cinematic = "true";

  const story = createStoryPanels(container);
  const films = createStoryFilms(container);
  const hero = createHeroHandoff(container, heroVideo, story.panels[0]);
  const debug = createStoryDebug(container);

  const state = { position: 0 };
  let lastActive = -1;
  let lastSegment = -1;
  let lastPaintPosition = -1;
  let active = true;

  const scroller = createSmoothScroll();
  const { lenis, held } = scroller;

  const setHeight = () => {
    stageHeight = Math.max(1, stage.getBoundingClientRect().height);
    // Two extra stage heights hold the last scene behind the overlapping product splash (its -200lvh margin).
    container.style.height = `${total * unitHeight() + 2 * stageHeight}px`;
  };
  setHeight();

  const loadNearby = (index: number) => {
    films.prepareAround(index);
    story.decodeNextPoster(index);
  };

  const paint = () => {
    if (!active) return;

    const now = performance.now();
    const suspended = document.hidden || held();
    if (state.position <= heroTiming.topThreshold) {
      // The idle loop's film is fetched only for a reader at the top (the curtain waits for it there); a page
      // restored or navigated elsewhere never downloads it until the reader comes back up.
      if (!suspended) hero.loop?.load();
      // Only prewarm at the top; moving scroll owns every subsequent seek.
      films.prewarm();
    }
    const openingDecoded = debug ? films.atOpeningFrame(hero.syncTime) && hero.ready : false;
    const heroFrame = hero.step(state.position, suspended);
    const renderPosition = heroFrame.position;
    const sample = sampleTimeline(segments, renderPosition);
    const { index, inTransition, progress } = sample;
    const cameraX = films.focus(index, inTransition ? progress : 0);
    hero.paint(heroFrame, suspended, index, inTransition, progress);

    const activeScene = inTransition && progress >= motion.textHandoff ? index + 1 : index;
    const segmentChanged = lastSegment !== index;

    // The hero uses physical scroll, so an idle-loop offset cannot dismiss its copy early.
    const textProgress = index === 0 ? clamp(state.position / segments[0].travel) : progress;
    story.panels.forEach((_, i) => story.revealText(i, textReveal(i, index, inTransition, textProgress)));

    if (segmentChanged) {
      loadNearby(index);
      lastSegment = index;
    }

    // Scene artwork and progress only need updating when the timeline position changes.
    if (renderPosition !== lastPaintPosition) {
      story.paintArtwork({ all: segmentChanged, index, inTransition, nextBackground: sample.nextBackground, activeScene, cameraX });
      showProgress(status, Math.min(1, renderPosition / total) * (scenes.length / JOURNEY_CHAPTERS));
      container.dataset.currentScene = String(activeScene + 1);
      lastPaintPosition = renderPosition;
    }

    films.show(index, inTransition, progress, heroFrame.ambientOpacity);

    debug?.report(now, () => ({
      heroPhase: heroFrame.phase, direction: heroFrame.direction,
      ambientActive: hero.loop?.playing ?? false, ambientOpacity: +heroFrame.ambientOpacity.toFixed(3),
      canonicalPosterOpacity: Number(story.visuals[0].style.opacity), transitionOpacity: Number(films.canvas.style.opacity),
      transitionTime: +films.painter.frameTime.toFixed(4), decoded: openingDecoded,
      settle: +heroFrame.settle.toFixed(3),
      heroTextOpacity: Number(gsap.getProperty(story.contents[0], "opacity")),
      lightOpacity: Number(hero.lightOpacity), softness: hero.softness,
      syncTime: +hero.syncTime.toFixed(3), offset: +heroFrame.offset.toFixed(4), loopTime: +(hero.loop?.currentTime ?? 0).toFixed(3),
    }));

    if (lastActive !== activeScene) {
      showChapter(status, scenes[activeScene].number, scenes[activeScene].title);
      lastActive = activeScene;
    }
  };

  const tween = gsap.to(state, {
    position: total,
    ease: "none",
    scrollTrigger: { trigger: container, start: "top top", end: () => `+=${total * unitHeight()}`, scrub: motion.scrub, invalidateOnRefresh: true },
  });

  // Advance scroll, sample its latest position, then paint in the same frame.
  // Native touch positions are sampled here too, keeping scene updates on one clock.
  // Every read of the page's layout happens here, before paint writes to it (lib/scroll-frame).
  const tick = (time: number) => {
    lenis.raf(time * 1000);
    ScrollTrigger.update();
    measureScrollFrame();
    paint();
  };
  // Prioritised: Product Range scenes update after it in the same frame (lib/scroll-frame).
  gsap.ticker.add(tick, false, true);

  paint();

  const navigation = createStoryNavigation({ container, lenis, unitHeight, navigateHero: hero.navigate });
  // A reload (or a return to the tab) comes back to where the reader was, with the hero state machine and the
  // carousel stop already past that point, exactly as scene navigation leaves them.
  const restoreScroll = () => {
    const y = savedScroll();
    if (y === null) return;
    const position = (y - (container.getBoundingClientRect().top + window.scrollY)) / unitHeight();
    hero.navigate(clamp(position, 0, total));
    lenis.scrollTo(y, { immediate: true, force: true });
  };
  const stopListening = listenToPage(scroller, hero.freeze);

  const onRefresh = () => {
    setHeight();
    lenis.resize();
  };
  ScrollTrigger.addEventListener("refreshInit", onRefresh);
  const refresh = () => {
    if (active && !isDisposed()) ScrollTrigger.refresh();
  };
  document.fonts.ready.then(refresh);
  const firstImage = story.panels[0].querySelector("img");
  firstImage?.addEventListener("load", refresh);

  const initialFrame = requestAnimationFrame(() => {
    refresh();
    if (restore.changed) navigation.goToHash(restore.product ? "#product-range" : `#${scenes[restore.index].id}`, true);
    else if (location.hash) navigation.goToHash(location.hash, true);
    else restoreScroll();
    if (hero.phase === "hero") hero.loop?.load();
    // The next frame has painted the restored position and marked its film.
    requestAnimationFrame(films.startPrefetch);
  });

  return () => {
    active = false;
    hero.destroy();
    debug?.destroy();
    cancelAnimationFrame(initialFrame);
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.ticker.remove(tick);
    scroller.destroy();
    navigation.destroy();
    stopListening();
    ScrollTrigger.removeEventListener("refreshInit", onRefresh);
    firstImage?.removeEventListener("load", refresh);
    films.destroy();
    story.destroy();
    container.removeAttribute("data-cinematic");
    container.removeAttribute("style");
  };
}
