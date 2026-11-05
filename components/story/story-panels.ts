import gsap from "gsap";
import { scenes } from "@/lib/story/scene-data";
import { copyTiming, createTimedReveal } from "@/lib/copy-reveal";

const DETAILS = [".scene-body", ".question-eyebrow", ".scene-question", ".scene-actions"].join(", ");

export type StoryPanels = ReturnType<typeof createStoryPanels>;

/** The story's scenes in cinematic mode: their fallback artwork and their copy reveals. */
export function createStoryPanels(container: HTMLElement) {
  const panels = gsap.utils.toArray<HTMLElement>(".story-scene", container);
  const visuals = panels.map((panel) => panel.querySelector<HTMLElement>(".scene-visual")!);
  const contents = panels.map((panel) => panel.querySelector<HTMLElement>(".scene-content")!);
  const lines = panels.map((panel) => Array.from(panel.querySelectorAll<HTMLElement>(".headline-line")));
  const details = panels.map((panel) => Array.from(panel.querySelectorAll<HTMLElement>(DETAILS)));
  const links = panels.map((panel) => Array.from(panel.querySelectorAll<HTMLAnchorElement>("a")));

  // Every scene has a reveal amount (0..1) taken from the timeline, but the copy does not follow it line by
  // line: once a scene is reached its whole copy plays in, and plays out when it is left (lib/copy-reveal),
  // so a reader who stops mid-transition never sees half-revealed text.
  const copyShades = panels.map((panel) => panel.querySelector<HTMLElement>(".scene-copy-shade"));
  const reveals = panels.map((_, i) => createTimedReveal(lines[i], details[i], (amount) => {
    contents[i].style.opacity = amount > 0 ? "1" : "0";
    // The shade sits above the shared film and fades with this scene's copy only.
    copyShades[i]?.style.setProperty("opacity", String(amount * (scenes[i].copyShade ?? 0)));
  }));
  const textAmount = panels.map(() => -1);

  links.flat().forEach((link) => { link.tabIndex = -1; });

  return {
    panels, visuals, contents,
    /** Plays scene `i`'s copy in or out; only shown copy takes focus and pointer input. */
    revealText(i: number, amount: number) {
      if (textAmount[i] === amount) return;
      const wasShown = textAmount[i] >= copyTiming.threshold;
      textAmount[i] = amount;
      const shown = amount >= copyTiming.threshold;
      if (shown !== wasShown || contents[i].inert !== !shown) {
        contents[i].style.pointerEvents = shown ? "auto" : "none";
        contents[i].inert = !shown;
        links[i].forEach((link) => { link.tabIndex = shown ? 0 : -1; });
      }
      reveals[i].update(amount);
    },
    /** Decodes the poster after scene `index` before it is needed. */
    decodeNextPoster(index: number) {
      const nextImage = panels[Math.min(index + 1, panels.length - 1)].querySelector("img");
      if (nextImage) {
        nextImage.loading = "eager";
        void nextImage.decode().catch(() => undefined);
      }
    },
    /** The fallback posters under the film canvas, and which scene is active. `all` repaints every scene. */
    paintArtwork({ all, index, inTransition, nextBackground, activeScene, cameraX }:
      { all: boolean; index: number; inTransition: boolean; nextBackground: number; activeScene: number; cameraX: number }) {
      const incoming = index + 1;
      const indices = all ? panels.map((_, i) => i) : [index, incoming].filter((i) => i < panels.length);
      indices.forEach((i) => {
        visuals[i].style.opacity = String(i === index ? 1 : i === incoming && inTransition ? nextBackground : 0);
        // A fallback must use the canvas's framing; extra poster zoom jumps
        // when a decoded frame replaces it and breaks the reading hold.
        visuals[i].style.transform = "none";
        const fallbackImage = visuals[i].querySelector("img");
        if (fallbackImage) fallbackImage.style.objectPosition = `${cameraX * 100}% 50%`;
        panels[i].dataset.active = String(i === activeScene);
      });
    },
    destroy() {
      reveals.forEach((reveal) => reveal.destroy());
      copyShades.forEach((shade) => shade?.style.removeProperty("opacity"));
      contents.forEach((element) => { element.inert = false; });
      visuals.forEach((visual) => visual.querySelector("img")?.style.removeProperty("object-position"));
      [...contents, ...visuals, ...lines.flat(), ...details.flat()].forEach((element) => element.removeAttribute("style"));
      links.flat().forEach((link) => link.removeAttribute("tabindex"));
      panels.forEach((panel) => { delete panel.dataset.active; });
    },
  };
}
