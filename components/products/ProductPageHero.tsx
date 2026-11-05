"use client";

import type { CSSProperties } from "react";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { productPageCopy } from "@/data/product-details";
import { site } from "@/data/site";
import { pad } from "@/lib/media/media";
import { PRODUCTS_PATH, type ProductPageData } from "@/lib/product/product-data";
import { bucketSrcSet } from "@/lib/product/product-images";

/** Rendered width of the pack beside the copy (product-page.css .pp-pack), for the browser's srcset choice. */
const PACK_SIZES = "(max-width: 1023px) 78vw, 44vw";

type ProductPageHeroProps = { product: ProductPageData; total: number };

/**
 * The opening screen of a product page: its nature film behind the title, the pack beside it. The film only plays
 * with full motion; reduced motion keeps its first frame and a still pack.
 */
export function ProductPageHero({ product, total }: ProductPageHeroProps) {
  const motion = useMotionPreference();
  const copy = productPageCopy;
  return <section className="pp-hero" data-motion={motion} aria-labelledby="pp-title"
    style={{ "--pp-pack-scale": product.packScale ?? 1, "--pp-pack-y": product.packY ?? "0%" } as CSSProperties}>
    <div className="pp-backdrop" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.poster} alt="" width={1248} height={704} fetchPriority="high" decoding="async" />
      {motion === "full" && product.video && <video src={product.video} poster={product.poster} autoPlay muted loop playsInline preload="metadata" />}
      <div className="pp-grade" />
    </div>
    <div className="pp-hero-inner">
      <div className="pp-hero-copy">
        <nav className="pp-crumbs pp-rise" aria-label="Breadcrumb">
          <ol>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
            <li><a href="/">{copy.home}</a></li>
            <li><a href={PRODUCTS_PATH}>{copy.products}</a></li>
            <li aria-current="page">{product.title}</li>
          </ol>
        </nav>
        {product.inRange && <p className="pp-counter pp-rise" style={{ "--pp-delay": "80ms" } as CSSProperties}>
          <span className="pp-range-label">{copy.rangeLabel}</span>{pad(product.index)} <small>/ {pad(total)}</small>
        </p>}
        {/* With a headline the H1 reads "Bhadram IN – Safe Interior …": the pack name large, the headline under it. */}
        {product.headline
          ? <h1 id="pp-title" className="pp-title pp-rise" style={{ "--pp-delay": "160ms" } as CSSProperties}>
            {product.brandInTitle && <span className="pp-title-brand">{site.name} </span>}
            <span className="pp-title-main">{product.name}</span>
            <span className="pp-title-headline"><span className="sr-only"> – </span>{product.headline}</span>
          </h1>
          : <h1 id="pp-title" className="pp-title pp-rise" style={{ "--pp-delay": "160ms" } as CSSProperties}>
            <span className="pp-title-name">{product.name}</span>
            <span className="pp-title-main">{product.title}<em aria-hidden="true">.</em></span>
          </h1>}
        <p className="pp-lede pp-rise" style={{ "--pp-delay": "260ms" } as CSSProperties}>{product.lede ?? product.description}</p>
        <div className="pp-actions pp-rise" style={{ "--pp-delay": "360ms" } as CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
          <a className="consult-cta" href="/#enquiry">{site.consultation}</a>
          <a className="pp-ghost" href="#details">{copy.details}<span aria-hidden="true">↓</span></a>
        </div>
      </div>
      {/* A product without a packshot yet lets its backdrop fill the right of the hero. */}
      {product.bucket && <div className="pp-pack pp-rise" style={{ "--pp-delay": "200ms" } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.bucket} srcSet={bucketSrcSet(product.bucket)} sizes={PACK_SIZES} width={1536} height={1920}
          alt={`${product.fullName} by ${site.name}`} fetchPriority="high" decoding="async" draggable={false} />
      </div>}
    </div>
  </section>;
}