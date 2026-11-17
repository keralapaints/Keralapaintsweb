"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveOutlet, type OutletField, type OutletFormState } from "@/app/admin/(panel)/outlets/actions";
import type { AdminOutlet } from "@/lib/server/outlets-repo";

type OutletFormProps = { outlet?: AdminOutlet; districts: readonly string[] };

/** Add or edit one outlet. Saving updates the database and the public Find an Outlet page. */
export function OutletForm({ outlet, districts }: OutletFormProps) {
  const [state, action, pending] = useActionState<OutletFormState, FormData>(saveOutlet, {});
  const [type, setType] = useState(outlet?.type ?? "dealer");
  const error = (field: OutletField) => state.errors?.[field] && <p className="ad-field-error">{state.errors[field]}</p>;
  const phones = outlet?.phones ?? [];

  return <form action={action} className="ad-form ad-panel" noValidate>
    {outlet && <input type="hidden" name="id" value={outlet.id} />}
    {state.message && <p className="ad-notice ad-notice--warn" role="alert">{state.message}</p>}

    <fieldset className="ad-field">
      <legend>Outlet type</legend>
      <div className="ad-segmented">
        {(["factory", "dealer"] as const).map((value) => <label key={value}>
          <input type="radio" name="type" value={value} checked={type === value} onChange={() => setType(value)} />
          <span>{value === "factory" ? "Factory outlet" : "Authorised dealer"}</span>
        </label>)}
      </div>
      {error("type")}
    </fieldset>

    <div className="ad-grid">
      <label className="ad-field">
        <span>{type === "dealer" ? "Business name" : "Business name (optional)"}</span>
        <input name="name" defaultValue={outlet?.name} placeholder={type === "dealer" ? "e.g. Colour Nest" : "Leave empty to show “Kerala Paints Factory Outlet”"} aria-invalid={Boolean(state.errors?.name)} />
        {error("name")}
      </label>
      <label className="ad-field">
        <span>District</span>
        <input name="district" list="ad-districts" defaultValue={outlet?.district} placeholder="e.g. Kozhikode" aria-invalid={Boolean(state.errors?.district)} />
        <datalist id="ad-districts">{districts.map((name) => <option key={name} value={name} />)}</datalist>
        <small>Pick an existing district so outlets are grouped together.</small>
        {error("district")}
      </label>
      <label className="ad-field">
        <span>Town / panchayath</span>
        <input name="place" defaultValue={outlet?.place} placeholder="e.g. Vadakara" aria-invalid={Boolean(state.errors?.place)} />
        {error("place")}
      </label>
      <label className="ad-field">
        <span>PIN code</span>
        <input name="pin" inputMode="numeric" maxLength={6} defaultValue={outlet?.pin} placeholder="6 digits" aria-invalid={Boolean(state.errors?.pin)} />
        {error("pin")}
      </label>
    </div>

    <label className="ad-field">
      <span>Address</span>
      <textarea name="address" rows={3} defaultValue={outlet?.address} placeholder="Building, road, landmark, town, district (no GST number)" aria-invalid={Boolean(state.errors?.address)} />
      {error("address")}
    </label>

    <fieldset className="ad-field">
      <legend>Phone numbers</legend>
      <div className="ad-grid ad-grid--3">
        {[0, 1, 2].map((index) => <input key={index} name={`phone${index + 1}`} type="tel" inputMode="tel" defaultValue={phones[index]} placeholder={index === 0 ? "Main number" : "Optional"} aria-label={`Phone ${index + 1}`} />)}
      </div>
      <small>Mobile numbers are shown as “98765 43210” and dial with +91.</small>
      {error("phones")}
    </fieldset>

    <div className="ad-grid">
      <label className="ad-check">
        <input type="checkbox" name="published" defaultChecked={outlet?.published ?? true} />
        <span>Show on the website</span>
      </label>
      <label className="ad-check">
        <input type="checkbox" name="isNew" defaultChecked={outlet?.isNew ?? !outlet} />
        <span>Show the “New” tag</span>
      </label>
      <label className="ad-field">
        <span>Display order (optional)</span>
        <input name="order" inputMode="numeric" defaultValue={outlet ? String(outlet.order) : ""} placeholder="Automatic" aria-invalid={Boolean(state.errors?.order)} />
        <small>Lower numbers come first. Leave empty to add it at the end of its district.</small>
        {error("order")}
      </label>
    </div>

    <div className="ad-actions-row ad-form-foot">
      <button className="ad-button ad-button--primary" type="submit" disabled={pending}>{pending ? "Saving…" : outlet ? "Save changes" : "Add outlet"}</button>
      <Link className="ad-button" href="/admin/outlets/">Cancel</Link>
    </div>
  </form>;
}