"use client";

import { rangeCopy } from "@/data/products";
import type { Product } from "@/lib/product/product-data";

/** The featured product's title and description beside the ring, with the way into its page. */
export function ProductCopy({ product }: { product: Product }) {
  return <div className="pr-copy">
    <h2 id="product-range-heading">{product.title}</h2>
    <div className="pr-detail">
      <p className="pr-description">{product.description}</p>
      {/* A full page load, not a client navigation: the story's films, scroller and timelines start clean each visit. */}
      <a className="pr-explore" href={product.path}>{rangeCopy.explore}<span className="sr-only">: {product.title}</span><span aria-hidden="true">⟶</span></a>
    </div>
  </div>;
}
