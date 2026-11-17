import { productCategories } from "@/data/categories";
import { categoryOfProduct, categoryPath } from "./product-urls";

/** A product in the header's Products menu. */
export type MenuProduct = { label: string; href: string };

/** A category in the header's Products menu: its page, and the products inside it. */
export type MenuCategory = { label: string; plural: string; href: string; products: readonly MenuProduct[] };

type MenuPage = { slug: string; name: string; path: string; categorySlug?: string };

/**
 * The Products menu: every category in data/categories.ts that has at least one published product, in that file's
 * order, each with its products (listed order first, then any added in /admin).
 */
export function buildProductMenu(pages: readonly MenuPage[]): MenuCategory[] {
  return productCategories.map((category) => {
    const order = (page: MenuPage) => { const position = category.products.indexOf(page.slug); return position < 0 ? 99 : position; };
    const products = pages
      .filter((page) => (page.categorySlug || categoryOfProduct(page.slug)?.slug) === category.slug)
      .sort((a, b) => order(a) - order(b))
      .map((page) => ({ label: page.name, href: page.path }));
    return { label: category.name, plural: category.plural, href: categoryPath(category.slug), products };
  }).filter((category) => category.products.length > 0);
}