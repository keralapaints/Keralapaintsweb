"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productCategories } from "@/data/categories";
import type { ProductDetail, ProductSection } from "@/data/product-details";
import type { ProductTemplate } from "@/data/product-template";
import { BACKDROPS, HERO_KEYS, ICONS, TEMPLATE_KEYS, slugify, type ProductField, type ProductInput } from "@/lib/admin/product-form";
import { STEP_TONES, type StepTone } from "@/lib/product/product-steps";
import { requireUser } from "@/lib/server/auth";
import { connectDB } from "@/lib/server/db";
import { ProductModel } from "@/lib/server/models/Product";

export type ProductFormState = { errors?: Partial<Record<ProductField, string>>; message?: string };

const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);
const paragraphs = (value: string) => value.split(/\n\s*\n/).map((part) => part.replace(/\s+/g, " ").trim()).filter(Boolean);

/** Rebuilds every product and category page, the Products overview and the admin lists. */
function refreshPages() {
  revalidatePath("/products", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

/** Checks the "advanced sections" JSON has the shape the product page expects. */
function parseSections(json: string): { sections?: ProductSection[]; error?: string } {
  if (!json.trim() || json.trim() === "[]") return { sections: [] };
  let value: unknown;
  try { value = JSON.parse(json); } catch (error) { return { error: `Not valid JSON: ${error instanceof Error ? error.message : "check commas and quotes"}` }; }
  if (!Array.isArray(value)) return { error: "Sections must be a list: start with [ and end with ]." };
  for (const [index, section] of value.entries()) {
    const item = section as Partial<ProductSection> | null;
    if (!item || typeof item !== "object") return { error: `Section ${index + 1} is not an object.` };
    if (typeof item.id !== "string" || !/^[a-z0-9-]+$/.test(item.id)) return { error: `Section ${index + 1} needs an "id" in lowercase letters, numbers and hyphens.` };
    if (!Array.isArray(item.heading) || item.heading.length === 0 || item.heading.some((line) => typeof line !== "string")) return { error: `Section "${item.id}" needs a "heading": a list of one or two lines.` };
  }
  return { sections: value as ProductSection[] };
}

/** Checks the template JSON: only template fields, with lists where lists belong and numbers in the price card. */
function parseTemplate(json: string): { template?: ProductTemplate; error?: string } {
  if (!json.trim() || json.trim() === "{}") return { template: {} };
  let value: unknown;
  try { value = JSON.parse(json); } catch (error) { return { error: `Not valid JSON: ${error instanceof Error ? error.message : "check commas and quotes"}` }; }
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "Template content must be an object: start with { and end with }." };
  const record = value as Record<string, unknown>;
  const unknown = Object.keys(record).filter((key) => !(TEMPLATE_KEYS as readonly string[]).includes(key));
  if (unknown.length > 0) return { error: `Unknown field${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}. Allowed: ${TEMPLATE_KEYS.join(", ")}.` };
  for (const key of ["badges", "glance", "specNotes", "applyNotes", "systems", "related", "relatedLinks"]) {
    if (record[key] !== undefined && !Array.isArray(record[key])) return { error: `"${key}" must be a list: [ … ].` };
  }
  const price = record.price as Record<string, unknown> | undefined;
  if (price !== undefined) {
    if (typeof price !== "object" || typeof price.label !== "string") return { error: "\"price\" needs a \"label\", e.g. \"Bhadram EX 20 Litre\"." };
    for (const key of ["pack", "offer", "coverage"]) if (typeof price[key] !== "number" || !(Number(price[key]) > 0)) return { error: `"price.${key}" must be a number above 0 (no quotes, no ₹).` };
    if (price.mrp !== undefined && typeof price.mrp !== "number") return { error: "\"price.mrp\" must be a number (no quotes, no ₹)." };
    if (price.unit !== "L" && price.unit !== "kg") return { error: "\"price.unit\" must be \"L\" or \"kg\"." };
  }
  return { template: record as ProductTemplate };
}

export async function saveProduct(_: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireUser(["editor"]);
  const id = String(formData.get("id") ?? "");
  let input: ProductInput;
  try { input = JSON.parse(String(formData.get("payload") ?? "")) as ProductInput; } catch { return { message: "The form could not be read. Reload the page and try again." }; }
  const text = (value: string | undefined) => (value ?? "").trim();

  const errors: ProductFormState["errors"] = {};
  const name = text(input.name);
  const slug = slugify(text(input.slug) || name);
  if (!name) errors.name = "Enter the product name.";
  if (!id && !slug) errors.slug = "Enter a page address.";
  if (!productCategories.some((category) => category.slug === input.categorySlug)) errors.categorySlug = "Choose the product’s category.";
  if (!text(input.title)) errors.title = "Enter the category title, e.g. “Interior Emulsion”.";
  if (!text(input.category)) errors.category = "Enter what the product is, e.g. “Interior wall primer”.";
  if (!BACKDROPS.some((item) => item.value === input.backdrop)) errors.backdrop = "Choose a backdrop.";
  if (!text(input.seoTitle)) errors.seoTitle = "Enter the SEO title.";
  else if (text(input.seoTitle).length > 70) errors.seoTitle = "Keep the SEO title under 70 characters (about 60 is ideal).";
  if (!text(input.seoDescription)) errors.seoDescription = "Enter the meta description.";
  else if (text(input.seoDescription).length > 170) errors.seoDescription = "Keep the description under 170 characters (about 155 is ideal).";
  if (paragraphs(input.overview).length === 0) errors.overview = "Write at least one overview paragraph.";
  const highlights = input.highlights.filter((item) => text(item.title) || text(item.text));
  if (highlights.length === 0) errors.highlights = "Add at least one feature.";
  else if (highlights.some((item) => !ICONS.includes(item.icon) || !text(item.title) || !text(item.text))) errors.highlights = "Every feature needs an icon, a title and a line of text.";
  const specs = input.specs.filter((item) => text(item.label) || text(item.value));
  if (specs.some((item) => !text(item.label) || !text(item.value))) errors.specs = "Every specification needs a label and a value.";
  const steps = input.steps.filter((item) => text(item.title) || text(item.text));
  if (steps.some((item) => !text(item.title) || !text(item.text))) errors.steps = "Every step needs a title and text.";
  const faqs = input.faqs.filter((item) => text(item.question) || text(item.answer));
  if (faqs.some((item) => !text(item.question) || !text(item.answer))) errors.faqs = "Every question needs an answer.";
  if (input.index && !/^\d+$/.test(input.index)) errors.index = "Use a whole number.";
  if (input.packScale && !(Number(input.packScale) > 0 && Number(input.packScale) <= 2)) errors.packScale = "Use a number between 0.5 and 1.5, e.g. 0.9.";
  if (input.packY && !/^-?\d+(\.\d+)?%$/.test(input.packY)) errors.packY = "Use a percentage, e.g. -3.4%.";
  if ((text(input.ctaHeading1) || text(input.ctaBody)) && !(text(input.ctaHeading1) && text(input.ctaBody))) errors.ctaHeading1 = "A custom call to action needs a heading and a sentence.";
  if (text(input.ctaLinkLabel) && !text(input.ctaLinkHref).startsWith("/")) errors.ctaLinkHref = "Use an address on this site starting with /, e.g. /blog/how-to-waterproof-a-terrace.";
  const { sections, error: sectionsError } = parseSections(input.sectionsJson);
  if (sectionsError) errors.sectionsJson = sectionsError;
  const { template, error: templateError } = parseTemplate(input.templateJson);
  if (templateError) errors.templateJson = templateError;

  await connectDB();
  if (!id && slug && await ProductModel.exists({ $or: [{ slug }, { key: slug }] })) errors.slug = "Another product already uses this address.";
  if (Object.keys(errors).length > 0) return { errors, message: "Please fix the highlighted fields." };

  const ctaHeading = [text(input.ctaHeading1), text(input.ctaHeading2)].filter(Boolean);
  // The hero's lines come from their form fields only: any copy left in the JSON box is dropped, so the two never disagree.
  const templateRest = Object.fromEntries(Object.entries(template ?? {}).filter(([key]) => !(HERO_KEYS as readonly string[]).includes(key))) as ProductTemplate;
  const detail: Omit<ProductDetail, "slug"> & ProductTemplate = {
    ...templateRest,
    name,
    ...(text(input.fullName) ? { fullName: text(input.fullName) } : {}),
    ...(text(input.headline) ? { headline: text(input.headline), tagline: text(input.headline) } : {}),
    ...(text(input.subhead) ? { subhead: text(input.subhead) } : {}),
    ...(input.brandInTitle ? { brandInTitle: true } : {}),
    ...(text(input.lede) ? { lede: text(input.lede), intro: text(input.lede) } : {}),
    category: text(input.category),
    seoTitle: text(input.seoTitle),
    seoDescription: text(input.seoDescription),
    keywords: lines(input.keywords),
    inspiration: { label: text(input.inspirationLabel), body: text(input.inspirationBody) },
    overview: paragraphs(input.overview),
    highlights: highlights.map((item) => ({ icon: item.icon, title: text(item.title), text: text(item.text) })),
    specs: specs.map((item) => ({ label: text(item.label), value: text(item.value) })),
    surfaces: lines(input.surfaces),
    ...(text(input.surfacesNote) ? { surfacesNote: text(input.surfacesNote) } : {}),
    steps: steps.map((item) => ({ title: text(item.title), text: text(item.text), ...(STEP_TONES.includes(item.tone as StepTone) ? { tone: item.tone } : {}) })),
    faqs: faqs.map((item) => ({ question: text(item.question), answer: text(item.answer) })),
    ...(sections && sections.length > 0 ? { sections } : {}),
    ...(ctaHeading.length > 0 ? {
      cta: {
        heading: ctaHeading,
        body: text(input.ctaBody),
        ...(text(input.ctaLinkLabel) ? { link: { label: text(input.ctaLinkLabel), href: text(input.ctaLinkHref) } } : {}),
        ...(text(input.ctaButton) ? { button: text(input.ctaButton) } : {}),
      },
    } : {}),
  };

  const fields = {
    categorySlug: input.categorySlug,
    title: text(input.title),
    short: text(input.title),
    description: text(input.description),
    backdrop: input.backdrop,
    bucket: input.bucket || undefined,
    packScale: input.packScale ? Number(input.packScale) : undefined,
    packY: text(input.packY) || undefined,
    published: Boolean(input.published),
    detail,
  };

  if (id) {
    const unset: Record<string, 1> = {};
    for (const key of ["bucket", "packScale", "packY"] as const) if (fields[key] === undefined) unset[key] = 1;
    const set = Object.fromEntries(Object.entries({ ...fields, ...(input.index ? { index: Number(input.index) } : {}) }).filter(([, value]) => value !== undefined));
    const result = await ProductModel.updateOne({ _id: id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
    if (result.matchedCount === 0) return { message: "This product no longer exists. It may have been deleted." };
  } else {
    const last = await ProductModel.findOne().sort({ index: -1 }).select("index").lean<{ index?: number }>();
    await ProductModel.create({ ...fields, key: slug, slug, inRange: false, index: input.index ? Number(input.index) : (last?.index ?? 0) + 1 });
  }

  refreshPages();
  redirect(`/admin/products/?saved=${id ? "updated" : "added"}`);
}

export async function deleteProduct(formData: FormData) {
  await requireUser(["editor"]);
  await connectDB();
  await ProductModel.deleteOne({ _id: String(formData.get("id") ?? "") });
  refreshPages();
  redirect("/admin/products/?saved=deleted");
}