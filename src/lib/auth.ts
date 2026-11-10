import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

/**
 * Admin authentication.
 *
 * Credentials are verified by Supabase Auth (email + password). Only emails
 * listed in ADMIN_EMAILS are allowed in. After a successful login we issue our
 * own short-lived, signed, HTTP-only session cookie, and every admin page and
 * admin server action re-validates it (including the allowlist) on the server.
 */
export const SESSION_COOKIE = "admin_session";
const SESSION_HOURS = 8;

export type AdminSession = { userId: string; email: string };

function getKey(): Uint8Array | null {
  const secret = env.sessionSecret();
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export const isAdminAuthConfigured = () => Boolean(getKey() && env.adminEmails().length);

export function isAllowedAdmin(email: string): boolean {
  return env.adminEmails().includes(email.trim().toLowerCase());
}

export async function createAdminSession(session: AdminSession): Promise<void> {
  const key = getKey();
  if (!key) throw new Error("SESSION_SECRET must be set (at least 32 characters).");
  const token = await new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .setAudience("admin")
    .sign(key);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function destroyAdminSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const key = getKey();
  if (!key) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { audience: "admin", algorithms: ["HS256"] });
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!payload.sub || !email || !isAllowedAdmin(email)) return null;
    return { userId: payload.sub, email };
  } catch {
    return null;
  }
}

/** Use at the top of every admin page and admin server action. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
