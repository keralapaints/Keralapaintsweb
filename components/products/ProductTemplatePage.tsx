import { productPageCopy } from "@/data/product-details";
import { productTemplateCopy as copy } from "@/data/product-template";
import { fill, priceFigures } from "@/lib/product/product-price";
import { bucketVariant } from "@/lib/product/product-images";
import { BRAND_LOGO } from "@/lib/preload";
import { toProductStep } from "@/lib/product/product-steps";
import { categoryPath } from "@/lib/product/product-urls";
import type { ReviewSummary } from "@/lib/product/reviews";
import type { TemplatePage } from "@/lib/server/products-repo";
import { RichText } from "@/components/site/RichText";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductIcon } from "./ProductIcon";
import { ProductReviews } from "./ProductReviews";
import { ProductSections } from "./ProductSections";
import { ProductTemplateHero } from "./ProductTemplateHero";
import "./product-page.css";
import "./product-template.css";

/** How many related product cards the last section shows. */
const RELATED_CARDS = 4;

type ProductTemplatePageProps = {
  product: TemplatePage;
  /** Every published product page, for links between products, the related cards and the footer. */
  pages: readonly TemplatePage[];
  category?: { name: string; plural: string };
  reviews: ReviewSummary;
  outletsPath: string;
};

type RelatedCard = { key: string; name: string; role: string; href: string; image: string; logo?: boolean; linkLabel: string };

/**
 * A product page in the eight-section template (data/product-template.ts): Hero, Key features, Specifications, How to
 * apply, Price, FAQ, Reviews and Related products. Exactly one H1; each section one H2; sub-topics H3.
 */
