"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { products, productTuning } from "@/lib/product/product-data";
import { carouselStop, productScrollRange, productUnit } from "@/lib/product/product-scroll";
import { bucketSizes, bucketSrcSet, warmImage } from "@/lib/product/product-images";
import { ProductBackground } from "./ProductBackground";
import { ProductCopy } from "./ProductCopy";
import { ProductSlider } from "./ProductSlider";
import { ProductJourneyStatus } from "./ProductJourneyStatus";
import { ProductSplash } from "./ProductSplash";
import { HomeScenes as ProductLivingScene } from "./HomeScenes";
import { EnquiryEnding } from "./EnquiryEnding";
import { ProductCarousel } from "./ProductCarousel";
import "./product-world.css";
import { pad } from "@/lib/media/media";
import { rangeCopy } from "@/data/products";
import { SCROLL_TO_EVENT } from "@/lib/events";
import { followsCinematicStory, useProductReveal } from "./hooks/useProductReveal";
import { useRangeConditions } from "./hooks/useRangeConditions";
import { useCarouselAutoplay } from "./hooks/useCarouselAutoplay";

function ringOffset(index: number, centre: number, count: number) {
  const distance = (((index - centre) % count) + count) % count;
  return distance > count / 2 ? distance - count : distance;
}

export function ProductWorld() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const motion = useMotionPreference();
  const reduced = motion !== "full";
  // Selection updates immediately; the featured product follows its exit animation.
  const [target, setTarget] = useState(0);
  const [position, setPosition] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [productIndex, setProductIndex] = useState(0);
  const product = products[productIndex];
  const [switching, setSwitching] = useState(false);
  const switchTimer = useRef<number | null>(null);
  const pendingIndex = useRef(0);
  const [nearby, setNearby] = useState(false);
  const [active, setActive] = useState(false);
  const [entered, setEntered] = useState(false);
  const [suspended, setSuspended] = useState(false);
  // The splash room is over the ring: the range holds still and takes no input.
  const [covered, setCovered] = useState(false);
  const [constrained, setConstrained] = useState(true);
  // Explicit data saving withholds autoplay; screen size and memory alone do not.
  const [dataSaver, setDataSaver] = useState(true);
  // The hero artwork has decoded once: the ring's centre copy hands over to the hero frame from then on.
  const [heroReady, setHeroReady] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const backgroundLoaded = useCallback(() => setBackgroundReady(true), []);
  const heroLoaded = useCallback(() => setHeroReady(true), []);

  // Changing product: the carousel slides straight away; the copy and hero bucket dip out, swap, and re-enter.
  const changeProduct = useCallback((index: number) => {
    if (index === pendingIndex.current || index < 0 || index >= products.length) return;
    const distance = ringOffset(index, pendingIndex.current, products.length);
    setPosition((current) => current + distance);
    pendingIndex.current = index;
    setTarget(index);
    if (switchTimer.current) window.clearTimeout(switchTimer.current);
    if (reduced) { setProductIndex(index); return; }
    setSwitching(true);
    switchTimer.current = window.setTimeout(() => {
      setProductIndex(index);
      setSwitching(false);
      switchTimer.current = null;
    }, productTuning.switchMs);
  }, [reduced]);
  useEffect(() => () => { if (switchTimer.current) window.clearTimeout(switchTimer.current); }, []);

  // Horizontal navigation is independent of page scroll, including the last-to-first wrap.
  const selectProduct = useCallback((id: string) => {
    const index = products.findIndex((entry) => entry.id === id);
    if (index < 0) return;
    changeProduct(index);
  }, [changeProduct]);
  const step = useCallback((direction: 1 | -1) => {
    selectProduct(products[(pendingIndex.current + direction + products.length) % products.length].id);
  }, [selectProduct]);

  useCarouselAutoplay({ active, entered, suspended, reduced, constrained, interacting, covered, position, step });
  useProductReveal(section, stage, reduced, setEntered);
  useRangeConditions(section, stage, { setNearby, setActive, setConstrained, setDataSaver, setSuspended });

  // Approaching the range: warm its opening frame. On it: warm the backdrops either side, so a switch never waits.
  useEffect(() => {
    if (!nearby) return;
    warmImage(products[productIndex].poster);
    if (!active) return;
    for (const step of [1, -1]) warmImage(products[(productIndex + step + products.length) % products.length].poster);
  }, [nearby, active, productIndex, reduced]);

  // The header Products menu picks a product directly.
  useEffect(() => {
    const pick = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (!id) return;
      selectProduct(id);
      const element = section.current;
      if (element) {
        const overlap = !reduced && followsCinematicStory(element);
        const bounds = element.getBoundingClientRect();
        const top = window.scrollY + bounds.top + (overlap ? productUnit(bounds) * carouselStop.rest : 0);
        if (overlap) window.dispatchEvent(new CustomEvent(SCROLL_TO_EVENT, { detail: { top } }));
        else window.scrollTo({ top, behavior: "instant" });
      }
    };
    window.addEventListener("product:select", pick);
    return () => window.removeEventListener("product:select", pick);
  }, [selectProduct, reduced]);

  // Left and right arrow keys step the range while it is on screen and nothing else has focus.
  useEffect(() => {
    if (!active || covered) return;
    const keys = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const focus = document.activeElement;
      if (focus && focus !== document.body && !stage.current?.contains(focus)) return;
      if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [active, covered, step]);

  // Warm the collection before the chapter entrance uncovers it.
  const revealed = nearby && backgroundReady;
  const playing = active && !covered && !suspended && !reduced && !dataSaver;
  const counter = pad(product.index);
  const total = pad(products.length);
  return <section ref={section} id="product-range" data-scene="12" data-product={product.id}
    data-active={active} data-revealed={revealed && !switching} data-idling={playing} data-switching={switching}
    data-hero-ready={heroReady}
    className="product-world" aria-labelledby="product-range-heading"
    style={{ "--pr-entrance": `${productTuning.entranceMs}ms`, "--pr-switch": `${productTuning.switchMs}ms`, "--pr-range": productScrollRange, "--pr-stop": carouselStop.rest } as CSSProperties}>
    <div ref={stage} className="pr-stage"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
      <ProductBackground product={product} near={nearby} nearby={nearby && !reduced && !dataSaver} playing={playing} onReady={backgroundLoaded} />
      {/* Announce only user-driven changes, with the product named; autoplay stays silent for screen readers. */}
      <p className="pr-counter" aria-live={interacting ? "polite" : "off"} aria-atomic="true"><span className="pr-range-label">{rangeCopy.label}</span><span>{counter}</span> <small>/ {total}</small><span className="sr-only">, {product.title}</span></p>
      <ProductCopy key={product.id} product={product} />
      <p className="pr-tagline">{rangeCopy.tagline.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</p>
      <ProductCarousel position={position} nearby={nearby} step={step} setInteracting={setInteracting} />
      {!reduced && <ProductSplash reduced={false} onCover={setCovered} />}
      {!reduced && <ProductLivingScene reduced={false} />}
      {!reduced && <EnquiryEnding reduced={false} />}
      {/* The featured artwork sits outside the ring so it can dip out and re-enter on a switch while the ring slides. */}
      <div className="pr-hero" style={{ "--pr-pack-scale": product.packScale ?? 1, "--pr-pack-y": product.packY ?? "0%" } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {nearby && <img src={product.bucket} srcSet={bucketSrcSet(product.bucket)} sizes={bucketSizes.featured}
          alt="" draggable={false} decoding="async" onLoad={heroLoaded} />}
      </div>
      <button type="button" className="pr-arrow pr-arrow-prev" disabled={covered} onClick={() => step(-1)} aria-label="Previous product">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M11 3 5 9l6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button type="button" className="pr-arrow pr-arrow-next" disabled={covered} onClick={() => step(1)} aria-label="Next product">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="m7 3 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <ProductSlider activeIndex={target} onSelect={selectProduct} reduced={reduced} disabled={covered} />
      {!reduced && <ProductJourneyStatus />}
    </div>
    {/* Where a touch fling comes to rest on the carousel (product-world.css). */}
    {!reduced && <div className="pr-stop" aria-hidden="true" />}
    {reduced && <ProductSplash reduced onCover={setCovered} />}
    {reduced && <ProductLivingScene reduced />}
    {reduced && <EnquiryEnding reduced />}
  </section>;
}
