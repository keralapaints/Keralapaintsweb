import config from "./hero-loop-config.json";
import { clamp } from "../math";

const HERO_LOOP_START = config.sourceStart;
export const HERO_LOOP_END = config.sourceEnd;
export const HERO_LOOP_DURATION = config.frameCount / config.fps;

/** The source timestamp represented by the eased, forward-and-back idle film. */
export function heroSourceTime(time: number) {
  const phase = ((time % HERO_LOOP_DURATION) + HERO_LOOP_DURATION) % HERO_LOOP_DURATION;
  return HERO_LOOP_START + (HERO_LOOP_END - HERO_LOOP_START) * (1 - Math.cos(2 * Math.PI * phase / HERO_LOOP_DURATION)) / 2;
}

/** Park on the forward half of the loop at a given source timestamp. */
export function heroPlaybackTime(sourceTime: number) {
  const progress = clamp((sourceTime - HERO_LOOP_START) / (HERO_LOOP_END - HERO_LOOP_START));
  return Math.acos(1 - 2 * progress) * HERO_LOOP_DURATION / (2 * Math.PI);
}

export type HeroLoopController = {
  load(): void;
  setActive(active: boolean): void;
  freeze(): void;
  reset(time?: number): void;
  /** Original opening-film time, so scrolling continues from the visible source frame. */
  readonly currentTime: number;
  pause(): void;
  readonly ready: boolean;
  readonly playing: boolean;
  destroy(): void;
};

/** One continuously playing decoder; the media itself has a seamless join. */
export function createHeroLoop(video: HTMLVideoElement, src: string): HeroLoopController {
  let enabled = false, destroyed = false, loaded = false;
  let pending = false, failed = false, pendingSeek = true;
  let generation = 0, startAt = HERO_LOOP_START;
  const ready = () => video.readyState >= 2 && !video.seeking && !video.error;
  const play = () => {
    if (!enabled || destroyed || failed || pending || !ready() || !video.paused) return;
    const token = generation;
    pending = true;
    void video.play().then(() => {
      if (destroyed || !enabled || token !== generation) video.pause();
    }).catch((error: unknown) => {
      if (token === generation && !(error instanceof Error && error.name === "AbortError")) failed = true;
    }).finally(() => {
      pending = false;
      if (enabled && !failed && video.paused) play();
    });
  };
  const onReady = () => {
    if (destroyed) return;
    if (pendingSeek && video.readyState >= 1) {
      pendingSeek = false;
      const time = heroPlaybackTime(startAt);
      if (Math.abs(video.currentTime - time) > .015) video.currentTime = time;
    }
    play();
  };
  const pause = () => { enabled = false; generation++; video.pause(); };
  const reset = (time = startAt) => {
    pause();
    startAt = clamp(time, HERO_LOOP_START, HERO_LOOP_END);
    video.style.opacity = "0";
    pendingSeek = true;
    onReady();
  };
  const load = () => {
    if (loaded || destroyed) return;
    loaded = true;
    video.src = src;
    video.load();
  };
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.preload = "auto";
  const events = ["loadedmetadata", "loadeddata", "canplay", "seeked"];
  events.forEach((event) => video.addEventListener(event, onReady));
  reset();
  return {
    load, reset,
    setActive(value) {
      if (destroyed || enabled === value) return;
      if (!value) { pause(); return; }
      enabled = true;
      failed = false;
      video.style.opacity = "1";
      load();
      onReady();
    },
    freeze: pause,
    pause,
    get currentTime() { return heroSourceTime(Math.floor(video.currentTime * config.fps + 1e-6) / config.fps); },
    get ready() { return ready(); },
    get playing() { return !video.paused; },
    destroy() {
      destroyed = true;
      pause();
      events.forEach((event) => video.removeEventListener(event, onReady));
      video.removeAttribute("src");
      video.load();
      video.removeAttribute("style");
    },
  };
}
