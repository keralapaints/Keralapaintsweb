import type { Metadata } from "next";
import { ColourExplorer } from "@/components/products/ColourExplorer";
import { ColourPaletteHero } from "@/components/products/ColourPaletteHero";
import { Header } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/SiteFooter";
import { colourShades } from "@/data/colour-shades";
import { COLOURS_PATH, colourPaletteCopy as copy } from "@/data/colours";
import { productPageCopy } from "@/data/product-details";
import { site } from "@/data/site";
import { buildPalette } from "@/lib/colour-palette";
import { OUTLETS_PATH } from "@/lib/outlets/outlets";
import { toJsonLd } from "@/lib/product/template-schema";
import { getProductPages } from "@/lib/server/products-repo";
import "@/components/products/product-template.css";

const url = new URL(COLOURS_PATH, site.url).toString();
/** The enquiry form at the end of the home page. */
const ENQUIRY_HREF = "/#enquiry";

export const metadata: Metadata = {
  title: { absolute: copy.seoTitle },
  description: copy.seoDescription,
  alternates: { canonical: url },
  openGraph: { title: copy.seoTitle, description: copy.seoDescription, url, siteName: site.name, type: "website", locale: "en_IN" },
};

/** The Colour Palette page: every shade on the Kerala Paints shade card, to browse, search, open and shortlist. */
export default async function ColoursRoute() {
  const palette = buildPalette(colourShades);
  const pages = await getProductPages();
  const schema = [{
    "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url}#page`, name: copy.heading, description: copy.seoDescription, url,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.home, item: new URL("/", site.url).toString() },
      { "@type": "ListItem", position: 2, name: copy.crumb },
    ],
  }];
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }} />
    <Header home="/" skip={{ href: "#palette", label: site.skipToContent }} />
    <main id="main-content" className="pt-page cp-page">
      <ColourPaletteHero palette={palette} />
      <ColourExplorer enquireHref={ENQUIRY_HREF} outletHref={OUTLETS_PATH} />
      <section className="pt-section cp-cta" aria-labelledby="cp-cta-title">
        <h2 id="cp-cta-title" className="pt-h2">{copy.cta.heading}</h2>
        <p className="pt-lead">{copy.cta.body}</p>
        <div className="pt-actions">
          <a className="pt-button pt-button--primary" href={ENQUIRY_HREF}>{copy.cta.consult}</a>
          <a className="pt-button" href={OUTLETS_PATH}>{copy.cta.outlet}</a>
        </div>
        <p className="pt-footnote">{copy.note}</p>
      </section>
    </main>
    <SiteFooter products={pages} productsLabel={productPageCopy.footerProducts} />
  </>;
}