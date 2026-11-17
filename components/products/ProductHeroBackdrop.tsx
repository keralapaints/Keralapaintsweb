"use client";

import { useMotionPreference } from "@/hooks/useMotionPreference";

type ProductHeroBackdropProps = { poster: string; video?: string };

/**
 * The hero's decorative nature backdrop: the still always, its film only with full motion, so reduced motion keeps a
 * calm, still page.
 */
export function ProductHeroBackdrop({ poster, video }: ProductHeroBackdropProps) {
  const motion = useMotionPreference();
  return <div className="pt-hero-backdrop" aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={poster} alt="" width={1248} height={704} decoding="async" />
    {video && motion === "full" && <video src={video} poster={poster} autoPlay muted loop playsInline preload="metadata" />}
  </div>;
}