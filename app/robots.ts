import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/**
 * The admin and its server endpoints are never crawled. The product pages, the Products overview, the blog and Find
 * an Outlet stay out until they are ready to be indexed: remove a path from `disallow` to open it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/products", "/blog", "/outlets"],
    },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}