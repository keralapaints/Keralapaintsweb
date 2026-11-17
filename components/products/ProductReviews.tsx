"use client";

import { useActionState, useId, useState, useTransition } from "react";
import { reviewsCopy as copy } from "@/data/product-template";
import { fill } from "@/lib/product/product-price";
import { MIN_REVIEWS_FOR_SUMMARY, type PublicQuestion, type PublicReview, type ReviewSummary } from "@/lib/product/reviews";
import { loadQuestions, loadReviews, submitQuestion, submitReview, type SubmitState } from "@/lib/server/review-actions";

type Sort = "newest" | "highest";
type ProductReviewsProps = { productKey: string; productName: string; summary: ReviewSummary };

/** Five stars, filled to the rating; read out as "4 out of 5". */
function Stars({ rating }: { rating: number }) {
  return <span className="pt-stars" role="img" aria-label={`${rating} ${copy.outOf}`}>
    {[1, 2, 3, 4, 5].map((star) => <span key={star} aria-hidden="true" data-on={star <= Math.round(rating) || undefined}>★</span>)}
  </span>;
}

/** Hidden from people, tempting to bots: a submission with this field filled in is dropped. */
function Honeypot() {
  return <label className="pt-honeypot" aria-hidden="true">{copy.form.honeypot}<input name="website" tabIndex={-1} autoComplete="off" /></label>;
}

function ReviewForm({ productKey, onClose }: { productKey: string; onClose: () => void }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitReview, {});
  const id = useId();
  if (state.ok) return <p className="pt-form-done" role="status">{copy.form.reviewThanks}</p>;
  const value = (key: string) => state.fields?.[key] ?? "";
  return <form action={action} className="pt-form" aria-labelledby={`${id}-title`}>
    <p id={`${id}-title`} className="pt-form-title">{copy.form.reviewTitle}</p>
    <input type="hidden" name="productKey" value={productKey} />
    <Honeypot />
    <fieldset className="pt-rating-input">
      <legend>{copy.form.rating}</legend>
      {[5, 4, 3, 2, 1].map((stars) => <label key={stars}>
        <input type="radio" name="rating" value={stars} required defaultChecked={value("rating") === String(stars)} />
        <span>{fill(copy.stars, { n: stars })}</span>
      </label>)}
    </fieldset>
    <div className="pt-form-grid">
      <label><span>{copy.form.name}</span><input name="name" required maxLength={80} autoComplete="name" defaultValue={value("name")} /></label>
      <label><span>{copy.form.location}</span><input name="location" required maxLength={80} defaultValue={value("location")} /></label>
      <label className="pt-span-2"><span>{copy.form.contact}</span><input name="contact" required maxLength={120} defaultValue={value("contact")} /></label>
      <label><span>{copy.form.projectType}</span>
        <select name="projectType" required defaultValue={value("projectType")}>
          <option value="" disabled>—</option>
          {Object.entries(copy.projectTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <label><span>{copy.form.shade}</span><input name="shade" maxLength={80} defaultValue={value("shade")} /></label>
      <label className="pt-span-2"><span>{copy.form.title}</span><input name="title" required maxLength={120} defaultValue={value("title")} /></label>
      <label className="pt-span-2"><span>{copy.form.text}</span><textarea name="text" required rows={5} minLength={20} maxLength={2000} defaultValue={value("text")} /></label>
    </div>
    {state.error && <p className="pt-form-error" role="alert">{state.error}</p>}
    <div className="pt-actions">
      <button className="pt-button pt-button--primary" type="submit" disabled={pending}>{pending ? copy.form.sending : copy.form.submitReview}</button>
      <button className="pt-button" type="button" onClick={onClose}>{copy.form.cancel}</button>
    </div>
  </form>;
}

function QuestionForm({ productKey, productName, onClose }: { productKey: string; productName: string; onClose: () => void }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitQuestion, {});
  const id = useId();
  if (state.ok) return <p className="pt-form-done" role="status">{copy.form.questionThanks}</p>;
  const value = (key: string) => state.fields?.[key] ?? "";
  return <form action={action} className="pt-form" aria-labelledby={`${id}-title`}>
    <p id={`${id}-title`} className="pt-form-title">{fill(copy.form.questionTitle, { name: productName })}</p>
    <input type="hidden" name="productKey" value={productKey} />
    <Honeypot />
    <div className="pt-form-grid">
      <label><span>{copy.form.name}</span><input name="name" required maxLength={80} autoComplete="name" defaultValue={value("name")} /></label>
      <label><span>{copy.form.contactOptional}</span><input name="contact" maxLength={120} defaultValue={value("contact")} /></label>
      <label className="pt-span-2"><span>{copy.form.question}</span><textarea name="question" required rows={3} minLength={10} maxLength={1000} defaultValue={value("question")} /></label>
    </div>
    {state.error && <p className="pt-form-error" role="alert">{state.error}</p>}
    <div className="pt-actions">
      <button className="pt-button pt-button--primary" type="submit" disabled={pending}>{pending ? copy.form.sending : copy.form.submitQuestion}</button>
      <button className="pt-button" type="button" onClick={onClose}>{copy.form.cancel}</button>
    </div>
  </form>;
}

