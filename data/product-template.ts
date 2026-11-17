import type { ProductDetail } from "./product-details";

/**
 * The product page template (from "Bhadram EX – Developer Doc"): every product page has the same eight sections in
 * this order: Hero, Key features, Specifications, How to apply, Price, FAQ, Reviews, Related products.
 *
 * A product's template content is added in `productTemplates` below, keyed by its id in data/products. Each field is
 * optional: a missing field falls back to the product's existing content in data/product-details.ts, and a section with
 * nothing to show (such as Price, before prices are confirmed) is left out. Fields of ProductDetail given here (such as
 * `seoTitle` or `faqs`) replace the ones in data/product-details.ts.
 *
 * In any text, [label](/path) makes a link, e.g. "subject to [warranty terms](https://warrantyportal.keralapaints.com/)".
 */
export type ProductTemplate = {
  /** The second line of the H1 ("High-Performance Exterior Wall Emulsion Paint"); defaults to `headline`. */
  tagline?: string;
  /** The line under the H1. */
  subhead?: string;
  /** The hero's intro paragraph; defaults to `lede`, then the short description. */
  intro?: string;
  /** Up to four short trust badges under the intro. */
  badges?: readonly string[];
  /** "Product at a glance": a few label/value pairs under the badges. */
  glance?: readonly { label: string; value: string }[];
  /** Alt text for the hero packshot. */
  imageAlt?: string;
  /** og:title, when it should differ from the SEO title. */
  ogTitle?: string;
  /** The longer description in Google's product data; defaults to the meta description. */
  schemaDescription?: string;
  /** The product's item code (for Google's product data), and its pack size. */
  sku?: string;

  /** Key features: a lead paragraph above the feature list (the list is `highlights`). */
  featuresLead?: string;
  /** "Where can … be used?": a paragraph above the list of areas (the list is `surfaces`, the note `surfacesNote`). */
  usageIntro?: string;

  /** The footnote under the specification table; defaults to the shared note. */
  specsFootnote?: string;
  /** Short sub-sections under the table, such as "Ultra-Low VOC: 0.38 g/L". */
  specNotes?: readonly { heading: string; body: string; link?: { label: string; href: string } }[];

  /** How to apply: a lead paragraph, then the steps (the "How to apply" rows in /admin), extra notes, systems and care. */
  applyLead?: string;
  /** Short cards after the steps, such as "Repainting an Old Exterior Wall". */
  applyNotes?: readonly { heading: string; body: string }[];
  systems?: readonly { title: string; steps: readonly string[]; note?: string }[];
  care?: string;

  /** The price card. Coverage and cost per sq. ft. are worked out from these numbers. */
  price?: {
    /** "Bhadram EX 20 Litre". */
    label: string;
    /** Pack size in litres (or kg), and the unit shown ("L" or "kg"). */
    pack: number;
    unit: "L" | "kg";
    /** MRP and offer price in rupees. */
    mrp?: number;
    offer: number;
    /** Coverage per litre (or kg) for one coat, in sq. ft. */
    coverage: number;
    lead?: string;
    note?: string;
    footnote?: string;
  };

  /** Related products: up to four cards. `product` is another product's id; without a page, the card links to Find an Outlet. */
  relatedLead?: string;
  related?: readonly { product?: string; name: string; role: string }[];
  /** Text links under the cards. */
  relatedLinks?: readonly { label: string; href: string }[];

  /** Section headings that differ from the defaults in productTemplateCopy. */
  headings?: Partial<Record<"features" | "usage" | "specs" | "apply" | "price" | "related", string>>;
};

/** What a product's entry below may hold: template fields, and any product field it replaces. */
export type ProductTemplateEntry = ProductTemplate & Partial<Omit<ProductDetail, "slug">>;

