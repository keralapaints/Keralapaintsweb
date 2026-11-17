import type { ProductCategory } from "@/data/categories";
import { categoryCopy as copy } from "@/data/categories";
import { productPageCopy } from "@/data/product-details";
import { bucketVariant } from "@/lib/product/product-images";
import { PRODUCTS_BASE } from "@/lib/product/product-urls";
import type { TemplatePage } from "@/lib/server/products-repo";
import { SiteFooter } from "@/components/site/SiteFooter";
import "./product-template.css";

type CategoryPageProps = { category: ProductCategory; products: readonly TemplatePage[]; pages: readonly TemplatePage[] };

/** A category page (/products/exterior-emulsion): its H1 and intro, then every product in it as a card. */
export function CategoryPage({ category, products, pages }: CategoryPageProps) {
  return <>
    <main id="main-content" className="pt-page">
      <section className="pt-category-hero" aria-labelledby="pt-category-title">
        <nav className="pt-crumbs" aria-label="Breadcrumb">
          <ol>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
            <li><a href="/">{copy.home}</a></li>
            <li><a href={PRODUCTS_BASE}>{copy.products}</a></li>
            <li aria-current="page">{category.name}</li>
          </ol>
        </nav>
        <p className="pt-label">{copy.eyebrow}</p>
        <h1 id="pt-category-title" className="pt-title"><span className="pt-title-name">{category.heading}</span></h1>
        <p className="pt-intro">{category.description}</p>
      </section>
      <section className="pt-section" aria-label={category.plural}>
        {products.length === 0 ? <p className="pt-body">{copy.empty}</p> : <ul className="pt-cards">
          {products.map((product) => <li key={product.id}>
            <a className="pt-card" href={product.path}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.bucket ? bucketVariant(product.bucket, 480) : product.poster} alt="" width={480} height={600} loading="lazy" decoding="async" />
              <h2 className="pt-card-title">{product.name}</h2>
              <p className="pt-card-role">{product.tagline ?? product.headline ?? product.title}</p>
              <span className="pt-card-link">{copy.view}<span aria-hidden="true"> →</span></span>
            </a>
          </li>)}
        </ul>}
        <div className="pt-actions">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
          <a className="pt-button pt-button--primary" href="/#enquiry">{copy.consult}</a>
        </div>
      </section>
    </main>
    <SiteFooter products={pages} productsLabel={productPageCopy.footerProducts} />
  </>;
}