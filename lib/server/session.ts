import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./models/User";

/**
 * The admin session: a signed token in an http-only cookie. It is shared by proxy.ts (which only checks the cookie)
 * and the server code (which also checks the user still exists), so it imports nothing that needs a database.
 */
export const SESSION_COOKIE = "kp_admin_session";
export const SESSION_DAYS = 7;

export type SessionPayload = { userId: string; role: Role; name: string };

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET is missing or shorter than 32 characters.");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

/** The session in a token, or null if it is missing, tampered with or expired. */
export async function readSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return { userId: String(payload.userId), role: payload.role as Role, name: String(payload.name) };
  } catch {
    return null;
  }
}