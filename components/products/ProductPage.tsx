import type { CSSProperties } from "react";
import { productPageCopy, type ProductIcon } from "@/data/product-details";
import type { ProductPageData } from "@/lib/product/product-data";
import { bucketSrcSet, bucketVariant } from "@/lib/product/product-images";
import { SiteFooter } from "@/components/site/SiteFooter";
import { outletsCopy } from "@/data/outlets";
import { OUTLETS_PATH } from "@/lib/outlets/outlets";
import { ProductPageHero } from "./ProductPageHero";
import { ProductSections } from "./ProductSections";
import "./product-page.css";

/** Highlight icons: 24-unit line paths, drawn like the home scenes' benefits. */
const ICONS: Record<ProductIcon, string> = {
  shield: "M12 3 4.5 6v6c0 5 7.5 9 7.5 9s7.5-4 7.5-9V6L12 3Zm-3.5 9 2.5 2.5 4.5-5",
  sparkle: "m8 3 1.5 4.5L14 9l-4.5 1.5L8 15l-1.5-4.5L2 9l4.5-1.5L8 3Zm10 9 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z",
  drop: "M12 2S5 10 5 14a7 7 0 0 0 14 0c0-4-7-12-7-12ZM8 14c0 2 1 3 3 4",
  leaf: "M20 3C9 3 3 8 5 15c2 7 15 3 15-12ZM3 22 16 8",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  home: "M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6",
  brush: "M14 4l6 6-8 8H6v-6l8-8Zm-3 3 6 6",
  palette: "M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A4.7 4.7 0 0 0 21 9.8C21 6 17 3 12 3ZM7.5 12.5h.01M9.5 7.5h.01M14.5 7.5h.01",
  air: "M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7",
  mix: "M5 9h14l-1.5 11h-11L5 9Zm3-5 2 5m6-5-2 5M8 14h8",
  badge: "M12 3l2.5 2 3.2-.3.6 3.1L21 10l-1.6 2.8.6 3.1-3.1.8-1.8 2.7L12 18l-3.1 1.4-1.8-2.7-3.1-.8.6-3.1L3 10l2.7-2.2.6-3.1 3.2.3L12 3Zm-3 9 2 2 4-4",
  thermo: "M10 14.8V5a2 2 0 1 1 4 0v9.8a4 4 0 1 1-4 0ZM12 9v7M17 6h3M17 10h3",
};

/** Rendered width of a related product's pack in its card, for the srcset choice. */
const RELATED_SIZES = "(max-width: 767px) 62vw, (max-width: 1023px) 30vw, 18vw";

/** A section heading in the story's chapter type: two lines, the last ending with a gold full stop. */
function Heading({ lines, id }: { lines: readonly string[]; id: string }) {
  return <h2 id={id} className="pp-heading">
    {/* A space between the lines keeps the words apart in the text search engines read; a question keeps its own mark. */}
    {lines.map((line, index) => <span key={line} className="pp-heading-line">{index > 0 && " "}{line}{index === lines.length - 1 && !line.endsWith("?") && <em aria-hidden="true">.</em>}</span>)}
  </h2>;
}

function Icon({ name }: { name: ProductIcon }) {
  return <svg className="pp-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>;
}

type ProductPageProps = { product: ProductPageData; related: readonly ProductPageData[] };

