import type { CSSProperties } from "react";
import { colourFamilies, colourPaletteCopy as copy } from "@/data/colours";
import { signatureStrips, toStrips, type Shade } from "@/lib/colour-palette";
import "./colour-palette.css";

/** Degrees between neighbouring strips of the fan deck. */
const FAN_STEP = 8;

type ColourPaletteHeroProps = { palette: readonly Shade[] };

/** The Colour Palette page's opening: the heading and figures beside a shade-card fan that opens as the page loads. */
export function ColourPaletteHero({ palette }: ColourPaletteHeroProps) {
  const fan = signatureStrips(palette, colourFamilies.map((family) => family.slug));
  const stats = [
    { value: palette.length.toLocaleString("en-IN"), label: copy.stats.shades },
    { value: String(colourFamilies.length), label: copy.stats.families },
    { value: String(toStrips(palette).length), label: copy.stats.strips },
  ];
  return <section className="cp-hero" aria-labelledby="cp-title">
    <div className="cp-hero-copy">
      <nav className="pt-crumbs" aria-label="Breadcrumb">
        <ol>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
          <li><a href="/">{copy.home}</a></li>
          <li aria-current="page">{copy.crumb}</li>
        </ol>
      </nav>
      <p className="pt-label">{copy.eyebrow}</p>
      <h1 id="cp-title" className="pt-title">
        <span className="pt-title-name">{copy.heading}</span>
        <span className="pt-title-tagline">{copy.tagline}</span>
      </h1>
      <p className="pt-intro">{copy.intro}</p>
      <dl className="cp-stats">
        {stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
      </dl>
      <div className="pt-actions"><a className="pt-button pt-button--primary" href="#palette">{copy.explore}<span aria-hidden="true">&nbsp;↓</span></a></div>
    </div>
    <div className="cp-fan" aria-hidden="true">
      {fan.map((strip, index) => <div key={strip[0].code} className="cp-fan-strip" style={{ "--cp-angle": `${(index - (fan.length - 1) / 2) * FAN_STEP}deg`, "--cp-i": index } as CSSProperties}>
        {strip.map((shade) => <span key={shade.code} style={{ background: shade.hex }} />)}
        <b>{strip[3]?.name}</b>
      </div>)}
    </div>
  </section>;
}