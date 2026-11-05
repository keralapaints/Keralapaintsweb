/**
 * The product pages (/products/<slug>/): the long-form words for each product, keyed by its `id` in data/products
 * (the eight range categories and `moreProducts`). lib/product/product-data joins them to the range and its media.
 *
 * Draft copy: confirm every specification and claim against the product's technical data sheet before launch.
 * A specification left out of a product's `specs` simply does not show on its page.
 */

/** The line icons a highlight can carry (drawn in components/products/ProductPage). */
export type ProductIcon = "shield" | "sparkle" | "drop" | "leaf" | "sun" | "layers" | "home" | "brush" | "palette" | "air" | "mix" | "badge" | "thermo";

/** A link to another product's page (by `id` in data/products) or to any page on the site (`href`). */
export type ProductLink = { label: string; product?: string; href?: string };

/**
 * A longer section of a product page, after "How to apply": any mix of paragraphs, cards, a list, a table, a boxed
 * aside, a note and links to other pages. Each part is optional.
 */
export type ProductSection = {
  /** Its anchor on the page (#id). */
  id: string;
  heading: readonly string[];
  intro?: readonly string[];
  /** Cards, each optionally with its own numbered steps and a closing note. */
  cards?: readonly { title: string; meta?: string; text: string; steps?: readonly string[]; note?: string }[];
  /** Cards per row on wide screens; without it, as many as fit at a comfortable width. */
  cardColumns?: 1 | 2 | 3;
  list?: readonly string[];
  /** Number the list, for steps done in order. */
  ordered?: boolean;
  table?: { columns: readonly string[]; rows: readonly (readonly string[])[] };
  /** A boxed aside after the content: a short explanation or a list of cautions. */
  aside?: { title: string; text?: string; items?: readonly string[] };
  note?: string;
  link?: ProductLink;
  /** A row of links to other pages. */
  links?: readonly ProductLink[];
};

export type ProductDetail = {
  /** The page address: /products/<slug>/. Keep it short, lowercase and keyword-led; never change it once live. */
  slug: string;
  /** The name on the pack. */
  name: string;
  /** The product's full name for alt text and structured data; without one, the pack name and the range title. */
  fullName?: string;
  /**
   * The line that completes the page's H1 after the pack name ("Bhadram IN – <headline>"). With one, the hero shows
   * the pack name large and this line under it; without one, the category title is the large line.
   */
  headline?: string;
  /** Show "Kerala Paints" as a small line above the pack name, inside the H1. */
  brandInTitle?: boolean;
  /** The hero's line under the H1; without one, the range description from data/products is used. */
  lede?: string;
  /** What the product is, for search engines (schema.org `category`). */
  category: string;
  /** The full browser and search-result title, used exactly as written: keep it under about 60 characters. */
  seoTitle: string;
  /** Under 160 characters: the line search results show under the title. */
  seoDescription: string;
  keywords: readonly string[];
  /** The nature story behind the product. */
  inspiration: { label: string; body: string };
  overview: readonly string[];
  highlights: readonly { icon: ProductIcon; title: string; text: string }[];
  specs: readonly { label: string; value: string }[];
  surfaces: readonly string[];
  /** A note under "Where to use it": surface condition, limits of use. */
  surfacesNote?: string;
  steps: readonly { title: string; text: string }[];
  faqs: readonly { question: string; answer: string }[];
  /** Further sections after "How to apply". */
  sections?: readonly ProductSection[];
  /**
   * The closing call to action, when the product has its own words; otherwise productPageCopy's is used. `link` adds
   * a first button to another page (such as a supporting blog post); `button` renames the consultation button.
   */
  cta?: { heading: readonly string[]; body: string; link?: { label: string; href: string }; button?: string };
};

/** Labels shared by every product page. */
export const productPageCopy = {
  home: "Home",
  products: "Products",
  rangeLabel: "Our paints",
  inspired: "Inspired by nature",
  details: "View details",
  highlightsHeading: ["WHY YOU’LL", "LOVE IT"],
  specsHeading: ["PRODUCT", "DETAILS"],
  surfacesHeading: "Where to use it",
  stepsHeading: ["HOW TO", "APPLY"],
  faqHeading: ["QUESTIONS,", "ANSWERED"],
  relatedHeading: ["EXPLORE", "THE RANGE"],
  explore: "Explore",
  ctaHeading: ["LET’S TALK", "ABOUT YOUR SPACE"],
  ctaBody: "Tell us about your project and we’ll help you choose the right finish.",
  ctaButton: "Book a free consultation",
  note: "*Actual coverage, drying and coating performance may vary with surface condition, porosity, colour, application method and weather. Always follow the instructions on the pack.",
  footerProducts: "Products",
} as const;

