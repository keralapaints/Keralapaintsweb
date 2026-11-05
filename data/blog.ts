/**
 * The blog (/blog/ and /blog/<slug>/): supporting articles for the product pages. lib/blog/blog-data adds their
 * addresses, reading time and structured data.
 *
 * In any paragraph or list item, [label](product:<id>) links to a product page (by its `id` in data/products) and
 * [label](/path/) links to any page on the site.
 */

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: readonly string[]; ordered?: boolean }
  /** A highlighted box: a key rule, the recommended system or a worked example. */
  | { type: "callout"; title?: string; text: string }
  /** A card for the product the article supports, with its pack and a button to its page. */
  | { type: "product"; product: string; label: string };

export type BlogSection = {
  /** Its anchor (#id), also used by the contents list. */
  id: string;
  heading: string;
  blocks: readonly BlogBlock[];
  subsections?: readonly { heading: string; blocks: readonly BlogBlock[] }[];
};

export type BlogPost = {
  /** The address: /blog/<slug>/. Never change it once live. */
  slug: string;
  /** The full browser and search-result title, used exactly as written. */
  seoTitle: string;
  seoDescription: string;
  keywords: readonly string[];
  /** The small line above the H1. */
  eyebrow: string;
  /** The H1. */
  title: string;
  /** Publication and last-update dates (YYYY-MM-DD). */
  published: string;
  updated?: string;
  /** The product whose backdrop and pack the article's hero shows (by `id` in data/products). */
  heroProduct: string;
  intro: readonly string[];
  sections: readonly BlogSection[];
  faqs: readonly { question: string; answer: string }[];
  /** The products the article links to, shown as cards after the questions (by `id`). */
  related: readonly string[];
  /** The closing links: other pages worth reading next. */
  links: readonly { label: string; product?: string; href?: string }[];
};

/** Labels shared by the blog pages. */
export const blogCopy = {
  home: "Home",
  blog: "Blog",
  by: "By Kerala Paints",
  readingTime: "min read",
  published: "Published",
  updated: "Updated",
  contents: "In this guide",
  faqHeading: ["FREQUENTLY ASKED", "QUESTIONS"],
  relatedHeading: ["PRODUCTS IN", "THIS GUIDE"],
  linksHeading: "Keep reading",
  explore: "Explore",
  read: "Read the guide",
  ctaHeading: ["NEED WATERPROOFING", "GUIDANCE?"],
  ctaBody: "Tell us about your terrace or project and the Kerala Paints team will help you choose the right system.",
  ctaButton: "Get waterproofing guidance",
  index: {
    // Draft copy for the blog index: no brief was supplied for this page.
    seoTitle: "Painting & Waterproofing Guides | Kerala Paints",
    seoDescription: "Practical guides from Kerala Paints on preparing surfaces, waterproofing terraces and choosing the right paint system for your home.",
    eyebrow: "Kerala Paints blog",
    heading: ["GUIDES FOR", "BETTER WALLS"],
    intro: "Practical, step-by-step advice on surface preparation, waterproofing and choosing the right paint system.",
  },
} as const;

