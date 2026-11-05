import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/product/product-schema";

/** Static export: robots.txt is written once at build time. */
export const dynamic = "force-static";

/**
 * Search engines may crawl the home page only for now. The product pages, the Products overview, the blog and Find
 * an Outlet are kept out until they are ready to be indexed; remove a path from `disallow` to open it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/products/", "/blog/", "/outlets/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}