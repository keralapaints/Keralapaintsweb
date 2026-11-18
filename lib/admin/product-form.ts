import type { ProductIcon } from "@/data/product-details";
import type { StepTone } from "@/lib/product/product-steps";

/**
 * The product form's data: what the admin edits, as plain strings, numbers and lists. Shared by the form (browser)
 * and its save action (server), so it imports nothing from the server.
 */
export type ProductInput = {
  name: string;
  slug: string;
  /** Its category in data/categories.ts: the middle of the page address. */
  categorySlug: string;
  fullName: string;
  /** The second line of the H1 (the template's `tagline`). */
  headline: string;
  brandInTitle: boolean;
  /** The gold line under the H1 (the template's `subhead`). */
  subhead: string;
  /** The hero's intro paragraph (the template's `intro`). */
  lede: string;
  category: string;
  /** The short category title ("Interior Emulsion"), and the line on cards and the hero when there is no lede. */
  title: string;
  description: string;
  backdrop: string;
  bucket: string;
  packScale: string;
  packY: string;
  index: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  /** One keyword or phrase per line. */
  keywords: string;
  inspirationLabel: string;
  inspirationBody: string;
  /** Paragraphs, separated by an empty line. */
  overview: string;
  highlights: { icon: ProductIcon; title: string; text: string }[];
  specs: { label: string; value: string }[];
  /** One surface per line. */
  surfaces: string;
  surfacesNote: string;
  /** Lines of text starting with "- " become notes under the step; `tone` marks it on the page ("" for none). */
  steps: { title: string; text: string; tone: StepTone | "" }[];
  faqs: { question: string; answer: string }[];
  ctaHeading1: string;
  ctaHeading2: string;
  ctaBody: string;
  ctaLinkLabel: string;
  ctaLinkHref: string;
  ctaButton: string;
  /** The longer sections after "How to apply", as JSON (see data/product-details ProductSection). */
  sectionsJson: string;
  /** The template's extra content (badges, price card, painting systems…), as JSON (see data/product-template.ts). */
  templateJson: string;
};

export type ProductField = keyof ProductInput;

export const ICONS: readonly ProductIcon[] = ["shield", "sparkle", "drop", "leaf", "sun", "layers", "home", "brush", "palette", "air", "mix", "badge", "thermo"];

/** The hero's template fields, edited in their own form fields rather than in `templateJson`. */
export const HERO_KEYS = ["tagline", "subhead", "intro"] as const;

/** The template fields kept in `templateJson` (data/product-template.ts ProductTemplate). */
export const TEMPLATE_KEYS = [
  "tagline", "subhead", "intro", "badges", "glance", "imageAlt", "ogTitle", "schemaDescription", "sku", "featuresLead",
  "usageIntro", "specsFootnote", "specNotes", "applyLead", "applyNotes", "systems", "care", "price", "relatedLead",
  "related", "relatedLinks", "headings",
] as const;

/** The nature films a product page can use (public/films/product-bg and public/stills/product-bg). */
export const BACKDROPS = [
  { value: "pearl-shell", label: "Pearl shell" },
  { value: "peacock", label: "Peacock" },
  { value: "forest-roots", label: "Forest roots" },
  { value: "forest-dew", label: "Forest dew (colocasia leaf)" },
  { value: "banyan", label: "Banyan tree" },
  { value: "ladybug", label: "Ladybug" },
  { value: "enamel", label: "Butterfly" },
  { value: "2k-coating", label: "Cactus" },
] as const;

/** The packshots already prepared in public/images/products/hd (each with -480 and -768 sizes). */
export const PACKSHOTS = [
  { value: "", label: "No packshot (backdrop only)" },
  { value: "/images/products/hd/bhadram-in-v3.webp", label: "Bhadram IN" },
  { value: "/images/products/hd/bhadram-ex-v3.webp", label: "Bhadram EX" },
  { value: "/images/products/hd/gold-in-v3.webp", label: "Gold IN" },
  { value: "/images/products/hd/gold-ex-v3.webp", label: "Gold EX" },
  { value: "/images/products/hd/silver-in-v3.webp", label: "Silver IN" },
  { value: "/images/products/hd/silver-ex-v3.webp", label: "Silver EX" },
  { value: "/images/products/hd/all-in-one-v3.webp", label: "All-In-One" },
  { value: "/images/products/hd/smart-shine-v3.webp", label: "Smart Shine" },
  { value: "/images/products/hd/prime-platinum-v3.webp", label: "Prime Platinum" },
  { value: "/images/products/hd/prime-gold-v3.webp", label: "Prime Gold" },
  { value: "/images/products/hd/prime-silver-v3.webp", label: "Prime Silver" },
  { value: "/images/products/hd/cool-coat-v3.webp", label: "Cool Coat" },
  { value: "/images/products/hd/aqua-seal.webp", label: "Aqua Seal 2K" },
  { value: "/images/products/hd/tile-coat-v2.webp", label: "Tile & Floor Coat" },
  { value: "/images/products/hd/enamel.webp", label: "Enamels" },
] as const;

/** A page address from a name: "Prime Silver Primer" → "prime-silver-primer". */
export const slugify = (value: string) =>
  value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

export const emptyProduct = (): ProductInput => ({
  name: "", slug: "", categorySlug: "", fullName: "", headline: "", brandInTitle: true, subhead: "", lede: "", category: "", title: "", description: "",
  backdrop: "pearl-shell", bucket: "", packScale: "", packY: "", index: "", published: false,
  seoTitle: "", seoDescription: "", keywords: "", inspirationLabel: "", inspirationBody: "", overview: "",
  highlights: [{ icon: "shield", title: "", text: "" }], specs: [{ label: "", value: "" }], surfaces: "", surfacesNote: "",
  steps: [{ title: "", text: "", tone: "" }], faqs: [{ question: "", answer: "" }],
  ctaHeading1: "", ctaHeading2: "", ctaBody: "", ctaLinkLabel: "", ctaLinkHref: "", ctaButton: "", sectionsJson: "[]", templateJson: "{}",
});