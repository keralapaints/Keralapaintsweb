"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/server/auth";
import { connectDB } from "@/lib/server/db";
import { User } from "@/lib/server/models/User";

export type LoginState = { error?: string; email?: string };

/** Only addresses inside /admin are allowed as the page to return to after signing in. */
const safeNext = (value: FormDataEntryValue | null) =>
  typeof value === "string" && value.startsWith("/admin") && !value.startsWith("/admin/login") ? value : "/admin/";

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  await connectDB();
  const user = await User.findOne({ email });
  const valid = user && user.active && await bcrypt.compare(password, user.passwordHash);
  if (!user || !valid) {
    // A short pause on every failed attempt slows down password guessing.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "Incorrect email or password.", email };
  }

  user.lastLoginAt = new Date();
  await user.save();
  await createSession({ userId: String(user._id), role: user.role, name: user.name });
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/admin/login/");
}