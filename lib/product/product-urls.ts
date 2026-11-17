import { productCategories } from "@/data/categories";

/** The Products overview's address. Addresses have no trailing slash (next.config.ts trailingSlash: false). */
export const PRODUCTS_BASE = "/products";

/** A category by its slug. */
export const findCategory = (slug: string) => productCategories.find((category) => category.slug === slug);

/** The category a product page belongs to, from data/categories.ts; undefined if it is not listed there. */
export const categoryOfProduct = (productSlug: string) =>
  productCategories.find((category) => category.products.includes(productSlug));

/** A category page's address: /products/exterior-emulsion. */
export const categoryPath = (categorySlug: string) => `${PRODUCTS_BASE}/${categorySlug}`;

/**
 * A product page's address: /products/{category}/{product}. The category comes from data/categories.ts unless given
 * (a product added in /admin stores its own); an unlisted product falls back to /products/{product}.
 */
export function productPath(productSlug: string, categorySlug = categoryOfProduct(productSlug)?.slug) {
  return categorySlug ? `${categoryPath(categorySlug)}/${productSlug}` : `${PRODUCTS_BASE}/${productSlug}`;
}