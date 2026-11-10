import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { env } from "./env";
import { getSupabaseAdmin } from "./supabase";

const secret = () => env.sessionSecret() ?? "dev-only-insecure-secret-change-me";

/* ------------------------------------------------------------------ IP -- */

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

/** One-way hash so raw IP addresses are never stored. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${secret()}:${ip}`).digest("hex").slice(0, 32);
}

/* -------------------------------------------------------- Rate limiting -- */

const memoryBuckets = new Map<string, number[]>();

/**
 * Sliding-window rate limit. Uses the database so limits hold across
 * serverless instances; falls back to memory if Supabase is unavailable.
 * Returns true when the action is allowed.
 */
export async function rateLimit(bucket: string, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const since = new Date(Date.now() - windowSeconds * 1000);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { count, error } = await supabase
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("bucket", bucket)
      .eq("key", key)
      .gte("created_at", since.toISOString());
    if (!error) {
      if ((count ?? 0) >= limit) return false;
      await supabase.from("rate_limits").insert({ bucket, key });
      return true;
    }
    console.error("[rateLimit] falling back to memory:", error.message);
  }

  const id = `${bucket}:${key}`;
  const hits = (memoryBuckets.get(id) ?? []).filter((t) => t > since.getTime());
  if (hits.length >= limit) {
    memoryBuckets.set(id, hits);
    return false;
  }
  hits.push(Date.now());
  memoryBuckets.set(id, hits);
  return true;
}

/* ----------------------------------------------------------- Form token -- */
/*
 * A signed timestamp issued when a form is first displayed. Submissions
 * that arrive too quickly (bots) or with a forged/expired token are rejected.
 */
const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export function createFormToken(): string {
  const ts = Date.now().toString();
  return `${ts}.${sign(ts)}`;
}

export type TokenCheck = "ok" | "invalid" | "too-fast" | "expired";

export function verifyFormToken(token: unknown, minSeconds = 3, maxSeconds = 60 * 60 * 24): TokenCheck {
  if (typeof token !== "string" || !token.includes(".")) return "invalid";
  const [ts, sig] = token.split(".");
  const expected = sign(ts);
  const a = Buffer.from(sig ?? "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "invalid";
  const age = (Date.now() - Number(ts)) / 1000;
  if (!Number.isFinite(age) || age < 0) return "invalid";
  if (age < minSeconds) return "too-fast";
  if (age > maxSeconds) return "expired";
  return "ok";
}

/* ------------------------------------------------------------ Turnstile -- */

export const isTurnstileEnabled = () => Boolean(env.turnstileSecretKey() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

/** Verifies a Cloudflare Turnstile token when Turnstile is configured. */
export async function verifyTurnstile(token: FormDataEntryValue | null, ip: string): Promise<boolean> {
  const secretKey = env.turnstileSecretKey();
  if (!isTurnstileEnabled() || !secretKey) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const body = new URLSearchParams({ secret: secretKey, response: token });
    if (ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error("[turnstile] verification failed:", err);
    return false;
  }
}

/* ------------------------------------------------------- Spam heuristics -- */

export const HONEYPOT_FIELD = "website";

/** Simple content heuristics used in addition to the checks above. */
export function looksLikeSpam(text: string): boolean {
  const links = (text.match(/https?:\/\/|www\./gi) ?? []).length;
  if (links > 2) return true;
  if (/<a\s|\[url=|\[link=/i.test(text)) return true;
  return false;
}

export type SpamCheckResult = { ok: true; ip: string; ipHash: string } | { ok: false; message: string; silent?: boolean };

/** Runs all shared anti-spam checks for a public form submission. */
export async function runSpamChecks(
  formData: FormData,
  opts: { bucket: string; limit: number; windowSeconds: number },
): Promise<SpamCheckResult> {
  const ip = await getClientIp();
  const ipHash = hashIp(ip);

  // Honeypot: real visitors never see or fill this field.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: false, message: "Submission blocked.", silent: true };
  }

  const token = verifyFormToken(formData.get("formToken"));
  if (token === "too-fast" || token === "invalid") {
    return { ok: false, message: "Your submission could not be verified. Please wait a moment and try again." };
  }
  if (token === "expired") {
    return { ok: false, message: "This form has expired. Please refresh the page and try again." };
  }

  if (!(await verifyTurnstile(formData.get("cf-turnstile-response"), ip))) {
    return { ok: false, message: "Please complete the verification challenge and try again." };
  }

  if (!(await rateLimit(opts.bucket, ipHash, opts.limit, opts.windowSeconds))) {
    return { ok: false, message: "Too many submissions from your network. Please try again later or give us a call." };
  }

  return { ok: true, ip, ipHash };
}
