"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { connectDB } from "@/lib/server/db";
import { QuestionModel, ReviewModel } from "@/lib/server/models/Review";

const back = (formData: FormData) => {
  const status = String(formData.get("return") ?? "pending");
  return `/admin/reviews/?status=${/^(pending|approved|rejected)$/.test(status) ? status : "pending"}`;
};

/** Rebuilds the product pages (their Reviews section and star rating) and the moderation list. */
function refreshPages() {
  revalidatePath("/products", "layout");
  revalidatePath("/admin/reviews");
}

/** Approve, reject, save or delete one review, with the verified badge and Kerala Paints' reply. */
export async function moderateReview(formData: FormData) {
  await requireUser(["editor"]);
  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "save");
  await connectDB();
  if (intent === "delete") await ReviewModel.deleteOne({ _id: id });
  else {
    const reply = String(formData.get("reply") ?? "").trim().slice(0, 2000);
    await ReviewModel.updateOne({ _id: id }, {
      $set: {
        verified: formData.get("verified") === "on",
        ...(intent === "approve" ? { status: "approved" } : intent === "reject" ? { status: "rejected" } : {}),
        ...(reply ? { reply } : {}),
      },
      ...(reply ? {} : { $unset: { reply: 1 } }),
    });
  }
  refreshPages();
  redirect(back(formData));
}

/** Answer, approve, reject or delete one question. A question appears on the website only once answered and approved. */
export async function moderateQuestion(formData: FormData) {
  await requireUser(["editor"]);
  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "save");
  const answer = String(formData.get("answer") ?? "").trim().slice(0, 2000);
  await connectDB();
  if (intent === "delete") await QuestionModel.deleteOne({ _id: id });
  else if (intent === "approve" && !answer) redirect(`${back(formData)}&error=answer`);
  else await QuestionModel.updateOne({ _id: id }, {
    $set: { ...(intent === "approve" ? { status: "approved" } : intent === "reject" ? { status: "rejected" } : {}), ...(answer ? { answer } : {}) },
    ...(answer ? {} : { $unset: { answer: 1 } }),
  });
  refreshPages();
  redirect(back(formData));
}