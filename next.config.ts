import type { NextConfig } from "next";

/** Long-lived caching for the story's media (frame packs carry a content hash in their URL). */
const cache = (seconds: number, immutable = false) =>
  [{ key: "Cache-Control", value: `public, max-age=${seconds}${immutable ? ", immutable" : ""}` }];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // Runs as a Node server (`next start`): public pages are still pre-built HTML, and /admin can save to MongoDB.
  // Addresses have no trailing slash: /products/exterior-emulsion/bhadram-ex. A trailing slash redirects (308) to it.
  trailingSlash: false,
  images: { unoptimized: true },
  // Allow phones/tablets on the same Wi-Fi to load dev assets via the LAN IP.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  async headers() {
    return [
      { source: "/frames/:path*", headers: cache(31536000, true) },
      { source: "/films/:path*", headers: cache(86400) },
      { source: "/stills/:path*", headers: cache(86400) },
      { source: "/images/:path*", headers: cache(86400) },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;