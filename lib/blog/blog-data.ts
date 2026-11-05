import { blogCopy, blogPosts, type BlogBlock, type BlogPost } from "@/data/blog";
import { site } from "@/data/site";
import { productPages } from "@/lib/product/product-data";
import { absoluteUrl } from "@/lib/product/product-schema";
import { BRAND_LOGO } from "@/lib/preload";

/** The blog index's address, and a post's (the site is exported with trailing slashes). */
export const BLOG_PATH = "/blog/";
export const blogPath = (slug: string) => `${BLOG_PATH}${slug}/`;

/** A product's page, by its `id`, for the links and cards in an article. */
export const productById = (id: string) => productPages.find((product) => product.id === id);

/** The text of one block, without its link markup, for the word count. */
const blockText = (block: BlogBlock) =>
  block.type === "list" ? block.items.join(" ") : block.type === "product" ? block.label : block.text;

/** Minutes to read at about 200 words a minute, never less than one. */
function readingMinutes(post: BlogPost) {
  const blocks = post.sections.flatMap((section) => [...section.blocks, ...(section.subsections ?? []).flatMap((sub) => sub.blocks)]);
  const text = [...post.intro, ...blocks.map(blockText), ...post.faqs.flatMap((faq) => [faq.question, faq.answer])].join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

export type BlogPostData = BlogPost & { path: string; minutes: number };

export const blogPostPages: BlogPostData[] = blogPosts.map((post) => ({ ...post, path: blogPath(post.slug), minutes: readingMinutes(post) }));

export const findBlogPost = (slug: string) => blogPostPages.find((post) => post.slug === slug);

/** "4 November 2026", for the article's dates. */
export const formatDate = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The structured data for an article: the post itself, its breadcrumb trail and its questions. */
export function blogPostSchema(post: BlogPostData) {
  const url = absoluteUrl(post.path);
  const hero = productById(post.heroProduct);
  const organisation = { "@type": "Organization", name: site.name, url: site.url, logo: { "@type": "ImageObject", url: absoluteUrl(BRAND_LOGO) } };
  return [{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.seoDescription,
    url,
    mainEntityOfPage: url,
    image: hero ? [absoluteUrl(hero.bucket ?? hero.poster)] : undefined,
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    author: organisation,
    publisher: organisation,
    keywords: post.keywords.join(", "),
    about: post.related.map((id) => productById(id)).filter((product) => product !== undefined)
      .map((product) => ({ "@type": "Product", name: `${site.name} ${product.name}`, url: absoluteUrl(product.path) })),
  }, {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: blogCopy.home, item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: blogCopy.blog, item: absoluteUrl(BLOG_PATH) },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  }, {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  }];
}

/** The structured data for the blog index: the blog and its posts. */
export function blogIndexSchema() {
  const url = absoluteUrl(BLOG_PATH);
  return [{
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    name: blogCopy.index.seoTitle,
    description: blogCopy.index.seoDescription,
    url,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    blogPost: blogPostPages.map((post) => ({ "@type": "BlogPosting", headline: post.title, url: absoluteUrl(post.path), datePublished: post.published })),
  }, {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: blogCopy.home, item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: blogCopy.blog, item: url },
    ],
  }];
}