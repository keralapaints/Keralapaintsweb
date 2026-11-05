// app/robots.ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/product/product-schema";

/** Static export: robots.txt is written once at build time. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: absoluteUrl("/sitemap.xml") };
}