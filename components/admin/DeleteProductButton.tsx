"use client";

import { deleteProduct } from "@/app/admin/(panel)/products/actions";

/** Deletes a product page after a confirmation. Unticking “Show on the website” hides it instead. */
export function DeleteProductButton({ id, label }: { id: string; label: string }) {
  return <form action={deleteProduct} onSubmit={(event) => { if (!window.confirm(`Delete “${label}”? Its page will disappear from the website and this cannot be undone.`)) event.preventDefault(); }}>
    <input type="hidden" name="id" value={id} />
    <button className="ad-button ad-button--danger" type="submit">Delete product</button>
  </form>;
}