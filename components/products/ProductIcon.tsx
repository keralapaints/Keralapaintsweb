import type { ProductIcon as ProductIconName } from "@/data/product-details";

/** Line icons for product features: 24-unit paths, drawn like the home scenes' benefits. */
const ICONS: Record<ProductIconName, string> = {
  shield: "M12 3 4.5 6v6c0 5 7.5 9 7.5 9s7.5-4 7.5-9V6L12 3Zm-3.5 9 2.5 2.5 4.5-5",
  sparkle: "m8 3 1.5 4.5L14 9l-4.5 1.5L8 15l-1.5-4.5L2 9l4.5-1.5L8 3Zm10 9 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z",
  drop: "M12 2S5 10 5 14a7 7 0 0 0 14 0c0-4-7-12-7-12ZM8 14c0 2 1 3 3 4",
  leaf: "M20 3C9 3 3 8 5 15c2 7 15 3 15-12ZM3 22 16 8",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  home: "M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6",
  brush: "M14 4l6 6-8 8H6v-6l8-8Zm-3 3 6 6",
  palette: "M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A4.7 4.7 0 0 0 21 9.8C21 6 17 3 12 3ZM7.5 12.5h.01M9.5 7.5h.01M14.5 7.5h.01",
  air: "M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7",
  mix: "M5 9h14l-1.5 11h-11L5 9Zm3-5 2 5m6-5-2 5M8 14h8",
  badge: "M12 3l2.5 2 3.2-.3.6 3.1L21 10l-1.6 2.8.6 3.1-3.1.8-1.8 2.7L12 18l-3.1 1.4-1.8-2.7-3.1-.8.6-3.1L3 10l2.7-2.2.6-3.1 3.2.3L12 3Zm-3 9 2 2 4-4",
  thermo: "M10 14.8V5a2 2 0 1 1 4 0v9.8a4 4 0 1 1-4 0ZM12 9v7M17 6h3M17 10h3",
};

/** One decorative feature icon. */
export function ProductIcon({ name, size = 24 }: { name: ProductIconName; size?: number }) {
  return <svg className="pt-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>;
}