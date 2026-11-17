import "server-only";
import type { ProductDetail } from "@/data/product-details";
import { productTemplates, type ProductTemplate } from "@/data/product-template";
import { HERO_KEYS, TEMPLATE_KEYS, type ProductInput } from "@/lib/admin/product-form";
import { productPages as fallbackPages, type ProductPageData } from "@/lib/product/product-data";
import { stepTone } from "@/lib/product/product-steps";
import { categoryOfProduct, productPath } from "@/lib/product/product-urls";
import { connectDB, hasDatabase } from "./db";
import { ProductModel } from "./models/Product";

/** A product page with its template content and its category: everything the product page template draws. */
export type TemplatePage = ProductPageData & ProductTemplate & { categorySlug: string };

type StoredDetail = Omit<ProductDetail, "slug"> & ProductTemplate;

type ProductRecord = {
  _id: unknown; key: string; slug: string; categorySlug?: string | null; inRange?: boolean | null; index?: number | null;
  title: string; short?: string | null; description?: string | null; backdrop: string; bucket?: string | null;
  packScale?: number | null; packY?: string | null; published?: boolean | null; detail: StoredDetail; updatedAt?: Date | null;
};

const categoryFor = (slug: string, stored?: string | null) => stored || categoryOfProduct(slug)?.slug || "";

/** A page written in data/, with its template content from data/product-template.ts and its new address. */
function withTemplate(page: ProductPageData): TemplatePage {
  const categorySlug = categoryFor(page.slug);
  return { ...page, ...productTemplates[page.id], categorySlug, path: productPath(page.slug, categorySlug || undefined) } as TemplatePage;
}

/** A stored product as the page data the product page template draws. */
function toPage(doc: ProductRecord): TemplatePage {
  const categorySlug = categoryFor(doc.slug, doc.categorySlug);
  return {
    ...doc.detail,
    id: doc.key,
    slug: doc.slug,
    categorySlug,
    index: doc.index ?? 99,
    title: doc.title,
    short: doc.short ?? doc.title,
    description: doc.description ?? "",
    backdrop: doc.backdrop,
    ...(doc.bucket ? { bucket: doc.bucket } : {}),
    ...(doc.packScale ? { packScale: doc.packScale } : {}),
    ...(doc.packY ? { packY: doc.packY } : {}),
    video: `/films/product-bg/${doc.backdrop}.mp4`,
    poster: `/stills/product-bg/${doc.backdrop}.webp`,
    path: productPath(doc.slug, categorySlug || undefined),
    inRange: Boolean(doc.inRange),
    fullName: doc.detail.fullName ?? doc.detail.name,
  } as TemplatePage;
}

/**
 * Every published product page, in display order. Without a database, before the products are imported, or if the
 * database cannot be reached, it falls back to the pages written in data/ so the site always builds.
 */
export async function getProductPages(): Promise<TemplatePage[]> {
  if (!hasDatabase()) return fallbackPages.map(withTemplate);
  try {
    await connectDB();
    if (await ProductModel.estimatedDocumentCount() === 0) return fallbackPages.map(withTemplate);
    const docs = await ProductModel.find({ published: true }).sort({ index: 1, createdAt: 1 }).lean<ProductRecord[]>();
    return docs.map(toPage);
  } catch (error) {
    console.error("[products] Could not read products from MongoDB; showing data/ instead.", error);
    return fallbackPages.map(withTemplate);
  }
}

export type AdminProductRow = {
  id: string; key: string; slug: string; path: string; name: string; title: string; index: number; inRange: boolean;
  published: boolean; hasPackshot: boolean; updatedAt?: string;
};

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  await connectDB();
  const docs = await ProductModel.find().sort({ index: 1, createdAt: 1 }).lean<ProductRecord[]>();
  return docs.map((doc) => ({
    id: String(doc._id), key: doc.key, slug: doc.slug, path: productPath(doc.slug, categoryFor(doc.slug, doc.categorySlug) || undefined),
    name: doc.detail.name, title: doc.title, index: doc.index ?? 99, inRange: Boolean(doc.inRange),
    published: doc.published !== false, hasPackshot: Boolean(doc.bucket), updatedAt: doc.updatedAt?.toISOString(),
  }));
}

/** One product as the admin form's values. */
export async function getAdminProduct(id: string): Promise<{ id: string; key: string; path: string; inRange: boolean; input: ProductInput } | null> {
  await connectDB();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const doc = await ProductModel.findById(id).lean<ProductRecord>();
  if (!doc) return null;
  const detail = doc.detail;
  const categorySlug = categoryFor(doc.slug, doc.categorySlug);
  // The hero's lines have their own form fields, so they are left out of the JSON box.
  const template = Object.fromEntries(TEMPLATE_KEYS
    .filter((key) => detail[key] !== undefined && !(HERO_KEYS as readonly string[]).includes(key))
    .map((key) => [key, detail[key]]));
  return {
    id: String(doc._id),
    key: doc.key,
    path: productPath(doc.slug, categorySlug || undefined),
    inRange: Boolean(doc.inRange),
    input: {
      name: detail.name, slug: doc.slug, categorySlug, fullName: detail.fullName ?? "", headline: detail.tagline ?? detail.headline ?? "",
      brandInTitle: Boolean(detail.brandInTitle), subhead: detail.subhead ?? "", lede: detail.intro ?? detail.lede ?? "", category: detail.category,
      title: doc.title, description: doc.description ?? "", backdrop: doc.backdrop, bucket: doc.bucket ?? "",
      packScale: doc.packScale ? String(doc.packScale) : "", packY: doc.packY ?? "", index: String(doc.index ?? ""),
      published: doc.published !== false,
      seoTitle: detail.seoTitle, seoDescription: detail.seoDescription, keywords: detail.keywords.join("\n"),
      inspirationLabel: detail.inspiration?.label ?? "", inspirationBody: detail.inspiration?.body ?? "",
      overview: detail.overview.join("\n\n"),
      highlights: detail.highlights.map((item) => ({ ...item })),
      specs: detail.specs.map((item) => ({ ...item })),
      surfaces: detail.surfaces.join("\n"), surfacesNote: detail.surfacesNote ?? "",
      steps: detail.steps.map((item) => ({ title: item.title, text: item.text, tone: stepTone(item) ?? "" })),
      faqs: detail.faqs.map((item) => ({ ...item })),
      ctaHeading1: detail.cta?.heading[0] ?? "", ctaHeading2: detail.cta?.heading[1] ?? "", ctaBody: detail.cta?.body ?? "",
      ctaLinkLabel: detail.cta?.link?.label ?? "", ctaLinkHref: detail.cta?.link?.href ?? "", ctaButton: detail.cta?.button ?? "",
      sectionsJson: JSON.stringify(detail.sections ?? [], null, 2),
      templateJson: JSON.stringify(template, null, 2),
    },
  };
}

/** The ids and names of every product, for links between products in the form and the review moderation. */
export async function listProductKeys(): Promise<{ key: string; name: string }[]> {
  await connectDB();
  const docs = await ProductModel.find().sort({ index: 1 }).select("key detail.name").lean<{ key: string; detail: { name: string } }[]>();
  return docs.map((doc) => ({ key: doc.key, name: doc.detail.name }));
}