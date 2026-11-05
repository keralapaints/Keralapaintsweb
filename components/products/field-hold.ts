import { productOffset } from "@/lib/product/product-scroll";

export type FieldHold = {
  /** The range offset frozen when a field took focus, while it is held. */
  heldOffset: () => number | undefined;
  release: () => void;
  /** Adds the hold's listeners; the returned function removes them in the same order. */
  listen: () => () => void;
};

/**
 * Filling the form on a touch screen: focusing a field makes the browser scroll the page towards it. The stage is
 * pinned, so that scroll only moves the timeline (the form fading into the footer and dropping the keyboard), and
 * iOS aims it at where the field would sit unpinned, far back in earlier sections. While a field is in use the
 * page stays where it was and the timeline holds; the panel itself scrolls the field above the keyboard.
 */
export function createFieldHold(panel: HTMLElement, product: HTMLElement, schedule: () => void): FieldHold {
  let held: { offset: number; scroll: number; base: number; keyboard: boolean; timer: number } | null = null;
  let anchor: number | null = null;
  const touch = window.matchMedia("(pointer: coarse)");
  const isField = (element: EventTarget | null): element is HTMLElement => element instanceof HTMLElement && panel.contains(element) && element.matches("input, textarea, select");
  const showField = () => {
    const field = document.activeElement;
    const view = window.visualViewport;
    if (!held || !view || !isField(field)) return;
    const box = field.getBoundingClientRect();
    panel.scrollBy({ top: box.top + box.height / 2 - (view.offsetTop + view.height / 2) });
  };
  const release = () => {
    if (!held) return;
    window.clearTimeout(held.timer);
    const { scroll } = held;
    held = null;
    delete panel.dataset.typing;
    panel.style.removeProperty("--keyboard");
    // The panel only scrolled to clear the keyboard; it goes back to the top with it.
    panel.scrollTo({ top: 0, behavior: "smooth" });
    if (Math.abs(window.scrollY - scroll) > 1) window.scrollTo(0, scroll);
    schedule();
  };
  const onKeyboard = () => {
    const view = window.visualViewport;
    if (!held || !view) return;
    // Room for whatever the keyboard covers of the layout (nothing where the keyboard shrinks the layout itself).
    panel.style.setProperty("--keyboard", `${Math.max(0, window.innerHeight - view.height)}px`);
    if (held.base - view.height > 120) { held.keyboard = true; requestAnimationFrame(showField); }
    // Android's back button hides the keyboard but leaves the field focused.
    else if (held.keyboard) release();
  };
  const onScroll = () => { if (held && Math.abs(window.scrollY - held.scroll) > 1) window.scrollTo(0, held.scroll); };
  // Where the page was when the finger came down, before the browser's focus scroll.
  const onPointerDown = () => { anchor = window.scrollY; };
  const onFocusIn = (event: FocusEvent) => {
    if (!touch.matches || !isField(event.target)) return;
    if (held) { requestAnimationFrame(showField); return; }
    const scroll = anchor ?? window.scrollY;
    anchor = null;
    if (Math.abs(window.scrollY - scroll) > 1) window.scrollTo(0, scroll);
    // No keyboard or picker within a second (a hardware keyboard): nothing to hold for.
    held = {
      offset: productOffset(product.getBoundingClientRect()), scroll, base: window.visualViewport?.height ?? window.innerHeight, keyboard: false,
      timer: window.setTimeout(() => { if (held && !held.keyboard) release(); }, 1000),
    };
    panel.dataset.typing = "";
    onKeyboard();
  };
  // iOS moves between fields without naming the next one, so look once focus has landed.
  const onFocusOut = () => { window.setTimeout(() => { if (!isField(document.activeElement)) release(); }, 60); };
  const listen = () => {
    panel.addEventListener("pointerdown", onPointerDown, { passive: true });
    panel.addEventListener("focusin", onFocusIn);
    window.addEventListener("scroll", onScroll, { passive: true });
    panel.addEventListener("focusout", onFocusOut);
    window.visualViewport?.addEventListener("resize", onKeyboard);
    return () => {
      panel.removeEventListener("pointerdown", onPointerDown);
      panel.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("scroll", onScroll);
      panel.removeEventListener("focusout", onFocusOut);
      window.visualViewport?.removeEventListener("resize", onKeyboard);
    };
  };
  return { heldOffset: () => held?.offset, release, listen };
}
