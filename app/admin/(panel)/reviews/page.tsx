import type { Metadata } from "next";
import Link from "next/link";
import { ReviewModeration } from "@/components/admin/ReviewModeration";
import { requireUser } from "@/lib/server/auth";
import { connectDB } from "@/lib/server/db";
import { QuestionModel, ReviewModel } from "@/lib/server/models/Review";
import { listProductKeys } from "@/lib/server/products-repo";

export const metadata: Metadata = { title: "Reviews" };

const STATUSES = [
  { value: "pending", label: "Waiting for approval" },
  { value: "approved", label: "On the website" },
  { value: "rejected", label: "Rejected" },
] as const;

type ReviewsAdminProps = { searchParams: Promise<{ status?: string; error?: string }> };

/** Moderation of customer reviews and questions: nothing appears on a product page until it is approved here. */
export default async function ReviewsAdminPage({ searchParams }: ReviewsAdminProps) {
  await requireUser(["editor"]);
  const { status: requested, error } = await searchParams;
  const status = STATUSES.some((item) => item.value === requested) ? requested as (typeof STATUSES)[number]["value"] : "pending";
  await connectDB();
  const [reviews, questions, counts, products] = await Promise.all([
    ReviewModel.find({ status }).sort({ createdAt: -1 }).limit(200).lean(),
    QuestionModel.find({ status }).sort({ createdAt: -1 }).limit(200).lean(),
    Promise.all(STATUSES.map(async (item) => await ReviewModel.countDocuments({ status: item.value }) + await QuestionModel.countDocuments({ status: item.value }))),
    listProductKeys(),
  ]);
  const productName = Object.fromEntries(products.map((product) => [product.key, product.name]));
  return <>
    <div className="ad-page-head">
      <div>
        <p className="ad-eyebrow">Product pages</p>
        <h1>Reviews &amp; questions</h1>
      </div>
    </div>
    <nav className="ad-chips" aria-label="Filter by status">
      {STATUSES.map((item, index) => <Link key={item.value} href={`/admin/reviews/?status=${item.value}`} aria-current={item.value === status ? "page" : undefined}>{item.label} ({counts[index]})</Link>)}
    </nav>
    {error === "answer" && <p className="ad-notice ad-notice--warn" role="alert">Write an answer before approving a question.</p>}
    <ReviewModeration
      status={status}
      reviews={reviews.map((review) => ({
        id: String(review._id), product: productName[review.productKey] ?? review.productKey, name: review.name, contact: review.contact,
        location: review.location, rating: review.rating, title: review.title, text: review.text, shade: review.shade ?? "",
        projectType: review.projectType, verified: Boolean(review.verified), reply: review.reply ?? "", date: review.createdAt.toISOString().slice(0, 10),
      }))}
      questions={questions.map((question) => ({
        id: String(question._id), product: productName[question.productKey] ?? question.productKey, name: question.name,
        contact: question.contact ?? "", question: question.question, answer: question.answer ?? "", date: question.createdAt.toISOString().slice(0, 10),
      }))}
    />
  </>;
}