"use client";

import { deleteOutlet } from "@/app/admin/(panel)/outlets/actions";

/** Deletes an outlet after a confirmation. Hiding it (untick “Show on the website”) keeps it for later instead. */
export function DeleteOutletButton({ id, label }: { id: string; label: string }) {
  return <form action={deleteOutlet} onSubmit={(event) => { if (!window.confirm(`Delete “${label}”? This removes it from the website and cannot be undone.`)) event.preventDefault(); }}>
    <input type="hidden" name="id" value={id} />
    <button className="ad-button ad-button--danger" type="submit">Delete outlet</button>
  </form>;
}