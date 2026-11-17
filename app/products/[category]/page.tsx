import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Header } from "@/components/site/Header";
import { CategoryPage } from "@/components/products/CategoryPage";
import { categoryCopy, productCategories } from "@/data/categories";
import { site } from "@/data/site";
import { PRODUCTS_BASE, categoryPath, findCategory } from "@/lib/product/product-urls";
import { toJsonLd } from "@/lib/product/template-schema";
import { getProductPages } from "@/lib/server/products-repo";

type CategoryRouteProps = { params: Promise<{ category: string }> };

/** Other values are still checked: an old product address (/products/bhadram-ex) moves to its new one. */
export const dynamicParams = true;

export function generateStaticParams() {
  return productCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: CategoryRouteProps): Promise<Metadata> {
  const category = findCategory((await params).category);
  if (!category) return {};
  const url = new URL(categoryPath(category.slug), site.url).toString();
  return {
    title: { absolute: category.seoTitle },
    description: category.seoDescription,
    alternates: { canonical: url },
    openGraph: { title: category.seoTitle, description: category.seoDescription, url, siteName: site.name, type: "website", locale: "en_IN" },
  };
}

export default async function CategoryRoute({ params }: CategoryRouteProps) {
  const slug = (await params).category;
  const category = findCategory(slug);
  const pages = await getProductPages();
  if (!category) {
    // Product pages used to live at /products/<product>; send those addresses to the new one for good (308).
    const moved = pages.find((page) => page.slug === slug);
    if (moved) permanentRedirect(moved.path);
    notFound();
  }
  const order = (page: (typeof pages)[number]) => { const position = category.products.indexOf(page.slug); return position < 0 ? 100 + page.index : position; };
  const products = pages.filter((page) => page.categorySlug === category.slug).sort((a, b) => order(a) - order(b));
  const url = new URL(categoryPath(category.slug), site.url).toString();
  const schema = [{
    "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url}#page`, name: category.heading, description: category.seoDescription, url,
    mainEntity: { "@type": "ItemList", itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: new URL(product.path, site.url).toString() })) },
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: categoryCopy.home, item: new URL("/", site.url).toString() },
      { "@type": "ListItem", position: 2, name: categoryCopy.products, item: new URL(PRODUCTS_BASE, site.url).toString() },
      { "@type": "ListItem", position: 3, name: category.name },
    ],
  }];
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }} />
    <Header home="/" skip={{ href: "#main-content", label: site.skipToContent }} />
    <CategoryPage category={category} products={products} pages={pages} />
  </>;
}