/**
 * Section 7: approved customer reviews and answered questions. The first few of each are in the page's HTML; the rest
 * load on request. The rating summary appears only once there are enough approved reviews.
 */
export function ProductReviews({ productKey, productName, summary }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<readonly PublicReview[]>(summary.reviews);
  const [questions, setQuestions] = useState<readonly PublicQuestion[]>(summary.questions);
  const [sort, setSort] = useState<Sort>("newest");
  const [form, setForm] = useState<"review" | "question" | null>(null);
  const [loading, startLoading] = useTransition();
  const sortId = useId();

  const changeSort = (next: Sort) => {
    setSort(next);
    startLoading(async () => setReviews(await loadReviews(productKey, 0, next)));
  };
  const moreReviews = () => startLoading(async () => {
    const next = await loadReviews(productKey, reviews.length, sort);
    setReviews((current) => [...current, ...next]);
  });
  const moreQuestions = () => startLoading(async () => {
    const next = await loadQuestions(productKey, questions.length);
    setQuestions((current) => [...current, ...next]);
  });

  return <div className="pt-reviews">
    <div className="pt-review-top">
      {summary.count >= MIN_REVIEWS_FOR_SUMMARY ? <div className="pt-rating-summary">
        <p className="pt-rating-average"><strong>{summary.average.toFixed(1)}</strong> <span>{copy.outOf}</span></p>
        <Stars rating={summary.average} />
        <p className="pt-rating-count">{fill(copy.basedOn, { count: summary.count })}</p>
        <ul className="pt-rating-bars">
          {summary.distribution.map((count, index) => <li key={5 - index}>
            <span>{fill(copy.stars, { n: 5 - index })}</span>
            <span className="pt-bar" aria-hidden="true"><span style={{ width: `${(count / summary.count) * 100}%` }} /></span>
            <span>{count}</span>
          </li>)}
        </ul>
      </div> : summary.count === 0 && <p className="pt-review-empty">{fill(copy.empty, { name: productName })}</p>}
      <div className="pt-actions">
        <button className="pt-button pt-button--primary" type="button" aria-expanded={form === "review"} onClick={() => setForm(form === "review" ? null : "review")}>{copy.write}</button>
        <button className="pt-button" type="button" aria-expanded={form === "question"} onClick={() => setForm(form === "question" ? null : "question")}>{copy.ask}</button>
      </div>
    </div>

    {form === "review" && <ReviewForm productKey={productKey} onClose={() => setForm(null)} />}
    {form === "question" && <QuestionForm productKey={productKey} productName={productName} onClose={() => setForm(null)} />}

    {reviews.length > 0 && <>
      <div className="pt-review-toolbar">
        <label htmlFor={sortId}>{copy.sortLabel}</label>
        <select id={sortId} value={sort} onChange={(event) => changeSort(event.target.value as Sort)}>
          <option value="newest">{copy.sort.newest}</option>
          <option value="highest">{copy.sort.highest}</option>
        </select>
      </div>
      <ul className="pt-review-list" aria-busy={loading}>
        {reviews.map((review) => <li key={review.id}>
          <article className="pt-review">
            <Stars rating={review.rating} />
            <h3 className="pt-review-title">{review.title}</h3>
            <p className="pt-review-meta">
              <span>{review.name}, {review.location}</span>
              <time dateTime={review.date}>{new Date(`${review.date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time>
              <span>{copy.projectTypes[review.projectType as keyof typeof copy.projectTypes] ?? review.projectType}</span>
              {review.verified && <span className="pt-verified">{copy.verified}</span>}
            </p>
            {review.shade && <p className="pt-review-shade">{copy.shade}: {review.shade}</p>}
            <p className="pt-body">{review.text}</p>
            {review.reply && <div className="pt-review-reply"><p className="pt-label">{copy.reply}</p><p className="pt-body">{review.reply}</p></div>}
          </article>
        </li>)}
      </ul>
      {reviews.length < summary.count && <button className="pt-button" type="button" onClick={moreReviews} disabled={loading}>{copy.loadMore}</button>}
    </>}

    <div className="pt-sub">
      <h3 className="pt-h3">{copy.questionsHeading}</h3>
      {questions.length === 0 ? <p className="pt-body">{fill(copy.noQuestions, { name: productName })}</p> : <ul className="pt-qa-list">
        {questions.map((item) => <li key={item.id}>
          <p className="pt-qa-q"><strong>Q.</strong> {item.question} <span className="pt-qa-by">— {item.name}</span></p>
          <p className="pt-qa-a"><strong>A.</strong> {item.answer} <span className="pt-qa-by">— {copy.answer}</span></p>
        </li>)}
      </ul>}
      {questions.length < summary.questionCount && <button className="pt-button" type="button" onClick={moreQuestions} disabled={loading}>{copy.loadMoreQuestions}</button>}
    </div>
  </div>;
}