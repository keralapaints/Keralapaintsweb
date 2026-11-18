"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { colourPaletteCopy, shadeDepths } from "@/data/colours";
import { formatRgb, pairsFor, stripOf, type Shade, type ShadePairs } from "@/lib/colour-palette";
import { fill } from "@/lib/product/product-price";

const copy = colourPaletteCopy.detail;

type ShadeDetailProps = {
  shade: Shade | undefined;
  palette: readonly Shade[];
  saved: boolean;
  enquireHref: string;
  outletHref: string;
  onSelect: (code: string) => void;
  onToggleSave: (code: string) => void;
  onCopy: (text: string, label: string) => void;
  onClose: () => void;
  /** A short message (a code was copied), shown inside the panel because the page behind it is covered. */
  toast: string;
};

/** A living room drawn in the chosen shade, with its contrast colour on the sofa. Colours fade as shades change. */
function RoomPreview({ wall, accent, label }: { wall: string; accent: string; label: string }) {
  return <svg className="cp-room" viewBox="0 0 400 250" role="img" aria-label={label}>
    <rect className="cp-room-wall" x="0" y="0" width="400" height="190" style={{ fill: wall }} />
    <rect x="0" y="0" width="400" height="190" fill="url(#cp-room-light)" />
    <rect x="252" y="34" width="92" height="104" rx="3" fill="#f7f3e8" opacity=".9" />
    <path d="M298 34v104M252 86h92" stroke="#d9d2c2" strokeWidth="3" />
    <rect x="0" y="186" width="400" height="64" fill="#7a5a3f" />
    <path d="M0 186h400" stroke="#5c4330" strokeWidth="3" />
    <ellipse cx="150" cy="226" rx="122" ry="10" fill="#000" opacity=".18" />
    <path className="cp-room-sofa" d="M52 156c0-16 10-26 26-26h144c16 0 26 10 26 26v24H52z" style={{ fill: accent }} />
    <path className="cp-room-sofa" d="M38 168c0-10 7-16 16-16s16 6 16 16v42H38zM230 168c0-10 7-16 16-16s16 6 16 16v42h-32z" style={{ fill: accent }} />
    <rect x="58" y="176" width="186" height="34" rx="6" fill="#000" opacity=".12" />
    <path d="M60 210v14M240 210v14" stroke="#3b2c20" strokeWidth="5" strokeLinecap="round" />
    <rect x="102" y="58" width="96" height="58" rx="2" fill="#f7f3e8" opacity=".95" />
    <rect x="108" y="64" width="84" height="46" fill="#d7a553" opacity=".55" />
    <path d="M330 204c-6-30 10-58 28-70-4 22 2 46-8 70z" fill="#4c7a52" />
    <path d="M348 206c4-26-6-48-22-58 0 20-6 40 2 58z" fill="#3e6845" />
    <rect x="322" y="200" width="36" height="28" rx="4" fill="#d9cdb6" />
    <defs>
      <linearGradient id="cp-room-light" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".18" />
        <stop offset=".6" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity=".16" />
      </linearGradient>
    </defs>
  </svg>;
}

/** A small swatch that opens another shade. */
function ShadeChip({ shade, label, current, onSelect }: { shade: Shade; label?: string; current?: boolean; onSelect: (code: string) => void }) {
  return <button type="button" className="cp-chip" data-ink={shade.ink} aria-current={current || undefined} style={{ "--cp-shade": shade.hex } as CSSProperties} onClick={() => onSelect(shade.code)}>
    <span className="cp-chip-swatch" />
    <span className="cp-chip-text">{label && <small>{label}</small>}<strong>{shade.name}</strong><span>{shade.code}</span></span>
  </button>;
}

/**
 * The open shade, in a side panel (a sheet on phones): a room painted in it, its codes to copy, its strip from the
 * shade card and the shades that pair with it, each of which opens in turn.
 */
