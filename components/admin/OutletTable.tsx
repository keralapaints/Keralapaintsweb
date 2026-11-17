"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminOutlet } from "@/lib/server/outlets-repo";

type Filter = "all" | "factory" | "dealer" | "hidden" | "new";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "factory", label: "Factory outlets" },
  { value: "dealer", label: "Dealers" },
  { value: "new", label: "New" },
  { value: "hidden", label: "Hidden" },
];

/** Every outlet, searchable and filterable, each row linking to its edit form. */
export function OutletTable({ outlets }: { outlets: readonly AdminOutlet[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const rows = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return outlets.filter((outlet) => {
      if (filter === "factory" || filter === "dealer") { if (outlet.type !== filter) return false; }
      if (filter === "hidden" && outlet.published) return false;
      if (filter === "new" && !outlet.isNew) return false;
      const text = [outlet.district, outlet.place, outlet.name, outlet.address, outlet.pin, ...outlet.phones].join(" ").toLowerCase();
      return words.every((word) => text.includes(word));
    });
  }, [outlets, query, filter]);

  return <section className="ad-panel">
    <div className="ad-toolbar">
      <input type="search" className="ad-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, town, district, PIN or phone" aria-label="Search outlets" />
      <div className="ad-chips" role="group" aria-label="Filter outlets">
        {FILTERS.map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}
      </div>
    </div>
    <p className="ad-count">{rows.length} of {outlets.length} outlets</p>
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead><tr><th>Outlet</th><th>District</th><th>Type</th><th>Phones</th><th>Status</th><th><span className="sr-only">Edit</span></th></tr></thead>
        <tbody>
          {rows.map((outlet) => <tr key={outlet.id} data-hidden={!outlet.published || undefined}>
            <td><strong>{outlet.name ?? "Kerala Paints Factory Outlet"}</strong><span>{outlet.place}{outlet.pin ? ` · ${outlet.pin}` : ""}</span></td>
            <td>{outlet.district}</td>
            <td><span className={`ad-badge ad-badge--${outlet.type}`}>{outlet.type === "factory" ? "Factory" : "Dealer"}</span></td>
            <td>{outlet.phones.length > 0 ? outlet.phones.join(", ") : <em>None</em>}</td>
            <td>
              {outlet.published ? <span className="ad-badge ad-badge--live">Live</span> : <span className="ad-badge">Hidden</span>}
              {outlet.isNew && <span className="ad-badge ad-badge--new">New</span>}
            </td>
            <td><Link className="ad-link" href={`/admin/outlets/${outlet.id}/`}>Edit</Link></td>
          </tr>)}
          {rows.length === 0 && <tr><td colSpan={6} className="ad-empty">No outlets match.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>;
}   