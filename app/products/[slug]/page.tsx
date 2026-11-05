import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { ProductPage } from "@/components/products/ProductPage";
import { site } from "@/data/site";
import { findProductPage, productPages } from "@/lib/product/product-data";
import { jsonLd, productSchema } from "@/lib/product/product-schema";

type ProductRouteProps = { params: Promise<{ slug: string }> };

/** Static export: one HTML page per product, and no others. */
export const dynamicParams = false;

export function generateStaticParams() {
  return productPages.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const product = findProductPage((await params).slug);
  if (!product) return {};
  // The packshot where there is one, otherwise the product's nature backdrop.
  const image = product.bucket
    ? { url: product.bucket, width: 1536, height: 1920, alt: `${product.fullName} by ${site.name}` }
    : { url: product.poster, width: 1248, height: 704, alt: `${product.fullName} by ${site.name}` };
  return {
    // The supplied SEO titles are complete, so the layout's " | Kerala Paints" template is not added to them.
    title: { absolute: product.seoTitle },
    description: product.seoDescription,
    keywords: [...product.keywords],
    alternates: { canonical: product.path },
    openGraph: { title: product.seoTitle, description: product.seoDescription, url: product.path, siteName: site.name, type: "website", locale: "en_IN", images: [image] },
    twitter: { card: "summary_large_image", title: product.seoTitle, description: product.seoDescription, images: [image.url] },
  };
}

export default async function ProductRoute({ params }: ProductRouteProps) {
  const product = findProductPage((await params).slug);
  if (!product) notFound();
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema(product)) }} />
    <Header home="/" skip={{ href: "#main-content", label: site.skipToContent }} />
    <ProductPage product={product} related={productPages.filter((entry) => entry.id !== product.id)} />
  </>;
}