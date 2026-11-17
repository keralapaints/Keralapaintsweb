import type { CSSProperties } from "react";
import { productTemplateCopy as copy } from "@/data/product-template";
import { bucketSrcSet } from "@/lib/product/product-images";
import { PRODUCTS_BASE, categoryPath } from "@/lib/product/product-urls";
import type { TemplatePage } from "@/lib/server/products-repo";
import { RichText } from "@/components/site/RichText";
import { ProductHeroBackdrop } from "./ProductHeroBackdrop";

type ProductTemplateHeroProps = {
  product: TemplatePage;
  categoryName?: string;
  paths: Record<string, string>;
  outletsPath: string;
};

/** Section 1, the hero: breadcrumb, H1, sub-heading, intro, trust badges, at a glance, buttons and the packshot. */
export function ProductTemplateHero({ product, categoryName, paths, outletsPath }: ProductTemplateHeroProps) {
  const tagline = product.tagline ?? product.headline ?? product.title;
  const intro = product.intro ?? product.lede ?? product.description;
  return <section id="hero" className="pt-hero" aria-labelledby="pt-title">
    <ProductHeroBackdrop poster={product.poster} video={product.video} />
    <div className="pt-hero-inner">
      <div className="pt-hero-copy">
        <nav className="pt-crumbs" aria-label="Breadcrumb">
          <ol>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
            <li><a href="/">{copy.home}</a></li>
            <li><a href={PRODUCTS_BASE}>{copy.products}</a></li>
            {categoryName && <li><a href={categoryPath(product.categorySlug)}>{categoryName}</a></li>}
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
        <h1 id="pt-title" className="pt-title">
          <span className="pt-title-name">{product.name}</span>
          {/* The dash joins the two lines in the text search engines read; on screen they sit on two lines. */}
          <span className="pt-sr-only"> – </span>
          <span className="pt-title-tagline">{tagline}</span>
        </h1>
        {product.subhead && <p className="pt-subhead">{product.subhead}</p>}
        {intro && <p className="pt-intro"><RichText text={intro} paths={paths} /></p>}
        {product.badges && product.badges.length > 0 && <ul className="pt-badges">
          {product.badges.map((badge) => <li key={badge}><span className="pt-badge-mark" aria-hidden="true" />{badge}</li>)}
        </ul>}
        {product.glance && product.glance.length > 0 && <dl className="pt-glance" aria-label={copy.glance}>
          {product.glance.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}
        </dl>}
        <div className="pt-actions">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
          <a className="pt-button pt-button--primary" href="/#enquiry">{copy.consult}</a>
          <a className="pt-button" href={outletsPath}>{copy.findOutlet}</a>
          <a className="pt-text-link" href="#key-features">{copy.viewDetails}<span aria-hidden="true"> ↓</span></a>
        </div>
      </div>
      {product.bucket && <div className="pt-pack" style={{ "--pt-pack-scale": product.packScale ?? 1, "--pt-pack-y": product.packY ?? "0%" } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.bucket} srcSet={bucketSrcSet(product.bucket)} sizes="(max-width: 1023px) 80vw, 38vw" width={1536} height={1920}
          alt={product.imageAlt ?? `${product.fullName} by Kerala Paints`} loading="eager" fetchPriority="high" decoding="async" />
      </div>}
    </div>
  </section>;
}