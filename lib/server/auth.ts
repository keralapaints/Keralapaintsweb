import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "./db";
import { User, type Role } from "./models/User";
import { SESSION_COOKIE, SESSION_DAYS, readSession, signSession, type SessionPayload } from "./session";

/** Starts a session for a signed-in user. */
export async function createSession(payload: SessionPayload) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in user, checked against the database (so a removed or disabled user is signed out at once). */
export async function getCurrentUser() {
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user || !user.active) return null;
  return { id: String(user._id), name: user.name, email: user.email, role: user.role as Role };
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/**
 * Every admin page and every save calls this first. It sends signed-out visitors to the login page, and users
 * without one of the given roles to the dashboard. Administrators may do everything.
 */
export async function requireUser(roles?: readonly Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login/");
  if (roles && user.role !== "admin" && !roles.includes(user.role)) redirect("/admin/?denied=1");
  return user;
}