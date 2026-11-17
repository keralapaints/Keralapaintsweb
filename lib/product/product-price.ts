import type { ProductTemplate } from "@/data/product-template";

/** Indian digit grouping: 11150 → "11,150". */
const RUPEES = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
/** Cost per sq. ft. to the paisa: 3.2794 → "3.28". */
const PAISE = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The worked-out numbers on the price card: one coat's area per pack, and the material cost per sq. ft. */
export function priceFigures(price: NonNullable<ProductTemplate["price"]>) {
  const area = price.pack * price.coverage;
  return {
    mrp: price.mrp === undefined ? undefined : RUPEES.format(price.mrp),
    offer: RUPEES.format(price.offer),
    area: RUPEES.format(area),
    cost: PAISE.format(price.offer / area),
  };
}

/** Replaces `{key}` placeholders in a line of copy. */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => key in values ? String(values[key]) : match);