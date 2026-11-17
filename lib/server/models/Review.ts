import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Where a review or question is in moderation: only "approved" ones appear on the website. */
export const MODERATION = ["pending", "approved", "rejected"] as const;
export const PROJECT_TYPES = ["new-home", "repainting", "commercial"] as const;

/** A customer review of one product, held for approval before it appears. */
const reviewSchema = new Schema({
  /** The product's id ("gold-ex"). */
  productKey: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  /** Phone or email: for verification only, never shown on the website. */
  contact: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  shade: { type: String, trim: true },
  projectType: { type: String, enum: PROJECT_TYPES, required: true },
  status: { type: String, enum: MODERATION, default: "pending", index: true },
  verified: { type: Boolean, default: false },
  reply: { type: String, trim: true },
  /** A one-way hash of the sender's IP address, for the rate limit only. */
  ipHash: { type: String, index: true },
}, { timestamps: true });

/** A customer question about one product, answered by Kerala Paints before it appears. */
const questionSchema = new Schema({
  productKey: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  contact: { type: String, trim: true },
  question: { type: String, required: true, trim: true },
  answer: { type: String, trim: true },
  status: { type: String, enum: MODERATION, default: "pending", index: true },
  ipHash: { type: String, index: true },
}, { timestamps: true });

export type ReviewDoc = InferSchemaType<typeof reviewSchema>;
export type QuestionDoc = InferSchemaType<typeof questionSchema>;

export const ReviewModel: Model<ReviewDoc> = (models.Review as Model<ReviewDoc>) ?? model<ReviewDoc>("Review", reviewSchema);
export const QuestionModel: Model<QuestionDoc> = (models.Question as Model<QuestionDoc>) ?? model<QuestionDoc>("Question", questionSchema);