import type { CSSProperties, ReactNode } from "react";
import { blogCopy, type BlogBlock } from "@/data/blog";
import { productPageCopy } from "@/data/product-details";
import { site } from "@/data/site";
import { BLOG_PATH, formatDate, productById, type BlogPostData } from "@/lib/blog/blog-data";
import { productPages } from "@/lib/product/product-data";
import { bucketSrcSet, bucketVariant } from "@/lib/product/product-images";
import { SiteFooter } from "@/components/site/SiteFooter";
import "@/components/products/product-page.css";
import "./blog.css";

/** Link markup inside article text: [label](product:<id>) or [label](/path/). */
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** A link target: a product page by id, or a site path as written. */
const hrefFor = (target: string) => target.startsWith("product:") ? productById(target.slice("product:".length))?.path : target;

/** Article text with its links drawn as links; a link to a missing product stays plain text. */
function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, target] = match;
    const index = match.index ?? 0;
    parts.push(text.slice(last, index));
    const href = hrefFor(target);
    parts.push(href ? <a key={index} href={href}>{label}</a> : label);
    last = index + whole.length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

/** A section heading in the story's chapter type: two lines, the last ending with a gold full stop. */
function Heading({ lines, id }: { lines: readonly string[]; id: string }) {
  return <h2 id={id} className="pp-heading">
    {lines.map((line, index) => <span key={line} className="pp-heading-line">{index > 0 && " "}{line}{index === lines.length - 1 && !line.endsWith("?") && <em aria-hidden="true">.</em>}</span>)}
  </h2>;
}

function Block({ block }: { block: BlogBlock }) {
  if (block.type === "p") return <p><RichText text={block.text} /></p>;
  if (block.type === "list") {
    const List = block.ordered ? "ol" : "ul";
    return <List>{block.items.map((item) => <li key={item}><RichText text={item} /></li>)}</List>;
  }
  if (block.type === "callout") return <div className="bl-callout">
    {block.title && <p className="bl-callout-title">{block.title}</p>}
    <p><RichText text={block.text} /></p>
  </div>;
  const product = productById(block.product);
  if (!product) return null;
  return <div className="bl-product">
    {product.bucket && <div className="bl-product-pack" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bucketVariant(product.bucket, 480)} srcSet={bucketSrcSet(product.bucket, 768)} sizes="180px" alt="" width={480} height={600} loading="lazy" decoding="async" />
    </div>}
    <div className="bl-product-copy">
      <p className="bl-product-name">{site.name} {product.name}</p>
      <p>{product.seoDescription}</p>
      <a className="pp-cta-button pp-cta-button--solid" href={product.path}>{block.label}<span aria-hidden="true">⟶</span></a>
    </div>
  </div>;
}

/**
 * A blog article: a hero over the product's backdrop, a contents list beside the text on wide screens, the article's
 * sections, its questions, the products it mentions and a call to action.
 */
