import "server-only";
import { REVIEWS_PAGE_SIZE, emptySummary, shortName, type PublicQuestion, type PublicReview, type ReviewSummary } from "@/lib/product/reviews";
import { connectDB, hasDatabase } from "./db";
import { QuestionModel, ReviewModel } from "./models/Review";

type ReviewRecord = {
  _id: unknown; name: string; location: string; rating: number; title: string; text: string; shade?: string | null;
  projectType: string; verified?: boolean | null; reply?: string | null; createdAt: Date;
};
type QuestionRecord = { _id: unknown; name: string; question: string; answer?: string | null; createdAt: Date };

export type ReviewSort = "newest" | "highest";

const toReview = (doc: ReviewRecord): PublicReview => ({
  id: String(doc._id), name: shortName(doc.name), location: doc.location, rating: doc.rating, title: doc.title, text: doc.text,
  date: doc.createdAt.toISOString().slice(0, 10), projectType: doc.projectType, verified: Boolean(doc.verified),
  ...(doc.shade ? { shade: doc.shade } : {}), ...(doc.reply ? { reply: doc.reply } : {}),
});

const toQuestion = (doc: QuestionRecord): PublicQuestion => ({
  id: String(doc._id), name: shortName(doc.name), question: doc.question, answer: doc.answer ?? "", date: doc.createdAt.toISOString().slice(0, 10),
});

/** Approved reviews for a product, a page at a time. */
export async function listApprovedReviews(productKey: string, skip = 0, sort: ReviewSort = "newest") {
  await connectDB();
  const order: Record<string, -1> = sort === "highest" ? { rating: -1, createdAt: -1 } : { createdAt: -1 };
  const docs = await ReviewModel.find({ productKey, status: "approved" }).sort(order).skip(skip).limit(REVIEWS_PAGE_SIZE).lean<ReviewRecord[]>();
  return docs.map(toReview);
}

/** Answered, approved questions for a product, a page at a time. */
export async function listApprovedQuestions(productKey: string, skip = 0) {
  await connectDB();
  const docs = await QuestionModel.find({ productKey, status: "approved" }).sort({ createdAt: -1 }).skip(skip).limit(REVIEWS_PAGE_SIZE).lean<QuestionRecord[]>();
  return docs.map(toQuestion);
}

/** Everything the Reviews section shows on load. Without a database it is empty, so the page still builds. */
export async function getReviewSummary(productKey: string): Promise<ReviewSummary> {
  if (!hasDatabase()) return emptySummary;
  try {
    await connectDB();
    const [ratings, reviews, questions, questionCount] = await Promise.all([
      ReviewModel.aggregate<{ _id: number; count: number }>([{ $match: { productKey, status: "approved" } }, { $group: { _id: "$rating", count: { $sum: 1 } } }]),
      listApprovedReviews(productKey),
      listApprovedQuestions(productKey),
      QuestionModel.countDocuments({ productKey, status: "approved" }),
    ]);
    const distribution = [5, 4, 3, 2, 1].map((stars) => ratings.find((row) => row._id === stars)?.count ?? 0);
    const count = distribution.reduce((sum, value) => sum + value, 0);
    const total = ratings.reduce((sum, row) => sum + row._id * row.count, 0);
    return { count, average: count ? Math.round((total / count) * 10) / 10 : 0, distribution, reviews, questions, questionCount };
  } catch (error) {
    console.error("[reviews] Could not read reviews from MongoDB.", error);
    return emptySummary;
  }
}