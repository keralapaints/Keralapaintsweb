import { useEffect, type RefObject } from "react";
import { productTuning } from "@/lib/product/product-data";
import { deviceHints, memoryAtMost } from "@/lib/device";
import { PHONE_QUERY } from "@/lib/viewport";
import { MENU_EVENT } from "@/lib/events";

/** Carousel autoplay stays off on devices reporting this much memory (GB) or less. */
const AUTOPLAY_LOW_MEMORY_GB = 4;

type RangeConditionSetters = {
  setNearby: (nearby: boolean) => void; setActive: (active: boolean) => void;
  setConstrained: (constrained: boolean) => void; setDataSaver: (dataSaver: boolean) => void; setSuspended: (suspended: boolean) => void;
};

/** Reports the range's surroundings into the caller's state: approaching (nearby), on screen (active), a constrained
 * or data-saving device, and suspended (tab hidden or the menu open). */
export function useRangeConditions(section: RefObject<HTMLElement | null>, stage: RefObject<HTMLDivElement | null>,
  { setNearby, setActive, setConstrained, setDataSaver, setSuspended }: RangeConditionSetters) {
  useEffect(() => {
    const element = section.current;
    const view = stage.current;
    if (!element || !view) return;
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearby(true); preload.disconnect(); }
    }, { rootMargin: productTuning.preloadMargin });
    const visibility = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: .12 });
    preload.observe(element);
    visibility.observe(view);
    const media = window.matchMedia(PHONE_QUERY);
    const assess = () => {
      const { saveData, memory } = deviceHints();
      setConstrained(media.matches || saveData || memoryAtMost(memory, AUTOPLAY_LOW_MEMORY_GB));
      setDataSaver(saveData);
    };
    assess();
    media.addEventListener("change", assess);
    const suspend = () => setSuspended(document.hidden || document.documentElement.classList.contains("menu-open"));
    document.addEventListener("visibilitychange", suspend);
    window.addEventListener(MENU_EVENT, suspend);
    suspend();
    return () => {
      preload.disconnect(); visibility.disconnect(); media.removeEventListener("change", assess);
      document.removeEventListener("visibilitychange", suspend); window.removeEventListener(MENU_EVENT, suspend);
    };
  }, [section, stage, setNearby, setActive, setConstrained, setDataSaver, setSuspended]);
}
