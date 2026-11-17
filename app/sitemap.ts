import type { MetadataRoute } from "next";
import { productCategories } from "@/data/categories";
import { site } from "@/data/site";
import { BLOG_PATH, blogPostPages } from "@/lib/blog/blog-data";
import { OUTLETS_PATH } from "@/lib/outlets/outlets";
import { PRODUCTS_BASE, categoryPath } from "@/lib/product/product-urls";
import { getProductPages } from "@/lib/server/products-repo";

/** Rebuilt at most once an hour, and whenever a product is saved in /admin. */
export const revalidate = 3600;

/** An absolute address: https, no trailing slash, the same as each page's canonical. */
const absolute = (path: string) => new URL(path, site.url).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProductPages();
  const usedCategories = productCategories.filter((category) => products.some((product) => product.categorySlug === category.slug));
  return [
    { url: absolute("/"), changeFrequency: "monthly", priority: 1 },
    { url: absolute(PRODUCTS_BASE), changeFrequency: "monthly", priority: .9 },
    ...usedCategories.map((category) => ({ url: absolute(categoryPath(category.slug)), changeFrequency: "monthly" as const, priority: .8 })),
    ...products.map((product) => ({ url: absolute(product.path), changeFrequency: "monthly" as const, priority: .8 })),
    { url: absolute(OUTLETS_PATH), changeFrequency: "monthly", priority: .7 },
    { url: absolute(BLOG_PATH), changeFrequency: "weekly", priority: .6 },
    ...blogPostPages.map((post) => ({ url: absolute(post.path), lastModified: post.updated ?? post.published, changeFrequency: "monthly" as const, priority: .6 })),
  ];
}