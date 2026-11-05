import { site } from "@/data/site";
import { BRAND_LOGO } from "@/lib/preload";

type FooterProduct = { id: string; title: string; path: string };

/**
 * The footer of the inner pages: the brand sign-off from the home page's closing footer, standing still, with links
 * to every product page (which also helps search engines find them all).
 */
export function SiteFooter({ products, productsLabel }: { products: readonly FooterProduct[]; productsLabel: string }) {
  return <footer className="site-footer">
    <div className="site-footer-top">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
      <a href="/" className="site-footer-brand" aria-label={`${site.name} — home`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BRAND_LOGO} alt={site.logoAlt} width={820} height={500} loading="lazy" />
      </a>
      <p className="site-footer-heading">{site.footerLines.map((line) => <span key={line}>{line}<em aria-hidden="true">.</em></span>)}</p>
    </div>
    <nav className="site-footer-nav" aria-label={productsLabel}>
      <p className="site-footer-label">{productsLabel}</p>
      <ul>{products.map((product) => <li key={product.id}><a href={product.path}>{product.title}</a></li>)}</ul>
    </nav>
    <p className="site-footer-copyright">{site.copyright}</p>
  </footer>;
}