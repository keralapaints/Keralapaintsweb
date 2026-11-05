"use client";

import type { CSSProperties } from "react";
import { products } from "@/lib/product/product-data";
import { bucketSizes, bucketSrcSet, bucketVariant } from "@/lib/product/product-images";
import { useCarouselDrag } from "./hooks/useCarouselDrag";

const VISIBLE_NEIGHBOURS = 3;

type ProductCarouselProps = { position: number; nearby: boolean; step: (direction: 1 | -1) => void; setInteracting: (interacting: boolean) => void };

/** The ring of buckets: three laps of slots around the current position, the far ones hidden. */
export function ProductCarousel({ position, nearby, step, setInteracting }: ProductCarouselProps) {
  const drag = useCarouselDrag(step, setInteracting);
  return <div className="pr-carousel" aria-hidden="true"
    onPointerDown={drag.onPointerDown} onPointerMove={drag.onPointerMove} onPointerCancel={drag.onPointerCancel} onPointerUp={drag.onPointerUp}>
    <div className="pr-floor" />
    {Array.from({ length: products.length * 3 }, (_, index) => {
      const logicalIndex = (Math.floor(position / products.length) - 1) * products.length + index;
      const entry = products[((logicalIndex % products.length) + products.length) % products.length];
      const offset = logicalIndex - position;
      return <div key={logicalIndex} className="pr-slot" data-offset={offset} data-hidden={Math.abs(offset) > VISIBLE_NEIGHBOURS || undefined}
        style={{ "--pr-offset": offset, "--pr-pack-scale": entry.packScale ?? 1, "--pr-pack-y": entry.packY ?? "0%" } as CSSProperties}>
        {/* Neighbours are scaled down and dimmed: they never need more than the medium encode. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {nearby && Math.abs(offset) <= VISIBLE_NEIGHBOURS + 1 && <img src={bucketVariant(entry.bucket, offset === 0 ? 1536 : 768)} srcSet={bucketSrcSet(entry.bucket, offset === 0 ? 1536 : 768)} sizes={offset === 0 ? bucketSizes.featured : bucketSizes.neighbour}
          alt="" draggable={false} loading="lazy" decoding="async" />}
      </div>;
    })}
  </div>;
}