export const blogPosts: readonly BlogPost[] = [
  // From "How to Waterproof a Terrace – Aqua Seal 2K Supporting Blog" (AQUA SEAL 2K SEO CONTENT, tab 2).
  {
    slug: "how-to-waterproof-a-terrace",
    seoTitle: "How to Waterproof a Terrace: Steps & Preparation",
    seoDescription: "Learn how to prepare a concrete terrace for waterproofing, apply a suitable coating system and understand why a protective finish matters.",
    keywords: ["how to waterproof a terrace", "terrace waterproofing process", "concrete terrace waterproofing", "roof waterproofing steps", "waterproofing for concrete roofs", "waterproof paint for terraces", "paint waterproofer", "how to prepare a terrace before waterproofing", "how to treat cracks before waterproofing", "waterproofing before the rainy season", "how many waterproofing coats are needed", "Aqua Seal 2K and Cool Coat terrace system"],
    eyebrow: "Waterproofing guide",
    title: "How to Waterproof a Concrete Terrace: Preparation and Application Steps",
    published: "2026-11-04",
    heroProduct: "aqua-seal",
    intro: [
      "Water entering through a concrete terrace can contribute to damp patches, damaged finishes and moisture problems in the spaces below. Choosing a suitable waterproofing system is important, but the result also depends on surface preparation, repairs, correct application and the finishing coat.",
      "If you are comparing waterproof paint options, first check whether the product is designed for exposed concrete and what protective finish the system requires.",
      "If you are planning terrace waterproofing, start by inspecting the concrete surface and identifying visible defects. Then choose a suitable waterproofing system and follow the product’s preparation, application and curing instructions.",
    ],
    sections: [
      {
        id: "inspect",
        heading: "Inspect the Terrace Before Waterproofing",
        blocks: [
          { type: "p", text: "Before applying a waterproofing coating, examine the concrete terrace for cracks, damaged areas, loose material, defective joints and other visible surface problems. Also consider where water collects or enters the building." },
          { type: "p", text: "Waterproofing should not replace the repair of serious substrate defects or the identification of an active leak. If the cause of moisture is unclear, obtain an appropriate site assessment before proceeding." },
        ],
      },
      {
        id: "prepare",
        heading: "Clean and Prepare the Concrete Surface",
        blocks: [
          { type: "p", text: "Surface preparation helps the waterproofing coating make proper contact with the concrete. Before application:" },
          { type: "list", items: [
            "Remove dust, dirt, grease, loose particles and other contaminants.",
            "Remove loose material that could interfere with the coating.",
            "Repair cracks, damaged concrete and defective joints using suitable repair materials.",
            "Ensure new concrete has completed the required curing period.",
            "Follow the product-specific instructions for pre-wetting and surface moisture.",
          ] },
          { type: "callout", title: "Saturated Surface Dry (SSD)", text: "For [Kerala Paints Aqua Seal 2K](product:aqua-seal), the required surface condition is Saturated Surface Dry (SSD). This means the concrete is adequately moistened but has no standing or pooled water." },
        ],
      },
      {
        id: "choose",
        heading: "Choose a Waterproofing System Suitable for the Terrace",
        blocks: [
          { type: "p", text: "Not every product marketed for waterproofing is suitable for every roof, terrace or substrate. Before selecting a product, consider its intended application, surface preparation requirements, coat sequence and finishing instructions." },
          { type: "p", text: "A decorative waterproof paint and a dedicated cementitious waterproofing coating do not necessarily perform the same function. Select a system designed for the particular substrate and exposure." },
          { type: "p", text: "[Kerala Paints Aqua Seal 2K](product:aqua-seal) is a two-component, polymer-modified flexible cementitious waterproofing system designed for suitable concrete and masonry surfaces. It consists of:" },
          { type: "list", items: ["Part A: Acrylic polymer solution", "Part B: Cementitious powder"] },
          { type: "p", text: "The mixing ratio is one part Part A to two parts Part B by weight. Mix for approximately 3–5 minutes, allow a resting period of 5–10 minutes and remix briefly before application." },
          { type: "callout", text: "Do not add extra water, cement, sand or other additives." },
        ],
      },
      {
        id: "apply",
        heading: "Apply the Recommended Aqua Seal 2K Terrace Waterproofing System",
        blocks: [
          { type: "p", text: "For exposed concrete terraces and roofs, Kerala Paints recommends the following system:" },
          { type: "callout", title: "Recommended terrace system", text: "One coat of Aqua Seal 2K + one coat of Kerala Paints Cool Coat." },
        ],
        subsections: [
          { heading: "Step 1 — Clean and Repair the Terrace", blocks: [{ type: "p", text: "Remove dirt, dust, loose particles and contaminants. Repair cracks, defective joints and damaged concrete using suitable repair materials." }] },
          { heading: "Step 2 — Prepare the Surface", blocks: [{ type: "p", text: "Bring the concrete surface to the required SSD condition. Ensure there is no standing or pooled water." }] },
          { heading: "Step 3 — Mix Aqua Seal 2K Correctly", blocks: [{ type: "p", text: "Combine Part A acrylic polymer solution and Part B cementitious powder in the prescribed 1:2 ratio by weight. Follow the specified mixing and resting procedure." }] },
          { heading: "Step 4 — Apply One Coat of Aqua Seal 2K", blocks: [{ type: "p", text: "Apply one uniform coat using a suitable waterproofing brush. Follow the product’s application and curing instructions." }] },
          { heading: "Step 5 — Apply the Cool Coat Finish", blocks: [
            { type: "p", text: "After the Aqua Seal 2K layer has reached the appropriate condition for the next application, apply one coat of [Kerala Paints Cool Coat](product:cool-coat) according to the compatible finishing-system instructions." },
            { type: "p", text: "The required waiting time depends on the application procedure and site conditions. Follow the applicable technical guidance before applying the finishing coat." },
          ] },
        ],
      },
      {
        id: "protective-finish",
        heading: "Why Is a Protective Finish Important?",
        blocks: [
          { type: "p", text: "For the recommended exposed terrace system, Aqua Seal 2K should not be left exposed to direct sunlight as the final coating." },
          { type: "p", text: "[Kerala Paints Cool Coat](product:cool-coat) is specified as the finishing layer over Aqua Seal 2K in this system. It protects the waterproofing layer from direct sunlight and supports the intended performance of the complete application system." },
          { type: "callout", text: "Do not omit or replace the specified finish without confirming compatibility with the technical team." },
        ],
      },
      {
        id: "estimate",
        heading: "Estimate the Waterproofing Material Requirement",
        blocks: [
          { type: "p", text: "The quantity of waterproofing material depends on terrace area, number of coats, surface texture, substrate condition and application losses." },
          { type: "p", text: "Aqua Seal 2K has approximate coverage of 10 sq. ft. per kg per coat. A 15 kg pack covers up to 150 sq. ft. for one coat and approximately 80 sq. ft. for two coats. These figures are approximate; actual coverage can vary with the surface and application conditions." },
          { type: "p", text: "The recommended terrace system also includes a separate Cool Coat finishing layer. Calculate the quantity of Cool Coat independently using its applicable coverage information." },
        ],
        subsections: [
          { heading: "Example of Aqua Seal 2K Material Cost", blocks: [
            { type: "p", text: "Using the listed 15 kg pack price of ₹3,300 and single-coat coverage of up to 150 sq. ft.:" },
            { type: "callout", text: "₹3,300 ÷ 150 sq. ft. = ₹22 per sq. ft. for one coat." },
            { type: "p", text: "This calculation covers Aqua Seal 2K material only. It excludes Cool Coat, labour, repairs and other project expenses." },
          ] },
        ],
      },
      {
        id: "cure",
        heading: "Allow the Waterproofing System to Cure",
        blocks: [
          { type: "p", text: "Do not assume that a terrace is ready for use immediately after coating. Follow the product-specific instructions for drying, curing, recoating and subsequent use." },
          { type: "p", text: "For the Aqua Seal 2K terrace system, use the applicable technical guidance to determine when the Cool Coat finishing layer can be applied. Site conditions may affect the waiting time." },
        ],
      },
      {
        id: "mistakes",
        heading: "Common Terrace Waterproofing Mistakes to Avoid",
        blocks: [],
        subsections: [
          { heading: "Applying Waterproofing Over an Unprepared Surface", blocks: [{ type: "p", text: "Dust, loose material, grease and unrepaired defects can interfere with the waterproofing application. Clean and prepare the surface before applying the coating." }] },
          { heading: "Ignoring the Source of Water Entry", blocks: [{ type: "p", text: "A coating alone may not resolve an active plumbing leak, rising dampness or a structural defect. Identify and address the moisture source wherever possible." }] },
          { heading: "Changing the Mixing Ratio", blocks: [{ type: "p", text: "Aqua Seal 2K requires a 1:2 ratio by weight. Do not add extra water, cement, sand or other additives to adjust the mixture." }] },
          { heading: "Leaving Aqua Seal 2K Exposed as the Final Terrace Coat", blocks: [{ type: "p", text: "The recommended exposed terrace system requires one coat of Cool Coat over Aqua Seal 2K. Follow the specified finishing system rather than leaving Aqua Seal 2K exposed to direct sunlight as the final coat." }] },
          { heading: "Estimating Material Only from the Floor Area", blocks: [{ type: "p", text: "Material requirements depend on the surface condition and the number of coats. Calculate the Aqua Seal 2K requirement and the Cool Coat finishing layer separately." }] },
        ],
      },
      {
        id: "is-it-suitable",
        heading: "Is Aqua Seal 2K Suitable for Your Terrace?",
        blocks: [
          { type: "p", text: "Kerala Paints Aqua Seal 2K can be used for suitable concrete terrace waterproofing applications where the surface and project conditions match the product requirements." },
          { type: "p", text: "The recommended exposed terrace system consists of one coat of Aqua Seal 2K followed by one coat of Kerala Paints Cool Coat. Proper surface preparation, the prescribed mixing ratio and the required curing procedure are important parts of the application." },
          { type: "p", text: "Before starting the work, review the product specifications and confirm the appropriate application sequence for your terrace." },
          { type: "product", product: "aqua-seal", label: "Explore Kerala Paints Aqua Seal 2K" },
        ],
      },
    ],
    faqs: [
      { question: "How do you waterproof a concrete terrace?", answer: "Inspect and repair the surface, remove contaminants, prepare the concrete according to the product instructions, apply a suitable waterproofing system and follow the curing and finishing requirements. For the recommended Aqua Seal 2K terrace system, apply one coat of Aqua Seal 2K followed by one coat of Cool Coat." },
      { question: "Can Aqua Seal 2K be used on a concrete roof?", answer: "Yes. Aqua Seal 2K can be used on suitable concrete roof and terrace surfaces. Prepare the substrate properly and follow the recommended finishing system." },
      { question: "How many coats are recommended for terrace waterproofing with Aqua Seal 2K?", answer: "For the specified exposed terrace application, the recommended system consists of one coat of Aqua Seal 2K followed by one coat of Kerala Paints Cool Coat." },
      { question: "Why should Aqua Seal 2K be finished with Cool Coat?", answer: "Aqua Seal 2K should not be left exposed to direct sunlight as the final coating in the recommended exposed terrace system. Cool Coat is specified as the finishing layer." },
      { question: "What is the mixing ratio of Aqua Seal 2K?", answer: "Mix one part Part A acrylic polymer solution with two parts Part B cementitious powder by weight. Do not add extra water, cement, sand or other additives." },
      { question: "What surface condition is required before applying Aqua Seal 2K?", answer: "The required condition is Saturated Surface Dry (SSD). The surface should be adequately moistened but free from standing or pooled water." },
      { question: "Can waterproofing be applied directly over cracks?", answer: "Cracks and damaged areas should be assessed and repaired with suitable materials before applying the waterproofing system. Follow the appropriate repair and product application instructions for the specific defect." },
      { question: "How much Aqua Seal 2K is needed for a terrace?", answer: "The approximate coverage is 10 sq. ft. per kg per coat. A 15 kg pack covers up to 150 sq. ft. for one coat, while two-coat coverage is approximately 80 sq. ft. Actual coverage varies. Estimate the Cool Coat finishing layer separately." },
      { question: "Can Aqua Seal 2K be left as the final roof coating?", answer: "For the specified exposed terrace system, Aqua Seal 2K should be finished with one coat of Kerala Paints Cool Coat rather than being left exposed to direct sunlight as the final coating." },
      { question: "When can the terrace be used after waterproofing?", answer: "Follow the applicable product instructions for drying, curing, recoating and use. The required waiting time depends on the application procedure and site conditions." },
      { question: "What should I look for in waterproof paint for a terrace?", answer: "Check whether the product is designed for concrete terraces, its surface preparation requirements, recommended number of coats and whether it needs a protective finishing layer. Also check compatibility with the existing surface and follow the product-specific application and curing instructions." },
    ],
    related: ["aqua-seal", "cool-coat"],
    links: [
      { label: "Kerala Paints Aqua Seal 2K", product: "aqua-seal" },
      { label: "Cool Coat finishing coat", product: "cool-coat" },
      { label: "Get waterproofing guidance", href: "/#enquiry" },
            { label: "Find a Kerala Paints outlet", href: "/outlets/" },
    ],
  },
];