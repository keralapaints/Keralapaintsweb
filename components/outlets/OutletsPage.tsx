import { outletsCopy } from "@/data/outlets";
import { productPageCopy } from "@/data/product-details";
import { productPages } from "@/lib/product/product-data";
import { SiteFooter } from "@/components/site/SiteFooter";
import { OutletFinder } from "./OutletFinder";
import "@/components/products/product-page.css";
import "./outlets.css";

/** The page's backdrop: the story's living room (scene 16). */
const HERO_STILL = "/stills/16.webp";

/** Find an Outlet (/outlets/): the heading, the searchable outlet list, the consultation and the footer. */
export function OutletsPage() {
  const copy = outletsCopy;
  return <>
    <div className="pp-top-shade" aria-hidden="true" />
    <main id="main-content" className="pp-page ol-page">
      <section className="pp-ov-hero ol-hero" aria-labelledby="ol-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pp-ov-hero-backdrop" src={HERO_STILL} alt="" width={1600} height={900} fetchPriority="high" decoding="async" aria-hidden="true" />
        <div className="pp-ov-hero-copy">
          <nav className="pp-crumbs" aria-label="Breadcrumb">
            <ol>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
              <li><a href="/">{copy.home}</a></li>
              <li aria-current="page">{copy.breadcrumb}</li>
            </ol>
          </nav>
          <p className="pp-eyebrow">{copy.eyebrow}</p>
          <h1 id="ol-title" className="pp-ov-title">{copy.heading.map((line, index) => <span key={line}>{index > 0 && " "}{line}{index === copy.heading.length - 1 && <em aria-hidden="true">.</em>}</span>)}</h1>
          <p className="pp-lede">{copy.intro}</p>
        </div>
      </section>

      <section className="pp-section ol-list" aria-label={copy.breadcrumb}>
        <OutletFinder />
      </section>

      <section className="pp-cta" aria-labelledby="ol-cta-heading">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pp-cta-backdrop" src="/stills/14.webp" alt="" width={1600} height={902} loading="lazy" decoding="async" aria-hidden="true" />
        <div className="pp-cta-copy">
          <h2 id="ol-cta-heading" className="pp-heading">{copy.ctaHeading.map((line, index) => <span key={line} className="pp-heading-line">{index > 0 && " "}{line}</span>)}</h2>
          <p>{copy.ctaBody}</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
          <a className="pp-cta-button" href="/#enquiry">{copy.ctaButton}<span aria-hidden="true">⟶</span></a>
        </div>
      </section>
    </main>
    <SiteFooter products={productPages} productsLabel={productPageCopy.footerProducts} />
  </>;
}