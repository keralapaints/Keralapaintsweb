import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // Static export: `npm run build` writes a fully static site to ./out
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Allow phones/tablets on the same Wi-Fi to load dev assets via the LAN IP.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
};

export default nextConfig;
