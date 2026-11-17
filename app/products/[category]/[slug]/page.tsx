import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Header } from "@/components/site/Header";
import { ProductTemplatePage } from "@/components/products/ProductTemplatePage";
import { site } from "@/data/site";
import { OUTLETS_PATH } from "@/lib/outlets/outlets";
import { findCategory } from "@/lib/product/product-urls";
import { templateSchema, toJsonLd } from "@/lib/product/template-schema";
import { getProductPages } from "@/lib/server/products-repo";
import { getReviewSummary } from "@/lib/server/reviews-repo";

type ProductRouteProps = { params: Promise<{ category: string; slug: string }> };

/**
 * Every product page is built as static HTML from the products in MongoDB (or data/ without one). A product added in
 * /admin later is built the first time someone opens it; saving a product or approving a review rebuilds it.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getProductPages()).filter((page) => page.categorySlug).map((page) => ({ category: page.categorySlug, slug: page.slug }));
}

async function load(params: ProductRouteProps["params"]) {
  const { category, slug } = await params;
  const pages = await getProductPages();
  return { pages, requested: category, product: pages.find((page) => page.slug === slug) };
}

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { product } = await load(params);
  if (!product) return {};
  const title = product.ogTitle ?? `${product.name} – ${product.tagline ?? product.headline ?? product.title}`;
  // Absolute, https, no trailing slash: the same address as the sitemap and the structured data.
  const url = new URL(product.path, site.url).toString();
  const image = product.bucket
    ? { url: new URL(product.bucket, site.url).toString(), width: 1536, height: 1920, alt: product.imageAlt ?? product.fullName }
    : { url: new URL(product.poster, site.url).toString(), width: 1248, height: 704, alt: product.fullName };
  return {
    // The SEO title is complete, so the layout's " | Kerala Paints" template is not added to it.
    title: { absolute: product.seoTitle },
    description: product.seoDescription,
    keywords: [...product.keywords],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    // og:type "product" is not one of Next's Open Graph types, so the page adds it itself (below).
    openGraph: { title, description: product.seoDescription, url, siteName: site.name, locale: "en_IN", images: [image] },
    twitter: { card: "summary_large_image", title, description: product.seoDescription, images: [image.url] },
  };
}

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { pages, requested, product } = await load(params);
  if (!product) notFound();
  // The same product under another category address moves to its own, so there is one address per product.
  if (product.categorySlug && requested !== product.categorySlug) permanentRedirect(product.path);
  const category = findCategory(product.categorySlug);
  const reviews = await getReviewSummary(product.id);
  return <>
    <meta property="og:type" content="product" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(templateSchema(product, category, reviews)) }} />
    <Header home="/" skip={{ href: "#main-content", label: site.skipToContent }} />
    <ProductTemplatePage product={product} pages={pages} category={category} reviews={reviews} outletsPath={OUTLETS_PATH} />
  </>;
}