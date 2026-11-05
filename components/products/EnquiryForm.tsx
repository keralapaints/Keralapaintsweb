"use client";

import { useState, type FormEvent, type RefObject } from "react";
import { products } from "@/lib/product/product-data";
import { enquiryCopy } from "@/data/enquiry";

/** Line icons for the fields, 24-unit strokes like the home-scene features. */
const icons = {
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.5 3-6 7-6s7 2.5 7 6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  mail: "M4 6h16v12H4V6Zm0 1 8 6 8-6",
  pin: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  bucket: "M5 8h14l-1.5 12h-11L5 8Zm2-3 5 2 5-2M9 12v5m6-5v5",
  chat: "M4 5h16v10H9l-4 4V5Z",
} as const;

function FieldIcon({ path }: { path: string }) {
  return <svg className="enquiry-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}

/** The enquiry form: its glass pieces sit on the deck, which the ending's reveal and tilt drive through `deckRef`. */
export function EnquiryForm({ deckRef }: { deckRef: RefObject<HTMLDivElement | null> }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const endpoint = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT;
    if (!endpoint) { setStatus(enquiryCopy.status.offline); return; }
    setSending(true);
    setStatus("");
    const form = event.currentTarget;
    try {
      const response = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Submission failed");
      setStatus(enquiryCopy.status.sent);
      form.reset();
    } catch { setStatus(enquiryCopy.status.failed); }
    finally { setSending(false); }
  }

  return <form className="enquiry-form" onSubmit={submit} aria-label="Project enquiry" aria-describedby="enquiry-status">
    {/* A faint orbit behind the deck, as if the pieces had drifted into place along it. */}
    <svg className="enquiry-orbit" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <ellipse cx="50" cy="52" rx="47" ry="31" transform="rotate(-24 50 52)" vectorEffect="non-scaling-stroke" />
      <ellipse cx="52" cy="48" rx="40" ry="46" transform="rotate(18 52 48)" vectorEffect="non-scaling-stroke" />
    </svg>
    <div ref={deckRef} className="enquiry-deck">
      <label className="enquiry-piece enquiry-field" data-piece="name"><FieldIcon path={icons.user} /><span className="sr-only">{enquiryCopy.fields.name.label}</span><input name="name" autoComplete="name" placeholder={enquiryCopy.fields.name.placeholder} required maxLength={120} /></label>
      <label className="enquiry-piece enquiry-field" data-piece="phone"><FieldIcon path={icons.phone} /><span className="sr-only">{enquiryCopy.fields.phone.label}</span><input name="phone" type="tel" autoComplete="tel" placeholder={enquiryCopy.fields.phone.placeholder} required minLength={7} maxLength={25} pattern="[+0-9\(\) .\-]{7,25}" title="Enter a phone number using digits, spaces, +, parentheses or hyphens." /></label>
      <label className="enquiry-piece enquiry-field" data-piece="email"><FieldIcon path={icons.mail} /><span className="sr-only">{enquiryCopy.fields.email.label}</span><input name="email" type="email" autoComplete="email" placeholder={enquiryCopy.fields.email.placeholder} required maxLength={254} /></label>
      <label className="enquiry-piece enquiry-field" data-piece="city"><FieldIcon path={icons.pin} /><span className="sr-only">{enquiryCopy.fields.city.label}</span><input name="city" autoComplete="address-level2" placeholder={enquiryCopy.fields.city.placeholder} required maxLength={100} /></label>
      <label className="enquiry-piece enquiry-field enquiry-field-wide" data-piece="product"><FieldIcon path={icons.bucket} /><span className="sr-only">{enquiryCopy.fields.product.label}</span><select name="product" defaultValue="" required><option value="" disabled>{enquiryCopy.fields.product.placeholder}</option>{products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}<option value="guidance">{enquiryCopy.fields.product.guidance}</option></select></label>
      <label className="enquiry-piece enquiry-field enquiry-field-wide enquiry-field-area" data-piece="message"><FieldIcon path={icons.chat} /><span className="sr-only">{enquiryCopy.fields.message.label}</span><textarea name="message" placeholder={enquiryCopy.fields.message.placeholder} rows={4} maxLength={4000} /></label>
      <button className="enquiry-piece home-cta" data-piece="send" type="submit" disabled={sending}>{sending ? enquiryCopy.sending : enquiryCopy.send}<span aria-hidden="true">⟶</span></button>
    </div>
    <p id="enquiry-status" className="enquiry-status" role="status">{status}</p>
  </form>;
}
