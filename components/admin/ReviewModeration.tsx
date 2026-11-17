import { moderateQuestion, moderateReview } from "@/app/admin/(panel)/reviews/actions";

type AdminReview = {
  id: string; product: string; name: string; contact: string; location: string; rating: number; title: string; text: string;
  shade: string; projectType: string; verified: boolean; reply: string; date: string;
};
type AdminQuestion = { id: string; product: string; name: string; contact: string; question: string; answer: string; date: string };

type ReviewModerationProps = { status: string; reviews: readonly AdminReview[]; questions: readonly AdminQuestion[] };

/** The buttons under each review or question: approve or reject (by status), save, delete. */
function Buttons({ status, approveLabel = "Approve" }: { status: string; approveLabel?: string }) {
  return <div className="ad-actions-row">
    {status !== "approved" && <button className="ad-button ad-button--primary" name="intent" value="approve">{approveLabel}</button>}
    <button className="ad-button" name="intent" value="save">Save</button>
    {status !== "rejected" && <button className="ad-button" name="intent" value="reject">Reject</button>}
    <button className="ad-button ad-button--danger" name="intent" value="delete">Delete</button>
  </div>;
}

/** Each review and question as a card with its moderation form. Contact details are visible here only. */
export function ReviewModeration({ status, reviews, questions }: ReviewModerationProps) {
  return <>
    <section className="ad-panel ad-form">
      <h2>Reviews ({reviews.length})</h2>
      {reviews.length === 0 && <p>No reviews here.</p>}
      {reviews.map((review) => <form key={review.id} action={moderateReview} className="ad-moderation">
        <input type="hidden" name="id" value={review.id} />
        <input type="hidden" name="return" value={status} />
        <p className="ad-eyebrow">{review.product} · {review.date}</p>
        <p className="ad-moderation-title">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} <strong>{review.title}</strong></p>
        <p>{review.text}</p>
        <p className="ad-moderation-meta">{review.name}, {review.location} · {review.projectType}{review.shade ? ` · Shade: ${review.shade}` : ""} · Contact: <strong>{review.contact}</strong></p>
        <label className="ad-check"><input type="checkbox" name="verified" defaultChecked={review.verified} /><span>Verified buyer (checked against a purchase)</span></label>
        <label className="ad-field"><span>Reply from Kerala Paints (optional, shown under the review)</span><textarea name="reply" rows={2} defaultValue={review.reply} /></label>
        <Buttons status={status} />
      </form>)}
    </section>
    <section className="ad-panel ad-form">
      <h2>Questions ({questions.length})</h2>
      {questions.length === 0 && <p>No questions here.</p>}
      {questions.map((question) => <form key={question.id} action={moderateQuestion} className="ad-moderation">
        <input type="hidden" name="id" value={question.id} />
        <input type="hidden" name="return" value={status} />
        <p className="ad-eyebrow">{question.product} · {question.date}</p>
        <p className="ad-moderation-title"><strong>{question.question}</strong></p>
        <p className="ad-moderation-meta">{question.name}{question.contact ? ` · Contact: ${question.contact}` : ""}</p>
        <label className="ad-field"><span>Answer (required to publish)</span><textarea name="answer" rows={3} defaultValue={question.answer} /></label>
        <Buttons status={status} approveLabel="Publish answer" />
      </form>)}
    </section>
  </>;
}