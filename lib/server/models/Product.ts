import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * A product page as stored in MongoDB. The range fields sit at the top; everything written on the page (the fields of
 * ProductDetail in data/product-details.ts except the slug, and the template fields in data/product-template.ts) is
 * kept together in `detail`.
 */
const productSchema = new Schema({
  /** The product's id, used by links between products ("gold-ex", "prime-gold"). Never changes. */
  key: { type: String, required: true, unique: true, trim: true },
  /** The page address: /products/<categorySlug>/<slug>. Never changes once live. */
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  /** Its category in data/categories.ts. */
  categorySlug: { type: String, trim: true, lowercase: true },
  /** One of the eight range categories on the home page (counted as "03 / 08"). */
  inRange: { type: Boolean, default: false },
  index: { type: Number, default: 99, index: true },
  title: { type: String, required: true, trim: true },
  short: { type: String, trim: true },
  description: { type: String, default: "" },
  backdrop: { type: String, required: true },
  bucket: { type: String },
  packScale: { type: Number },
  packY: { type: String },
  published: { type: Boolean, default: true },
  detail: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true, minimize: false });

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const ProductModel: Model<ProductDoc> = (models.Product as Model<ProductDoc>) ?? model<ProductDoc>("Product", productSchema);