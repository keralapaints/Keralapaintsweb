import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { OutletsPage } from "@/components/outlets/OutletsPage";
import { outletsCopy } from "@/data/outlets";
import { site } from "@/data/site";
import { OUTLETS_PATH, outletsSchema } from "@/lib/outlets/outlets";
import { jsonLd } from "@/lib/product/product-schema";

export const metadata: Metadata = {
  title: { absolute: outletsCopy.seoTitle },
  description: outletsCopy.seoDescription,
  keywords: [...outletsCopy.keywords],
  alternates: { canonical: OUTLETS_PATH },
  openGraph: { title: outletsCopy.seoTitle, description: outletsCopy.seoDescription, url: OUTLETS_PATH, siteName: site.name, type: "website", locale: "en_IN" },
};

export default function OutletsRoute() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(outletsSchema()) }} />
    <Header home="/" skip={{ href: "#main-content", label: site.skipToContent }} />
    <OutletsPage />
  </>;
}