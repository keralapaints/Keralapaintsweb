import type { ShadeEntry } from "@/data/colour-shades";
import type { ColourFamilySlug, ShadeDepth } from "@/data/colours";

/** Shades in one printed strip on the shade card, lightest to darkest. */
export const SHADES_PER_STRIP = 7;
/** Below this chroma (0–1, the spread between the strongest and weakest channel) a strip reads as white or grey. */
const NEUTRAL_CHROMA = 0.12;
/** Warm hues (degrees) whose strongest shade stays below EARTH_CHROMA read as beige and brown rather than orange. */
const EARTH_HUES = [18, 48] as const;
const EARTH_CHROMA = 0.32;
/** Yellow-green hues (degrees) that stay below OLIVE_CHROMA read as olive, so they sit with the greens. */
const OLIVE_HUES = [50, 60] as const;
const OLIVE_CHROMA = 0.35;
/** Where each colour family ends on the hue wheel (degrees), for strips that are neither neutral nor earthy. */
const HUE_FAMILIES: readonly [end: number, family: ColourFamilySlug][] = [
  [12, "red"], [37, "orange"], [60, "yellow"], [165, "green"], [200, "teal"], [250, "blue"], [300, "purple"], [345, "pink"], [360, "red"],
];
/** Above this relative luminance (0–1) a shade takes dark text; below it, ivory. */
const DARK_INK_LUMINANCE = 0.4;
/** How far apart two lightness values may sit (0–1) for one shade to be offered as the other's partner. */
const PAIR_LIGHTNESS_SPREAD = 0.18;

/** A shade, ready for the page: the card's details plus its family, strip and measured colour. */
export type Shade = {
  code: string;
  name: string;
  hex: string;
  depth: ShadeDepth;
  family: ColourFamilySlug;
  /** Which printed strip it sits in (0 = the first), and its place in the palette. */
  strip: number;
  order: number;
  rgb: readonly [number, number, number];
  hue: number;
  chroma: number;
  lightness: number;
  /** The text colour that reads on it. */
  ink: "dark" | "light";
};

/** The shades that pair well with one shade. */
export type ShadePairs = { contrast?: Shade; harmony?: Shade; trim?: Shade };

/** A filter of the palette, as set on the page. */
export type ShadeFilter = { query?: string; family?: ColourFamilySlug | "all"; depth?: ShadeDepth | "all"; codes?: readonly string[] };

/** "#f4eccf" → [244, 236, 207]. */
export function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Hue (degrees), chroma and lightness (0–1) of a colour. */
export function describeColour([r, g, b]: readonly [number, number, number]) {
  const [red, green, blue] = [r / 255, g / 255, b / 255];
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const chroma = max - min;
  let hue = 0;
  if (chroma > 0) {
    if (max === red) hue = ((green - blue) / chroma) % 6;
    else if (max === green) hue = (blue - red) / chroma + 2;
    else hue = (red - green) / chroma + 4;
    hue = (hue * 60 + 360) % 360;
  }
  return { hue, chroma, lightness: (max + min) / 2 };
}

