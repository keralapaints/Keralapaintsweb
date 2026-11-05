import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { blogCopy } from "@/data/blog";
import { site } from "@/data/site";
import { BLOG_PATH, blogIndexSchema } from "@/lib/blog/blog-data";
import { jsonLd } from "@/lib/product/product-schema";

export const metadata: Metadata = {
  title: { absolute: blogCopy.index.seoTitle },
  description: blogCopy.index.seoDescription,
  alternates: { canonical: BLOG_PATH },
  openGraph: { title: blogCopy.index.seoTitle, description: blogCopy.index.seoDescription, url: BLOG_PATH, siteName: site.name, type: "website", locale: "en_IN" },
};

export default function BlogIndexRoute() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(blogIndexSchema()) }} />
    <Header home="/" skip={{ href: "#main-content", label: site.skipToContent }} />
    <BlogIndex />
  </>;
}