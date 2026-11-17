import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** An outlet as stored in MongoDB: the same fields as data/outlets.ts, plus order, visibility and timestamps. */
const outletSchema = new Schema({
  district: { type: String, required: true, trim: true },
  type: { type: String, enum: ["factory", "dealer"], required: true },
  name: { type: String, trim: true },
  place: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  pin: { type: String, trim: true },
  phones: { type: [String], default: [] },
  isNew: { type: Boolean, default: false },
  /** Hidden outlets stay in the admin but are not shown on the website. */
  published: { type: Boolean, default: true },
  /** Lower comes first. Districts appear in the order of their first outlet. */
  order: { type: Number, default: 0, index: true },
}, { timestamps: true, suppressReservedKeysWarning: true });

export type OutletDoc = InferSchemaType<typeof outletSchema>;

export const OutletModel: Model<OutletDoc> = (models.Outlet as Model<OutletDoc>) ?? model<OutletDoc>("Outlet", outletSchema);