import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { BlogPost } from "@/components/blog/BlogPost";
import { site } from "@/data/site";
import { blogPostPages, blogPostSchema, findBlogPost, productById } from "@/lib/blog/blog-data";
import { jsonLd } from "@/lib/product/product-schema";

type BlogRouteProps = { params: Promise<{ slug: string }> };

/** Static export: one HTML page per article, and no others. */
export const dynamicParams = false;

export function generateStaticParams() {
  return blogPostPages.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogRouteProps): Promise<Metadata> {
  const post = findBlogPost((await params).slug);
  if (!post) return {};
  const hero = productById(post.heroProduct);
  const image = hero?.bucket
    ? { url: hero.bucket, width: 1536, height: 1920, alt: `${hero.fullName} by ${site.name}` }
    : hero && { url: hero.poster, width: 1248, height: 704, alt: post.title };
  return {
    // The supplied SEO title is complete, so the layout's " | Kerala Paints" template is not added to it.
    title: { absolute: post.seoTitle },
    description: post.seoDescription,
    keywords: [...post.keywords],
    alternates: { canonical: post.path },
    openGraph: { type: "article", title: post.seoTitle, description: post.seoDescription, url: post.path, siteName: site.name, locale: "en_IN", publishedTime: post.published, modifiedTime: post.updated ?? post.published, images: image ? [image] : undefined },
    twitter: { card: "summary_large_image", title: post.seoTitle, description: post.seoDescription, images: image ? [image.url] : undefined },
  };
}

export default async function BlogRoute({ params }: BlogRouteProps) {
  const post = findBlogPost((await params).slug);
  if (!post) notFound();
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(blogPostSchema(post)) }} />
    <Header home="/" skip={{ href: "#main-content", label: site.skipToContent }} />
    <BlogPost post={post} />
  </>;
}