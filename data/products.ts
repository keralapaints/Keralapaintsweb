/** The Product Range: the eight categories, in the order the client supplied. lib/product/product-data adds their media. */
export type ProductContent = {
  id: string;
  index: number;
  title: string;
  /** Short label for the range timeline (line breaks allowed). */
  short: string;
  description: string;
  /** Its nature backdrop: public/films/product-bg/<backdrop>.mp4 and its first frame in public/stills/product-bg. */
  backdrop: string;
  /** The supplied packshot, cut out and fitted into the carousel's 4:5 frame (scripts/prepare-product-hd.py). */
  bucket: string;
  /** Optical fit for wide cartons and tall tins inside the shared artwork frame. */
  packScale?: number;
  packY?: string;
};

// The eight product categories, one nature backdrop each, in the order the client supplied. The descriptions are the
// client's copy trimmed to the length of the Tile & Floor Coat one (about 150 characters), so every paragraph runs the
// same depth beside its title.
export const productRange: ProductContent[] = [{
  id: "bhadram-in",
  index: 1,
  title: "Interior Emulsion",
  short: "Interior Emulsion",
  backdrop: "pearl-shell",
  bucket: "/images/products/hd/bhadram-in-v2.webp",
  description: "Inspired by the pearl shell that glows while guarding the life within, our Interior Emulsion keeps your walls shining, clean and strong for years.",
}, {
  id: "gold-ex",
  index: 2,
  title: "Exterior Emulsion",
  short: "Exterior Emulsion",
  backdrop: "peacock",
  bucket: "/images/products/hd/gold-ex-v2.webp",
  description: "Inspired by the peacock’s feathers that shine in every season, our Exterior Emulsion keeps your walls glossy, strong and beautiful through sun and rain.",
}, {
  id: "prime-platinum",
  index: 3,
  title: "Primers",
  short: "Primers",
  backdrop: "forest-roots",
  bucket: "/images/products/hd/prime-platinum-v2.webp",
  description: "Like invisible roots that give trees their strength, our health-friendly primers build a strong foundation for healthy walls and protect your family’s well-being.",
}, {
  id: "aqua-seal",
  index: 4,
  title: "Water Proofing",
  short: "Water Proofing",
  backdrop: "forest-dew",
  bucket: "/images/products/hd/aqua-seal.webp",
  packScale: .78,
  packY: "-3.4%",
  description: "Inspired by the Colocasia Leaf that never lets water stick, our waterproofing range keeps your walls dry, strong, and protected in every season.",
}, {
  id: "cool-coat",
  index: 5,
  title: "Thermostat",
  short: "Thermostat",
  backdrop: "banyan",
  bucket: "/images/products/hd/cool-coat-v2.webp",
  description: "Inspired by the banyan tree that offers shade, coolness, and protection in every season, Cool Coat keeps your home cooler, waterproof, and long-lasting.",
}, {
  id: "floor-coat",
  index: 6,
  title: "Tile & Floor Coat",
  short: "Tile & Floor Coat",
  backdrop: "ladybug",
  bucket: "/images/products/hd/tile-coat-v2.webp",
  description: "Inspired by the glossy shell of the ladybug, our Tile & Floor Coat delivers strength, shine, and vibrant beauty while protecting your floors for years.",
}, {
  id: "enamel",
  index: 7,
  title: "Enamels",
  short: "Enamels",
  backdrop: "enamel",
  bucket: "/images/products/hd/enamel.webp",
  packScale: .9,
  packY: "2.4%",
  description: "Inspired by the vibrant wings of butterflies, our Enamels add lasting color, glossy beauty, and strong protection to wood and metal surfaces.",
}, {
  id: "2k-coating",
  index: 8,
  title: "Damp Proof",
  short: "Damp Proof",
  backdrop: "2k-coating",
  // Aqua Seal 2K's carton: the supplied packshots hold no separate 2K Coating pack.
  bucket: "/images/products/hd/aqua-seal.webp",
  packScale: .78,
  packY: "-3.4%",
  description: "Inspired by the cactus that holds water without ever letting it escape, Tough Seal forms a watertight barrier that keeps dampness out and your walls dry.",
}];

/** The carousel's own words: the label over its counter and the tagline beside the ring (one line each). */
/** The carousel's own words: the label over its counter, the link to a product's page and the tagline beside the ring (one line each). */
export const rangeCopy = { label: "Our paints", explore: "Explore product", tagline: ["Inspired by", "Nature.", "Made for", "Better Living."] } as const;

