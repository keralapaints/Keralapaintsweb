/**
 * Words of the Colour Palette page (/colours), its colour families and the shade depths. The shades themselves are in
 * data/colour-shades.ts.
 */

/** The address of the Colour Palette page. */
export const COLOURS_PATH = "/colours";

/** A colour family: a filter on the page, and the group its shade strips sit in. */
export type ColourFamily = { slug: ColourFamilySlug; label: string };

/** A colour family's name in code and in the page address (#family-blue). */
export type ColourFamilySlug = "yellow" | "orange" | "red" | "pink" | "purple" | "blue" | "teal" | "green" | "earth" | "neutral";

/** The colour families, in the order the page shows them. */
export const colourFamilies: readonly ColourFamily[] = [
  { slug: "yellow", label: "Yellows" },
  { slug: "orange", label: "Oranges & Peaches" },
  { slug: "red", label: "Reds & Corals" },
  { slug: "pink", label: "Pinks" },
  { slug: "purple", label: "Purples & Lilacs" },
  { slug: "blue", label: "Blues" },
  { slug: "teal", label: "Teals & Aquas" },
  { slug: "green", label: "Greens" },
  { slug: "earth", label: "Earthy Beiges & Browns" },
  { slug: "neutral", label: "Whites & Greys" },
];

/** The letter ending each shade code. */
export type ShadeDepth = "P" | "T" | "D" | "C";

/** What each code letter means on the page, lightest first. Rename freely: only these words are shown. */
export const shadeDepths: readonly { code: ShadeDepth; label: string }[] = [
  { code: "P", label: "Light" },
  { code: "T", label: "Mid-tone" },
  { code: "D", label: "Deep" },
  { code: "C", label: "Rich" },
];

/** Every word on the Colour Palette page. {n}, {name} and {code} are filled in by the page. */
export const colourPaletteCopy = {
  seoTitle: "Colour Palette | 1,000+ Paint Shades | Kerala Paints",
  seoDescription: "Explore the Kerala Paints colour palette: over a thousand interior and exterior paint shades by colour family, with shade codes, matching colours and a shortlist to take to your nearest outlet.",
  home: "Home",
  crumb: "Colour Palette",
  eyebrow: "Colour palette",
  heading: "Find Your Colour",
  tagline: "Every shade on the Kerala Paints card, ready to explore.",
  intro: "Browse by colour family, search by name or shade code, and open any shade to see it on a wall with colours that pair well with it. Save the ones you love to your shortlist and bring the codes to your nearest Kerala Paints outlet.",
  stats: { shades: "Shades", families: "Colour families", strips: "Shade strips" },
  explore: "Explore the palette",
  toolbarLabel: "Filter the palette",
  searchLabel: "Search shades",
  searchPlaceholder: "Search a name or code, e.g. Sunny Lemon or 2001P",
  clearSearch: "Clear search",
  familyLabel: "Colour family",
  allFamilies: "All colours",
  depthLabel: "Depth",
  allDepths: "All",
  savedOnly: "Shortlist",
  count: "{n} shades",
  one: "1 shade",
  familyCount: "{n} shades · {strips} strips",
  empty: "No shades match your search. Try another name or code, or clear the filters.",
  emptySaved: "Your shortlist is empty. Open any shade and tap “Add to shortlist”.",
  clearFilters: "Clear filters",
  savedMark: "In your shortlist",
  detail: {
    close: "Close",
    depth: "Depth",
    code: "Shade code",
    hex: "HEX",
    rgb: "RGB",
    copy: "Copy {label}",
    copied: "{label} copied",
    save: "Add to shortlist",
    saved: "In your shortlist",
    preview: "{name} on a living-room wall, with {accent} on the sofa",
    strip: "Its shade strip",
    stripHint: "Lightest to darkest, as on the shade card.",
    pairs: "Pairs well with",
    pairLabels: { contrast: "Bold contrast", harmony: "Close harmony", trim: "Soft trim & ceiling" },
    enquire: "Ask about this shade",
    outlet: "Find an outlet",
  },
  tray: {
    label: "Your shortlist",
    share: "Share",
    shared: "Shortlist link copied",
    clear: "Clear",
    enquire: "Enquire",
  },
  note: "Colours on screen vary with your display and lighting. See the printed shade card or a tester at your nearest Kerala Paints outlet before you buy.",
  cta: {
    heading: "Not sure which shade suits your home?",
    body: "Our colour experts can help you choose shades for each room, check them in your light and plan the right paint system.",
    consult: "Free Paint Consultation",
    outlet: "Find an Outlet",
  },
} as const;