/** Shared words of the template. `{name}` is replaced with the product name. */
export const productTemplateCopy = {
  home: "Home",
  products: "Products",
  headings: {
    features: "Key Features & Benefits of {name}",
    usage: "Where Can {name} Be Used?",
    specs: "{name} Technical Specifications",
    apply: "How to Apply {name}",
    systems: "Recommended Painting System",
    care: "Care & Maintenance",
    price: "{name} Price & Painting Cost per Sq. Ft.",
    faq: "Frequently Asked Questions",
    reviews: "Customer Reviews & Questions",
    related: "Complete the {name} Painting System",
    relatedFallback: "Explore More Kerala Paints Products",
  },
  glance: "Product at a glance",
  areas: "Recommended areas",
  surfaces: "Recommended surfaces",
  specsCaption: "{name} technical specifications",
  specLabel: "Specification",
  step: "Step {n}",
  stepTag: { product: "{name}", optional: "If needed" },
  systemSteps: "{n} steps",
  consult: "Free Paint Consultation",
  findOutlet: "Find an Outlet",
  viewDetails: "View Details",
  price: {
    mrp: "MRP",
    offer: "Offer price",
    coverage: "Coverage",
    coverageValue: "Up to {coverage} sq. ft./{unit}/coat",
    packCoverage: "Single-coat coverage of {pack} {unit}",
    packCoverageValue: "Up to {area} sq. ft.",
    cost: "Topcoat material cost",
    costValue: "Approx. ₹{cost} per sq. ft.*",
    calculation: "₹{offer} ÷ {area} sq. ft. = approx. ₹{cost} per sq. ft. (one coat of {name})",
    note: "This is the approximate {name} material cost for one coat only. It is not the complete painting cost: the total also includes surface preparation, putty, base coat, dampness treatment where required, labour, scaffolding, additional coats and other site requirements.",
    footnote: "*Coverage and actual cost per sq. ft. vary with surface porosity and condition, shade, application method, wastage, applicator technique and site conditions.",
    estimate: "Get an exact estimate – Free Paint Consultation",
  },
  faq: {
    lead: "Quick answers to what homeowners and painters ask most about {name}.",
    more: "Still have a question?",
    ask: "Ask Kerala Paints",
    consult: "Free Paint Consultation",
  },
  viewProduct: "View product",
  relatedOutlet: "Ask at a Kerala Paints outlet",
  allIn: "All {category}",
} as const;

