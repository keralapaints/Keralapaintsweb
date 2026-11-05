import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { ProductsOverview } from "@/components/products/ProductsOverview";
import { productsPageCopy } from "@/data/products-page";
import { site } from "@/data/site";
import { PRODUCTS_PATH } from "@/lib/product/product-data";
import { jsonLd, productsPageSchema } from "@/lib/product/product-schema";

/** The supplied SEO title already ends with the brand, so the layout's template is not added to it. */
export const metadata: Metadata = {
  title: { absolute: productsPageCopy.seoTitle },
  description: productsPageCopy.seoDescription,
  keywords: [...productsPageCopy.keywords],
  alternates: { canonical: PRODUCTS_PATH },
  openGraph: { title: productsPageCopy.seoTitle, description: productsPageCopy.seoDescription, url: PRODUCTS_PATH, siteName: site.name, type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image", title: productsPageCopy.seoTitle, description: productsPageCopy.seoDescription },
};

export default function ProductsRoute() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productsPageSchema()) }} />
    <Header home="/" skip={{ href: "#main-content", label: site.skipToContent }} />
    <ProductsOverview />
  </>;
}