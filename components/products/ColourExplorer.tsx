"use client";

import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { colourShades } from "@/data/colour-shades";
import { colourFamilies, colourPaletteCopy as copy, shadeDepths, type ColourFamilySlug, type ShadeDepth } from "@/data/colours";
import { buildPalette, filterShades, findShade, signatureStrips, toStrips, type Shade } from "@/lib/colour-palette";
import { fill } from "@/lib/product/product-price";
import { ShadeDetail } from "./ShadeDetail";

/** Where the shortlist is kept in this browser. */
const SHORTLIST_KEY = "kerala-paints-shortlist";
/** The address part that opens a shade ("#shade-2001P") and the query that shares a shortlist ("?shortlist=…"). */
const SHADE_HASH = "#shade-";
const SHORTLIST_PARAM = "shortlist";
/** How long the "copied" message stays (ms). */
const TOAST_MS = 2200;
/** How far before the end of the palette (px) the docked bar slides away, so it never covers the closing section. */
const DOCK_RELEASE = 240;

const PALETTE = buildPalette(colourShades);
const FAMILY_SWATCH = new Map(signatureStrips(PALETTE, colourFamilies.map((family) => family.slug)).map((strip) => [strip[0].family, strip[4]?.hex ?? strip[0].hex]));

type ColourExplorerProps = { enquireHref: string; outletHref: string };

/** A shade card band: tall colour, its name and code revealed on hover or focus. */
function Band({ shade, saved, onOpen }: { shade: Shade; saved: boolean; onOpen: (code: string) => void }) {
  return <button type="button" className="cp-band" data-ink={shade.ink} data-saved={saved || undefined} style={{ "--cp-shade": shade.hex } as CSSProperties} onClick={() => onOpen(shade.code)}>
    <span className="cp-band-name">{shade.name}</span><span className="cp-band-code">{shade.code}</span>
  </button>;
}

/** A single shade as a tile, for search results and the shortlist. */
function Tile({ shade, saved, onOpen }: { shade: Shade; saved: boolean; onOpen: (code: string) => void }) {
  return <li><button type="button" className="cp-tile" data-saved={saved || undefined} style={{ "--cp-shade": shade.hex } as CSSProperties} onClick={() => onOpen(shade.code)}>
    <span className="cp-tile-swatch" />
    <span className="cp-tile-text"><strong>{shade.name}</strong><span>{shade.code}</span></span>
  </button></li>;
}

/**
 * The palette explorer: search, colour-family and depth filters, the shade card's strips grouped by family (or a grid
 * of single shades while searching), a detail panel for the open shade and a shortlist kept in the browser.
 */
