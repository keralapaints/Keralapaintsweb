/**
 * Product categories: the middle part of every product address (/products/{category}/{product}) and the category
 * pages at /products/{category}. Each product page belongs to exactly one category, listed here by its page slug.
 * A product added in /admin picks its category from this list.
 */

export type ProductCategory = {
  /** The address: /products/<slug>. Lowercase words joined by hyphens; never change it once live. */
  slug: string;
  /** The short name, used in breadcrumbs and links ("All Exterior Emulsions" uses `plural`). */
  name: string;
  plural: string;
  /** The category page's H1 and intro. */
  heading: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  /** The product page slugs in this category, in display order. */
  products: readonly string[];
};

export const productCategories: readonly ProductCategory[] = [
  {
    slug: "interior-emulsion", name: "Interior Emulsion", plural: "Interior Emulsions",
    heading: "Interior Emulsion Paints",
    description: "Bring your indoor spaces to life with interior emulsion paints designed for walls and ceilings. Explore finishes and product options to suit your room, surface and preferred look.",
    seoTitle: "Interior Emulsion Paints | Kerala Paints",
    seoDescription: "Explore Kerala Paints interior emulsion paints for walls and ceilings, with low-odour, washable finishes for bedrooms, living rooms and kitchens.",
    products: ["bhadram-in"],
  },
  {
    slug: "exterior-emulsion", name: "Exterior Emulsion", plural: "Exterior Emulsions",
    heading: "Exterior Emulsion Paints",
    description: "Choose exterior emulsion products designed for suitable outdoor wall surfaces. Explore options for your property’s exterior finish and follow the recommended surface preparation and application instructions.",
    seoTitle: "Exterior Emulsion Paints | Kerala Paints",
    seoDescription: "Explore Kerala Paints exterior emulsion paints for weather protection, algal resistance and long-lasting colour on exterior walls.",
    products: ["bhadram-ex"],
  },
  {
    slug: "wall-primers", name: "Wall Primers", plural: "Wall Primers",
    heading: "Wall Primers",
    description: "A good painting system starts with the right base. Explore Kerala Paints primers for suitable surfaces before applying the recommended topcoat.",
    seoTitle: "Wall Primers for Interior & Exterior Walls | Kerala Paints",
    seoDescription: "Explore Kerala Paints wall primers, including Prime Platinum and Prime Gold, for a strong, smooth base before interior and exterior emulsions.",
    products: ["prime-platinum", "prime-gold"],
  },
  {
    slug: "wall-putty", name: "Wall Putty", plural: "Wall Putties",
    heading: "Wall Putty",
    description: "Prepare smooth, even walls before priming and painting. Explore Kerala Paints wall putties for interior and exterior masonry.",
    seoTitle: "Wall Putty for Interior & Exterior Walls | Kerala Paints",
    seoDescription: "Explore Kerala Paints wall putties, including Ultra White Putty and Waterproof Putty, for smooth wall preparation before primer and paint.",
    products: ["ultra-white-putty", "waterproof-putty"],
  },
  {
    slug: "waterproofing", name: "Waterproofing", plural: "Waterproofing Products",
    heading: "Waterproofing Products",
    description: "Explore waterproofing products for suitable surfaces and project requirements. Select the appropriate system based on the surface condition, moisture exposure and product application guidelines.",
    seoTitle: "Waterproofing Products | Kerala Paints",
    seoDescription: "Explore Kerala Paints waterproofing products for terraces, bathrooms, foundations, damp walls and water tanks.",
    products: ["aqua-seal-2k"],
  },
  {
    slug: "roof-coatings", name: "Roof Coatings", plural: "Roof Coatings",
    heading: "Thermostat Roof Coatings",
    description: "Explore Kerala Paints roof-coating solutions designed for suitable roof surfaces. Check individual product specifications to understand their intended use, application method and coverage.",
    seoTitle: "Heat-Reflective Roof Coatings | Kerala Paints",
    seoDescription: "Explore Kerala Paints heat-reflective roof coatings that help reduce solar heat absorption on concrete terraces.",
    products: ["cool-coat"],
  },
  {
    slug: "tile-floor-coatings", name: "Tile & Floor Coatings", plural: "Tile & Floor Coatings",
    heading: "Tile & Floor Coatings",
    description: "Explore coating products for suitable tile and floor-related applications. Check the product details to confirm surface compatibility, preparation requirements and the recommended finish.",
    seoTitle: "Tile & Floor Coatings | Kerala Paints",
    seoDescription: "Explore Kerala Paints tile and floor coatings for verandas, courtyards and cement floors.",
    products: ["tile-floor-coat"],
  },
  {
    slug: "enamel-paints", name: "Enamel Paints", plural: "Enamel Paints",
    heading: "Enamel Paints",
    description: "Explore Kerala Paints enamel products for suitable applications. Review the product specifications to select an option that matches the intended surface and finish.",
    seoTitle: "Enamel Paints for Wood & Metal | Kerala Paints",
    seoDescription: "Explore Kerala Paints enamel paints for doors, windows, grills, gates and furniture.",
    products: ["enamel-paint"],
  },
  {
    slug: "damp-proofing", name: "Damp Proofing", plural: "Damp-Proofing Products",
    heading: "Damp-Proofing Products",
    description: "Explore products intended for suitable dampness-related surface treatment. Identify the source of moisture and follow the recommended treatment system before applying finishing coats.",
    seoTitle: "Damp-Proofing Products | Kerala Paints",
    seoDescription: "Explore Kerala Paints damp-proofing products for walls affected by dampness and seepage.",
    products: ["damp-proof-coating"],
  },
];

/** Shared words on the category pages. */
export const categoryCopy = {
  home: "Home",
  products: "Products",
  eyebrow: "Product category",
  view: "View product",
  empty: "Products in this category are coming soon. Contact Kerala Paints for guidance in the meantime.",
  consult: "Free Paint Consultation",
} as const;

/** Words on the Products overview (/products), which lists every category. */
export const productsOverviewCopy = {
  heading: "Kerala Paints Products",
  description: "Paints, primers, putties and protective coatings for every surface of your home. Choose a category to explore its products.",
  seoTitle: "Paints, Primers & Coatings | Kerala Paints Products",
  seoDescription: "Explore Kerala Paints products: interior and exterior emulsions, primers, wall putty, waterproofing, roof, floor, enamel and damp-proofing coatings.",
  eyebrow: "Our range",
  view: "View category",
  count: "{n} products",
  one: "1 product",
} as const;


/** Words of the header's Products menu. */
export const productsMenuCopy = {
  viewAll: "View all products",
  allIn: "All {category}",
} as const;