/** The WCAG relative luminance of a colour (0 = black, 1 = white). */
export function luminance(rgb: readonly [number, number, number]) {
  const [r, g, b] = rgb.map((channel) => { const value = channel / 255; return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The family of a strip, judged by its strongest shade, so its palest shades stay with their own colour. */
export function familyOf(strip: readonly { hue: number; chroma: number }[]): ColourFamilySlug {
  const strongest = strip.reduce((best, shade) => shade.chroma > best.chroma ? shade : best, strip[0]);
  if (!strongest || strongest.chroma < NEUTRAL_CHROMA) return "neutral";
  if (strongest.hue >= EARTH_HUES[0] && strongest.hue < EARTH_HUES[1] && strongest.chroma < EARTH_CHROMA) return "earth";
  if (strongest.hue >= OLIVE_HUES[0] && strongest.hue < OLIVE_HUES[1] && strongest.chroma < OLIVE_CHROMA) return "green";
  return HUE_FAMILIES.find(([end]) => strongest.hue < end)?.[1] ?? "red";
}

/** The whole palette, with each shade's family, strip and text colour worked out. */
export function buildPalette(entries: readonly ShadeEntry[]): Shade[] {
  const measured = entries.map(([code, name, hex], order) => {
    const rgb = hexToRgb(hex);
    return { code, name, hex, rgb, order, strip: Math.floor(order / SHADES_PER_STRIP), depth: code.slice(-1) as ShadeDepth, ...describeColour(rgb), ink: luminance(rgb) > DARK_INK_LUMINANCE ? "dark" as const : "light" as const };
  });
  const families = new Map<number, ColourFamilySlug>();
  for (let start = 0; start < measured.length; start += SHADES_PER_STRIP) families.set(start / SHADES_PER_STRIP, familyOf(measured.slice(start, start + SHADES_PER_STRIP)));
  return measured.map((shade) => ({ ...shade, family: families.get(shade.strip) ?? "neutral" }));
}

/** A shade by its code, in any case ("2001p"). */
export function findShade(palette: readonly Shade[], code: string) {
  const wanted = code.trim().toUpperCase();
  return palette.find((shade) => shade.code === wanted);
}

/** Lower case, without accents or punctuation, so "ole" finds "Ole'". */
const normalise = (text: string) => text.toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

/** Does a shade match a search? Names match anywhere; codes match from their start ("20" finds 2001P). */
export function matchesQuery(shade: Shade, query: string) {
  const wanted = normalise(query);
  if (!wanted) return true;
  return shade.code.toLowerCase().startsWith(wanted.replace(/ /g, "")) || normalise(shade.name).includes(wanted);
}

/** The shades a filter keeps, in the palette's order. */
export function filterShades(palette: readonly Shade[], { query = "", family = "all", depth = "all", codes }: ShadeFilter) {
  return palette.filter((shade) => (family === "all" || shade.family === family)
    && (depth === "all" || shade.depth === depth)
    && (!codes || codes.includes(shade.code))
    && matchesQuery(shade, query));
}

/** The shades grouped by printed strip, in order. */
export function toStrips(shades: readonly Shade[]): Shade[][] {
  const strips = new Map<number, Shade[]>();
  for (const shade of shades) strips.set(shade.strip, [...(strips.get(shade.strip) ?? []), shade]);
  return [...strips.values()];
}

/** One strip per family, in the order given: the family's boldest, for the page's fan deck. */
export function signatureStrips(palette: readonly Shade[], families: readonly ColourFamilySlug[]) {
  const strips = toStrips(palette);
  const boldness = (strip: readonly Shade[]) => Math.max(...strip.map((shade) => shade.chroma));
  return families.flatMap((family) => {
    const own = strips.filter((strip) => strip[0]?.family === family);
    const boldest = own.reduce<Shade[] | undefined>((best, strip) => !best || boldness(strip) > boldness(best) ? strip : best, undefined);
    return boldest ? [boldest] : [];
  });
}

/** The seven shades of a shade's own strip. */
export function stripOf(palette: readonly Shade[], shade: Shade) {
  return palette.filter((other) => other.strip === shade.strip);
}

/** Degrees between two hues, the short way round (0–180). */
export function hueDistance(a: number, b: number) {
  const gap = Math.abs(a - b) % 360;
  return gap > 180 ? 360 - gap : gap;
}

/** The shade closest to a target hue and lightness, from other strips with real colour in them. */
function closest(palette: readonly Shade[], shade: Shade, hue: number, lightness: number) {
  let best: Shade | undefined;
  let bestScore = Infinity;
  for (const other of palette) {
    if (other.strip === shade.strip || other.chroma < NEUTRAL_CHROMA / 2 || Math.abs(other.lightness - lightness) > PAIR_LIGHTNESS_SPREAD) continue;
    const score = hueDistance(other.hue, hue) / 180 + Math.abs(other.lightness - lightness) - other.chroma / 4;
    if (score < bestScore) { best = other; bestScore = score; }
  }
  return best;
}

/**
 * Shades that pair well with a shade: a bold contrast from across the colour wheel, a close harmony from beside it,
 * and a soft near-white for trims and ceilings that leans the same way.
 */
export function pairsFor(palette: readonly Shade[], shade: Shade): ShadePairs {
  const contrast = closest(palette, shade, (shade.hue + 180) % 360, shade.lightness);
  const harmony = closest(palette, shade, (shade.hue + 30) % 360, shade.lightness);
  const trim = palette
    .filter((other) => other.depth === "P" && other.lightness > 0.88 && other.code !== shade.code)
    .reduce<Shade | undefined>((best, other) => !best || hueDistance(other.hue, shade.hue) - other.lightness * 40 < hueDistance(best.hue, shade.hue) - best.lightness * 40 ? other : best, undefined);
  return { contrast, harmony, trim };
}

/** "rgb(244, 236, 207)" as people copy it: "244, 236, 207". */
export const formatRgb = ([r, g, b]: readonly [number, number, number]) => `${r}, ${g}, ${b}`;