/**
 * The Products overview page (/products/): every word on it, from "Kerala Paints – Complete Products Page SEO
 * Content" (supplied by Kerala Paints). The eight categories are keyed by the range `id` in data/products.
 */

export type ProductCategoryCopy = {
  /** The category's H2 on the overview page. */
  heading: string;
  description: string;
  /** The link to the category's product page. */
  cta: string;
  /** Alt text for the category's packshot. */
  alt: string;
};

export const productsPageCopy = {
  seoTitle: "Premium Paint Products in Kerala | Kerala Paints",
  seoDescription: "Explore premium paint products in Kerala from Kerala Paints, including interior and exterior paints, primers, waterproofing solutions and roof coatings.",
  keywords: ["Premium Paint Products in Kerala", "Kerala Paints products", "interior emulsion paint", "exterior emulsion paint", "wall primers", "waterproofing products", "roof heat-reflective coating", "tile coating paint", "floor coating paint", "enamel paint", "damp-proofing products"],
  home: "Home",
  breadcrumb: "Products",
  /** The header's Products panel links here after the eight products. */
  navLabel: "View all products",
  eyebrow: "Our paints",
  heading: ["EXPLORE OUR PREMIUM", "PAINT PRODUCTS"],
  intro: "Discover premium paint products in Kerala from Kerala Paints, with solutions for different surfaces, spaces and application needs. Explore our range of interior and exterior emulsions, primers, waterproofing products, roof coatings, and tile and floor coatings to find a suitable option for your home or project.",
  jumpLabel: "Product categories",
  guide: {
    heading: ["FIND THE RIGHT PAINT", "FOR YOUR SPACE"],
    body: [
      "Every surface has different requirements. Consider the surface type, existing condition, exposure and desired finish before choosing a paint or coating product.",
      "Browse our product categories or contact the Kerala Paints team for guidance on selecting a suitable solution.",
    ],
    browse: "Browse products",
  },
  help: {
    heading: ["NEED HELP", "CHOOSING A PAINT?"],
    body: "Use the Free Paint Consultation to contact the Kerala Paints team for product-selection guidance.",
    cta: "Free Paint Consultation",
  },
  faqHeading: ["FREQUENTLY ASKED", "QUESTIONS"],
  faqs: [
    { question: "What types of products does Kerala Paints offer?", answer: "Kerala Paints features product categories including interior emulsion, exterior emulsion, primers, waterproofing, thermostat coatings, tile and floor coats, enamels and damp-proofing products." },
    { question: "How do I choose the right paint product?", answer: "Consider the surface, whether it is indoors or outdoors, the existing surface condition and the desired finish. Check the individual product specifications and recommended application system before purchasing." },
    { question: "Why is primer used before painting?", answer: "A suitable primer helps prepare the surface for the finishing coats. Its benefits depend on the surface, primer formulation and recommended painting system." },
    { question: "Which product should I choose for roof coating?", answer: "The suitable product depends on the roof material and the intended purpose. Review the specifications of the relevant roof-coating product before application." },
    { question: "Where can I find Kerala Paints products?", answer: "Browse the product categories on this page, or contact the Kerala Paints team through the Free Paint Consultation to find a Kerala Paints outlet near you." },
    { question: "Can I get help choosing a paint?", answer: "Yes. Use the Free Paint Consultation option to contact the Kerala Paints team for product-selection guidance." },
  ],
} as const;

/** The eight categories, keyed by the range `id` in data/products. */
export const productCategories: Record<string, ProductCategoryCopy> = {
  "bhadram-in": {
    heading: "Interior Emulsion Paints",
    description: "Bring your indoor spaces to life with interior emulsion paints designed for walls and ceilings. Explore finishes and product options to suit your room, surface and preferred look.",
    cta: "Explore Interior Emulsion",
    alt: "Kerala Paints interior emulsion paint",
  },
  "gold-ex": {
    heading: "Exterior Emulsion Paints",
    description: "Choose exterior emulsion products designed for suitable outdoor wall surfaces. Explore options for your property’s exterior finish and follow the recommended surface preparation and application instructions.",
    cta: "Explore Exterior Emulsion",
    alt: "Kerala Paints exterior emulsion paint",
  },
  "prime-platinum": {
    heading: "Wall Primers",
    description: "A good painting system starts with the right base. Explore Kerala Paints primers, including Prime Gold, Prime Platinum and Prime Silver, for suitable surfaces before applying the recommended topcoat.",
    cta: "Explore Primers",
    alt: "Kerala Paints wall primer products",
  },
  "aqua-seal": {
    heading: "Waterproofing Products",
    description: "Explore waterproofing products for suitable surfaces and project requirements. Select the appropriate system based on the surface condition, moisture exposure and product application guidelines.",
    cta: "Explore Waterproofing",
    alt: "Kerala Paints waterproofing product",
  },
  "cool-coat": {
    heading: "Thermostat Roof Coatings",
    description: "Explore Kerala Paints roof-coating solutions designed for suitable roof surfaces. Check individual product specifications to understand their intended use, application method and coverage.",
    cta: "Explore Thermostat",
    alt: "Kerala Paints roof coating product",
  },
  "floor-coat": {
    heading: "Tile & Floor Coatings",
    description: "Explore coating products for suitable tile and floor-related applications. Check the product details to confirm surface compatibility, preparation requirements and the recommended finish.",
    cta: "Explore Tile & Floor Coat",
    alt: "Kerala Paints tile and floor coating products",
  },
  enamel: {
    heading: "Enamel Paints",
    description: "Explore Kerala Paints enamel products for suitable applications. Review the product specifications to select an option that matches the intended surface and finish.",
    cta: "Explore Enamels",
    alt: "Kerala Paints enamel paint products",
  },
  "2k-coating": {
    heading: "Damp-Proofing Products",
    description: "Explore products intended for suitable dampness-related surface treatment. Identify the source of moisture and follow the recommended treatment system before applying finishing coats.",
    cta: "Explore Damp Proof",
    alt: "Kerala Paints damp-proofing product",
  },
};