/** Every product page, keyed by its `id` in data/products. */
export const productDetails: Record<string, ProductDetail> = {
  // From BHADRAM IN – PRODUCT PAGE SEO CONTENT (supplied by Kerala Paints).
  "bhadram-in": {
    slug: "bhadram-in",
    name: "Bhadram IN",
    headline: "Safe Interior Topcoat Emulsion Paint",
    category: "Interior emulsion paint",
    seoTitle: "Bhadram IN Interior Emulsion | Low-VOC Interior Paint",
    seoDescription: "Bhadram IN interior emulsion combines ultra-low VOC, low-odour technology, high washability and single-coat coverage for beautiful indoor walls.",
    keywords: ["Bhadram IN interior emulsion", "Bhadram IN", "interior emulsion paint", "interior wall paint", "interior emulsion paint for homes", "low VOC interior paint", "low-odour interior paint", "washable interior wall paint", "interior paint for bedrooms", "interior paint for Kerala homes"],
    inspiration: { label: "The pearl shell", body: "A pearl shell glows on the outside while it guards the life within. Bhadram IN is made the same way: an elegant sheen for your walls, and quiet care for the family who lives beside them." },
    overview: [
      "Your home is where you spend much of your time, so the paint you choose for your interiors should offer more than just a good-looking finish.",
      "Bhadram IN is a premium interior emulsion paint developed by the Rubber Research Institute of India (RRII), under the Rubber Board. It is designed specifically for indoor spaces, combining Ultra-Low VOC and Low-Odour Technology with excellent washability, superior coverage and an elegant sheen finish.",
      "Whether it is a bedroom, living room, kitchen, dining area or hall, Bhadram IN is designed to provide a practical and refined finish for frequently used interior spaces.",
    ],
    highlights: [
      { icon: "home", title: "Designed for indoor spaces", text: "Formulated specifically for interior walls and ceilings, where appearance, durability and indoor air quality matter." },
      { icon: "air", title: "Ultra-Low VOC & Low-Odour", text: "Designed to minimise paint-related VOC emissions and odour in the rooms you live in." },
      { icon: "layers", title: "Superior coverage", text: "Designed for single-coat topcoat covering, up to 180 sq. ft. per litre per coat." },
      { icon: "drop", title: "Highly washable", text: "Dust, fingerprints and everyday stains clean off more easily, so walls keep their look." },
      { icon: "brush", title: "Ready to use", text: "No water dilution needed, so it keeps its intended consistency, hiding power and coverage." },
      { icon: "sparkle", title: "Elegant sheen finish", text: "A refined sheen with a brilliant white appearance." },
      { icon: "palette", title: "450+ shades", text: "A colour for every bedroom, living room, kitchen and hall." },
    ],
    specs: [
      { label: "Product type", value: "Water-based topcoat interior emulsion paint" },
      { label: "Finish", value: "Sheen" },
      { label: "Coverage", value: "Up to 180 sq. ft. per litre per coat*" },
      { label: "Coating", value: "Designed for single-coat covering*" },
      { label: "Dilution", value: "Ready to use – no dilution required" },
      { label: "Touch dry", value: "Approximately 3 hours*" },
      { label: "Application", value: "Brush, roller or spray" },
      { label: "Pack sizes", value: "1 L, 4 L, 10 L & 20 L" },
      { label: "Colours", value: "450+ shades" },
      { label: "Recommended surface", value: "Interior masonry walls and ceilings" },
      { label: "VOC (tested)", value: "0.42 g/L – ASTM D 3960:2018, tested by CIPET" },
    ],
    surfaces: ["Bedrooms", "Living rooms", "Dining rooms", "Kitchens", "Halls", "Passages & corridors", "Ceilings", "Offices & commercial interiors"],
    steps: [
      { title: "Prepare the surface", text: "Make sure the wall is sound, clean and dry. Remove loose paint, dust, grease, fungus and algae, and treat dampness at its source – with Kerala Paints Aqua Seal 2K where appropriate, and Salt Block on chalky surfaces." },
      { title: "Ultra White Putty", text: "Apply two coats of Kerala Paints Ultra White Putty for a smooth, even base." },
      { title: "Smart Shine base coat", text: "Apply two coats of Kerala Paints Smart Shine Base Coat." },
      { title: "Bhadram IN topcoat", text: "Apply one coat of Bhadram IN, ready to use. Add a second coat only if needed – for deep colours or a big colour change." },
    ],
    faqs: [
      { question: "What is Bhadram IN interior emulsion?", answer: "Bhadram IN is a premium interior topcoat emulsion paint developed for indoor spaces. It combines Ultra-Low VOC and Low-Odour Technology with high washability, superior coverage and an elegant sheen finish." },
      { question: "Is Bhadram IN an interior or exterior paint?", answer: "Bhadram IN is an interior emulsion paint designed for properly prepared interior masonry walls and ceilings." },
      { question: "Is Bhadram IN a low-VOC interior paint?", answer: "Yes. Bhadram IN has a tested VOC content of 0.42 g/L according to ASTM D 3960:2018. The product information states that it was tested by CIPET." },
      { question: "Does Bhadram IN have low odour?", answer: "Yes. Bhadram IN uses Low-Odour Technology designed to minimise the characteristic odour associated with paint application." },
      { question: "Is Bhadram IN suitable for bedrooms?", answer: "Yes. Bhadram IN is recommended for bedrooms and other frequently occupied indoor spaces." },
      { question: "Can Bhadram IN be used in kitchens?", answer: "Yes. Bhadram IN is listed for use in kitchens and other properly prepared interior spaces." },
      { question: "How much area does Bhadram IN cover per litre?", answer: "Bhadram IN provides coverage of up to 180 sq. ft. per litre per coat under the stated conditions. Actual coverage can vary depending on surface condition, porosity, colour and application method." },
      { question: "Does Bhadram IN require water dilution?", answer: "No. Bhadram IN is ready to use and does not require additional water dilution." },
      { question: "How many coats of Bhadram IN are required?", answer: "Bhadram IN is designed for single-coat topcoat covering under recommended conditions. An additional coat may be required for certain dark colours, repainting situations or where additional hiding is needed." },
      { question: "How do I repaint existing walls with Bhadram IN?", answer: "Inspect the existing surface, remove loose paint, dust, grease and other contaminants, and address any dampness or chalkiness. Repair and prepare the surface, apply Smart Shine Base Coat where required, then apply one coat of Bhadram IN, with an additional coat if needed." },
      { question: "What finish does Bhadram IN provide?", answer: "Bhadram IN provides an elegant sheen finish." },
      { question: "How many shades are available in Bhadram IN?", answer: "Bhadram IN is available in more than 450 shades." },
      { question: "What pack sizes are available?", answer: "Bhadram IN is available in 1 L, 4 L, 10 L and 20 L pack sizes." },
    ],
    cta: { heading: ["CHOOSE BHADRAM IN", "FOR YOUR INTERIORS"], body: "Low odour, Ultra-Low VOC performance, washability, coverage and 450+ shades – a balanced finish for everyday interior spaces." },
  },
  // From BHADRAM EX – PRODUCT PAGE SEO DOCUMENT (supplied by Kerala Paints). The range entry keeps its id "gold-ex".
  "gold-ex": {
    slug: "bhadram-ex",
    name: "Bhadram EX",
    headline: "High-Performance Exterior Wall Emulsion Paint",
    category: "Exterior emulsion paint",
    seoTitle: "Bhadram EX Exterior Paint | Weather-Resistant Wall Paint",
    seoDescription: "Bhadram EX is a high-performance exterior emulsion with Latex Technology, algal resistance, high washability and ultra-low VOC protection.",
    keywords: ["Bhadram EX exterior paint", "Bhadram EX", "exterior emulsion paint", "exterior wall paint", "exterior paint for walls", "weather-resistant exterior paint", "exterior paint for Kerala climate", "low VOC exterior paint", "washable exterior wall paint", "exterior paint with algal resistance"],
    inspiration: { label: "The peacock", body: "A peacock’s feathers keep their shine in every season, through the heat of summer and the heaviest rain. Bhadram EX brings that same lasting lustre to the outside of your home." },
    overview: [
      "Bhadram EX is a high-performance exterior emulsion paint developed for exterior walls that face sunlight, rain, humidity and changing weather conditions.",
      "Developed with advanced Latex Technology, Bhadram EX is designed to support long-lasting colour retention and finish while providing weather protection, algal resistance, high washability and superior coverage.",
      "The ready-to-use formulation requires no additional water dilution and is designed for single-coat topcoat coverage of up to 170 sq. ft. per litre, depending on surface condition and application method. It is available in 1 L, 4 L, 10 L and 20 L packs with 450+ shades.",
    ],
    highlights: [
      { icon: "sun", title: "Advanced weather protection", text: "Made for exterior walls exposed to sun, rain and changing weather, for a durable finish." },
      { icon: "sparkle", title: "Advanced Latex Technology", text: "Supports coating durability, colour retention and a long-lasting exterior finish." },
      { icon: "leaf", title: "Algal resistance", text: "Resists algal growth on painted surfaces, for a cleaner-looking finish." },
      { icon: "layers", title: "Superior coverage", text: "Up to 170 sq. ft. per litre per coat under recommended conditions." },
      { icon: "drop", title: "Highly washable finish", text: "Withstands regular cleaning while keeping its appearance." },
      { icon: "air", title: "Ultra-Low VOC", text: "Formulated to minimise VOC emissions while protecting exterior walls." },
    ],
    specs: [
      { label: "Product type", value: "Water-based topcoat exterior emulsion paint" },
      { label: "Recommended use", value: "Exterior masonry walls – plastered cement, concrete and suitable masonry" },
      { label: "Finish", value: "Sheen" },
      { label: "Coverage", value: "Up to 170 sq. ft. per litre per coat*" },
      { label: "Topcoat system", value: "Designed for single-coat covering*" },
      { label: "Dilution", value: "Ready to use – no dilution required" },
      { label: "Touch dry", value: "Approximately 3 hours*" },
      { label: "Application", value: "Brush, roller or spray" },
      { label: "Pack sizes", value: "1 L, 4 L, 10 L & 20 L" },
      { label: "Colours", value: "450+ shades" },
      { label: "Technology", value: "Advanced Latex Technology" },
      { label: "Algal resistance", value: "Yes" },
      { label: "Washability", value: "High" },
      { label: "Warranty", value: "Up to 10 years, subject to warranty terms and conditions" },
      // VOC is left out until Kerala Paints confirms one value: the brief gives both 0.42 g/L and 0.38 g/L.
    ],
    surfaces: ["Home exteriors", "Residential buildings", "Building facades", "Apartments", "Villas", "Commercial buildings", "Balcony walls", "Parapet walls", "Boundary & compound walls", "Exterior passages & common areas"],
    steps: [
      { title: "Prepare the surface", text: "Remove loose or flaking paint, dust, dirt, grease, oil, loose particles and unsound coatings. Remove fungus, algae and moss, and let the wall dry." },
      { title: "Treat dampness", text: "Where there is dampness or water ingress, find and fix the source. Kerala Paints Aqua Seal 2K may be used as part of the treatment where appropriate." },
      { title: "Treat chalky surfaces", text: "If the wall is still chalky or powdery after cleaning, use Kerala Paints Salt Block as recommended." },
      { title: "Waterproof Putty", text: "Apply two coats of Kerala Paints Waterproof Putty to the prepared masonry." },
      { title: "Smart Shine base coat", text: "Apply two coats of Kerala Paints Smart Shine as the base coat." },
      { title: "Bhadram EX topcoat", text: "Apply one coat of Bhadram EX – ready to use, by brush, roller or spray. Add a coat only if needed for deep colours, big colour changes or uneven porosity." },
    ],
    faqs: [
      { question: "What is Bhadram EX?", answer: "Bhadram EX is a high-performance exterior wall emulsion paint developed for exterior masonry surfaces. It combines advanced Latex Technology, weather protection, algal resistance, high washability, superior coverage and an Ultra-Low VOC formulation." },
      { question: "Is Bhadram EX suitable for exterior walls?", answer: "Yes. Bhadram EX is specifically developed for properly prepared exterior masonry surfaces, including exterior home walls, building facades, balconies, parapets and boundary walls." },
      { question: "How much area does Bhadram EX cover?", answer: "Bhadram EX provides coverage of up to 170 sq. ft. per litre per coat, subject to surface condition and application method." },
      { question: "Does Bhadram EX require water dilution?", answer: "No. Bhadram EX is ready to use and does not require additional water dilution before application." },
      { question: "Is Bhadram EX resistant to algae?", answer: "Yes. Bhadram EX is designed with algal resistance to help maintain a cleaner-looking exterior finish." },
      { question: "What finish does Bhadram EX provide?", answer: "Bhadram EX provides a sheen finish and is available in more than 450 shades." },
      { question: "What surfaces can Bhadram EX be applied to?", answer: "It is recommended for properly prepared exterior masonry surfaces, including plastered cement walls, concrete and other suitable masonry substrates." },
      { question: "How many coats of Bhadram EX are required?", answer: "Bhadram EX is designed for single-coat topcoat coverage under recommended conditions. An additional coat may be required for certain colours, repainting situations or surface conditions." },
      { question: "What are the available pack sizes?", answer: "Bhadram EX is available in 1 L, 4 L, 10 L and 20 L packs." },
      { question: "How can Bhadram EX be applied?", answer: "It can be applied using a brush, roller or spray." },
    ],
    cta: { heading: ["GIVE YOUR EXTERIOR WALLS", "LONG-LASTING PROTECTION"], body: "Choose Bhadram EX for weather protection, high washability, algal resistance, superior coverage and a premium sheen finish." },
  },
  // From PRIME PLATINUM – PRODUCT PAGE SEO CONTENT (supplied by Kerala Paints).
  "prime-platinum": {
    slug: "prime-platinum",
    name: "Prime Platinum",
    fullName: "Prime Platinum Waterproof Wall Primer",
    headline: "Interior & Exterior Waterproof Primer",
    brandInTitle: true,
    category: "Interior and exterior waterproof wall primer",
    seoTitle: "Prime Platinum Waterproof Primer | Kerala Paints",
    seoDescription: "Discover Kerala Paints Prime Platinum, a water-based waterproof primer for interior and exterior masonry walls, designed to support moisture resistance and topcoat adhesion.",
    keywords: ["waterproof wall primer", "Kerala Paints Prime Platinum", "interior and exterior waterproof primer", "water-resistant wall primer", "waterproof primer for masonry walls", "primer for damp-prone walls", "primer for cement plaster walls", "wall primer before emulsion paint"],
    inspiration: { label: "The forest roots", body: "Unseen beneath the soil, roots give a tree its strength and hold back the wet ground around it. Prime Platinum works the same way: hidden under your finish, a firm, water-resistant foundation for every coat above." },
    overview: [
      "Kerala Paints Prime Platinum is a premium, water-based waterproof primer developed for properly prepared interior and exterior masonry walls.",
      "Designed to combine water-resistant coating properties, good surface penetration and high intercoat holding capacity, Prime Platinum helps establish a protective and uniform foundation for compatible decorative emulsion paints.",
      "Its formulation helps reduce moisture absorption through the primed surface while supporting adhesion between coating layers. It also helps fill minor pores and surface imperfections, for a smoother and more consistent base for the final finish.",
    ],
    highlights: [
      { icon: "drop", title: "Water-resistant primer", text: "A water-resistant primer layer that helps reduce water absorption through prepared masonry." },
      { icon: "home", title: "Interior & exterior walls", text: "For properly prepared interior and exterior masonry in residential and commercial painting systems." },
      { icon: "layers", title: "Good surface penetration", text: "Penetrates suitable masonry to build a firm foundation for the coats above." },
      { icon: "shield", title: "High intercoat holding", text: "Supports adhesion between the primer and compatible decorative emulsion topcoats." },
      { icon: "brush", title: "Fills minor pores", text: "Helps fill small pores and minor imperfections. It does not replace putty or crack fillers." },
      { icon: "sparkle", title: "Smooth, uniform base", text: "A consistent base for uniform topcoat application and the look of the final finish." },
      { icon: "sun", title: "Exterior coating protection", text: "With a compatible exterior emulsion, part of a system made for normal exterior exposure." },
      { icon: "badge", title: "For premium emulsions", text: "A primer foundation for compatible Kerala Paints interior and exterior emulsions." },
    ],
    specs: [
      { label: "Product category", value: "Interior & exterior waterproof primer" },
      { label: "Product type", value: "Water-based waterproofing masonry primer" },
      { label: "Recommended use", value: "Interior & exterior masonry walls" },
      { label: "Primary function", value: "Water-resistant priming and surface preparation" },
      { label: "Surface penetration", value: "Good surface penetration" },
      { label: "Intercoat performance", value: "High intercoat holding capacity" },
      { label: "Surface filling", value: "Minor pores and surface imperfections" },
      { label: "Finish", value: "Smooth primer base" },
      { label: "Recommended coats", value: "2 coats" },
      { label: "Coverage", value: "150–160 sq. ft. per litre per coat*" },
      { label: "Dilution", value: "Up to 20% water" },
      { label: "Touch-dry time", value: "3 hours*" },
      { label: "Recoat time", value: "6 hours*" },
      { label: "Application", value: "Brush, roller or suitable spray equipment" },
      { label: "Pack sizes", value: "1 L, 4 L, 10 L & 20 L" },
      { label: "Suitable surfaces", value: "Cement-plastered walls, suitable concrete, interior masonry ceilings and prepared previously painted masonry" },
      { label: "Recommended finishing", value: "Compatible Kerala Paints interior or exterior emulsion" },
    ],
    surfaces: ["Bedrooms", "Living rooms", "Dining rooms", "Kitchens", "Halls & corridors", "Offices & commercial interiors", "Exterior walls", "Building facades", "Exterior corridors", "Masonry columns"],
    surfacesNote: "Prime Platinum is a water-resistant primer. It is not a standalone solution for active leakage, rising dampness, hydrostatic pressure or structural waterproofing defects. The substrate should be sound, clean, adequately dry and free from contaminants.",
    steps: [
      { title: "Prepare the surface", text: "Remove loose or flaking paint, dust, dirt, grease, oil and loose particles. Clean off fungal, algal or moss growth and let the wall dry." },
      { title: "Treat problems first", text: "Fix the source of any dampness – with Aqua Seal 2K where appropriate – and never prime over active seepage. Use Salt Block on chalky surfaces." },
      { title: "Repair & level", text: "Repair significant cracks and holes. Use Ultra White Putty on interior walls and Waterproof Putty on exterior walls where required." },
      { title: "First coat", text: "Mix thoroughly, dilute with clean water as directed (up to 20%) and apply uniformly by brush, roller or spray." },
      { title: "Second coat", text: "After about six hours, once the first coat has dried, apply the second coat uniformly." },
      { title: "Emulsion topcoat", text: "Finish with a compatible Kerala Paints interior emulsion, or a weather-resistant exterior emulsion outside." },
    ],
    sections: [
      {
        id: "painting-systems",
        heading: ["RECOMMENDED", "PAINTING SYSTEMS"],
        cardColumns: 1,
        cards: [
          { title: "New interior wall", meta: "Interior", text: "Prepare the surface → repair defects → two coats of Ultra White Putty where required → two coats of Prime Platinum → compatible interior emulsion." },
          { title: "New exterior wall", meta: "Exterior", text: "Prepare the surface → repair defects → two coats of Waterproof Putty where required → two coats of Prime Platinum → compatible exterior emulsion." },
          { title: "Repainting", meta: "Existing walls", text: "Inspect → remove loose paint and contaminants → address moisture defects → repair and prepare → two coats of Prime Platinum → compatible emulsion." },
        ],
        note: "The exact preparation and coating requirements depend on the condition of the surface and the approved instructions for each product.",
      },
      {
        id: "compared",
        heading: ["PRIME PLATINUM VS.", "A REGULAR WALL PRIMER"],
        table: {
          columns: ["Feature", "Prime Platinum"],
          rows: [
            ["Intended application", "Interior and exterior masonry walls"],
            ["Main distinction", "Water-resistant primer properties"],
            ["Intercoat performance", "Designed for high intercoat holding capacity"],
            ["Surface imperfections", "Helps fill minor pores and imperfections"],
            ["Finishing system", "Compatible interior or exterior emulsion"],
            ["Limitations", "Not a standalone treatment for active leakage or structural waterproofing defects"],
          ],
        },
        note: "This describes Prime Platinum’s intended positioning. It is not a laboratory comparison against every other primer.",
      },
      {
        id: "more-products",
        heading: ["EXPLORE MORE", "KERALA PAINTS PRODUCTS"],
        links: [
          { label: "Kerala Paints Prime Gold", product: "prime-gold" },
          { label: "Aqua Seal 2K waterproofing", product: "aqua-seal" },
          { label: "Kerala Paints Ultra White Putty", product: "ultra-white-putty" },
          { label: "Kerala Paints Waterproof Putty", product: "waterproof-putty" },
          { label: "Interior emulsion paints", product: "bhadram-in" },
          { label: "Exterior emulsion paints", product: "gold-ex" },
        ],
      },
    ],
    faqs: [
      { question: "What is Kerala Paints Prime Platinum used for?", answer: "Kerala Paints Prime Platinum is a water-based waterproof primer designed for properly prepared interior and exterior masonry walls before applying compatible decorative emulsion paint." },
      { question: "Can Prime Platinum be used on both interior and exterior walls?", answer: "Yes. Prime Platinum is designed for suitable interior and exterior masonry surfaces when used as part of a compatible painting system." },
      { question: "Is Prime Platinum a waterproofing product?", answer: "Prime Platinum is positioned as a waterproof primer with water-resistant properties. It should not be treated as a standalone solution for active leakage, rising dampness, hydrostatic pressure or structural waterproofing defects." },
      { question: "How many coats of Prime Platinum are recommended?", answer: "The recommended application is two coats. Follow the approved product instructions for drying intervals and application conditions." },
      { question: "What is the coverage of Prime Platinum?", answer: "The listed coverage is 150–160 sq. ft. per litre per coat. Actual coverage can vary with surface porosity, texture, preparation and application method." },
      { question: "Can Prime Platinum be applied before emulsion paint?", answer: "Yes. Prime Platinum is designed to provide a primer foundation for compatible Kerala Paints interior or exterior emulsion topcoats." },
      { question: "Can Prime Platinum repair cracks in walls?", answer: "No. It helps fill minor pores and surface imperfections. Significant cracks, holes and uneven areas should be repaired using suitable materials before primer application." },
      { question: "What should be done if a wall has active dampness or leakage?", answer: "Identify and address the source of moisture before proceeding with the painting system. Use an appropriate waterproofing or repair treatment where required. Prime Platinum should not replace treatment for active leakage or structural moisture defects." },
      { question: "How much water should be added to Prime Platinum?", answer: "The listed technical specification allows dilution of up to 20% water. Follow the approved product application instructions for the correct dilution." },
    ],
    cta: { heading: ["PREPARE YOUR WALLS WITH", "PRIME PLATINUM"], body: "Talk to Kerala Paints about the right primer and painting system for your walls." },
  },
  // From AQUA SEAL 2K SEO CONTENT, tab 1 (supplied by Kerala Paints). Its supporting blog post is in data/blog.
  "aqua-seal": {
    slug: "aqua-seal-2k",
    name: "Aqua Seal 2K",
    headline: "Waterproofing",
    brandInTitle: true,
    category: "Two-component cementitious waterproofing system",
    seoTitle: "Aqua Seal 2K Waterproofing | Kerala Paints",
    seoDescription: "Looking for reliable waterproofing? Choose Aqua Seal 2K by Kerala Paints for flexible protection across bathrooms, terraces and foundations.",
    keywords: ["Aqua Seal 2K waterproofing", "waterproof paint", "Kerala Paints Aqua Seal 2K", "cementitious waterproofing coating", "two-component waterproofing system", "polymer-modified waterproofing", "waterproofing product in Kerala", "Aqua Seal 2K price", "Aqua Seal 2K coverage", "bathroom waterproofing", "concrete terrace waterproofing", "foundation waterproofing", "basement waterproofing", "damp wall treatment", "waterproofing mixing ratio", "waterproofing application method"],
    inspiration: { label: "The colocasia leaf", body: "Rain falls on a colocasia leaf and simply rolls away; water never gets a hold. Aqua Seal 2K gives concrete and masonry that same quiet resistance, monsoon after monsoon." },
    overview: [
      "Kerala Paints Aqua Seal 2K waterproofing is a two-part, polymer-modified, flexible cement waterproofing system. It helps reduce water seepage through well-prepared concrete and masonry surfaces.",
      "It combines an acrylic polymer solution with a cement-based powder. When mixed and applied as recommended, it forms a continuous waterproof coating. Aqua Seal 2K is suitable for specified applications such as foundations, basements, damp-wall treatment, bathrooms, terraces, concrete water tanks and swimming pools.",
      "For the recommended exposed terrace and roof system, apply one coat of Aqua Seal 2K followed by one coat of Kerala Paints Cool Coat. Aqua Seal 2K should not be left exposed to direct sunlight as the final coating in this system.",
    ],
    highlights: [
      { icon: "drop", title: "Primary waterproofing protection", text: "A continuous cementitious waterproofing layer on prepared concrete and masonry, helping control water penetration through the treated substrate." },
      { icon: "mix", title: "Two-component polymer-modified technology", text: "An acrylic polymer solution and a cementitious powder, mixed in a specified ratio for application." },
      { icon: "layers", title: "Flexible cementitious coating", text: "A polymer-modified formulation designed to give a flexible waterproofing coat on suitable concrete and masonry." },
      { icon: "home", title: "Foundation & basement protection", text: "Helps reduce moisture ingress, and can replace conventional bituminous foundation coating in suitable applications." },
      { icon: "shield", title: "Damp-wall treatment", text: "Part of a wall treatment system once affected coatings are removed – moisture can cause peeling paint, damaged putty and spoilt finishes." },
      { icon: "brush", title: "Bathroom & wet-area waterproofing", text: "For bathroom floors and walls before tiling, with care at corners, floor-wall junctions and pipe penetrations." },
      { icon: "sun", title: "Terrace & roof waterproofing", text: "The primary waterproofing layer for concrete terraces and roofs, finished with one coat of Kerala Paints Cool Coat." },
      { icon: "leaf", title: "Water tanks & swimming pools", text: "For suitable concrete tanks and pools, cured as recommended before filling. Verify potable-water suitability for drinking-water tanks." },
      { icon: "sparkle", title: "Simple 1:2 mixing ratio", text: "One part Part A to two parts Part B by weight – no extra water, cement, sand or additives." },
      { icon: "badge", title: "Extendable waterproofing warranty", text: "Application-specific five-year coverage, extendable up to ten years with the prescribed Cool Coat schedule, subject to terms." },
    ],
    specs: [
      { label: "Product category", value: "Primary waterproofing system" },
      { label: "Product type", value: "Two-component polymer-modified flexible cementitious waterproofing" },
      { label: "Part A", value: "Acrylic polymer solution" },
      { label: "Part B", value: "Cementitious powder" },
      { label: "Mixing ratio", value: "1:2 by weight (Part A : Part B)" },
      { label: "Mixing duration", value: "3–5 minutes" },
      { label: "Resting time", value: "5–10 minutes" },
      { label: "Working time at 27°C", value: "Approximately 45–60 minutes*" },
      { label: "Surface condition", value: "Saturated Surface Dry (SSD)" },
      { label: "Application method", value: "Suitable waterproofing brush" },
      { label: "Approximate coverage", value: "10 sq. ft. per kg per coat*" },
      { label: "15 kg single-coat coverage", value: "Up to 150 sq. ft.*" },
      { label: "15 kg two-coat coverage", value: "Approximately 80 sq. ft.*" },
      { label: "3 kg pack composition", value: "1 kg Part A + 2 kg Part B" },
      { label: "15 kg pack composition", value: "5 kg Part A + 10 kg Part B" },
      { label: "Additional water", value: "Do not add" },
      { label: "Additional cement, sand or additives", value: "Do not add" },
      { label: "Foundation application", value: "1 coat" },
      { label: "Damp-wall treatment", value: "1 coat" },
      { label: "Bathroom and wet areas", value: "2 coats" },
      { label: "Terrace and roof", value: "1 coat Aqua Seal 2K + 1 coat Cool Coat" },
      { label: "Water tanks and swimming pools", value: "2 coats" },
      { label: "Standard warranty", value: "Application-specific five-year coverage" },
      { label: "Extendable warranty", value: "Up to ten years under applicable conditions" },
    ],
    surfaces: ["Foundations", "Basements", "Damp walls", "Bathrooms & wet areas", "Terraces & roofs", "Concrete water tanks", "Swimming pools"],
    surfacesNote: "Actual coverage and working time depend on substrate condition, temperature, surface texture, application method and site conditions. For drinking-water tanks, verify suitability and certification for potable-water contact before use.",
    steps: [
      { title: "Clean the surface", text: "Remove dust, dirt, grease, oil, loose cement, flaking paint and other contaminants." },
      { title: "Repair defects", text: "Repair cracks, holes, damaged concrete and other defects with suitable repair materials." },
      { title: "Let new work cure", text: "New concrete and plaster should complete their required curing period before waterproofing." },
      { title: "Bring to SSD", text: "Pre-wet absorbent surfaces until Saturated Surface Dry: moistened through, with no standing or pooled water." },
      { title: "Mix 1:2 by weight", text: "Add Part B to Part A while mixing, mix 3–5 minutes, rest 5–10 minutes and remix. Use within 45–60 minutes at 27°C." },
      { title: "Apply", text: "Apply uniformly with a suitable waterproofing brush, in the number of coats specified for the application." },
    ],
    sections: [
      {
        id: "applications",
        heading: ["WHERE CAN AQUA SEAL 2K", "BE USED?"],
        cardColumns: 2,
        cards: [
          {
            title: "Foundation & basement waterproofing", meta: "1 coat",
            text: "Used during foundation construction as a protective waterproofing coat, helping reduce moisture ingress through treated foundation masonry and concrete.",
            steps: ["Prepare the surface and repair defects where necessary.", "Bring the substrate to Saturated Surface Dry (SSD) condition.", "Apply the coating uniformly.", "Allow appropriate curing and protect the treated surface from damage."],
            note: "Subsequent construction may proceed after approximately five days, subject to suitable curing and site conditions.",
          },
          {
            title: "Damp-wall treatment", meta: "1 coat",
            text: "Part of a treatment system for walls affected by dampness. Identify and address the moisture source wherever possible first.",
            steps: ["Remove affected paint and putty from the treatment area.", "Clean the exposed masonry surface.", "Repair cracks, holes and other defects where necessary.", "Prepare the surface to SSD condition.", "Apply one uniform coat of Aqua Seal 2K.", "Allow approximately 12 hours before the subsequent putty and painting system."],
            note: "Base the treatment height and extent on the affected area and moisture source. Active seepage, rising dampness and plumbing leaks may need additional corrective work.",
          },
          {
            title: "Bathroom & wet-area waterproofing", meta: "2 coats",
            text: "For bathroom floors and walls before tiling, covering all treatment areas including corners, floor-wall junctions and pipe penetrations.",
            steps: ["Clean the bathroom floor and wall surfaces.", "Remove dust, grease, loose particles and contaminants.", "Repair cracks, holes and defective junctions.", "Prepare the surface to SSD condition.", "Apply the first coat uniformly.", "Allow the first coat to reach the appropriate recoat condition.", "Apply the second coat for complete coverage.", "Allow approximately 36 hours before tiling, subject to curing and system compatibility."],
            note: "When estimating quantity, include the floor and all wall surfaces that need waterproofing.",
          },
          {
            title: "Terrace & roof waterproofing", meta: "1 coat + 1 coat Cool Coat",
            text: "The primary waterproofing layer for suitable concrete terraces and roofs.",
            steps: ["Clean the terrace and remove loose particles and contaminants.", "Repair cracks, defective joints and damaged concrete.", "Prepare the substrate to SSD condition.", "Mix Aqua Seal 2K in the prescribed ratio.", "Apply one uniform coat.", "Allow the waterproofing layer to dry and cure sufficiently.", "Apply one coat of Kerala Paints Cool Coat according to the compatible finishing-system instructions."],
            note: "Why is a Cool Coat required? Aqua Seal 2K should not be left exposed to direct sunlight as the final coat in this system. Cool Coat is the specified finishing layer.",
          },
          {
            title: "Concrete water tank waterproofing", meta: "2 coats",
            text: "For suitable concrete water tank surfaces as part of a waterproofing system.",
            steps: ["Empty and clean the tank.", "Remove loose particles and contaminants.", "Repair cracks, holes and defective joints.", "Prepare the surface to SSD condition.", "Apply the first coat.", "Allow suitable drying before recoating.", "Apply the second coat uniformly.", "Allow the system to cure adequately."],
            note: "Wait seven days before filling. For drinking-water tanks, verify potable-water suitability and certification before use.",
          },
          {
            title: "Swimming pool waterproofing", meta: "2 coats",
            text: "For suitable concrete swimming pool surfaces as part of a waterproofing system.",
            steps: ["Clean and prepare the concrete surface.", "Repair cracks, joints and surface defects.", "Bring the substrate to SSD condition.", "Apply the first coat.", "Allow suitable drying before recoating.", "Apply the second coat uniformly.", "Allow the coating to cure adequately."],
            note: "Follow the seven-day waiting period before filling, subject to compatibility with the final pool finishing system.",
          },
        ],
        links: [
          { label: "Kerala Paints Cool Coat", product: "cool-coat" },
          { label: "How to waterproof a terrace", href: "/blog/how-to-waterproof-a-terrace/" },
        ],
      },
      {
        id: "packs",
        heading: ["PACK SIZES", "AND PRICES"],
        table: {
          columns: ["Pack size", "Part A", "Part B", "Price"],
          rows: [
            ["3 kg combination pack", "1 kg", "2 kg", "₹792"],
            ["15 kg combination pack", "5 kg", "10 kg", "₹3,300"],
          ],
        },
        aside: {
          title: "Approximate material cost per sq. ft.",
          text: "Based on the 15 kg pack price of ₹3,300 and single-coat coverage of up to 150 sq. ft.: ₹3,300 ÷ 150 sq. ft. = ₹22 per sq. ft. for one coat.",
        },
        note: "This is an approximate Aqua Seal 2K material cost only. It excludes labour, surface repairs, Cool Coat, other finishing materials and site-specific expenses. Actual cost varies with coverage and application conditions; confirm current prices before purchase.",
      },
      {
        id: "mixing",
        heading: ["HOW TO MIX", "AQUA SEAL 2K"],
        intro: [
          "Aqua Seal 2K has two components that must be combined before application. The mixing ratio is 1 part Part A to 2 parts Part B by weight – for example, 1 kg of Part A acrylic polymer solution with 2 kg of Part B cementitious powder, for 3 kg of mixed material.",
        ],
        ordered: true,
        list: [
          "Use a clean mixing container free from dirt and contaminants.",
          "Pour the required quantity of Part A acrylic polymer solution into the container.",
          "Gradually add Part B cementitious powder while mixing.",
          "Maintain the prescribed 1:2 ratio by weight.",
          "Mix for approximately 3–5 minutes until uniform and lump-free.",
          "Allow the mixture to rest for approximately 5–10 minutes.",
          "Remix briefly before application.",
          "Use the mixture within approximately 45–60 minutes at 27°C.",
        ],
        aside: {
          title: "Important mixing instructions",
          items: [
            "Do not add extra water.",
            "Do not add cement or sand.",
            "Do not add other chemicals or additives.",
            "Prepare only the quantity that can be applied within the working time.",
            "Do not attempt to restore hardened material by adding water.",
          ],
        },
      },
      {
        id: "surface-preparation",
        heading: ["SURFACE PREPARATION", "BEFORE APPLYING"],
        intro: ["Proper surface preparation is an important step in the waterproofing process."],
        cardColumns: 1,
        cards: [
          { title: "Clean the surface", meta: "01", text: "Remove dust, dirt, grease, oil, loose cement, flaking paint and other contaminants that could interfere with application." },
          { title: "Repair surface defects", meta: "02", text: "Repair cracks, holes, damaged concrete and other defects using suitable repair materials before applying the waterproofing coating." },
          { title: "Allow new concrete or plaster to cure", meta: "03", text: "New concrete and plaster should complete the required curing period before waterproofing." },
          { title: "Pre-wet absorbent surfaces", meta: "04", text: "Moisten absorbent surfaces as specified in the application procedure." },
          { title: "Achieve Saturated Surface Dry (SSD) condition", meta: "05", text: "The surface should be adequately moistened but free from standing or pooled water." },
        ],
        aside: {
          title: "What does SSD mean?",
          text: "Saturated Surface Dry (SSD) means the substrate has absorbed sufficient moisture, while no free water remains on the surface. This is the required surface condition for Aqua Seal 2K application.",
        },
      },
      {
        id: "more-products",
        heading: ["EXPLORE", "FURTHER"],
        links: [
          { label: "Waterproofing products", href: "/products/" },
          { label: "Kerala Paints Cool Coat", product: "cool-coat" },
          { label: "How to waterproof a terrace", href: "/blog/how-to-waterproof-a-terrace/" },
          { label: "Get waterproofing guidance", href: "/#enquiry" },
        ],
      },
    ],
    faqs: [
      { question: "What is Kerala Paints Aqua Seal 2K?", answer: "Kerala Paints Aqua Seal 2K is a two-component, polymer-modified flexible cementitious waterproofing system designed to help prevent water penetration through suitable concrete and masonry surfaces." },
      { question: "What is the mixing ratio of Aqua Seal 2K?", answer: "The mixing ratio is one part Part A acrylic polymer solution to two parts Part B cementitious powder by weight. For example, mix 1 kg of Part A with 2 kg of Part B. Do not add extra water, cement, sand or other additives." },
      { question: "How much area does Aqua Seal 2K cover?", answer: "Aqua Seal 2K has an approximate coverage of 10 sq. ft. per kg per coat. A 15 kg pack covers up to 150 sq. ft. for one coat and approximately 80 sq. ft. for two coats, depending on surface and application conditions." },
      { question: "Can Aqua Seal 2K be used for bathroom waterproofing?", answer: "Yes. Aqua Seal 2K can be used for suitable bathroom floors and walls before tiling. The recommended application consists of two coats, with particular attention to corners, floor-wall junctions and pipe penetrations." },
      { question: "Can Aqua Seal 2K be used on a terrace?", answer: "Yes. For the specified exposed terrace system, apply one coat of Aqua Seal 2K followed by one coat of Kerala Paints Cool Coat. Aqua Seal 2K should not be left exposed to direct sunlight as the final coating in this system." },
      { question: "Can Aqua Seal 2K be used to treat damp walls?", answer: "Yes. Aqua Seal 2K can form part of a suitable damp-wall treatment system. Remove affected coatings, prepare the surface and address the source of moisture wherever possible before application." },
      { question: "Is Aqua Seal 2K suitable for water tanks and swimming pools?", answer: "Aqua Seal 2K can be used on suitable concrete water tank and swimming pool surfaces. The recommended application is two coats, followed by the prescribed curing period. For drinking-water tanks, verify potable-water suitability and certification before use." },
      { question: "What pack sizes are available?", answer: "Aqua Seal 2K is available in 3 kg and 15 kg combination packs. The 3 kg pack contains 1 kg of Part A and 2 kg of Part B. The 15 kg pack contains 5 kg of Part A and 10 kg of Part B." },
      { question: "What is the price of Aqua Seal 2K?", answer: "The listed prices are ₹792 for the 3 kg combination pack and ₹3,300 for the 15 kg combination pack. Confirm current prices before purchase." },
      { question: "Does Aqua Seal 2K come with a warranty?", answer: "Aqua Seal 2K offers application-specific five-year warranty coverage, extendable up to ten years for qualifying systems. The extension depends on the prescribed Cool Coat application and maintenance requirements and the applicable warranty terms." },
      { question: "How long can the mixed product be used?", answer: "The working time is approximately 45–60 minutes at 27°C. Temperature and site conditions can affect working time, so prepare only the amount that can be applied within the recommended period." },
      { question: "What does SSD mean in waterproofing?", answer: "SSD stands for Saturated Surface Dry. It means the surface is adequately moistened but has no standing or pooled water when the waterproofing coating is applied." },
      { question: "Is Aqua Seal 2K a waterproof paint?", answer: "Aqua Seal 2K is a two-component cementitious waterproofing coating, not a conventional decorative paint. It is intended for suitable concrete and masonry waterproofing applications and must be used according to the recommended application system." },
      { question: "Can ordinary paint waterproof a wall?", answer: "Ordinary decorative paint should not automatically be treated as a waterproofing solution. The right product depends on the surface and source of moisture. A dedicated waterproofing system may be needed, and active leaks or structural moisture problems may require separate repairs." },
      { question: "What should I check when choosing a paint waterproofer?", answer: "Check the intended surface, moisture exposure, preparation requirements, application method, number of coats and compatible finishing system. Choose a product designed for the particular application and follow its technical instructions." },
    ],
    cta: {
      heading: ["NEED HELP CHOOSING THE RIGHT", "WATERPROOFING SYSTEM?"],
      body: "Choosing a waterproofing system depends on the surface, moisture exposure and intended application. Aqua Seal 2K suits foundation, basement, damp-wall, bathroom, terrace, roof, water tank and swimming pool applications. Read our terrace guide, or contact Kerala Paints for guidance on the right system for your project.",
      link: { label: "How to waterproof a terrace", href: "/blog/how-to-waterproof-a-terrace/" },
      button: "Enquire about Aqua Seal 2K",
    },
  },
  // From COOL COAT SEO CONTENT (supplied by Kerala Paints).
  "cool-coat": {
    slug: "cool-coat",
    name: "Cool Coat",
    headline: "Heat-Reflective Roof Coating",
    brandInTitle: true,
    lede: "A cooler roof. Less heat transfer. Better protection.",
    category: "Heat-reflective roof coating (thermostat emulsion)",
    seoTitle: "Cool Coat Roof Coating for Heat Reduction | Kerala Paints",
    seoDescription: "Discover Kerala Paints Cool Coat, a heat-reflective roof coating for concrete terraces. It helps cut solar heat absorption and heat transfer.",
    keywords: ["Cool Coat roof coating", "Kerala Paints Cool Coat", "heat reflective roof coating", "roof heat reduction coating", "thermostat emulsion for roof", "heat reflective coating for concrete roof", "roof coating to reduce heat", "terrace heat reduction coating", "concrete roof heat protection", "solar heat reflective coating"],
    inspiration: { label: "The banyan tree", body: "The banyan spreads its canopy wide, giving shade and cool air whatever the season. Cool Coat brings that shelter to your roof, turning back the sun’s heat before it soaks into the slab." },
    overview: [
      "Kerala Paints Cool Coat is a thermostat emulsion and heat-reflective roof coating designed to reduce solar heat absorption on concrete terraces. By reflecting incoming solar radiation, it helps lower roof surface temperatures and limit heat transfer into indoor spaces. Actual performance depends on sunlight, roof construction, surface condition and environmental factors.",
      "Ready to use, Cool Coat can be applied using a suitable brush or roller. Apply two even coats across the terrace, including parapets, corners and edges.",
      "It comes with a three-year standard warranty, extendable up to five years by applying an additional coat in the third year, subject to warranty terms and conditions.",
    ],
    highlights: [
      { icon: "sun", title: "Solar heat-reflective technology", text: "Reflects some incoming sunlight, reducing the heat a concrete terrace absorbs in direct sun." },
      { icon: "thermo", title: "Reduces roof surface heating", text: "Designed to reduce excessive heating on concrete terraces; results depend on the roof, sunlight and conditions." },
      { icon: "home", title: "Limits heat transfer into rooms", text: "Less roof heating means less heat passing through the slab into the rooms below." },
      { icon: "air", title: "Supports indoor comfort", text: "Manages roof heating rather than cooling indoor air; results vary with the building and weather." },
      { icon: "layers", title: "Moderates thermal stress", text: "May help limit temperature swings in the concrete. It does not repair existing cracks." },
      { icon: "shield", title: "Protective roof coating", text: "An added protective coat, and the specified finish for the Aqua Seal 2K terrace system." },
      { icon: "mix", title: "Ready to use", text: "Stir gently by hand. No water, additives or mechanical mixer." },
      { icon: "brush", title: "Brush or roller", text: "Apply uniformly with a suitable brush or roller. Spray is not recommended." },
      { icon: "badge", title: "3-year warranty, up to 5", text: "Extendable to five years with the prescribed additional coat in the third year, subject to terms." },
    ],
    specs: [
      { label: "Product category", value: "Thermostat emulsion" },
      { label: "Product type", value: "Heat-reflective protective roof coating" },
      { label: "Primary function", value: "Roof heat reduction and surface protection" },
      { label: "Recommended substrate", value: "Concrete terraces and roofs" },
      { label: "Coverage", value: "Approximately 50 sq. ft. per litre per coat*" },
      { label: "Standalone application", value: "Two coats" },
      { label: "Two-coat coverage", value: "Approximately 25 sq. ft. per litre*" },
      { label: "Dilution", value: "No water required" },
      { label: "Preparation", value: "Gentle manual stirring" },
      { label: "Application method", value: "Brush or roller" },
      { label: "Spray application", value: "Not recommended" },
      { label: "Surface preparation", value: "Clean, repaired and SSD, as specified" },
      { label: "Recoat interval", value: "Approximately 2–3 hours, subject to drying conditions*" },
      { label: "Pack sizes", value: "4 L, 10 L & 20 L" },
      { label: "Standard warranty", value: "3 years" },
      { label: "Extended warranty", value: "Up to 5 years, with the prescribed additional coat in the third year, subject to conditions" },
    ],
    surfaces: ["Residential concrete terraces", "Commercial concrete roofs", "Flat concrete roof slabs", "Exposed RCC terraces", "Aqua Seal 2K terrace systems"],
    surfacesNote: "The concrete should be sound, clean and free from loose particles, grease and dirt, with cracks, damaged concrete and defective joints repaired before coating. Cool Coat is not a substitute for dedicated waterproofing where there is active leakage or significant waterproofing defects.",
    steps: [
      { title: "Clean & inspect", text: "Remove dust, dirt, grease, loose cement and flaking coatings – a jet wash may be used. Check for cracks, holes and defective joints." },
      { title: "Repair defects", text: "Repair cracks, holes, damaged concrete and joints. Where there is active leakage, carry out waterproofing first." },
      { title: "Bring to SSD", text: "Moisten the surface to Saturated Surface Dry: adequately wet, with no standing or pooled water." },
      { title: "Prepare Cool Coat", text: "Stir gently by hand until uniform. Do not add water or other materials, and do not use a mechanical mixer." },
      { title: "First coat", text: "Apply a uniform coat by brush or roller over the whole continuous terrace, including parapets, corners and edges." },
      { title: "Second coat", text: "After about 2–3 hours, once the first coat has dried, apply the second coat uniformly." },
    ],
    sections: [
      {
        id: "quantity",
        heading: ["HOW MUCH COOL COAT", "DO YOU NEED?"],
        cardColumns: 3,
        intro: ["Cool Coat covers approximately 50 sq. ft. per litre per coat – about 25 sq. ft. per litre for the recommended two coats. Required litres = total area ÷ two-coat coverage per litre."],
        cards: [
          { title: "One coat", meta: "≈ 50 sq. ft. / litre", text: "Approximate coverage for a single coat." },
          { title: "Two coats", meta: "≈ 25 sq. ft. / litre", text: "The recommended standalone application." },
          { title: "A 500 sq. ft. terrace", meta: "≈ 20 litres", text: "500 ÷ 25 = about 20 litres for two coats." },
        ],
        note: "A preliminary estimate. Measure the full area to be coated, including parapets, corners and edges; actual use varies with surface texture, application thickness and material losses.",
      },
      {
        id: "whole-terrace",
        heading: ["WHY COAT THE", "ENTIRE TERRACE?"],
        intro: [
          "Untreated sections of a continuous concrete roof may keep absorbing solar energy and transferring heat through the slab. Include the main terrace, parapets, corners, edges and other connected areas specified in the application system.",
          "Complete terrace coverage is also a stated condition of the Cool Coat warranty guidance. Follow the applicable written warranty terms.",
        ],
      },
      {
        id: "with-aqua-seal-2k",
        heading: ["COOL COAT WITH", "AQUA SEAL 2K"],
        intro: ["For terraces that need both waterproofing and heat reduction, Cool Coat is the specified finishing layer in the compatible Kerala Paints Aqua Seal 2K terrace system."],
        cards: [
          { title: "Aqua Seal 2K", meta: "1 coat", text: "The primary waterproofing layer in the specified system." },
          { title: "Cool Coat", meta: "1 coat", text: "The specified protective finishing layer." },
        ],
        ordered: true,
        list: [
          "Inspect and prepare the terrace.",
          "Repair cracks, joints and surface defects.",
          "Prepare the substrate as specified.",
          "Apply one coat of Aqua Seal 2K.",
          "Allow appropriate drying and curing.",
          "Apply one coat of Cool Coat as the finishing layer.",
        ],
        note: "This differs from the standalone two-coat Cool Coat application. Follow the instructions for the system you choose rather than swapping one schedule for the other.",
        link: { label: "Aqua Seal 2K waterproofing", product: "aqua-seal" },
      },
      {
        id: "maintenance",
        heading: ["HOW TO MAINTAIN", "COOL COAT"],
        list: [
          "Remove leaves and debris regularly.",
          "Prevent excessive dust and dirt from building up.",
          "Clean the surface periodically, washing gently with water when needed.",
          "Avoid aggressive cleaning methods that may damage the coating.",
          "Inspect the coating for wear, damage or deterioration.",
          "Follow the applicable maintenance and warranty conditions.",
        ],
      },
    ],
    faqs: [
      { question: "What is Kerala Paints Cool Coat?", answer: "Kerala Paints Cool Coat is a thermostat emulsion and heat-reflective protective roof coating designed to reduce solar heat absorption on concrete terraces exposed to direct sunlight." },
      { question: "Does Cool Coat help reduce heat inside a house?", answer: "It helps reduce roof surface heating, which can limit heat transfer through the concrete slab into rooms below. The actual effect depends on roof construction, insulation, ventilation, weather and other building conditions." },
      { question: "Is Cool Coat a waterproofing product?", answer: "Cool Coat is primarily intended for roof heat reduction and surface protection. It does not replace dedicated waterproofing treatment for active leakage or significant waterproofing defects. It can serve as the specified finishing coat in compatible systems such as the Aqua Seal 2K terrace system." },
      { question: "How many coats of Cool Coat are required?", answer: "Two uniform coats are recommended for standalone heat-reduction application. The compatible Aqua Seal 2K terrace system uses a different schedule: one coat of Aqua Seal 2K followed by one coat of Cool Coat." },
      { question: "What is the coverage of Cool Coat?", answer: "Approximate coverage is 50 sq. ft. per litre per coat, or 25 sq. ft. per litre for two coats. Actual coverage depends on surface and application conditions." },
      { question: "Can Cool Coat be diluted with water?", answer: "No. Cool Coat is ready to use. Gently stir it manually before application and do not add water or other materials." },
      { question: "Can Cool Coat be applied using a spray machine?", answer: "Spray application is not recommended. Use a suitable brush or roller." },
      { question: "How long should I wait before applying the second coat?", answer: "The approximate recoat interval is 2–3 hours, provided the first coat has dried sufficiently. Actual drying time varies with weather, humidity and surface conditions." },
      { question: "What pack sizes are available?", answer: "Cool Coat is available in 4 L, 10 L and 20 L pack sizes." },
      { question: "What warranty does Cool Coat offer?", answer: "Cool Coat has a three-year standard warranty, extendable up to five years through the prescribed additional coat in the third year, subject to applicable terms. Complete coating of the continuous terrace, including parapet surfaces, is a stated warranty condition." },
      { question: "Can Cool Coat be used with Aqua Seal 2K?", answer: "Yes. It can serve as the specified finishing coat in the compatible Aqua Seal 2K terrace system. Follow the prescribed application sequence and drying and curing instructions." },
      { question: "What surface preparation is required?", answer: "The surface should be clean, sound and repaired, with contaminants removed. The specified substrate condition is SSD, meaning adequately moistened without standing or pooled water." },
    ],
    cta: { heading: ["NEED HELP CHOOSING", "A ROOF COATING?"], body: "Contact Kerala Paints for product guidance on the right roof coating for your terrace." },
  },
  "floor-coat": {
    slug: "tile-floor-coat",
    name: "Tile & Floor Coat",
    category: "Floor and tile coating",
    seoTitle: "Tile & Floor Coat — Glossy Floor Paint | Kerala Paints",
    seoDescription: "Kerala Paints Tile & Floor Coat gives floors strength, shine and vibrant colour while protecting them for years. Ideal for verandas, courtyards and more.",
    keywords: ["floor paint", "tile coat", "floor coating Kerala", "veranda floor paint", "glossy floor paint", "Kerala Paints"],
    inspiration: { label: "The ladybug", body: "A ladybug’s shell is bright, glossy and remarkably tough. Tile & Floor Coat gives the surfaces you walk on every day that same blend of colour, shine and strength." },
    overview: [
      "Tile & Floor Coat brings tired floors back to life with a glossy, vibrant finish that stands up to daily footsteps.",
      "It protects the surface beneath while staying easy to keep clean, so verandas, courtyards and walkways look cared for, year after year.",
    ],
    highlights: [
      { icon: "shield", title: "Tough wear", text: "Stands up to everyday foot traffic." },
      { icon: "sparkle", title: "Glossy shine", text: "A bright finish with vibrant colour." },
      { icon: "drop", title: "Easy to clean", text: "Sweep and mop to keep it looking new." },
      { icon: "layers", title: "Renews old floors", text: "Gives tired surfaces a fresh, even look." },
    ],
    specs: [
      { label: "Product type", value: "Floor and tile coating" },
      { label: "Finish", value: "Glossy" },
      { label: "Recommended for", value: "Cement floors, verandas, courtyards and tiled surfaces" },
      { label: "Application", value: "Brush or roller" },
      { label: "Recommended coats", value: "Two coats" },
      { label: "Ready for use", value: "After full drying, as directed on the pack" },
    ],
    surfaces: ["Verandas", "Courtyards", "Cement floors", "Car porches", "Walkways", "Tiled surfaces"],
    steps: [
      { title: "Clean", text: "Remove dust, oil, grease and any loose coating from the floor." },
      { title: "Dry", text: "Make sure the surface is completely dry before you start." },
      { title: "Coat", text: "Apply the first coat evenly, working away from the exit." },
      { title: "Finish", text: "Apply the second coat once dry, and keep off it until fully cured." },
    ],
    faqs: [
      { question: "How soon can I walk on the floor?", answer: "Allow the coating to dry and cure fully, as directed on the pack, before regular foot traffic." },
      { question: "Can I use it on an old floor?", answer: "Yes, as long as the floor is sound, clean and free of oil, grease and loose material." },
      { question: "How do I keep the floor shining?", answer: "Sweep regularly and mop with plain water or a mild cleaner. Avoid harsh abrasive cleaners." },
    ],
  },
  enamel: {
    slug: "enamel-paint",
    name: "Kerala Paints Enamels",
    category: "Enamel paint for wood and metal",
    seoTitle: "Enamel Paint for Wood & Metal | Kerala Paints",
    seoDescription: "Kerala Paints Enamels add lasting colour, glossy beauty and strong protection to doors, windows, grills, gates and furniture, on wood and metal alike.",
    keywords: ["enamel paint", "wood paint", "metal paint", "gloss enamel", "paint for grills and gates", "Kerala Paints"],
    inspiration: { label: "The butterfly", body: "A butterfly’s wings carry the brightest colours in the garden, with a sheen that catches every ray of light. Our Enamels bring that brilliance to the wood and metal around your home." },
    overview: [
      "Kerala Paints Enamels give doors, windows, grills and furniture a deep, glossy finish in vibrant, lasting colour.",
      "The hard film protects wood and metal from everyday knocks and the weather, so the details of your home look as good as its walls.",
    ],
    highlights: [
      { icon: "sparkle", title: "Vibrant colour", text: "Rich shades that stay bright." },
      { icon: "layers", title: "High-gloss finish", text: "A deep, mirror-like sheen." },
      { icon: "shield", title: "Strong protection", text: "A hard film for wood and metal surfaces." },
      { icon: "brush", title: "Smooth to apply", text: "Flows out evenly for a clean finish." },
    ],
    specs: [
      { label: "Product type", value: "Enamel paint" },
      { label: "Finish", value: "Glossy" },
      { label: "Recommended for", value: "Wood and metal: doors, windows, grills, gates and furniture" },
      { label: "Primer", value: "A suitable wood or metal primer" },
      { label: "Thinning", value: "As directed on the pack" },
      { label: "Application", value: "Brush, roller or spray" },
      { label: "Recommended coats", value: "Two coats" },
    ],
    surfaces: ["Doors", "Windows", "Grills & gates", "Railings", "Furniture", "Metal fixtures"],
    steps: [
      { title: "Prepare", text: "Sand the surface, removing rust, old flaking paint and grease." },
      { title: "Prime", text: "Apply a suitable wood or metal primer and let it dry." },
      { title: "Paint", text: "Stir well and apply the first coat in thin, even strokes." },
      { title: "Finish", text: "Lightly sand when dry, then apply the second coat for full gloss." },
    ],
    faqs: [
      { question: "Can enamel be used on both wood and metal?", answer: "Yes. With the right primer underneath, our Enamels give a glossy, protective finish on both wood and metal." },
      { question: "Should I sand between coats?", answer: "A light sanding between coats gives better adhesion and a smoother final finish." },
      { question: "How do I stop rust showing through on metal?", answer: "Remove all rust and loose paint, then apply a metal primer before the enamel." },
    ],
  },
  "2k-coating": {
    slug: "damp-proof-coating",
    name: "Tough Seal",
    category: "Damp-proof coating",
    seoTitle: "Tough Seal Damp-Proof Wall Coating | Kerala Paints",
    seoDescription: "Tough Seal from Kerala Paints forms a watertight barrier that keeps dampness out and walls dry, protecting your paint from peeling and patches.",
    keywords: ["damp proof paint", "damp wall solution", "anti damp coating", "seepage proof coating", "Tough Seal", "Kerala Paints"],
    inspiration: { label: "The cactus", body: "A cactus holds on to every drop of water and never lets it escape. Tough Seal turns that idea around: a watertight barrier that keeps moisture out of your walls for good." },
    overview: [
      "Tough Seal is our damp-proof coating for walls troubled by moisture and seepage.",
      "It forms a watertight barrier that keeps dampness out, helping to prevent damp patches, peeling paint and the musty smell that comes with them.",
    ],
    highlights: [
      { icon: "drop", title: "Blocks dampness", text: "Keeps moisture from working through the wall." },
      { icon: "shield", title: "Watertight barrier", text: "A tough seal that lasts." },
      { icon: "home", title: "Protects your finish", text: "Helps stop peeling, bubbling and patches." },
      { icon: "leaf", title: "Healthier rooms", text: "Drier walls for fresher indoor spaces." },
    ],
    specs: [
      { label: "Product type", value: "Damp-proof coating" },
      { label: "Recommended for", value: "Walls prone to dampness and seepage" },
      { label: "Mixing", value: "Mix thoroughly as directed on the pack" },
      { label: "Application", value: "Brush or roller" },
      { label: "Recommended coats", value: "As directed on the pack" },
    ],
    surfaces: ["Damp walls", "Ground-floor walls", "Bathroom walls", "Kitchen walls", "Basements", "Exterior walls"],
    steps: [
      { title: "Find the source", text: "Fix leaking pipes, cracks or gaps that let water in." },
      { title: "Prepare", text: "Scrape off damaged paint and plaster, clean and let the wall dry." },
      { title: "Seal", text: "Mix as directed and apply Tough Seal evenly across the area." },
      { title: "Finish", text: "Apply further coats as directed, then your chosen finish." },
    ],
    faqs: [
      { question: "What causes damp patches on walls?", answer: "Moisture from rain, plumbing leaks or water rising from the ground can soak into walls and show up as patches, peeling or a musty smell." },
      { question: "Should I fix leaks before applying Tough Seal?", answer: "Yes. Find and fix the source of the water, and let the wall dry, before applying Tough Seal." },
      { question: "Will Tough Seal stop my paint peeling?", answer: "Dampness is a common cause of peeling and blistering paint. By keeping moisture out, Tough Seal helps your finish coats stay in place." },
    ],
  },
  // From PRIME GOLD – PRODUCT PAGE SEO CONTENT (supplied by Kerala Paints). Not a range category: data/products moreProducts.
  "prime-gold": {
    slug: "prime-gold",
    name: "Prime Gold",
    fullName: "Prime Gold Interior & Exterior Wall Primer",
    headline: "Interior & Exterior Wall Primer",
    brandInTitle: true,
    lede: "Stronger bonding. Smoother walls. A better foundation for every finish.",
    category: "Interior and exterior wall primer",
    seoTitle: "Prime Gold Interior & Exterior Primer | Kerala Paints",
    seoDescription: "Explore Kerala Paints Prime Gold, a water-based interior and exterior wall primer designed to support adhesion and create a smooth base for emulsion paint.",
    keywords: ["interior and exterior wall primer", "Kerala Paints Prime Gold", "water-based wall primer", "interior wall primer", "exterior wall primer", "wall primer for masonry", "wall primer before emulsion paint", "primer for cement plaster walls"],
    inspiration: { label: "Deep roots", body: "Before a tree can rise, its roots must take hold of the earth. Prime Gold gives every finish that same grip: a firm, even foundation the colour above can hold on to." },
    overview: [
      "Kerala Paints Prime Gold is a water-based wall primer developed to prepare interior and exterior masonry surfaces for decorative emulsion painting.",
      "Formulated to provide good surface penetration, high intercoat holding capacity and minor pore-filling performance, Prime Gold helps establish a smooth and uniform foundation for compatible topcoats.",
      "Its primer formulation helps support the bonding of subsequent decorative coatings while reducing the visibility of minor pores and surface imperfections. Suitable for residential and commercial projects, it prepares walls for a consistent finish with appropriate surface preparation and compatible Kerala Paints emulsions.",
    ],
    highlights: [
      { icon: "home", title: "Interior & exterior walls", text: "For properly prepared interior and exterior masonry in residential and commercial projects." },
      { icon: "layers", title: "Good surface penetration", text: "Penetrates suitable masonry to establish a foundation for the coats above." },
      { icon: "shield", title: "High intercoat holding", text: "Supports adhesion of compatible emulsion topcoats, with correct preparation." },
      { icon: "brush", title: "Fills minor pores", text: "Helps fill minor pores and irregularities. It does not replace wall putty or repairs." },
      { icon: "sparkle", title: "Smooth, uniform base", text: "A consistent base that supports the application and look of the final coat." },
      { icon: "badge", title: "Part of a full system", text: "Outside, finish with a compatible weather-resistant exterior emulsion." },
      { icon: "drop", title: "Efficient coverage", text: "Approximately 140–150 sq. ft. per litre per coat in recommended conditions." },
      { icon: "mix", title: "Two-coat primer system", text: "Recommended in two coats over properly prepared masonry." },
    ],
    specs: [
      { label: "Product category", value: "Interior & exterior wall primer" },
      { label: "Product type", value: "Water-based masonry primer" },
      { label: "Recommended use", value: "Interior and exterior masonry walls" },
      { label: "Primary function", value: "Surface preparation and priming" },
      { label: "Surface penetration", value: "Good surface penetration" },
      { label: "Intercoat performance", value: "High intercoat holding capacity" },
      { label: "Surface filling", value: "Minor pores and surface imperfections" },
      { label: "Finish", value: "Smooth primer base" },
      { label: "Coverage", value: "Approximately 140–150 sq. ft. per litre per coat*" },
      { label: "Recommended coats", value: "2 coats" },
      { label: "Touch-dry time", value: "Approximately 3 hours*" },
      { label: "Recoat time", value: "6 hours*" },
      { label: "Application", value: "Brush, roller or suitable spray equipment" },
      { label: "Pack sizes", value: "1 L, 4 L, 10 L & 20 L" },
      { label: "Suitable surfaces", value: "Cement-plastered walls, suitable concrete, interior masonry ceilings and prepared previously painted masonry" },
      { label: "Recommended finishing", value: "Compatible interior or exterior emulsion" },
      // Dilution is left out: the brief marks it HOLD until Kerala Paints confirms the approved value.
    ],
    surfaces: ["Bedrooms", "Living rooms", "Dining rooms", "Kitchens", "Halls & corridors", "Offices", "Exterior walls", "Building facades", "Exterior corridors", "Masonry columns"],
    surfacesNote: "The substrate should be structurally sound, clean, adequately dry and free from contaminants before primer application.",
    steps: [
      { title: "Prepare the surface", text: "Remove loose or flaking paint, dust, dirt, grease, oil and loose particles. Clean off fungal, algal or moss growth and let the wall dry." },
      { title: "Treat problems first", text: "Fix the source of dampness – with Aqua Seal 2K where appropriate – use Salt Block on chalky surfaces, and repair significant defects with Ultra White Putty inside or Waterproof Putty outside." },
      { title: "First coat", text: "Mix thoroughly, follow the approved dilution with clean water only where permitted, and apply uniformly by brush, roller or spray." },
      { title: "Second coat", text: "After the recoat interval of about six hours, apply the second coat." },
      { title: "Emulsion topcoat", text: "Finish with a compatible Kerala Paints interior emulsion, or a weather-resistant exterior emulsion outside." },
    ],
    sections: [
      {
        id: "painting-systems",
        heading: ["RECOMMENDED", "PAINTING SYSTEMS"],
        cardColumns: 1,
        cards: [
          { title: "New interior wall", meta: "Interior", text: "Surface preparation → repair cracks and holes where required → Ultra White Putty where required → two coats of Prime Gold → compatible interior emulsion." },
          { title: "New exterior wall", meta: "Exterior", text: "Surface preparation → repair cracks and holes where required → Waterproof Putty where required → two coats of Prime Gold → compatible exterior emulsion." },
          { title: "Previously painted walls", meta: "Repainting", text: "Inspect → remove loose paint and contaminants → address dampness or chalkiness → repair and prepare → recommended primer coats → compatible emulsion." },
        ],
        note: "The exact preparation and coating requirements depend on the surface condition and the approved painting system.",
      },
      {
        id: "more-products",
        heading: ["EXPLORE MORE", "KERALA PAINTS PRODUCTS"],
        links: [
          { label: "Kerala Paints Prime Platinum", product: "prime-platinum" },
          { label: "Kerala Paints Ultra White Putty", product: "ultra-white-putty" },
          { label: "Kerala Paints Waterproof Putty", product: "waterproof-putty" },
          { label: "Aqua Seal 2K waterproofing", product: "aqua-seal" },
          { label: "Explore interior emulsion paints", product: "bhadram-in" },
          { label: "Explore exterior emulsion paints", product: "gold-ex" },
        ],
      },
    ],
    faqs: [
      { question: "What is Kerala Paints Prime Gold used for?", answer: "Prime Gold is a water-based primer designed to prepare suitable interior and exterior masonry walls before applying compatible emulsion paint." },
      { question: "Can Prime Gold be used on both interior and exterior walls?", answer: "Yes. It is designed for suitable interior and exterior masonry applications. Choose a compatible finishing emulsion for the intended application." },
      { question: "How many coats of Prime Gold are recommended?", answer: "A two-coat primer system is recommended over properly prepared masonry surfaces. Follow the approved application instructions." },
      { question: "What is the coverage of Prime Gold?", answer: "The approximate coverage is 140–150 sq. ft. per litre per coat. Actual coverage varies with surface porosity, texture, preparation and application method." },
      { question: "Does Prime Gold replace wall putty?", answer: "No. Prime Gold helps fill minor pores and imperfections, but it does not replace putty or repair materials needed for significant cracks, holes and uneven surfaces." },
      { question: "Can Prime Gold be used before emulsion paint?", answer: "Yes. It is intended to prepare suitable masonry surfaces for compatible interior and exterior emulsion topcoats." },
      { question: "How long does Prime Gold take to dry?", answer: "The touch-dry time is approximately three hours and the recoat time is approximately six hours. Actual drying time varies with weather and surface conditions." },
      { question: "Can Prime Gold be applied to a damp wall?", answer: "Address the underlying moisture problem before applying primer. Proceed only when the surface meets the approved product application requirements." },
      { question: "Which finishing paint should be used over Prime Gold?", answer: "Use a compatible Kerala Paints interior emulsion for interior walls or a suitable weather-resistant exterior emulsion for exterior walls." },
    ],
    cta: { heading: ["PREPARE YOUR WALLS", "FOR A BETTER FINISH"], body: "Prepare your walls for a better finish with Kerala Paints Prime Gold. Ask us which primer suits your project." },
  },
  // From ULTRA WHITE PUTTY SEO CONTENT (supplied by Kerala Paints). Not a range category: data/products moreProducts.
  "ultra-white-putty": {
    slug: "ultra-white-putty",
    name: "Ultra White Putty",
    fullName: "Ultra White Putty Interior Wall Putty",
    headline: "Premium Interior Wall Putty",
    brandInTitle: true,
    lede: "A smooth, bright foundation for beautiful interior walls.",
    category: "Interior wall putty",
    seoTitle: "Ultra White Putty for Interior Walls | Kerala Paints",
    seoDescription: "Discover Kerala Paints Ultra White Putty for smooth interior wall finishing. Create a bright, uniform base before applying primer and emulsion.",
    keywords: ["Ultra White Putty", "ultra-white wall putty", "interior wall putty", "white wall putty for interior walls", "wall putty for smooth finish", "wall putty for pinholes", "wall putty before primer", "wall putty for ceilings"],
    inspiration: { label: "The pearl", body: "A pearl grows layer by smooth layer around the smallest grain, until nothing rough remains. Ultra White Putty prepares your walls the same way: thin, even coats for a bright, flawless base." },
    overview: [
      "A beautiful interior paint finish begins with a properly prepared wall. Minor pores, pinholes and uneven surfaces can affect the final appearance, so choosing the right interior wall putty is essential.",
      "Kerala Paints Ultra White Putty is a premium interior wall putty developed for smooth and uniform wall preparation. Its ultra-white appearance creates a bright foundation for decorative painting.",
      "It helps fill minor surface imperfections on properly prepared masonry walls and suitable ceilings, supporting a refined finish before compatible primers and decorative emulsions. It suits residential and commercial interiors, in new construction and renovation.",
    ],
    highlights: [
      { icon: "sparkle", title: "Ultra-white base", text: "A bright, consistent foundation for the interior colours above." },
      { icon: "brush", title: "Smooth wall finishing", text: "Helps create a smoother, more uniform surface before priming." },
      { icon: "drop", title: "Fills pores & pinholes", text: "Addresses small superficial imperfections on prepared plaster." },
      { icon: "layers", title: "Improved levelling", text: "Helps correct minor unevenness for a more consistent foundation." },
      { icon: "shield", title: "Part of a full system", text: "Made to go under compatible Kerala Paints interior primers and emulsions." },
      { icon: "home", title: "Walls & ceilings", text: "For prepared interior masonry walls and compatible ceilings. Not for exteriors." },
    ],
    specs: [
      { label: "Product category", value: "Premium interior wall putty" },
      { label: "Recommended use", value: "Interior masonry walls and suitable ceilings" },
      { label: "Primary function", value: "Surface levelling, pore filling and smooth preparation" },
      { label: "Appearance", value: "Ultra-white" },
      { label: "Finish", value: "Smooth white putty base" },
      { label: "Surface filling", value: "Minor pores, pinholes and superficial imperfections" },
      { label: "Recommended coats", value: "2 thin coats for new walls" },
      { label: "Application", value: "Putty blade or stainless-steel trowel" },
      { label: "Substrates", value: "Cement-plastered interior walls, suitable interior concrete and compatible masonry" },
      { label: "Finishing system", value: "Compatible Kerala Paints interior primer and emulsion" },
      { label: "Exterior application", value: "Not recommended" },
      // Pack sizes, coverage, mixing and drying times are left out: the brief does not state them.
    ],
    surfaces: ["Bedrooms", "Living rooms", "Dining rooms", "Halls & corridors", "Office interiors", "Commercial interiors", "Interior ceilings"],
    surfacesNote: "For interior use only. For exterior walls, use Kerala Paints Waterproof Putty.",
    steps: [
      { title: "Inspect & clean", text: "Remove dust, grease, loose paint, unstable plaster and fungal growth. The surface must be clean and sound." },
      { title: "Treat dampness", text: "Resolve any damp patches or seepage at the source – with Aqua Seal 2K where recommended – before applying putty." },
      { title: "Repair damage", text: "Repair significant cracks, holes and damaged plaster with suitable materials. Use Salt Block on persistent chalky surfaces." },
      { title: "Prepare the putty", text: "Mix as the approved instructions direct, adding only the specified clean water if supplied as powder. Never guess the ratio." },
      { title: "First coat", text: "Apply a thin, even coat with a putty blade or steel trowel, filling pores and pinholes, then let it dry." },
      { title: "Second coat", text: "Once at the approved recoat condition, apply a second thin coat. Avoid excessive thickness." },
      { title: "Finish & dust off", text: "After drying, finish the surface as recommended and remove all sanding dust." },
      { title: "Primer & emulsion", text: "Apply a compatible Kerala Paints interior primer – Prime Silver, Prime Gold or Prime Platinum – then an interior emulsion." },
    ],
    sections: [
      {
        id: "painting-system",
        heading: ["RECOMMENDED INTERIOR", "PAINTING SYSTEM"],
        cardColumns: 1,
        cards: [
          { title: "New interior walls", meta: "New construction", text: "Inspect → clean → treat moisture where needed → repair defects → two thin coats of Ultra White Putty → finish → remove dust → compatible interior primer → interior emulsion." },
          { title: "Existing painted walls", meta: "Renovation", text: "Inspect → clean → remove loose coatings → repair defects → Ultra White Putty where required → finish → compatible interior primer → interior emulsion." },
        ],
        note: "Always follow the latest product label and approved technical data sheet.",
      },
      {
        id: "quantity",
        heading: ["COVERAGE AND", "MATERIAL QUANTITY"],
        intro: [
          "Material needs depend on the actual paintable area, how rough the surface is, the approved consumption rate and the number of coats.",
          "For an accurate quantity estimate, contact Kerala Paints for approved technical data. Work out primer and emulsion quantities separately.",
        ],
      },
      {
        id: "more-products",
        heading: ["EXPLORE MORE", "KERALA PAINTS PRODUCTS"],
        links: [
          { label: "Kerala Paints Prime Gold", product: "prime-gold" },
          { label: "Kerala Paints Prime Platinum", product: "prime-platinum" },
          { label: "Interior emulsion paints", product: "bhadram-in" },
          { label: "Aqua Seal 2K for dampness", product: "aqua-seal" },
          { label: "Waterproof Putty for exteriors", product: "waterproof-putty" },
        ],
      },
    ],
    faqs: [
      { question: "What is Kerala Paints Ultra White Putty?", answer: "It is a premium interior wall putty. It smooths and prepares masonry walls and suitable ceilings before primer and decorative emulsion." },
      { question: "Is Ultra White Putty suitable for exterior walls?", answer: "No. Kerala Paints Ultra White Putty is designed for interior applications. Exterior use is not recommended." },
      { question: "How many coats are recommended?", answer: "The recommended new-wall system uses two thin coats. For repainting, apply putty where necessary." },
      { question: "Can Ultra White Putty fill cracks and holes?", answer: "It helps fill minor pores and pinholes. However, significant cracks and damaged plaster require separate repair materials." },
      { question: "Can it be applied to damp walls?", answer: "Do not apply it over active seepage or unresolved dampness. First, identify and correct the moisture source." },
      { question: "Which tools are required for application?", answer: "Use a suitable putty blade or stainless-steel trowel." },
      { question: "Which primer should be applied after putty?", answer: "Compatible Kerala Paints interior primers include Prime Silver, Prime Gold and Prime Platinum, subject to the approved painting system." },
      { question: "What is the coverage per kilogram?", answer: "Coverage depends on the surface and approved consumption rate. Contact Kerala Paints for an approved consumption estimate." },
      { question: "Is Ultra White Putty suitable for ceilings?", answer: "Yes. It is suitable for properly prepared interior masonry ceilings." },
      { question: "What is the drying time?", answer: "Follow the current approved product instructions for drying and recoating intervals." },
    ],
    cta: { heading: ["SMOOTH INTERIOR WALLS", "START HERE"], body: "Contact Kerala Paints or visit an authorised outlet for product selection, application guidance and technical information." },
  },
  // From WATERPROOF PUTTY SEO CONTENT (supplied by Kerala Paints). Not a range category: data/products moreProducts.
  "waterproof-putty": {
    slug: "waterproof-putty",
    name: "Waterproof Wall Putty",
    fullName: "Waterproof Putty for Interior & Exterior Walls",
    headline: "A Better Foundation for Beautiful Walls",
    lede: "Water-resistant preparation for smoother interior and exterior walls.",
    category: "Interior and exterior wall putty",
    seoTitle: "Waterproof Wall Putty for Interior & Exterior Walls | Kerala Paints",
    seoDescription: "Discover Kerala Paints Waterproof Putty for interior and exterior walls. Learn its benefits, applications and preparation steps for smoother painted surfaces.",
    keywords: ["interior and exterior waterproof putty", "waterproof wall putty", "water-resistant wall putty", "wall levelling putty", "putty for masonry walls", "wall putty application", "Kerala Paints Waterproof Putty"],
    inspiration: { label: "Morning dew", body: "Dew settles on a leaf in perfect beads and rests there without soaking in. Waterproof Putty gives your walls a smooth, water-resistant layer in the same spirit, ready for the colour to come." },
    overview: [
      "A beautiful paint finish starts with proper wall preparation. Uneven surfaces, tiny holes and minor imperfections can affect the final appearance, so choosing the right wall putty before painting is essential.",
      "Kerala Paints Waterproof Putty is a water-resistant wall levelling putty for interior and exterior masonry. It helps create a smoother, more uniform surface before primer and decorative emulsion, and helps reduce moisture absorption through the putty layer.",
      "It is not a replacement for structural repairs or dedicated waterproofing treatment. Always address existing seepage and moisture problems before applying it.",
    ],
    highlights: [
      { icon: "drop", title: "Water-resistant preparation", text: "Helps reduce moisture absorption through the prepared putty layer." },
      { icon: "home", title: "Interior & exterior walls", text: "For properly prepared masonry in residential and commercial projects." },
      { icon: "sparkle", title: "Smooth, uniform finish", text: "Levels minor imperfections for a smoother base." },
      { icon: "brush", title: "Fills minor imperfections", text: "Addresses pores, pinholes and superficial irregularities. Not for significant cracks." },
      { icon: "layers", title: "Better paint preparation", text: "Supports more uniform primer application and the full painting system." },
      { icon: "mix", title: "Convenient pack sizes", text: "Available in 1 kg, 10 kg and 30 kg packs." },
    ],
    specs: [
      { label: "Product category", value: "Interior & exterior waterproof wall putty" },
      { label: "Product type", value: "Water-resistant wall levelling putty" },
      { label: "Recommended substrate", value: "Prepared cement-plastered walls, suitable concrete and compatible masonry" },
      { label: "Primary function", value: "Surface levelling and minor imperfection filling" },
      { label: "Finish", value: "Smooth putty base" },
      { label: "Recommended coats", value: "Two thin coats, subject to approved instructions" },
      { label: "Application", value: "Putty blade or stainless-steel trowel" },
      { label: "Pack sizes", value: "1 kg, 10 kg & 30 kg" },
      { label: "Finishing system", value: "Compatible Kerala Paints primer, then interior or exterior emulsion" },
      // Coverage, dilution and drying times are left out: the brief does not state them.
    ],
    surfaces: ["Bedrooms & living rooms", "Kitchens & dining rooms", "Interior corridors", "Office interiors", "Residential exteriors", "Commercial facades", "Exterior passages", "Plastered columns"],
    surfacesNote: "Always check substrate suitability and exposure conditions before application. Never apply putty over active seepage.",
    steps: [
      { title: "Prepare & clean", text: "Remove dust, grease, loose paint, unstable plaster, loose cement and biological growth. Repair significant cracks and holes." },
      { title: "Treat moisture", text: "Find and fix the source of dampness or seepage first – with Aqua Seal 2K where appropriate, and Salt Block on chalky surfaces." },
      { title: "Mix correctly", text: "Follow the approved mixing instructions, adding only the specified clean water. Never add cement, sand or other materials." },
      { title: "First coat", text: "Apply a thin, even layer with a putty blade or steel trowel, filling pores and imperfections, then let it dry." },
      { title: "Second coat", text: "Once at the approved recoat condition, apply the second thin coat evenly, without excess build-up." },
      { title: "Finish & prime", text: "Smooth the dried putty, remove sanding dust and apply a compatible Kerala Paints primer such as Prime Gold or Prime Platinum." },
      { title: "Emulsion topcoat", text: "Finish with a compatible Kerala Paints interior or exterior emulsion." },
    ],
    sections: [
      {
        id: "painting-system",
        heading: ["RECOMMENDED", "PAINTING SYSTEM"],
        cardColumns: 1,
        cards: [
          { title: "Interior walls", meta: "Interior", text: "Surface preparation → repair defects → two thin putty coats → finishing → dust removal → compatible interior primer → interior emulsion." },
          { title: "Exterior walls", meta: "Exterior", text: "Surface preparation → repair defects → two thin putty coats → finishing → dust removal → approved exterior primer → exterior emulsion." },
        ],
        note: "For damp walls, address the moisture source and complete the required waterproofing treatment before applying putty.",
      },
      {
        id: "mistakes",
        heading: ["MISTAKES", "TO AVOID"],
        list: [
          "Applying putty over active seepage.",
          "Ignoring loose paint and unstable plaster.",
          "Using wall putty to repair significant cracks.",
          "Adding unapproved mixing materials.",
          "Applying excessively thick coats.",
          "Skipping the recommended drying period.",
          "Applying primer before completing surface preparation.",
        ],
      },
      {
        id: "more-products",
        heading: ["EXPLORE MORE", "KERALA PAINTS PRODUCTS"],
        links: [
          { label: "Aqua Seal 2K waterproofing", product: "aqua-seal" },
          { label: "Kerala Paints Prime Gold", product: "prime-gold" },
          { label: "Kerala Paints Prime Platinum", product: "prime-platinum" },
          { label: "Interior emulsion paints", product: "bhadram-in" },
          { label: "Exterior emulsion paints", product: "gold-ex" },
        ],
      },
    ],
    faqs: [
      { question: "Can waterproof putty be used on exterior walls?", answer: "Yes. Kerala Paints Waterproof Putty is suitable for properly prepared exterior masonry walls and facades." },
      { question: "How many coats of waterproof putty are recommended?", answer: "Two thin coats are recommended, subject to approved product application instructions." },
      { question: "Does waterproof putty stop active water leakage?", answer: "No. Identify and resolve the underlying moisture source before applying putty." },
      { question: "Can waterproof putty fill large cracks?", answer: "No. It is designed for minor pores, pinholes and superficial irregularities. Use suitable repair materials for significant cracks." },
      { question: "What pack sizes are available?", answer: "Kerala Paints Waterproof Putty is available in 1 kg, 10 kg and 30 kg packs." },
      { question: "How much area does 1 kg of waterproof putty cover?", answer: "Coverage depends on surface condition and application requirements. Contact Kerala Paints for verified coverage information." },
      { question: "Should primer be applied after waterproof putty?", answer: "Yes. Apply a compatible Kerala Paints primer after completing the recommended putty preparation and finishing process." },
    ],
    cta: { heading: ["CHOOSE WATERPROOF PUTTY FOR", "BETTER WALL PREPARATION"], body: "Contact Kerala Paints or visit an authorised outlet for product selection, application guidance and technical information." },
  },
};