export function ShadeDetail({ shade, palette, saved, enquireHref, outletHref, onSelect, onToggleSave, onCopy, onClose, toast }: ShadeDetailProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const open = Boolean(shade);

  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    if (open && !modal.open) modal.showModal();
    else if (!open && modal.open) modal.close();
  }, [open]);

  const pairs: ShadePairs = shade ? pairsFor(palette, shade) : {};
  const strip = shade ? stripOf(palette, shade) : [];
  const accent = pairs.contrast ?? pairs.harmony;
  const depth = shadeDepths.find((entry) => entry.code === shade?.depth)?.label;
  const codes = shade ? [{ label: copy.code, value: shade.code }, { label: copy.hex, value: shade.hex.toUpperCase() }, { label: copy.rgb, value: formatRgb(shade.rgb) }] : [];

  return <dialog ref={dialog} className="cp-drawer" aria-labelledby="cp-drawer-title" data-lenis-prevent onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    {shade && <div className="cp-drawer-inner" key={shade.code}>
      <div className="cp-drawer-hero" data-ink={shade.ink} style={{ "--cp-shade": shade.hex } as CSSProperties}>
        <button type="button" className="cp-drawer-close" aria-label={copy.close} onClick={onClose}><span /><span /></button>
        <RoomPreview wall={shade.hex} accent={accent?.hex ?? "#3d4a4f"} label={fill(copy.preview, { name: shade.name, accent: accent?.name ?? "" })} />
      </div>
      <div className="cp-drawer-body">
        <p className="cp-drawer-meta">{shade.code}{depth && <> · {copy.depth}: {depth}</>}</p>
        <h2 id="cp-drawer-title" className="cp-drawer-title">{shade.name}</h2>
        <button type="button" className="pt-button cp-save" aria-pressed={saved} onClick={() => onToggleSave(shade.code)}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13.5S2 10 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 7.5-6 7.5z" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
          {saved ? copy.saved : copy.save}
        </button>
        <dl className="cp-codes">
          {codes.map((entry) => <div key={entry.label}>
            <dt>{entry.label}</dt>
            <dd><button type="button" onClick={() => onCopy(entry.value, entry.label)} aria-label={fill(copy.copy, { label: `${entry.label} ${entry.value}` })}>{entry.value}<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="4.5" y="4.5" width="7.5" height="7.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M9.5 2.5V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5.5a1 1 0 0 0 1 1h.5" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg></button></dd>
          </div>)}
        </dl>
        <section className="cp-drawer-section" aria-labelledby="cp-strip-title">
          <h3 id="cp-strip-title" className="cp-drawer-h3">{copy.strip}</h3>
          <p className="cp-drawer-hint">{copy.stripHint}</p>
          <div className="cp-mini-strip">
            {strip.map((entry) => <button key={entry.code} type="button" data-ink={entry.ink} aria-current={entry.code === shade.code || undefined} style={{ background: entry.hex }} onClick={() => onSelect(entry.code)} aria-label={`${entry.name} ${entry.code}`}><span>{entry.code}</span></button>)}
          </div>
        </section>
        <section className="cp-drawer-section" aria-labelledby="cp-pairs-title">
          <h3 id="cp-pairs-title" className="cp-drawer-h3">{copy.pairs}</h3>
          <div className="cp-pairs">
            {(["contrast", "harmony", "trim"] as const).map((key) => { const pair = pairs[key]; return pair ? <ShadeChip key={key} shade={pair} label={copy.pairLabels[key]} onSelect={onSelect} /> : null; })}
          </div>
        </section>
        <div className="pt-actions cp-drawer-actions">
          <a className="pt-button pt-button--primary" href={enquireHref}>{copy.enquire}</a>
          <a className="pt-text-link" href={outletHref}>{copy.outlet}<span aria-hidden="true">&nbsp;→</span></a>
        </div>
        <p className="cp-note">{colourPaletteCopy.note}</p>
      </div>
    </div>}
    <p className="cp-toast" role="status" data-show={Boolean(toast) || undefined}>{toast}</p>
  </dialog>;
}