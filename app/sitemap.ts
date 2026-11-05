import type { MetadataRoute } from "next";
import { PRODUCTS_PATH, productPages } from "@/lib/product/product-data";
import { absoluteUrl } from "@/lib/product/product-schema";
import { BLOG_PATH, blogPostPages } from "@/lib/blog/blog-data";
import { OUTLETS_PATH } from "@/lib/outlets/outlets";

/** Static export: the sitemap is written once at build time. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl(PRODUCTS_PATH), changeFrequency: "monthly", priority: .9 },
    { url: absoluteUrl(OUTLETS_PATH), changeFrequency: "monthly", priority: .8 },
    ...productPages.map((product) => ({ url: absoluteUrl(product.path), changeFrequency: "monthly" as const, priority: .8 })),
    { url: absoluteUrl(BLOG_PATH), changeFrequency: "weekly", priority: .6 },
    ...blogPostPages.map((post) => ({ url: absoluteUrl(post.path), lastModified: post.updated ?? post.published, changeFrequency: "monthly" as const, priority: .7 })),
  ];
}