/** The closing words over the splash scene, exactly as scene 13 of the brief sets them. */
export const splashCopy = {
  lines: ["MADE FOR THE WALLS", "WE LIVE WITH EVERY DAY"],
  paragraph: "From innovation to application, every finish is\ndesigned to return to the spaces that matter most.",
};

export type RoomCopy = {
  id: "living" | "colour" | "family";
  number: number;
  title: readonly string[];
  description: string;
  alt: string;
  /** Button to the enquiry, and the hand-lettered closing line. */
  cta?: string;
  signoff?: string;
};

/** PDF pages 14–16: the rooms that follow the splash. lib/product/product-data adds their films. */
export const roomCopy: readonly RoomCopy[] = [
  { id: "living", number: 14, title: ["THE FINISH THAT", "FEELS LIKE HOME"], description: "Smooth to the touch. Easy to live with.\nMade for the moments that matter.", alt: "A sunlit blue living room with a flowing paint ribbon and an armchair" },
  { id: "colour", number: 15, title: ["COLOUR THAT", "LIVES WITH YOU"], description: "Made for everyday moments,\neveryday movement, and the people\nwho make a house a home.", alt: "A warm red feature wall opening into a blue living room", cta: "Make it yours" },
  { id: "family", number: 16, title: ["BEYOND BEAUTIFUL WALLS", "FOR THE PEOPLE LIVING INSIDE"], description: "Beautiful spaces. Strong protection.\nLasting memories. That’s the Kerala Paints promise\nfor every home.", alt: "A child playing in a sunlit bedroom with sage green walls", cta: "Build a beautiful home", signoff: "Beautifully yours, for years." },
];

/** The finish's benefits, shown in the rooms (`short` in the compact list). Icons are 24-unit line paths. */
export const benefits = [
  { label: "STRONG\nPROTECTION", short: "ADVANCED\nPROTECTION", description: "Shields your walls\nfrom everyday wear.", path: "M12 3 4.5 6v6c0 5 7.5 9 7.5 9s7.5-4 7.5-9V6L12 3Zm-3.5 9 2.5 2.5 4.5-5" },
  { label: "RICH\nCOLOURS", short: "RICH, LASTING\nCOLOURS", description: "Colours that stay\nvibrant for years.", path: "m8 3 1.5 4.5L14 9l-4.5 1.5L8 15l-1.5-4.5L2 9l4.5-1.5L8 3Zm10 9 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3ZM18 2v5m-2.5-2.5h5M5 17v5m-2.5-2.5h5" },
  { label: "EASY TO CLEAN\n& MAINTAIN", short: "EASY TO CLEAN\n& MAINTAIN", description: "Wipe clean easily\nand keep walls\nlooking new.", path: "M12 2S5 10 5 14a7 7 0 0 0 14 0c0-4-7-12-7-12ZM8 14c0 2 1 3 3 4" },
  { label: "SAFE FOR YOUR\nFAMILY", short: "SAFE FOR YOUR\nFAMILY", description: "Low odour, non-toxic\nand safe for everyday\nliving.", path: "M20 3C9 3 3 8 5 15c2 7 15 3 15-12ZM3 22 16 8" },
] as const;

/** The footer caption through the Product Range (the rooms use their own titles), and its scroll cue. */
export const journeyCaptions = {
  range: "Discover our products",
  splash: "Made for everyday living",
  enquiry: "Let’s talk about your space",
  footer: "Beyond beautiful walls",
  scroll: "Scroll to explore ↓",
  end: "You’ve reached the end",
} as const;

/**
 * Products with their own page that are not one of the eight range categories (so not in the carousel): they reuse a
 * range backdrop, and show their pack only once a packshot is supplied (`bucket`, prepared like the range's).
 */
export type CatalogueProduct = Omit<ProductContent, "bucket"> & { bucket?: string };

export const moreProducts: CatalogueProduct[] = [{
  id: "prime-gold",
  index: 9,
  title: "Prime Gold",
  short: "Prime Gold",
  backdrop: "forest-roots",
  description: "Stronger bonding. Smoother walls. A better foundation for every finish.",
}, {
  id: "ultra-white-putty",
  index: 10,
  title: "Ultra White Putty",
  short: "Ultra White Putty",
  backdrop: "pearl-shell",
  description: "A smooth, bright foundation for beautiful interior walls.",
}, {
  id: "waterproof-putty",
  index: 11,
  title: "Waterproof Putty",
  short: "Waterproof Putty",
  backdrop: "forest-dew",
  description: "A water-resistant, smoother foundation for interior and exterior walls.",
}];