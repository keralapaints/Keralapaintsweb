import { blogCopy } from "@/data/blog";
import { productPageCopy } from "@/data/product-details";
import { blogPostPages, formatDate, productById } from "@/lib/blog/blog-data";
import { productPages } from "@/lib/product/product-data";
import { SiteFooter } from "@/components/site/SiteFooter";
import "@/components/products/product-page.css";
import "./blog.css";

/** The blog index (/blog/): its heading and every article as a card, newest first. */
export function BlogIndex() {
  const copy = blogCopy;
  const posts = [...blogPostPages].sort((a, b) => b.published.localeCompare(a.published));
  return <>
    <div className="pp-top-shade" aria-hidden="true" />
    <main id="main-content" className="pp-page bl-page">
      <section className="bl-index-hero" aria-labelledby="bl-index-title">
        <nav className="pp-crumbs" aria-label="Breadcrumb">
          <ol>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
            <li><a href="/">{copy.home}</a></li>
            <li aria-current="page">{copy.blog}</li>
          </ol>
        </nav>
        <p className="pp-eyebrow">{copy.index.eyebrow}</p>
        <h1 id="bl-index-title" className="pp-ov-title">{copy.index.heading.map((line, index) => <span key={line}>{index > 0 && " "}{line}{index === copy.index.heading.length - 1 && <em aria-hidden="true">.</em>}</span>)}</h1>
        <p className="bl-index-intro">{copy.index.intro}</p>
      </section>
      <section className="pp-section bl-index-list" aria-labelledby="bl-index-title">
        <ul className="bl-cards">
          {posts.map((post) => {
            const hero = productById(post.heroProduct);
            return <li key={post.slug} className="bl-card">
              {hero && <div className="bl-card-visual" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={hero.poster} alt="" width={1248} height={704} loading="lazy" decoding="async" />
              </div>}
              <div className="bl-card-body">
                <p className="pp-eyebrow">{post.eyebrow}</p>
                <h2><a href={post.path}>{post.title}</a></h2>
                <p>{post.seoDescription}</p>
                <p className="bl-meta"><time dateTime={post.published}>{formatDate(post.published)}</time><span>{post.minutes} {copy.readingTime}</span></p>
                <span className="pp-ov-link" aria-hidden="true">{copy.read}<span>⟶</span></span>
              </div>
            </li>;
          })}
        </ul>
      </section>
    </main>
    <SiteFooter products={productPages} productsLabel={productPageCopy.footerProducts} />
  </>;
}