/** Template content per product, keyed by its id in data/products. */
export const productTemplates: Record<string, ProductTemplateEntry> = {
  // From "Bhadram EX – Developer Doc" (supplied by Kerala Paints). The range entry keeps its id "gold-ex".
  "gold-ex": {
    seoTitle: "Bhadram EX Exterior Emulsion Paint | Kerala Paints",
    seoDescription: "Bhadram EX latex exterior emulsion: single-coat coverage up to 170 sq ft/L, algae resistance, ultra-low VOC & up to 10-year warranty. 450+ shades.",
    ogTitle: "Bhadram EX – High-Performance Exterior Wall Emulsion Paint",
    fullName: "Bhadram EX High-Performance Exterior Wall Emulsion Paint",
    category: "Exterior Emulsion Paint",
    schemaDescription: "Bhadram EX is a premium, ready-to-use exterior emulsion paint with Latex Technology developed by the Rubber Research Institute of India (RRII). Single-coat coverage up to 170 sq. ft. per litre, algal resistance, high washability, ultra-low VOC (0.38 g/L) and up to 10-year warranty. Sheen finish in 450+ shades.",
    imageAlt: "Kerala Paints Bhadram EX exterior emulsion paint 20 litre pack",

    tagline: "High-Performance Exterior Wall Emulsion Paint",
    subhead: "Advanced Weather Protection for Beautiful, Long-Lasting Exterior Walls",
    intro: "Developed by the Rubber Research Institute of India (RRII) under the Rubber Board, Bhadram EX is a premium exterior emulsion paint with Latex Technology. It combines single-coat coverage up to 170 sq. ft. per litre, algal resistance, high washability and ultra-low VOC to protect walls and keep their colour through Kerala’s sun and monsoon rain.",
    badges: ["Up to 10-Year Warranty", "Single-Coat Coverage", "Ultra-Low VOC", "450+ Shades"],
    glance: [
      { label: "Finish", value: "Sheen" },
      { label: "Pack sizes", value: "1 L, 4 L, 10 L & 20 L" },
      { label: "Shades", value: "450+" },
      { label: "Recommended for", value: "Exterior walls, building facades, balconies, parapet walls, boundary walls & other exterior masonry" },
    ],

    featuresLead: "Bhadram EX is a premium exterior emulsion paint built for walls that face strong sunlight, UV, heavy rain, humidity and algae every day. Its advanced Latex Technology combines weather resistance, algal resistance, high washability, ultra-low VOC and single-coat coverage to keep exterior walls protected and beautiful for longer.",
    highlights: [
      { icon: "sparkle", title: "Latex Technology developed by RRII", text: "a durable coating film that holds its colour and finish under demanding outdoor conditions." },
      { icon: "layers", title: "Single-coat covering, up to 170 sq. ft./litre", text: "one topcoat instead of two, so you use less paint and spend less on labour." },
      { icon: "sun", title: "Advanced weather protection", text: "built for strong sunlight, heavy rain, humidity and changing weather." },
      { icon: "palette", title: "Long-lasting colour retention & finish", text: "exterior walls stay vibrant and attractive for longer." },
      { icon: "leaf", title: "Algal resistance", text: "helps damp, humid walls stay cleaner and better-looking." },
      { icon: "drop", title: "Highly washable finish", text: "dust, dirt and deposits can be cleaned off without harming the coating." },
      { icon: "air", title: "Ultra-low VOC: 0.38 g/L (tested by CIPET)", text: "minimal VOC emissions with full exterior performance." },
      { icon: "mix", title: "Ready to use, no water dilution", text: "consistent hiding power, coverage and film formation on every site." },
      { icon: "brush", title: "Brilliant white, elegant sheen, [450+ shades](/colours)", text: "performance and premium looks together." },
      { icon: "badge", title: "Up to 10-year warranty", text: "long-term performance assurance, subject to [warranty terms](/warranty)." },
    ],
    usageIntro: "Bhadram EX is an exterior wall paint for homes, villas, apartments and commercial buildings. Made for exterior masonry surfaces exposed to Kerala’s sun, rain and humidity, it protects facades, balconies, parapet walls and boundary walls with weather protection, algal resistance and long-lasting colour.",
    surfaces: [
      "Exterior walls of homes and residential buildings",
      "Building facades",
      "Apartment and villa exteriors",
      "Commercial building exteriors",
      "Exterior balcony walls",
      "Parapet walls",
      "Boundary and compound walls",
      "Exterior passages and common areas",
      "Other exterior masonry areas exposed to outdoor conditions",
    ],
    surfacesNote: "Properly prepared plastered cement walls, concrete surfaces and other suitable masonry. The surface should be structurally sound, clean, dry and free from cracks, loose paint, algae, fungus, dampness or water-ingress issues before painting.",

    specs: [
      { label: "Brand", value: "Kerala Paints" },
      { label: "Product type", value: "Water-based topcoat exterior emulsion paint" },
      { label: "Technology", value: "Latex Technology, developed by RRII (Rubber Board)" },
      { label: "Recommended use", value: "Exterior masonry walls" },
      { label: "Finish", value: "Sheen" },
      { label: "Coverage", value: "Up to 170 sq. ft./litre/coat*" },
      { label: "Number of coats", value: "Designed for single-coat covering*" },
      { label: "Dilution", value: "No dilution required – ready to use" },
      { label: "Touch dry", value: "Approximately 3 hours*" },
      { label: "Recoat time", value: "If an additional coat is required, apply within 30 minutes of the first coat*" },
      { label: "Application methods", value: "Brush, roller or spray" },
      { label: "Pack sizes", value: "1 L, 4 L, 10 L & 20 L" },
      { label: "Colour availability", value: "450+ shades" },
      { label: "VOC content", value: "0.38 g/L" },
      { label: "VOC test method", value: "ASTM D 3960:2018" },
      { label: "VOC tested by", value: "Central Institute of Petrochemicals Engineering & Technology (CIPET)" },
      { label: "Reference VOC limit", value: "≤ 50 g/L for Class A matt plastic emulsion under IS 15489:2024" },
      { label: "VOC performance", value: "Approximately 99.24% below the reference limit" },
      { label: "Warranty", value: "Up to 10 years, subject to terms and conditions" },
    ],
    specsFootnote: "*Actual coverage, drying and coating performance may vary depending on surface condition, porosity, colour, application method, applicator technique and environmental conditions.",
    specNotes: [
      { heading: "Ultra-Low VOC: 0.38 g/L", body: "Bhadram EX recorded a VOC content of only 0.38 g/L when tested as per ASTM D 3960:2018 by CIPET. Compared with the reference limit of 50 g/L for Class A matt plastic emulsion under IS 15489:2024, this is approximately 99.24% lower, combining high-performance exterior protection with minimal VOC emissions." },
    ],

    headings: { apply: "How to Apply Bhadram EX Exterior Paint" },
    applyLead: "To paint exterior walls with Bhadram EX, follow the Kerala Paints exterior painting system: surface preparation, 2 coats of Waterproof Putty, 2 coats of Smart Shine base coat and 1 coat of Bhadram EX.",
    applyNotes: [
      { heading: "Repainting an Old Exterior Wall", body: "Remove loose paint, dirt, algae and fungus, treat any dampness or chalkiness, and repair the surface. Apply Smart Shine base coat where required, then 1 coat of Bhadram EX." },
    ],
    // No painting-system diagrams on this page: the steps and the repainting note cover them.
    systems: [],
    care: "The highly washable finish lets you clean dust and dirt off painted walls without harming the coating.",

    price: {
      label: "Bhadram EX 20 Litre",
      pack: 20,
      unit: "L",
      mrp: 16700,
      offer: 11150,
      coverage: 170,
      lead: "Bhadram EX combines high coverage with single-coat covering, which reduces the quantity of final topcoat needed for your exterior walls.",
      note: "This is the approximate Bhadram EX final topcoat material cost for one coat only. It is not the complete painting cost: the total also includes surface preparation, putty, base coat, dampness treatment where required, labour, scaffolding, additional coats and other site requirements.",
    },

    faqs: [
      { question: "How many coats of Bhadram EX do I need?", answer: "One coat. Bhadram EX is designed for single-coat covering over the recommended putty and Smart Shine base coat. A second coat may be needed for dark or deep shades, or when repainting over a much darker colour." },
      { question: "How much area does one litre of Bhadram EX cover?", answer: "Up to 170 sq. ft. per litre for a single coat, so a 20-litre pack covers up to 3,400 sq. ft. Actual coverage depends on surface condition, porosity, colour and application method." },
      { question: "Do I need to add water to Bhadram EX before painting?", answer: "No. Bhadram EX is ready to use and needs no water dilution. Using it undiluted keeps its intended consistency, hiding power, coverage and coating performance." },
      { question: "Does Bhadram EX prevent algae on exterior walls?", answer: "Bhadram EX provides algal resistance, helping exterior walls stay cleaner in warm, humid and damp conditions. Any existing algae, fungus or moss must be removed before painting." },
      { question: "Is Bhadram EX a low-VOC paint?", answer: "Yes. Bhadram EX recorded a VOC content of 0.38 g/L when tested by CIPET as per ASTM D 3960:2018, approximately 99.24% below the 50 g/L reference limit under IS 15489:2024." },
      { question: "What warranty does Bhadram EX have?", answer: "Bhadram EX comes with up to 10 years’ warranty, subject to the applicable warranty terms, application requirements and conditions." },
    ],

    relatedLead: "Get the best results from Bhadram EX with the full Kerala Paints exterior painting system.",
    related: [
      { product: "waterproof-putty", name: "Kerala Paints Waterproof Putty", role: "Smooth, uniform base – 2 coats before the base coat" },
      { name: "Kerala Paints Smart Shine", role: "Recommended base coat – 2 coats before Bhadram EX" },
      { product: "aqua-seal", name: "Kerala Paints Aqua Seal 2K", role: "Controls dampness and water ingress before painting" },
      { name: "Kerala Paints Salt Block", role: "Treats chalky or powdery surfaces before painting" },
    ],
    relatedLinks: [
      { label: "All Exterior Emulsions", href: "/products/exterior-emulsion" },
      { label: "Warranty Details", href: "https://warrantyportal.keralapaints.com/" },
      { label: "Find an Outlet", href: "/outlets" },
    ],
  },
};