export function ColourExplorer({ enquireHref, outletHref }: ColourExplorerProps) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<ColourFamilySlug | "all">("all");
  const [depth, setDepth] = useState<ShadeDepth | "all">("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [docked, setDocked] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const section = useRef<HTMLElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const deferredQuery = useDeferredValue(query);

  // Once the full toolbar scrolls away, a slim bar docks under the header; it leaves again near the palette's end.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bar = toolbar.current?.getBoundingClientRect();
      const area = section.current?.getBoundingClientRect();
      // The bar is fixed to the top of the screen, so its height is where it ends, shown or not.
      const dockBottom = dock.current?.offsetHeight ?? 0;
      setDocked(Boolean(bar && area && bar.bottom < dockBottom && area.bottom > dockBottom + DOCK_RELEASE));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); if (frame) cancelAnimationFrame(frame); };
  }, []);

  // A new filter from the docked bar starts its results just under the bar, so the bar stays put while typing.
  useLayoutEffect(() => {
    if (!docked || !toolbar.current || !dock.current) return;
    const gap = toolbar.current.getBoundingClientRect().bottom - dock.current.offsetHeight;
    if (gap > -1) window.scrollBy({ top: gap + 1, behavior: "instant" });
    // Only a change of filter should move the page, not the bar docking itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery, family, depth, savedOnly]);

  // The shortlist comes from a shared link first, then from this browser; an open shade from the address.
  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get(SHORTLIST_PARAM);
    let stored: string[] = [];
    try { stored = JSON.parse(localStorage.getItem(SHORTLIST_KEY) ?? "[]") as string[]; } catch { /* Storage can be unavailable. */ }
    const codes = (shared ? shared.split(",") : stored).map((code) => findShade(PALETTE, code)?.code).filter((code): code is string => Boolean(code));
    const fromHash = window.location.hash.startsWith(SHADE_HASH) ? findShade(PALETTE, window.location.hash.slice(SHADE_HASH.length))?.code : undefined;
    // Reading the address and storage can only happen after hydration, so this one-off sync is deliberate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved([...new Set(codes)]);
    if (shared && codes.length) setSavedOnly(true);
    if (fromHash) setOpenCode(fromHash);
  }, []);

  useEffect(() => { try { localStorage.setItem(SHORTLIST_KEY, JSON.stringify(saved)); } catch { /* Storage can be unavailable. */ } }, [saved]);
  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  const say = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), TOAST_MS);
  }, []);

  const open = useCallback((code: string) => {
    setOpenCode(code);
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}${SHADE_HASH}${code}`);
  }, []);
  const close = useCallback(() => {
    setOpenCode(null);
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);
  const toggleSave = useCallback((code: string) => setSaved((list) => list.includes(code) ? list.filter((entry) => entry !== code) : [...list, code]), []);
  const copyText = useCallback((text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(() => say(fill(copy.detail.copied, { label })), () => undefined);
  }, [say]);
  const share = () => {
    const url = `${window.location.origin}${window.location.pathname}?${SHORTLIST_PARAM}=${saved.join(",")}`;
    navigator.clipboard?.writeText(url).then(() => say(copy.tray.shared), () => undefined);
  };

  const flat = Boolean(deferredQuery.trim()) || depth !== "all" || savedOnly;
  const results = useMemo(() => filterShades(PALETTE, { query: deferredQuery, family, depth, codes: savedOnly ? saved : undefined }), [deferredQuery, family, depth, savedOnly, saved]);
  const groups = useMemo(() => colourFamilies
    .filter((entry) => family === "all" || entry.slug === family)
    .map((entry) => ({ ...entry, strips: toStrips(PALETTE.filter((shade) => shade.family === entry.slug)) }))
    .filter((entry) => entry.strips.length > 0), [family]);
  const savedSet = useMemo(() => new Set(saved), [saved]);
  const shortlist = useMemo(() => saved.map((code) => findShade(PALETTE, code)).filter((shade): shade is Shade => Boolean(shade)), [saved]);
  const filtered = flat || family !== "all";
  const reset = () => { setQuery(""); setFamily("all"); setDepth("all"); setSavedOnly(false); };
  const count = flat ? results.length : groups.reduce((total, group) => total + group.strips.length * group.strips[0].length, 0);

  const search: ReactNode = <label className="cp-search">
    <span className="pt-sr-only">{copy.searchLabel}</span>
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m12.2 12.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    <input type="search" value={query} placeholder={copy.searchPlaceholder} autoComplete="off" spellCheck={false} onChange={(event) => setQuery(event.target.value)} />
    {query && <button type="button" className="cp-search-clear" aria-label={copy.clearSearch} onClick={() => setQuery("")}>×</button>}
  </label>;
  const families: ReactNode = <div className="cp-families" role="group" aria-label={copy.familyLabel}>
    <button type="button" className="cp-family-chip" aria-pressed={family === "all"} onClick={() => setFamily("all")}><span className="cp-family-dot cp-family-dot--all" />{copy.allFamilies}</button>
    {colourFamilies.map((entry) => <button key={entry.slug} type="button" className="cp-family-chip" aria-pressed={family === entry.slug} onClick={() => setFamily(family === entry.slug ? "all" : entry.slug)}>
      <span className="cp-family-dot" style={{ background: FAMILY_SWATCH.get(entry.slug) }} />{entry.label}
    </button>)}
  </div>;
  const savedToggle: ReactNode = <button type="button" className="cp-saved-toggle" aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13.5S2 10 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 7.5-6 7.5z" fill={savedOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
    {copy.savedOnly}<span className="cp-saved-count">{saved.length}</span>
  </button>;

  return <section ref={section} id="palette" className="pt-section cp-explorer" aria-label={copy.explore}>
    <div ref={dock} className="cp-dock" data-show={docked || undefined} inert={!docked} role="search" aria-label={copy.toolbarLabel}>
      <div className="cp-dock-inner">{search}{families}{savedToggle}</div>
    </div>
    <div ref={toolbar} className="cp-toolbar" role="search" aria-label={copy.toolbarLabel}>
      {search}
      {families}
      <div className="cp-toolbar-row">
        <div className="cp-depths" role="group" aria-label={copy.depthLabel}>
          <span className="cp-depths-label" aria-hidden="true">{copy.depthLabel}</span>
          <button type="button" aria-pressed={depth === "all"} onClick={() => setDepth("all")}>{copy.allDepths}</button>
          {shadeDepths.map((entry) => <button key={entry.code} type="button" aria-pressed={depth === entry.code} onClick={() => setDepth(depth === entry.code ? "all" : entry.code)}>{entry.label}</button>)}
        </div>
        {savedToggle}
        <p className="cp-count" aria-live="polite">{count === 1 ? copy.one : fill(copy.count, { n: count.toLocaleString("en-IN") })}</p>
        {filtered && <button type="button" className="pt-text-link cp-reset" onClick={reset}>{copy.clearFilters}</button>}
      </div>
    </div>

    {flat ? (results.length ? <ul className="cp-tiles">{results.map((shade) => <Tile key={shade.code} shade={shade} saved={savedSet.has(shade.code)} onOpen={open} />)}</ul>
      : <div className="cp-empty"><p>{savedOnly && !saved.length ? copy.emptySaved : copy.empty}</p><button type="button" className="pt-button" onClick={reset}>{copy.clearFilters}</button></div>)
      : groups.map((group) => <section key={group.slug} id={`family-${group.slug}`} className="cp-family" aria-labelledby={`cp-family-${group.slug}`}>
        <header className="cp-family-head">
          <h2 id={`cp-family-${group.slug}`} className="pt-h3"><span className="cp-family-dot" style={{ background: FAMILY_SWATCH.get(group.slug) }} />{group.label}</h2>
          <p>{fill(copy.familyCount, { n: group.strips.length * group.strips[0].length, strips: group.strips.length })}</p>
        </header>
        <ul className="cp-strips">
          {group.strips.map((strip) => <li key={strip[0].code} className="cp-strip">
            {strip.map((shade) => <Band key={shade.code} shade={shade} saved={savedSet.has(shade.code)} onOpen={open} />)}
          </li>)}
        </ul>
      </section>)}

    {shortlist.length > 0 && <aside className="cp-tray" aria-label={copy.tray.label}>
      <p className="cp-tray-label">{copy.tray.label}<span>{shortlist.length}</span></p>
      <ul className="cp-tray-shades">
        {shortlist.map((shade) => <li key={shade.code}><button type="button" style={{ background: shade.hex }} aria-label={`${shade.name} ${shade.code}`} title={`${shade.name} · ${shade.code}`} onClick={() => open(shade.code)} /></li>)}
      </ul>
      <div className="cp-tray-actions">
        <button type="button" className="cp-tray-button" onClick={share}>{copy.tray.share}</button>
        <button type="button" className="cp-tray-button" onClick={() => { setSaved([]); setSavedOnly(false); }}>{copy.tray.clear}</button>
        <a className="pt-button pt-button--primary cp-tray-enquire" href={enquireHref}>{copy.tray.enquire}</a>
      </div>
    </aside>}

    <ShadeDetail shade={openCode ? findShade(PALETTE, openCode) : undefined} palette={PALETTE} saved={openCode ? savedSet.has(openCode) : false} enquireHref={enquireHref} outletHref={outletHref} onSelect={open} onToggleSave={toggleSave} onCopy={copyText} onClose={close} toast={openCode ? toast : ""} />
    <p className="cp-toast" role="status" data-show={Boolean(toast && !openCode) || undefined}>{openCode ? "" : toast}</p>
  </section>;
}