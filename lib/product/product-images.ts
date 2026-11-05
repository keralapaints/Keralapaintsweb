/** Widths each product cut-out is encoded at (scripts/prepare-bucket-variants.py); the original is the widest. */
export const bucketWidths = [480, 768, 1536] as const;

export const bucketVariant = (bucket: string, width: number) =>
  width >= bucketWidths[bucketWidths.length - 1] ? bucket : bucket.replace(/\.webp$/, `-${width}.webp`);

/** Candidates up to `maxWidth`: ring neighbours never need the full cut-out, the featured bucket may. */
export function bucketSrcSet(bucket: string, maxWidth = bucketWidths[bucketWidths.length - 1]) {
  return bucketWidths.filter((width) => width <= maxWidth).map((width) => `${bucketVariant(bucket, width)} ${width}w`).join(", ");
}

/**
 * Rendered widths of the 4:5 carousel frame (--pr-frame-w in product-world.css: 80% of --pr-frame-h), for the
 * featured bucket and for its neighbours, which the ring scales to at most .74 and dims.
 */
export const bucketSizes = {
  featured: "(max-width: 1023px) 47vh, (max-width: 1280px) 64vh, 87vh",
  neighbour: "(max-width: 1023px) 35vh, (max-width: 1280px) 48vh, 64vh",
} as const;

const warmed = new Set<string>();

/**
 * Fetches and decodes an image ahead of need, once per page, so a later <img> of the same source (and srcset)
 * draws immediately. Failures are ignored: the element itself will try again.
 */
export function warmImage(src: string, srcSet?: string, sizes?: string) {
  const key = srcSet ?? src;
  if (warmed.has(key) || typeof window === "undefined") return;
  warmed.add(key);
  const image = new window.Image();
  image.decoding = "async";
  if (srcSet) { image.sizes = sizes ?? "100vw"; image.srcset = srcSet; }
  image.src = src;
  void image.decode().catch(() => undefined);
}
