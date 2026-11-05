import { JOURNEY_CHAPTERS, scenes } from "@/lib/story/scene-data";
import { showChapter, showProgress, type StatusRefs } from "./story-status";
import type { StoryRestore } from "./cinematic-story";

/** Reduced motion: the scenes stand as ordinary sections; the footer follows the one in view. Returns its cleanup. */
export function startReducedStory(container: HTMLElement, status: StatusRefs, restore: StoryRestore) {
  const panels = Array.from(container.querySelectorAll<HTMLElement>(".story-scene"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const panel = entry.target as HTMLElement;
      panel.dataset.inView = String(entry.isIntersecting);
      if (!entry.isIntersecting) return;
      const index = Number(panel.dataset.scene) - 1;
      showChapter(status, index + 1, scenes[index].title);
      showProgress(status, (index + 1) / JOURNEY_CHAPTERS);
      container.dataset.currentScene = String(index + 1);
    });
  }, { threshold: 0.5 });
  panels.forEach((panel) => observer.observe(panel));

  // Switching from the cinematic mode keeps the reader at the same scene (or the Product Range).
  const restoreFrame = requestAnimationFrame(() => {
    if (!restore.changed) return;
    if (restore.product) {
      document.getElementById("product-range")?.scrollIntoView({ behavior: "instant" });
      return;
    }
    panels[restore.index]?.scrollIntoView({ behavior: "instant" });
  });

  return () => {
    cancelAnimationFrame(restoreFrame);
    observer.disconnect();
    panels.forEach((panel) => { delete panel.dataset.inView; });
  };
}
