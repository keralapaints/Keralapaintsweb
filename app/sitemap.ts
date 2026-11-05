import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/product/product-schema";

/** Static export: the sitemap is written once at build time. */
export const dynamic = "force-static";

/**
 * Only the home page for now: the product pages, the blog and Find an Outlet are blocked in app/robots.ts until they
 * are ready. When they open, add them back here (see the earlier version with productPages, blogPostPages and outlets).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
  ];
}