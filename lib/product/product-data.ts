import { moreProducts, productRange, roomCopy, type CatalogueProduct, type ProductContent } from "@/data/products";
import { productDetails, type ProductDetail } from "@/data/product-details";
import { productCategories, type ProductCategoryCopy } from "@/data/products-page";
import { packUrl, stillUrl } from "../media/media";

/** A product's looping nature film, with its first frame as the poster so the still hands over to the film unseen. */
const backdrop = (id: string) => ({ video: `/films/product-bg/${id}.mp4`, poster: `/stills/product-bg/${id}.webp` });

/** A product's page address (the site is exported with trailing slashes). */
export const productPath = (slug: string) => `/products/${slug}/`;

/** The long-form page words for a product; every product in data/products must have them. */
function detailFor(id: string): ProductDetail {
  const detail = productDetails[id];
  if (!detail) throw new Error(`data/product-details has no entry for the product "${id}"`);
  return detail;
}

export type Product = ProductContent & {
  /** Background film; without one the poster stands alone. */
  video?: string;
  poster: string;
  /** Its page: /products/<slug>/. */
  path: string;
};

/** The eight range categories (the carousel, the header menu, the enquiry form). */
export const products: Product[] = productRange.map((product) => ({ ...product, ...backdrop(product.backdrop), path: productPath(detailFor(product.id).slug) }));

/** A product with everything its page shows: a range category, or a further product with its own page. */
export type ProductPageData = Omit<Product, "bucket"> & ProductDetail & {
  /** Its packshot, when one has been supplied. */
  bucket?: string;
  /** One of the eight range categories (counted "01 / 08" and shown on the Products overview). */
  inRange: boolean;
  /** The product's name for alt text and structured data, e.g. "Bhadram IN Interior Emulsion". */
  fullName: string;
};

function pageFor(product: ProductContent | CatalogueProduct, inRange: boolean): ProductPageData {
  const detail = detailFor(product.id);
  return {
    ...product, ...backdrop(product.backdrop), ...detail, inRange,
    path: productPath(detail.slug),
    fullName: detail.fullName ?? `${detail.name} ${product.title}`,
  };
}

/** Every product page: the eight range categories in range order, then the further products. */
export const productPages: ProductPageData[] = [
  ...productRange.map((product) => pageFor(product, true)),
  ...moreProducts.map((product) => pageFor(product, false)),
];

/** The product page for an address slug, if there is one. */
export const findProductPage = (slug: string) => productPages.find((product) => product.slug === slug);

/** The Products overview page's address. */
export const PRODUCTS_PATH = "/products/";

/** The eight categories on the Products overview page, each with its product and the words the overview shows. */
export const productCategoryCards: (ProductPageData & { card: ProductCategoryCopy })[] = productPages.filter((product) => product.inRange).map((product) => {
  const card = productCategories[product.id];
  if (!card) throw new Error(`data/products-page has no category for the product "${product.id}"`);
  return { ...product, card };
});

/**
 * Full supplied splash film, including its original bucket. The room dissolves in over the carousel before playback.
 */
export const splashScene = {
  film: packUrl(12, 13),
  /** The room before the paint rises: the film's first frame, preserving the supplied composition. */
  poster: stillUrl(12),
  /** The final frame, standing in for the film where it cannot play. */
  end: stillUrl(13),
};

/** The blue living room that follows the splash (scene 14). */
const livingScene = {
  film: packUrl(13, 14),
  // The splash's last frame: this film opens on the same composition, so nothing changes while it decodes.
  poster: stillUrl(13),
  end: stillUrl(14),
};

/** The rooms after the splash (data/products roomCopy) with their films: each opens on the previous room's last frame. */
export const homeScenes = [
  { ...livingScene, ...roomCopy[0] },
  { film: packUrl(14, 15), poster: stillUrl(14), end: stillUrl(15), ...roomCopy[1] },
  { film: packUrl(15, 16), poster: stillUrl(15), end: stillUrl(16), ...roomCopy[2] },
] as const;

export const endingScene = {
  film: packUrl(15, 16),
  poster: stillUrl(16),
  end: stillUrl(16),
};

export const productTuning = {
  entranceMs: 900,
  // Switching products: the copy and hero bucket dip out for this long while the carousel slides, then re-enter.
  switchMs: 380,
  // How far ahead of the Product Range its first backdrop, featured bucket, ring and reveal mask are warmed
  // (3.5 viewport heights); the films load later, by their own proximity (lib/media/media-window).
  preloadMargin: "350% 0px",
};