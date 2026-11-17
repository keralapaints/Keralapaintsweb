"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminProductRow } from "@/lib/server/products-repo";

/** Every product page, searchable, each row linking to its edit form. */
export function ProductTable({ products }: { products: readonly AdminProductRow[] }) {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((product) => words.every((word) => [product.name, product.title, product.slug].join(" ").toLowerCase().includes(word)));
  }, [products, query]);

  return <section className="ad-panel">
    <div className="ad-toolbar">
      <input type="search" className="ad-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" />
    </div>
    <p className="ad-count">{rows.length} of {products.length} products</p>
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead><tr><th>#</th><th>Product</th><th>Page address</th><th>Status</th><th><span className="sr-only">Edit</span></th></tr></thead>
        <tbody>
          {rows.map((product) => <tr key={product.id} data-hidden={!product.published || undefined}>
            <td>{product.index}</td>
            <td><strong>{product.name}</strong><span>{product.title}</span></td>
            <td><a className="ad-link" href={product.path} target="_blank" rel="noopener noreferrer">{product.path}</a></td>
            <td>
              {product.published ? <span className="ad-badge ad-badge--live">Live</span> : <span className="ad-badge">Hidden</span>}
              {product.inRange && <span className="ad-badge ad-badge--factory">Home range</span>}
              {!product.hasPackshot && <span className="ad-badge">No packshot</span>}
            </td>
            <td><Link className="ad-link" href={`/admin/products/${product.id}/`}>Edit</Link></td>
          </tr>)}
          {rows.length === 0 && <tr><td colSpan={5} className="ad-empty">No products match.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>;
}