/** A product's own page: the hero, its story, highlights, details, application, questions and the rest of the range. */
export function ProductPage({ product, related }: ProductPageProps) {
  const copy = productPageCopy;
  // The hero counts the eight range categories only ("03 / 08").
  const total = [product, ...related].filter((entry) => entry.inRange).length;
  // Product pages by id, for sections that link to another product.
  const paths = Object.fromEntries([product, ...related].map((entry) => [entry.id, entry.path]));
  return <>
    <div className="pp-top-shade" aria-hidden="true" />
    <main id="main-content" className="pp-page" data-product={product.id}>
      <ProductPageHero product={product} total={total} />

      <section className="pp-section pp-story" aria-labelledby="pp-story-heading">
        <div className="pp-story-lead pp-reveal">
          <p className="pp-eyebrow">{copy.inspired}</p>
          <h2 id="pp-story-heading" className="pp-heading"><span className="pp-heading-line">{product.inspiration.label}<em aria-hidden="true">.</em></span></h2>
          <p className="pp-story-quote">{product.inspiration.body}</p>
        </div>
        <div className="pp-story-body pp-reveal">
          {product.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section className="pp-section pp-highlights" aria-labelledby="pp-highlights-heading">
        <Heading id="pp-highlights-heading" lines={copy.highlightsHeading} />
        <ul className="pp-highlight-grid">
          {product.highlights.map((item, index) => <li key={item.title} className="pp-highlight pp-reveal" style={{ "--pp-index": index } as CSSProperties}>
            <Icon name={item.icon} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </li>)}
        </ul>
      </section>

      <section id="details" className="pp-section pp-details" aria-labelledby="pp-details-heading">
        <div className="pp-details-visual pp-reveal" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pp-details-backdrop" src={product.poster} alt="" width={1248} height={704} loading="lazy" decoding="async" />
          {product.bucket && <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pp-details-pack" src={bucketVariant(product.bucket, 768)} srcSet={bucketSrcSet(product.bucket, 768)} sizes="(max-width: 1023px) 60vw, 26vw" alt="" width={768} height={960} loading="lazy" decoding="async" />
          </>}
        </div>
        <div className="pp-details-copy">
          <Heading id="pp-details-heading" lines={copy.specsHeading} />
          <dl className="pp-specs">
            {product.specs.map((spec) => <div key={spec.label} className="pp-spec"><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}
          </dl>
          <h3 className="pp-subheading">{copy.surfacesHeading}</h3>
          <ul className="pp-chips">{product.surfaces.map((surface) => <li key={surface}>{surface}</li>)}</ul>
          {product.surfacesNote && <p className="pp-surfaces-note">{product.surfacesNote}</p>}
          <p className="pp-note">{copy.note}</p>
        </div>
      </section>

      <section className="pp-section pp-steps" aria-labelledby="pp-steps-heading">
        <Heading id="pp-steps-heading" lines={copy.stepsHeading} />
        <ol className="pp-step-list">
          {product.steps.map((step, index) => <li key={step.title} className="pp-step pp-reveal" style={{ "--pp-index": index } as CSSProperties}>
            <span className="pp-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>)}
        </ol>
      </section>

      {product.sections && <ProductSections sections={product.sections} paths={paths} />}

      <section className="pp-section pp-faq" aria-labelledby="pp-faq-heading">
        <Heading id="pp-faq-heading" lines={copy.faqHeading} />
        <div className="pp-faq-list">
          {product.faqs.map((faq, index) => <details key={faq.question} className="pp-faq-item" open={index === 0}>
            <summary><h3>{faq.question}</h3><span className="pp-faq-mark" aria-hidden="true" /></summary>
            <p>{faq.answer}</p>
          </details>)}
        </div>
      </section>

      <section className="pp-section pp-related" aria-labelledby="pp-related-heading">
        <Heading id="pp-related-heading" lines={copy.relatedHeading} />
        <ul className="pp-related-list">
          {related.map((entry) => <li key={entry.id}>
            <a className="pp-card" href={entry.path} style={{ "--pp-pack-scale": entry.packScale ?? 1 } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pp-card-backdrop" src={entry.poster} alt="" width={1248} height={704} loading="lazy" decoding="async" />
              {entry.bucket && <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pp-card-pack" src={bucketVariant(entry.bucket, 480)} srcSet={bucketSrcSet(entry.bucket, 768)} sizes={RELATED_SIZES} alt={entry.fullName} width={480} height={600} loading="lazy" decoding="async" />
              </>}
              <span className="pp-card-copy">
                <span className="pp-card-index">{String(entry.index).padStart(2, "0")}</span>
                <span className="pp-card-title">{entry.title}</span>
                <span className="pp-card-link">{copy.explore}<span aria-hidden="true">⟶</span></span>
              </span>
            </a>
          </li>)}
        </ul>
      </section>

      <section className="pp-cta" aria-labelledby="pp-cta-heading">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pp-cta-backdrop" src={product.poster} alt="" width={1248} height={704} loading="lazy" decoding="async" aria-hidden="true" />
        <div className="pp-cta-copy pp-reveal">
          <Heading id="pp-cta-heading" lines={product.cta?.heading ?? copy.ctaHeading} />
                   <p>{product.cta?.body ?? copy.ctaBody}</p>
          <div className="pp-cta-actions">
            {/* A product's own first button, e.g. to its supporting blog post. */}
            {product.cta?.link && <a className="pp-cta-button pp-cta-button--solid" href={product.cta.link.href}>{product.cta.link.label}<span aria-hidden="true">⟶</span></a>}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
            <a className="pp-cta-button" href="/#enquiry">{product.cta?.button ?? copy.ctaButton}<span aria-hidden="true">⟶</span></a>
                        <a className="pp-cta-button" href={OUTLETS_PATH}>{outletsCopy.find}<span aria-hidden="true">⟶</span></a>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter products={[product, ...related].sort((a, b) => a.index - b.index)} productsLabel={copy.footerProducts} />
  </>;
}