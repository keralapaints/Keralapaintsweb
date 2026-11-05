import { transitions } from "@/lib/story/scene-data";
import { clamp } from "@/lib/math";
import { motion } from "@/lib/story/story-timeline";
import { createHeroLoop } from "@/lib/story/hero-loop";
import { createHeroState } from "@/lib/story/hero-state";
import { filmForScreen } from "@/lib/media/film-cache";
import { segments } from "./story-layout";

export type HeroFrame = ReturnType<ReturnType<typeof createHeroState>["step"]>;

/**
 * The opening scene: its idle-loop video at the top of the page, and the handoff into the scroll-scrubbed opening
 * film (a shade, a warm window bloom and a brief softness) as the reader starts scrolling.
 */
export function createHeroHandoff(container: HTMLElement, video: HTMLVideoElement | null, heroPanel: HTMLElement) {
  // The baked loop has matching endpoints and uses one native decoder.
  const heroSource = filmForScreen("/films/hero-idle.mp4");
  const heroLoop = video ? createHeroLoop(video, heroSource) : null;

  // The idle loop is cut from the opening film itself, so the exit syncs the scroll transition to the
  // exact film time the loop was showing: the bridge crosses identical frames and the shot continues.
  let syncTime = transitions[0].start;
  const machine = createHeroState(segments[0].travel, () => {
    const time = heroLoop?.currentTime ?? transitions[0].start;
    // Snap to the frame actually on screen (the one whose timestamp is at or before the clock).
    syncTime = clamp(Math.floor(time * 24 + 1e-6) / 24, transitions[0].start, transitions[0].end);
    return (syncTime - transitions[0].start) / (transitions[0].end - transitions[0].start) * segments[0].travel;
  });
  const ambientStage = container.querySelector<HTMLElement>(".hero-loop-stage")!;
  let loopMode = "";
  const heroPoster = heroPanel.querySelector("img")!;
  const originalShade = heroPanel.querySelector<HTMLElement>(".scene-shade")!;
  const heroShade = originalShade.cloneNode(false) as HTMLElement;
  heroShade.classList.add("hero-handoff-shade");
  container.querySelector(".video-stage")!.append(heroShade);
  // Warm daylight bloom from the window: the bedroom's version of the reference's bridge flash.
  const heroLight = document.createElement("div");
  heroLight.className = "hero-light";
  container.querySelector(".video-stage")!.append(heroLight);
  let lightOpacity = "";
  let softness = "";
  originalShade.style.visibility = "hidden";

  return {
    loop: heroLoop,
    get syncTime() { return syncTime; },
    get phase() { return machine.phase; },
    get lightOpacity() { return lightOpacity; },
    get softness() { return softness; },
    /** The poster and the loop can show the opening frame (hero debug overlay). */
    get ready() { return heroPoster.complete && heroPoster.naturalWidth > 0 && (heroLoop?.ready ?? true); },
    step: (position: number, suspended: boolean) => machine.step(position, suspended),
    /** Every jump clears the hero offset, so decoding restarts from the opening film's first frame. */
    navigate(position: number) {
      syncTime = transitions[0].start;
      machine.navigate(position);
    },
    /** Pauses the idle loop until the paint loop wants it playing again. */
    freeze() { heroLoop?.freeze(); loopMode = "freeze"; },
    paint(hero: HeroFrame, suspended: boolean, index: number, inTransition: boolean, progress: number) {
      const wantedLoopMode = suspended || hero.phase !== "hero" ? "freeze" : "play";
      if (wantedLoopMode !== loopMode) {
        if (wantedLoopMode === "play") heroLoop?.setActive(true);
        else if (wantedLoopMode === "freeze") heroLoop?.freeze();
        loopMode = wantedLoopMode;
      }
      ambientStage.style.opacity = String(heroLoop?.ready ? hero.ambientOpacity : 0);
      heroShade.style.opacity = index === 0 ? String(inTransition ? Math.min(1, (1 - progress) / 0.06) : 1) : "0";
      container.dataset.heroState = hero.phase;
      // Bloom and softness belong only to the scroll handoff.
      const bridge = hero.phase === "exiting" ? 4 * hero.settle * (1 - hero.settle) : 0;
      const light = (motion.heroLightPeak * bridge).toFixed(3);
      if (light !== lightOpacity) { lightOpacity = light; heroLight.style.opacity = light; }
      const soft = bridge > 0.02 ? `blur(${(motion.heroSoftnessPx * bridge).toFixed(2)}px)` : "none";
      if (soft !== softness) { softness = soft; ambientStage.style.filter = soft; heroPoster.style.filter = soft; }
    },
    destroy() {
      heroLoop?.destroy();
      machine.destroy();
      heroShade.remove(); heroLight.remove();
      ambientStage.style.removeProperty("filter"); heroPoster.style.removeProperty("filter");
      originalShade.style.removeProperty("visibility");
      ambientStage.style.removeProperty("opacity");
      delete container.dataset.heroState;
    },
  };
}