export function ProductTemplatePage({ product, pages, category, reviews, outletsPath }: ProductTemplatePageProps) {
  const name = product.name;
  const heading = (key: keyof typeof copy.headings) => fill(product.headings?.[key as keyof NonNullable<TemplatePage["headings"]>] ?? copy.headings[key], { name });
  const paths = Object.fromEntries(pages.map((page) => [page.id, page.path]));
  const featuresLead = product.featuresLead ? [product.featuresLead] : product.overview;
  // The steps are the "How to apply" rows edited in /admin.
  const steps = product.steps.map(toProductStep);
  const price = product.price;
  const figures = price && priceFigures(price);
  const unitWord = price?.unit === "kg" ? "kg" : "litre";

  const relatedCards: RelatedCard[] = product.related
    ? product.related.map((item) => {
      const page = item.product ? pages.find((entry) => entry.id === item.product) : undefined;
      return {
        key: item.name, name: item.name, role: item.role,
        href: page?.path ?? outletsPath,
        // A product without its own page yet shows the Kerala Paints mark rather than another product's picture.
        image: page ? (page.bucket ? bucketVariant(page.bucket, 480) : page.poster) : BRAND_LOGO,
        logo: !page,
        linkLabel: page ? copy.viewProduct : copy.relatedOutlet,
      };
    })
    : [...pages.filter((page) => page.id !== product.id && page.categorySlug === product.categorySlug), ...pages.filter((page) => page.id !== product.id && page.categorySlug !== product.categorySlug)]
      .slice(0, RELATED_CARDS)
      .map((page) => ({ key: page.id, name: page.name, role: page.tagline ?? page.headline ?? page.title, href: page.path, image: page.bucket ? bucketVariant(page.bucket, 480) : page.poster, linkLabel: copy.viewProduct }));
  const relatedLinks = product.relatedLinks ?? [
    ...(category ? [{ label: fill(copy.allIn, { category: category.plural }), href: categoryPath(product.categorySlug) }] : []),
    { label: copy.findOutlet, href: outletsPath },
  ];

  return <>
    <main id="main-content" className="pt-page">
      <ProductTemplateHero product={product} categoryName={category?.name} paths={paths} outletsPath={outletsPath} />

      <section id="key-features" className="pt-section" aria-labelledby="key-features-heading">
        <h2 id="key-features-heading" className="pt-h2">{heading("features")}</h2>
        {featuresLead.map((paragraph) => <p key={paragraph} className="pt-lead"><RichText text={paragraph} paths={paths} /></p>)}
        <ul className="pt-features">
          {product.highlights.map((item) => <li key={item.title}>
            <span className="pt-feature-icon"><ProductIcon name={item.icon} size={22} /></span>
            {/* The dash joins feature and benefit in the text; on screen the benefit sits under the feature. */}
            <p><strong><RichText text={item.title} paths={paths} /></strong><span className="pt-sr-only"> – </span><span><RichText text={item.text} paths={paths} /></span></p>
          </li>)}
        </ul>
        {(product.surfaces.length > 0 || product.usageIntro) && <div className="pt-sub">
          <h3 className="pt-h3">{heading("usage")}</h3>
          {product.usageIntro && <p className="pt-body"><RichText text={product.usageIntro} paths={paths} /></p>}
          <div className="pt-usage">
            {product.surfaces.length > 0 && <div>
              <p className="pt-label">{copy.areas}</p>
              <ul className="pt-checklist">{product.surfaces.map((surface) => <li key={surface}>{surface}</li>)}</ul>
            </div>}
            {product.surfacesNote && <div>
              <p className="pt-label">{copy.surfaces}</p>
              <p className="pt-body"><RichText text={product.surfacesNote} paths={paths} /></p>
            </div>}
          </div>
        </div>}
      </section>

      {product.specs.length > 0 && <section id="specifications" className="pt-section" aria-labelledby="specifications-heading">
        <h2 id="specifications-heading" className="pt-h2">{heading("specs")}</h2>
        <div className="pt-table-wrap">
          <table className="pt-spec-table">
            <caption>{fill(copy.specsCaption, { name })}</caption>
            <tbody>{product.specs.map((spec) => <tr key={spec.label}><th scope="row">{spec.label}</th><td>{spec.value}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="pt-footnote">{product.specsFootnote ?? productPageCopy.note}</p>
        {product.specNotes?.map((note) => <div key={note.heading} className="pt-sub pt-callout">
          <h3 className="pt-h3">{note.heading}</h3>
          <p className="pt-body"><RichText text={note.body} paths={paths} /></p>
          {note.link && <a className="pt-text-link" href={note.link.href}>{note.link.label}</a>}
        </div>)}
      </section>}

      {steps.length > 0 && <section id="how-to-apply" className="pt-section" aria-labelledby="how-to-apply-heading">
        <div className="pt-apply-head">
          <h2 id="how-to-apply-heading" className="pt-h2">{heading("apply")}</h2>
          {product.applyLead && <p className="pt-lead"><RichText text={product.applyLead} paths={paths} /></p>}
        </div>
        <ol className="pt-process">
          {steps.map((step, index) => <li key={step.title} className="pt-process-step" data-tone={step.tone}>
            <span className="pt-process-marker" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div className="pt-process-card">
              {step.tone && <span className="pt-process-tag">{fill(copy.stepTag[step.tone], { name })}</span>}
              {/* Read as "Step 1 – Prepare the Exterior Surface"; on screen the step number sits above the title. */}
              <h3 className="pt-step-title"><span className="pt-step-number">{fill(copy.step, { n: index + 1 })}</span><span className="pt-sr-only"> – </span><span>{step.title}</span></h3>
              <p className="pt-body"><RichText text={step.body} paths={paths} /></p>
              {step.items && <ul className="pt-step-notes">{step.items.map((item) => <li key={item}><RichText text={item} paths={paths} /></li>)}</ul>}
            </div>
          </li>)}
        </ol>
        {product.systems && product.systems.length > 0 && <div className="pt-sub">
          <h3 className="pt-h3">{copy.headings.systems}</h3>
          <div className="pt-systems">
            {product.systems.map((system) => <div key={system.title} className="pt-system">
              <div className="pt-system-head">
                <p className="pt-system-title">{system.title}</p>
                <span className="pt-system-count">{fill(copy.systemSteps, { n: system.steps.length })}</span>
              </div>
              <ol>{system.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              {system.note && <p className="pt-system-note"><em>{system.note}</em></p>}
            </div>)}
          </div>
        </div>}
        {((product.applyNotes && product.applyNotes.length > 0) || product.care) && <div className="pt-apply-extras">
          {product.applyNotes?.map((note) => <div key={note.heading} className="pt-extra">
            <span className="pt-feature-icon"><ProductIcon name="brush" size={22} /></span>
            <div>
              <h3 className="pt-h3">{note.heading}</h3>
              <p className="pt-body"><RichText text={note.body} paths={paths} /></p>
            </div>
          </div>)}
          {product.care && <div className="pt-extra pt-extra--care">
            <span className="pt-feature-icon"><ProductIcon name="drop" size={22} /></span>
            <div>
              <h3 className="pt-h3">{copy.headings.care}</h3>
              <p className="pt-body"><RichText text={product.care} paths={paths} /></p>
            </div>
          </div>}
        </div>}
      </section>}

      {/* Older long-form sections (tables, cards) written before the template, such as Aqua Seal 2K's application guide. */}
      {product.sections && product.sections.length > 0 && <ProductSections sections={product.sections} paths={paths} />}

      {price && figures && <section id="price-cost" className="pt-section" aria-labelledby="price-cost-heading">
        <h2 id="price-cost-heading" className="pt-h2">{heading("price")}</h2>
        {price.lead && <p className="pt-lead">{price.lead}</p>}
        <div className="pt-price">
          <div className="pt-price-card">
            <p className="pt-price-label">{price.label}</p>
            <dl>
              {figures.mrp && <div><dt>{copy.price.mrp}</dt><dd><s>{`₹${figures.mrp}`}</s></dd></div>}
              <div className="pt-price-offer"><dt>{copy.price.offer}</dt><dd>{`₹${figures.offer}`}</dd></div>
              <div><dt>{copy.price.coverage}</dt><dd>{fill(copy.price.coverageValue, { coverage: price.coverage, unit: unitWord })}</dd></div>
              <div><dt>{fill(copy.price.packCoverage, { pack: price.pack, unit: price.unit })}</dt><dd>{fill(copy.price.packCoverageValue, { area: figures.area })}</dd></div>
              <div><dt>{copy.price.cost}</dt><dd>{fill(copy.price.costValue, { cost: figures.cost })}</dd></div>
            </dl>
            <p className="pt-price-calc">{fill(copy.price.calculation, { offer: figures.offer, area: figures.area, cost: figures.cost, name })}</p>
          </div>
          <div className="pt-price-notes">
            <p className="pt-note">{price.note ?? fill(copy.price.note, { name })}</p>
            <p className="pt-footnote">{price.footnote ?? copy.price.footnote}</p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
            <a className="pt-button pt-button--primary" href="/#enquiry">{copy.price.estimate}</a>
          </div>
        </div>
      </section>}

      {product.faqs.length > 0 && <section id="faq" className="pt-section" aria-labelledby="faq-heading">
        <div className="pt-faq-layout">
          <div className="pt-faq-intro">
            <h2 id="faq-heading" className="pt-h2">{copy.headings.faq}</h2>
            <p className="pt-body">{fill(copy.faq.lead, { name })}</p>
            <div className="pt-faq-more">
              <p className="pt-label">{copy.faq.more}</p>
              <div className="pt-actions">
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the home page is always a full load, so its story starts clean */}
                <a className="pt-button pt-button--primary" href="/#enquiry">{copy.faq.consult}</a>
                <a className="pt-text-link" href="#reviews">{copy.faq.ask}<span aria-hidden="true"> →</span></a>
              </div>
            </div>
          </div>
          <div className="pt-faq">
            {product.faqs.map((faq, index) => <details key={faq.question} open={index === 0}>
              <summary>
                <span className="pt-faq-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="pt-faq-q">{faq.question}</h3>
                <span className="pt-faq-mark" aria-hidden="true" />
              </summary>
              <div className="pt-faq-answer"><p className="pt-body">{faq.answer}</p></div>
            </details>)}
          </div>
        </div>
      </section>}

      <section id="reviews" className="pt-section" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="pt-h2">{copy.headings.reviews}</h2>
        <ProductReviews productKey={product.id} productName={name} summary={reviews} />
      </section>

      {relatedCards.length > 0 && <section id="related-products" className="pt-section" aria-labelledby="related-products-heading">
        <h2 id="related-products-heading" className="pt-h2">{product.related ? heading("related") : copy.headings.relatedFallback}</h2>
        {product.relatedLead && <p className="pt-lead">{product.relatedLead}</p>}
        <ul className="pt-cards">
          {relatedCards.map((card) => <li key={card.key}>
            <a className="pt-card" href={card.href}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={card.logo ? "pt-card-logo" : undefined} src={card.image} alt="" width={480} height={600} loading="lazy" decoding="async" />
              <h3 className="pt-card-title">{card.name}</h3>
              <p className="pt-card-role">{card.role}</p>
              <span className="pt-card-link">{card.linkLabel}<span aria-hidden="true"> →</span></span>
            </a>
          </li>)}
        </ul>
        <ul className="pt-links">
          {relatedLinks.map((link) => <li key={link.label}><a className="pt-text-link" href={link.href} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link.label}</a></li>)}
        </ul>
      </section>}
    </main>
    <SiteFooter products={pages} productsLabel={productPageCopy.footerProducts} />
  </>;
}