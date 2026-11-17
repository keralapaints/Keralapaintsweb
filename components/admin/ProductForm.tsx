"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { saveProduct, type ProductFormState } from "@/app/admin/(panel)/products/actions";
import { productCategories } from "@/data/categories";
import { BACKDROPS, ICONS, PACKSHOTS, TEMPLATE_KEYS, slugify, type ProductField, type ProductInput } from "@/lib/admin/product-form";
import { productPath } from "@/lib/product/product-urls";

type ProductFormProps = {
  /** Set when editing; absent when adding a product. */
  id?: string;
  /** One of the eight home-page range categories: its address and place in the range are fixed. */
  inRange?: boolean;
  initial: ProductInput;
  productKeys: readonly { key: string; name: string }[];
};

/** A character counter that turns gold near the limit and red past it. */
function Counter({ value, ideal, max }: { value: string; ideal: number; max: number }) {
  const length = value.trim().length;
  return <small className="ad-counter" data-state={length > max ? "over" : length > ideal ? "near" : "ok"}>{length} / {ideal}</small>;
}

/** A repeatable list (features, specs, steps, questions): add, remove and reorder rows. */
function Rows<T>({ items, onChange, blank, render, addLabel }: {
  items: T[]; onChange: (items: T[]) => void; blank: () => T; addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
}) {
  const update = (index: number, patch: Partial<T>) => onChange(items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const move = (index: number, by: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    onChange(next);
  };
  return <div className="ad-rows">
    {items.map((item, index) => <div className="ad-row" key={index}>
      <span className="ad-row-number">{String(index + 1).padStart(2, "0")}</span>
      <div className="ad-row-body">{render(item, (patch) => update(index, patch), index)}</div>
      <div className="ad-row-tools">
        <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">↑</button>
        <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down">↓</button>
        <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove">✕</button>
      </div>
    </div>)}
    <button type="button" className="ad-button" onClick={() => onChange([...items, blank()])}>+ {addLabel}</button>
  </div>;
}

/** Add or edit one product page. Saving updates the database and the product's page on the website. */
export function ProductForm({ id, inRange = false, initial, productKeys }: ProductFormProps) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const [value, setValue] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const set = <K extends ProductField>(key: K, next: ProductInput[K]) => setValue((current) => ({ ...current, [key]: next }));
  const error = (field: ProductField) => state.errors?.[field] && <p className="ad-field-error">{state.errors[field]}</p>;
  const invalid = (field: ProductField) => Boolean(state.errors?.[field]);
  // The address can't change once the page is live, so links and Google rankings keep working.
  const addressLocked = Boolean(id) && Boolean(initial.categorySlug);

  const textField = (field: ProductField, label: string, options: { placeholder?: string; hint?: string; rows?: number; disabled?: boolean } = {}) =>
    <label className="ad-field">
      <span>{label}</span>
      {options.rows
        ? <textarea rows={options.rows} value={String(value[field])} placeholder={options.placeholder} onChange={(event) => set(field, event.target.value as never)} aria-invalid={invalid(field)} />
        : <input value={String(value[field])} placeholder={options.placeholder} disabled={options.disabled} onChange={(event) => set(field, event.target.value as never)} aria-invalid={invalid(field)} />}
      {options.hint && <small>{options.hint}</small>}
      {error(field)}
    </label>;

  return <form action={action} className="ad-form" noValidate>
    {id && <input type="hidden" name="id" value={id} />}
    <input type="hidden" name="payload" value={JSON.stringify(value)} />
    {state.message && <p className="ad-notice ad-notice--warn" role="alert">{state.message}</p>}

    <section className="ad-panel ad-form">
      <h2>Name and address</h2>
      <div className="ad-grid">
        <label className="ad-field">
          <span>Product name (on the pack)</span>
          <input value={value.name} placeholder="e.g. Prime Silver" aria-invalid={invalid("name")} onChange={(event) => {
            const name = event.target.value;
            setValue((current) => ({ ...current, name, ...(slugTouched ? {} : { slug: slugify(name) }) }));
          }} />
          {error("name")}
        </label>
        <label className="ad-field">
          <span>Category</span>
          <select value={value.categorySlug} disabled={addressLocked} onChange={(event) => set("categorySlug", event.target.value)} aria-invalid={invalid("categorySlug")}>
            <option value="" disabled>Choose a category</option>
            {productCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
          {error("categorySlug")}
        </label>
        <label className="ad-field">
          <span>Page address</span>
          <div className="ad-prefix"><em>/products/{value.categorySlug || "…"}/</em><input value={value.slug} disabled={Boolean(id)} aria-invalid={invalid("slug")} onChange={(event) => { setSlugTouched(true); set("slug", slugify(event.target.value)); }} /></div>
          <small>{id ? "The address can’t change once the page is live, so links and Google rankings keep working." : "Short, lowercase, keyword-led. It can’t be changed after saving."}</small>
          {error("slug")}
        </label>
        {textField("headline", "Tagline (second line of the H1)", { placeholder: "e.g. High-Performance Exterior Wall Emulsion Paint" })}
        {textField("title", "Category title", { placeholder: "e.g. Wall Primer", hint: "Used on cards and as the tagline when there is none." })}
        {textField("category", "What it is (for Google)", { placeholder: "e.g. Exterior Emulsion Paint" })}
        {textField("fullName", "Full name (optional)", { placeholder: "e.g. Bhadram EX High-Performance Exterior Wall Emulsion Paint", hint: "Google’s product name and image alt text. Defaults to the product name." })}
      </div>
      {textField("subhead", "Sub-heading (optional)", { placeholder: "e.g. Advanced Weather Protection for Beautiful, Long-Lasting Exterior Walls", hint: "The short gold line under the H1." })}
      {textField("lede", "Hero intro (optional)", { placeholder: "The paragraph under the sub-heading.", rows: 4 })}
      {textField("description", "Short description", { rows: 3, hint: "Used on cards, and in the hero when there is no intro." })}
    </section>

    <section className="ad-panel ad-form">
      <h2>Images</h2>
      <div className="ad-grid">
        <label className="ad-field">
          <span>Nature backdrop</span>
          <select value={value.backdrop} onChange={(event) => set("backdrop", event.target.value)}>{BACKDROPS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          {error("backdrop")}
        </label>
        <label className="ad-field">
          <span>Packshot</span>
          <select value={value.bucket} onChange={(event) => set("bucket", event.target.value)}>{PACKSHOTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <small>New packshots need to be prepared and added to the site first. Leave it empty to show the backdrop only.</small>
        </label>
      </div>
      <div className="ad-media-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/stills/product-bg/${value.backdrop}.webp`} alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value.bucket && <img className="ad-media-pack" src={value.bucket.replace(/\.webp$/, "-480.webp")} alt="" style={{ scale: value.packScale || 1 }} />}
      </div>
      <div className="ad-grid ad-grid--3">
        {textField("packScale", "Pack size (optional)", { placeholder: "1", hint: "e.g. 0.8 for a wide carton." })}
        {textField("packY", "Pack offset (optional)", { placeholder: "0%", hint: "e.g. -3.4% to move it up." })}
        {textField("index", "Display order", { placeholder: "Automatic", hint: inRange ? "Its number in the home range." : "Lower numbers come first.", disabled: inRange })}
      </div>
    </section>

    <section className="ad-panel ad-form">
      <h2>Search engines</h2>
      <label className="ad-field">
        <span>SEO title</span>
        <input value={value.seoTitle} onChange={(event) => set("seoTitle", event.target.value)} aria-invalid={invalid("seoTitle")} placeholder="Bhadram EX Exterior Emulsion Paint | Kerala Paints" />
        <Counter value={value.seoTitle} ideal={60} max={70} />
        {error("seoTitle")}
      </label>
      <label className="ad-field">
        <span>Meta description</span>
        <textarea rows={3} value={value.seoDescription} onChange={(event) => set("seoDescription", event.target.value)} aria-invalid={invalid("seoDescription")} />
        <Counter value={value.seoDescription} ideal={155} max={170} />
        {error("seoDescription")}
      </label>
      {textField("keywords", "Keywords (one per line)", { rows: 4 })}
      <div className="ad-serp" aria-label="Search result preview">
        <span className="ad-serp-url">keralapaints.com{productPath(value.slug || "…", value.categorySlug || undefined).replace(/\//g, " › ")}</span>
        <span className="ad-serp-title">{value.seoTitle || "SEO title"}</span>
        <span className="ad-serp-text">{value.seoDescription || "Meta description"}</span>
      </div>
    </section>

    <section className="ad-panel ad-form">
      <h2>Key features</h2>
      {textField("overview", "Overview", { rows: 6, hint: "Shown above the feature list when the template has no “featuresLead”. Separate paragraphs with an empty line." })}
      <Rows items={value.highlights} onChange={(items) => set("highlights", items)} addLabel="Add a feature" blank={(): ProductInput["highlights"][number] => ({ icon: "shield", title: "", text: "" })} render={(item, update) => <div className="ad-grid ad-grid--row">
        <select value={item.icon} onChange={(event) => update({ icon: event.target.value as typeof item.icon })} aria-label="Icon">{ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select>
        <input value={item.title} placeholder="Feature, shown in bold" onChange={(event) => update({ title: event.target.value })} aria-label="Feature" />
        <textarea rows={2} value={item.text} placeholder="Benefit, after the dash" onChange={(event) => update({ text: event.target.value })} aria-label="Benefit" />
      </div>} />
      {error("highlights")}
      <div className="ad-grid">
        {textField("surfaces", "Recommended areas (one per line)", { rows: 6 })}
        {textField("surfacesNote", "Recommended surfaces (paragraph)", { rows: 6 })}
      </div>
    </section>

    <section className="ad-panel ad-form">
      <h2>Technical specifications</h2>
      <Rows items={value.specs} onChange={(items) => set("specs", items)} addLabel="Add a specification" blank={() => ({ label: "", value: "" })} render={(item, update) => <div className="ad-grid">
        <input value={item.label} placeholder="Label, e.g. Coverage" onChange={(event) => update({ label: event.target.value })} aria-label="Specification label" />
        <input value={item.value} placeholder="Value, e.g. Up to 170 sq. ft./litre/coat*" onChange={(event) => update({ value: event.target.value })} aria-label="Specification value" />
      </div>} />
      {error("specs")}
    </section>

    <section className="ad-panel ad-form">
      <h2>How to apply</h2>
      <p>Each step is a numbered card on the page, in this order. In the text, a line starting with “- ” becomes a note under the step, e.g. “- **Damp walls:** fix the source of moisture, then apply Aqua Seal 2K.” Mark the step that applies this product to show it in gold, and an optional step to show it dashed.</p>
      <Rows items={value.steps} onChange={(items) => set("steps", items)} addLabel="Add a step" blank={(): ProductInput["steps"][number] => ({ title: "", text: "", tone: "" })} render={(item, update) => <div className="ad-stack">
        <div className="ad-grid">
          <input value={item.title} placeholder="Step title, e.g. Prepare the Exterior Surface" onChange={(event) => update({ title: event.target.value })} aria-label="Step title" />
          <select value={item.tone} onChange={(event) => update({ tone: event.target.value as typeof item.tone })} aria-label="Step mark">
            <option value="">Normal step</option>
            <option value="product">This product’s step (gold)</option>
            <option value="optional">Only if needed (dashed)</option>
          </select>
        </div>
        <textarea rows={4} value={item.text} placeholder={"What to do.\n- Note under the step (optional)"} onChange={(event) => update({ text: event.target.value })} aria-label="Step text" />
      </div>} />
      {error("steps")}
    </section>

    <section className="ad-panel ad-form">
      <h2>Frequently asked questions</h2>
      <Rows items={value.faqs} onChange={(items) => set("faqs", items)} addLabel="Add a question" blank={() => ({ question: "", answer: "" })} render={(item, update) => <div className="ad-stack">
        <input value={item.question} placeholder="Question" onChange={(event) => update({ question: event.target.value })} aria-label="Question" />
        <textarea rows={3} value={item.answer} placeholder="Answer" onChange={(event) => update({ answer: event.target.value })} aria-label="Answer" />
      </div>} />
      {error("faqs")}
    </section>

    <details className="ad-panel ad-advanced" open={invalid("templateJson") || undefined}>
      <summary><h2>Template content (JSON)</h2></summary>
      <p>Trust badges, “at a glance”, feature lead, spec notes, extra how-to-apply cards (“applyNotes”), care, price card and related products. See <code>data/product-template.ts</code> for every field and the Bhadram EX example. Allowed fields:</p>
      <p className="ad-keys">{TEMPLATE_KEYS.map((key) => <code key={key}>{key}</code>)}</p>
      <textarea className="ad-code" rows={22} spellCheck={false} value={value.templateJson} onChange={(event) => set("templateJson", event.target.value)} aria-invalid={invalid("templateJson")} />
      {error("templateJson")}
    </details>

    <details className="ad-panel ad-advanced" open={invalid("sectionsJson") || undefined}>
      <summary><h2>Extra sections (JSON)</h2></summary>
      <p>Older long-form sections (tables, cards, lists), shown after “How to apply”. To link to another product, use its id:</p>
      <p className="ad-keys">{productKeys.map((item) => <code key={item.key} title={item.name}>{item.key}</code>)}</p>
      <textarea className="ad-code" rows={14} spellCheck={false} value={value.sectionsJson} onChange={(event) => set("sectionsJson", event.target.value)} aria-invalid={invalid("sectionsJson")} />
      {error("sectionsJson")}
    </details>

    <div className="ad-savebar">
      <label className="ad-check"><input type="checkbox" checked={value.published} onChange={(event) => set("published", event.target.checked)} /><span>Show on the website</span></label>
      <div className="ad-actions-row">
        <Link className="ad-button" href="/admin/products/">Cancel</Link>
        <button className="ad-button ad-button--primary" type="submit" disabled={pending}>{pending ? "Saving…" : id ? "Save changes" : "Add product"}</button>
      </div>
    </div>
  </form>;
}