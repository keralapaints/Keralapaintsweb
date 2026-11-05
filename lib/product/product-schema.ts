import { productPageCopy } from "@/data/product-details";
import { productsPageCopy } from "@/data/products-page";
import { site } from "@/data/site";
import { PRODUCTS_PATH, productCategoryCards, type ProductPageData } from "./product-data";

/** An absolute address on the live site, for structured data and the sitemap. */
export const absoluteUrl = (path: string) => new URL(path, site.url).toString();

/**
 * The structured data (schema.org JSON-LD) for a product page: the product itself, its breadcrumb trail and its
 * questions. Search engines read these to show richer results.
 */
export function productSchema(product: ProductPageData) {
  const url = absoluteUrl(product.path);
  const brand = { "@type": "Brand", name: site.name };
  return [{
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.fullName.startsWith(site.name) ? product.fullName : `${site.name} ${product.fullName}`,
    description: product.seoDescription,
    category: product.category,
    url,
    image: [absoluteUrl(product.bucket ?? product.poster)],
    brand,
    manufacturer: { "@type": "Organization", name: site.name, url: site.url },
    additionalProperty: product.specs.map((spec) => ({ "@type": "PropertyValue", name: spec.label, value: spec.value })),
  }, {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: productPageCopy.home, item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: productPageCopy.products, item: absoluteUrl(PRODUCTS_PATH) },
      { "@type": "ListItem", position: 3, name: product.title, item: url },
    ],
  }, {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: product.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  }];
}

/**
 * The structured data for the Products overview page: the collection, its breadcrumb, the eight categories as a list
 * linking to their pages, and its visible questions. It is never marked up as a single product.
 */
export function productsPageSchema() {
  const url = absoluteUrl(PRODUCTS_PATH);
  return [{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    name: productsPageCopy.seoTitle,
    description: productsPageCopy.seoDescription,
    url,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    mainEntity: { "@id": `${url}#categories` },
  }, {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#categories`,
    itemListElement: productCategoryCards.map((entry, index) => ({ "@type": "ListItem", position: index + 1, name: entry.card.heading, url: absoluteUrl(entry.path) })),
  }, {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: productsPageCopy.home, item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: productsPageCopy.breadcrumb, item: url },
    ],
  }, {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: productsPageCopy.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  }];
}

/** JSON-LD as safe script text: `<` is escaped so no string in it can close the script element. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");