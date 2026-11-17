"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { connectDB } from "@/lib/server/db";
import { OutletModel } from "@/lib/server/models/Outlet";
import { nextOrderFor } from "@/lib/server/outlets-repo";
import type { OutletType } from "@/data/outlets";

export type OutletField = "type" | "name" | "district" | "place" | "address" | "pin" | "phones" | "order";
export type OutletFormState = { errors?: Partial<Record<OutletField, string>>; message?: string };

/** A phone number as the website shows it: a 10-digit mobile as "98765 43210"; other numbers as digits. */
function formatPhone(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits;
  return digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

/** Rebuilds the public page (and the admin list) after a change, so the website shows it within seconds. */
function refreshPages() {
  revalidatePath("/outlets");
  revalidatePath("/admin/outlets");
  revalidatePath("/admin");
}

export async function saveOutlet(_: OutletFormState, formData: FormData): Promise<OutletFormState> {
  await requireUser(["outlets"]);
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const id = text("id");
  const type = text("type");
  const name = text("name");
  const district = text("district");
  const place = text("place");
  const address = text("address").replace(/\s+/g, " ");
  const pin = text("pin").replace(/\s/g, "");
  const phones = ["phone1", "phone2", "phone3"].map(text).filter(Boolean);
  const orderText = text("order");

  const errors: OutletFormState["errors"] = {};
  if (type !== "factory" && type !== "dealer") errors.type = "Choose factory outlet or authorised dealer.";
  if (type === "dealer" && !name) errors.name = "Enter the dealer’s business name.";
  if (!district) errors.district = "Enter the district.";
  if (!place) errors.place = "Enter the town or panchayath.";
  if (address.length < 10) errors.address = "Enter the full address.";
  if (pin && !/^\d{6}$/.test(pin)) errors.pin = "A PIN code has 6 digits.";
  const badPhone = phones.find((phone) => { const digits = phone.replace(/\D/g, ""); return digits.length < 6 || digits.length > 12; });
  if (badPhone) errors.phones = `“${badPhone}” doesn’t look like a phone number.`;
  if (orderText && !/^-?\d+$/.test(orderText)) errors.order = "Use a whole number, or leave it empty.";
  if (Object.keys(errors).length > 0) return { errors, message: "Please fix the highlighted fields." };

  const data = {
    type: type as OutletType,
    name: type === "dealer" ? name : (name || undefined),
    district,
    place,
    address,
    pin: pin || undefined,
    phones: phones.map(formatPhone),
    isNew: formData.get("isNew") === "on",
    published: formData.get("published") === "on",
  };

  await connectDB();
  if (id) {
    const update: Record<string, unknown> = { ...data, ...(orderText ? { order: Number(orderText) } : {}) };
    const unset: Record<string, 1> = {};
    if (!data.name) { delete update.name; unset.name = 1; }
    if (!data.pin) { delete update.pin; unset.pin = 1; }
    const result = await OutletModel.updateOne({ _id: id }, { $set: update, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
    if (result.matchedCount === 0) return { message: "This outlet no longer exists. It may have been deleted." };
  } else {
    await OutletModel.create({ ...data, order: orderText ? Number(orderText) : await nextOrderFor(district) });
  }

  refreshPages();
  redirect(`/admin/outlets/?saved=${id ? "updated" : "added"}`);
}

export async function deleteOutlet(formData: FormData) {
  await requireUser(["outlets"]);
  const id = String(formData.get("id") ?? "");
  await connectDB();
  await OutletModel.deleteOne({ _id: id });
  refreshPages();
  redirect("/admin/outlets/?saved=deleted");
}