/** Words of the Customer Reviews & Questions section. `{name}` is the product name. */
export const reviewsCopy = {
  empty: "Painted your home with {name}? Be the first to share your experience.",
  basedOn: "Based on {count} reviews",
  outOf: "out of 5",
  stars: "{n} stars",
  write: "Write a Review",
  ask: "Ask a Question",
  sortLabel: "Sort reviews",
  sort: { newest: "Newest first", highest: "Highest rated" },
  loadMore: "Load more reviews",
  loadMoreQuestions: "Load more questions",
  verified: "Verified buyer",
  shade: "Shade used",
  reply: "Reply from Kerala Paints",
  questionsHeading: "Questions & Answers",
  noQuestions: "No questions yet. Ask Kerala Paints anything about {name}.",
  answer: "Kerala Paints",
  projectTypes: { "new-home": "New home", repainting: "Repainting", commercial: "Commercial" },
  form: {
    reviewTitle: "Share your experience",
    questionTitle: "Ask about {name}",
    name: "Your name",
    contact: "Phone or email (for verification only, never shown)",
    contactOptional: "Phone or email (optional, so we can reply)",
    location: "City / district",
    rating: "Your rating",
    title: "Review title",
    text: "Your review",
    shade: "Shade used (optional)",
    projectType: "Project type",
    question: "Your question",
    submitReview: "Submit review",
    submitQuestion: "Send question",
    sending: "Sending…",
    cancel: "Cancel",
    reviewThanks: "Thank you! Your review has been received and will appear after it is checked.",
    questionThanks: "Thank you! Kerala Paints will answer your question, and it will appear here once answered.",
    honeypot: "Leave this field empty",
  },
} as const;