"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import type { PublicQuestion, PublicReview } from "@/lib/product/reviews";
import { connectDB } from "./db";
import { PROJECT_TYPES, QuestionModel, ReviewModel } from "./models/Review";
import { listApprovedQuestions, listApprovedReviews, type ReviewSort } from "./reviews-repo";

/** How many reviews and questions one visitor may send in an hour. */
const MAX_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

export type SubmitState = { ok?: boolean; error?: string; fields?: Record<string, string> };

/** A one-way hash of the visitor's IP address: enough to rate-limit, without storing the address itself. */
async function visitorHash() {
  const forwarded = (await headers()).get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(`${ip}:${process.env.AUTH_SECRET ?? ""}`).digest("hex").slice(0, 32);
}

/** Spam checks shared by both forms: the hidden "website" field must stay empty, and the hourly limit must hold. */
async function spamCheck(formData: FormData, ipHash: string) {
  if (String(formData.get("website") ?? "") !== "") return "Your message could not be sent.";
  const since = new Date(Date.now() - HOUR_MS);
  const recent = await ReviewModel.countDocuments({ ipHash, createdAt: { $gte: since } }) + await QuestionModel.countDocuments({ ipHash, createdAt: { $gte: since } });
  return recent >= MAX_PER_HOUR ? "You have sent several messages recently. Please try again later." : null;
}

const field = (formData: FormData, key: string, max: number) => String(formData.get(key) ?? "").trim().slice(0, max);
const validProduct = (key: string) => /^[a-z0-9-]{2,60}$/.test(key);

/** A new review from the product page. It is stored as pending and appears only after approval in /admin/reviews. */
export async function submitReview(_: SubmitState, formData: FormData): Promise<SubmitState> {
  const fields = {
    productKey: field(formData, "productKey", 60), name: field(formData, "name", 80), contact: field(formData, "contact", 120),
    location: field(formData, "location", 80), rating: field(formData, "rating", 1), title: field(formData, "title", 120),
    text: field(formData, "text", 2000), shade: field(formData, "shade", 80), projectType: field(formData, "projectType", 20),
  };
  const rating = Number(fields.rating);
  if (!validProduct(fields.productKey)) return { error: "Something went wrong. Please reload the page.", fields };
  if (!fields.name || !fields.contact || !fields.location || !fields.title || !fields.text) return { error: "Please fill in every required field.", fields };
  if (!/^\+?[\d\s-]{8,15}$/.test(fields.contact) && !/^\S+@\S+\.\S+$/.test(fields.contact)) return { error: "Enter a valid phone number or email address.", fields };
  if (!(rating >= 1 && rating <= 5)) return { error: "Choose a star rating.", fields };
  if (!(PROJECT_TYPES as readonly string[]).includes(fields.projectType)) return { error: "Choose the project type.", fields };
  if (fields.text.length < 20) return { error: "Please write a little more about your experience (at least 20 characters).", fields };

  await connectDB();
  const ipHash = await visitorHash();
  const spam = await spamCheck(formData, ipHash);
  if (spam) return { error: spam, fields };
  await ReviewModel.create({ ...fields, projectType: fields.projectType as (typeof PROJECT_TYPES)[number], rating, shade: fields.shade || undefined, ipHash });
  return { ok: true };
}

/** A new question from the product page, answered by Kerala Paints in /admin/reviews before it appears. */
export async function submitQuestion(_: SubmitState, formData: FormData): Promise<SubmitState> {
  const fields = { productKey: field(formData, "productKey", 60), name: field(formData, "name", 80), contact: field(formData, "contact", 120), question: field(formData, "question", 1000) };
  if (!validProduct(fields.productKey)) return { error: "Something went wrong. Please reload the page.", fields };
  if (!fields.name || fields.question.length < 10) return { error: "Please enter your name and your question.", fields };
  await connectDB();
  const ipHash = await visitorHash();
  const spam = await spamCheck(formData, ipHash);
  if (spam) return { error: spam, fields };
  await QuestionModel.create({ ...fields, contact: fields.contact || undefined, ipHash });
  return { ok: true };
}

/** "Load more" and the sort switch on the product page. */
export async function loadReviews(productKey: string, skip: number, sort: ReviewSort): Promise<PublicReview[]> {
  if (!validProduct(productKey)) return [];
  return listApprovedReviews(productKey, Math.max(0, Math.floor(skip)), sort === "highest" ? "highest" : "newest");
}

export async function loadQuestions(productKey: string, skip: number): Promise<PublicQuestion[]> {
  if (!validProduct(productKey)) return [];
  return listApprovedQuestions(productKey, Math.max(0, Math.floor(skip)));
}