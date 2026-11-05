/** Development overlay for the hero handoff, shown with `?heroDebug=1`; null otherwise. */
export function createStoryDebug(container: HTMLElement) {
  if (!(process.env.NODE_ENV === "development" && new URLSearchParams(location.search).get("heroDebug") === "1")) return null;
  const panel = document.createElement("pre");
  panel.className = "hero-debug";
  panel.setAttribute("aria-hidden", "true");
  container.append(panel);
  let shownAt = 0;
  return {
    /** Writes the readout at most every 100 ms; `read` is only called when it is due. */
    report(now: number, read: () => object) {
      if (now - shownAt < 100) return;
      shownAt = now;
      panel.textContent = JSON.stringify(read(), null, 2);
    },
    destroy() { panel.remove(); },
  };
}
