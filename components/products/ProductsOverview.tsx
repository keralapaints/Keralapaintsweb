import type { CSSProperties } from "react";
import { productsPageCopy } from "@/data/products-page";
import { pad } from "@/lib/media/media";
import { productCategoryCards, productPages } from "@/lib/product/product-data";
import { bucketSrcSet, bucketVariant } from "@/lib/product/product-images";
import { SiteFooter } from "@/components/site/SiteFooter";
import "./product-page.css";

/** The overview's backdrop: the blue room the story's paint ribbon sweeps through (scene 14). */
const HERO_STILL = "/stills/14.webp";
/** Rendered width of a category's pack in its card, for the srcset choice. */
const CARD_PACK_SIZES = "(max-width: 1023px) 60vw, 22vw";

/** A section heading in the story's chapter type: two lines, the last ending with a gold full stop. */
function Heading({ lines, id }: { lines: readonly string[]; id: string }) {
  return <h2 id={id} className="pp-heading">
    {/* A space between the lines keeps the words apart in the text search engines read; a question keeps its own mark. */}
    {lines.map((line, index) => <span key={line} className="pp-heading-line">{index > 0 && " "}{line}{index === lines.length - 1 && !line.endsWith("?") && <em aria-hidden="true">.</em>}</span>)}
  </h2>;
}

/**
 * The Products overview (/products/): one H1, the eight categories as H2 sections that each link to their page, a
 * guide to choosing, the consultation and the questions. Plain links throughout, so every category is in the HTML.
 */
export function ProductsOverview() {
  const copy = productsPageCopy;
  return <>
    <div className="pp-top-shade" aria-hidden="true" />
    <main id="main-content" className="pp-page pp-overview">
      <section className="pp-ov-hero" aria-labelledby="pp-ov-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pp-ov-hero-backdrop" src={HERO_STILL} alt="" width={1600} height={902} fetchPriority="high" decoding="async" aria-hidden="true" />
        <div className="pp-ov-hero-copy">
          <nav className="pp-crumbs" aria-label="Breadcrumb">
            <ol>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
              <li><a href="/">{copy.home}</a></li>
              <li aria-current="page">{copy.breadcrumb}</li>
            </ol>
          </nav>
          <p className="pp-eyebrow">{copy.eyebrow} · {pad(productCategoryCards.length)}</p>
          <h1 id="pp-ov-title" className="pp-ov-title">{copy.heading.map((line, index) => <span key={line}>{index > 0 && " "}{line}{index === copy.heading.length - 1 && <em aria-hidden="true">.</em>}</span>)}</h1>
          <p className="pp-lede">{copy.intro}</p>
          <nav className="pp-ov-jump" aria-label={copy.jumpLabel}>
            <ul className="pp-chips">{productCategoryCards.map((entry) => <li key={entry.id}><a href={`#${entry.slug}`}>{entry.title}</a></li>)}</ul>
          </nav>
        </div>
      </section>

      <section id="product-categories" className="pp-section pp-ov-range" aria-label={copy.jumpLabel}>
        <ul className="pp-ov-grid">
          {productCategoryCards.map((entry) => <li key={entry.id} id={entry.slug} className="pp-ov-card pp-reveal">
            <div className="pp-ov-visual" style={{ "--pp-pack-scale": entry.packScale ?? 1 } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pp-ov-backdrop" src={entry.poster} alt="" width={1248} height={704} loading="lazy" decoding="async" />
              {entry.bucket && <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pp-ov-pack" src={bucketVariant(entry.bucket, 768)} srcSet={bucketSrcSet(entry.bucket, 768)} sizes={CARD_PACK_SIZES}
                  alt={entry.card.alt} width={768} height={960} loading="lazy" decoding="async" />
              </>}
            </div>
            <div className="pp-ov-body">
              <p className="pp-ov-index"><span>{pad(entry.index)}</span>{entry.name}</p>
              <h2 className="pp-ov-heading">{entry.card.heading}</h2>
              <p className="pp-ov-text">{entry.card.description}</p>
              {/* Its ::after covers the whole card, so the card is one click target with one link in the HTML. */}
              <a className="pp-ov-link" href={entry.path}>{entry.card.cta}<span aria-hidden="true">⟶</span></a>
              {/* Further products in the category: links above the card-wide link, so each stays clickable. */}
              {entry.card.also && <p className="pp-ov-also">{copy.also} {entry.card.also.map((id) => productPages.find((page) => page.id === id)).filter((page) => page !== undefined).map((page, index) => <span key={page.id}>{index > 0 && ", "}<a href={page.path}>{page.name}</a></span>)}</p>}
            </div>
          </li>)}
        </ul>
      </section>

      <section className="pp-section pp-story" aria-labelledby="pp-ov-guide-heading">
        <div className="pp-story-lead pp-reveal">
          <Heading id="pp-ov-guide-heading" lines={copy.guide.heading} />
        </div>
        <div className="pp-story-body pp-reveal">
          {copy.guide.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p className="pp-ov-guide-links"><a className="pp-ghost" href="#product-categories">{copy.guide.browse}<span aria-hidden="true">↑</span></a></p>
        </div>
      </section>

      <section className="pp-section pp-faq" aria-labelledby="pp-ov-faq-heading">
        <Heading id="pp-ov-faq-heading" lines={copy.faqHeading} />
        <div className="pp-faq-list">
          {copy.faqs.map((faq, index) => <details key={faq.question} className="pp-faq-item" open={index === 0}>
            <summary><h3>{faq.question}</h3><span className="pp-faq-mark" aria-hidden="true" /></summary>
            <p>{faq.answer}</p>
          </details>)}
        </div>
      </section>

      <section className="pp-cta" aria-labelledby="pp-ov-help-heading">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pp-cta-backdrop" src="/stills/16.webp" alt="" width={1600} height={900} loading="lazy" decoding="async" aria-hidden="true" />
        <div className="pp-cta-copy pp-reveal">
          <Heading id="pp-ov-help-heading" lines={copy.help.heading} />
          <p>{copy.help.body}</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
          <a className="pp-cta-button" href="/#enquiry">{copy.help.cta}<span aria-hidden="true">⟶</span></a>
        </div>
      </section>
    </main>
    <SiteFooter products={productPages} productsLabel={copy.breadcrumb} />
  </>;
}