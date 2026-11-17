import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/SiteFooter";
import { categoryCopy, productCategories, productsOverviewCopy as copy } from "@/data/categories";
import { productPageCopy } from "@/data/product-details";
import { site } from "@/data/site";
import { bucketVariant } from "@/lib/product/product-images";
import { fill } from "@/lib/product/product-price";
import { PRODUCTS_BASE, categoryPath } from "@/lib/product/product-urls";
import { getProductPages } from "@/lib/server/products-repo";
import "@/components/products/product-template.css";

const url = new URL(PRODUCTS_BASE, site.url).toString();

export const metadata: Metadata = {
  title: { absolute: copy.seoTitle },
  description: copy.seoDescription,
  alternates: { canonical: url },
  openGraph: { title: copy.seoTitle, description: copy.seoDescription, url, siteName: site.name, type: "website", locale: "en_IN" },
};

/** The Products overview: every category with products, each as a card linking to its category page. */
export default async function ProductsRoute() {
  const pages = await getProductPages();
  const categories = productCategories
    .map((category) => ({ category, products: pages.filter((page) => page.categorySlug === category.slug) }))
    .filter((entry) => entry.products.length > 0);
  return <>
    <Header home="/" skip={{ href: "#main-content", label: site.skipToContent }} />
    <main id="main-content" className="pt-page">
      <section className="pt-category-hero" aria-labelledby="pt-products-title">
        <nav className="pt-crumbs" aria-label="Breadcrumb">
          <ol>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
            <li><a href="/">{categoryCopy.home}</a></li>
            <li aria-current="page">{categoryCopy.products}</li>
          </ol>
        </nav>
        <p className="pt-label">{copy.eyebrow}</p>
        <h1 id="pt-products-title" className="pt-title"><span className="pt-title-name">{copy.heading}</span></h1>
        <p className="pt-intro">{copy.description}</p>
      </section>
      <section className="pt-section" aria-label={copy.heading}>
        <ul className="pt-cards">
          {categories.map(({ category, products }) => {
            const first = products[0];
            return <li key={category.slug}>
              <a className="pt-card" href={categoryPath(category.slug)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={first.bucket ? bucketVariant(first.bucket, 480) : first.poster} alt="" width={480} height={600} loading="lazy" decoding="async" />
                <h2 className="pt-card-title">{category.heading}</h2>
                <p className="pt-card-role">{products.length === 1 ? copy.one : fill(copy.count, { n: products.length })}</p>
                <span className="pt-card-link">{copy.view}<span aria-hidden="true"> →</span></span>
              </a>
            </li>;
          })}
        </ul>
      </section>
    </main>
    <SiteFooter products={pages} productsLabel={productPageCopy.footerProducts} />
  </>;
}