export function BlogPost({ post }: { post: BlogPostData }) {
  const copy = blogCopy;
  const hero = productById(post.heroProduct);
  const related = post.related.map((id) => productById(id)).filter((product) => product !== undefined);
  return <>
    <div className="pp-top-shade" aria-hidden="true" />
    <main id="main-content" className="pp-page bl-page">
      <section className="pp-hero bl-hero" aria-labelledby="bl-title">
        {hero && <div className="pp-backdrop" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.poster} alt="" width={1248} height={704} fetchPriority="high" decoding="async" />
          <div className="pp-grade" />
        </div>}
        <div className="pp-hero-inner">
          <div className="pp-hero-copy">
            <nav className="pp-crumbs" aria-label="Breadcrumb">
              <ol>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
                <li><a href="/">{copy.home}</a></li>
                <li><a href={BLOG_PATH}>{copy.blog}</a></li>
                <li aria-current="page">{post.eyebrow}</li>
              </ol>
            </nav>
            <p className="pp-eyebrow">{post.eyebrow}</p>
            <h1 id="bl-title" className="bl-title">{post.title}</h1>
            <p className="bl-meta">
              <span>{copy.by}</span>
              <span>{post.minutes} {copy.readingTime}</span>
              <span>{copy.published} <time dateTime={post.published}>{formatDate(post.published)}</time></span>
              {post.updated && <span>{copy.updated} <time dateTime={post.updated}>{formatDate(post.updated)}</time></span>}
            </p>
          </div>
          {hero?.bucket && <div className="pp-pack" style={{ "--pp-pack-scale": hero.packScale ?? 1, "--pp-pack-y": hero.packY ?? "0%" } as CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.bucket} srcSet={bucketSrcSet(hero.bucket)} sizes="(max-width: 1023px) 70vw, 36vw" width={1536} height={1920}
              alt={`${site.name} ${hero.name} waterproofing product pack`} fetchPriority="high" decoding="async" />
          </div>}
        </div>
      </section>

      <div className="bl-layout">
        <nav className="bl-toc" aria-labelledby="bl-toc-heading">
          <p id="bl-toc-heading" className="bl-toc-heading">{copy.contents}</p>
          <ol>{post.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}</ol>
        </nav>
        <article className="bl-article">
          <div className="bl-intro">{post.intro.map((paragraph) => <p key={paragraph}><RichText text={paragraph} /></p>)}</div>
          {post.sections.map((section) => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
            <h2 id={`${section.id}-heading`}>{section.heading}</h2>
            {section.blocks.map((block, index) => <Block key={index} block={block} />)}
            {section.subsections?.map((sub) => <div key={sub.heading} className="bl-sub">
              <h3>{sub.heading}</h3>
              {sub.blocks.map((block, index) => <Block key={index} block={block} />)}
            </div>)}
          </section>)}
          <aside className="bl-links" aria-labelledby="bl-links-heading">
            <p id="bl-links-heading" className="bl-toc-heading">{copy.linksHeading}</p>
            <ul>{post.links.map((link) => {
              const href = link.href ?? (link.product ? productById(link.product)?.path : undefined);
              return href && <li key={link.label}><a className="pp-ghost" href={href}>{link.label}<span aria-hidden="true">⟶</span></a></li>;
            })}</ul>
          </aside>
        </article>
      </div>

      <section className="pp-section pp-faq" aria-labelledby="bl-faq-heading">
        <Heading id="bl-faq-heading" lines={copy.faqHeading} />
        <div className="pp-faq-list">
          {post.faqs.map((faq, index) => <details key={faq.question} className="pp-faq-item" open={index === 0}>
            <summary><h3>{faq.question}</h3><span className="pp-faq-mark" aria-hidden="true" /></summary>
            <p>{faq.answer}</p>
          </details>)}
        </div>
      </section>

      {related.length > 0 && <section className="pp-section pp-related" aria-labelledby="bl-related-heading">
        <Heading id="bl-related-heading" lines={copy.relatedHeading} />
        <ul className="pp-related-list">
          {related.map((entry) => <li key={entry.id}>
            <a className="pp-card" href={entry.path} style={{ "--pp-pack-scale": entry.packScale ?? 1 } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pp-card-backdrop" src={entry.poster} alt="" width={1248} height={704} loading="lazy" decoding="async" />
              {entry.bucket && <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pp-card-pack" src={bucketVariant(entry.bucket, 480)} srcSet={bucketSrcSet(entry.bucket, 768)} sizes="(max-width: 767px) 62vw, 330px" alt={entry.fullName} width={480} height={600} loading="lazy" decoding="async" />
              </>}
              <span className="pp-card-copy">
                <span className="pp-card-index">{entry.name}</span>
                <span className="pp-card-title">{entry.title}</span>
                <span className="pp-card-link">{copy.explore}<span aria-hidden="true">⟶</span></span>
              </span>
            </a>
          </li>)}
        </ul>
      </section>}

      <section className="pp-cta" aria-labelledby="bl-cta-heading">
        {hero && <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pp-cta-backdrop" src={hero.poster} alt="" width={1248} height={704} loading="lazy" decoding="async" aria-hidden="true" />
        </>}
        <div className="pp-cta-copy">
          <Heading id="bl-cta-heading" lines={copy.ctaHeading} />
          <p>{copy.ctaBody}</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
          <a className="pp-cta-button" href="/#enquiry">{copy.ctaButton}<span aria-hidden="true">⟶</span></a>
        </div>
      </section>
    </main>
    <SiteFooter products={productPages} productsLabel={productPageCopy.footerProducts} />
  </>;
}