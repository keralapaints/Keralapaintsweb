import { productTemplateCopy } from "@/data/product-template";
import { site } from "@/data/site";
import type { TemplatePage } from "@/lib/server/products-repo";
import { PRODUCTS_BASE, categoryPath } from "./product-urls";
import { MIN_REVIEWS_FOR_SUMMARY, type ReviewSummary } from "./reviews";

/** An absolute address on the live site: https, no trailing slash (except the home page). */
const absolute = (path: string) => new URL(path, site.url).toString();

/**
 * The structured data (JSON-LD) of a template product page: Product (with its offer, and its star rating only when
 * real approved reviews are shown), BreadcrumbList and FAQPage. Every value matches what the page shows.
 */
export function templateSchema(product: TemplatePage, category: { name: string } | undefined, reviews: ReviewSummary) {
  const url = absolute(product.path);
  const price = product.price;
  const brand = { "@type": "Brand", name: site.name };
  const rated = reviews.count >= MIN_REVIEWS_FOR_SUMMARY;
  return [{
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.fullName,
    url,
    description: product.schemaDescription ?? product.seoDescription,
    image: [absolute(product.bucket ?? product.poster)],
    brand,
    manufacturer: { "@type": "Organization", name: site.name, url: site.url },
    category: product.category,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(price ? { size: `${price.pack} ${price.unit}` } : {}),
    // The footnote asterisks belong to the page, not to the values.
    additionalProperty: product.specs.map((spec) => ({ "@type": "PropertyValue", name: spec.label, value: spec.value.replace(/\*$/, "") })),
    ...(price ? {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "INR",
        price: String(price.offer),
        ...(price.mrp ? { priceSpecification: { "@type": "UnitPriceSpecification", priceType: "https://schema.org/StrikethroughPrice", price: String(price.mrp), priceCurrency: "INR" } } : {}),
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: site.name },
      },
    } : {}),
    ...(rated ? {
      aggregateRating: { "@type": "AggregateRating", ratingValue: reviews.average.toFixed(1), reviewCount: reviews.count, bestRating: 5, worstRating: 1 },
      review: reviews.reviews.slice(0, 5).map((review) => ({
        "@type": "Review",
        name: review.title,
        reviewBody: review.text,
        datePublished: review.date,
        author: { "@type": "Person", name: review.name },
        reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
      })),
    } : {}),
  }, {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: productTemplateCopy.home, item: absolute("/") },
      { "@type": "ListItem", position: 2, name: productTemplateCopy.products, item: absolute(PRODUCTS_BASE) },
      ...(category ? [{ "@type": "ListItem", position: 3, name: category.name, item: absolute(categoryPath(product.categorySlug)) }] : []),
      // The current page is the last crumb, without a link.
      { "@type": "ListItem", position: category ? 4 : 3, name: product.name },
    ],
  }, ...(product.faqs.length > 0 ? [{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: product.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  }] : [])];
}

/** JSON-LD as safe script text: `<` is escaped so no string in it can close the script element. */
export const toJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");