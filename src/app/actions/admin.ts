"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminSession, destroyAdminSession, isAdminAuthConfigured, isAllowedAdmin, requireAdmin } from "@/lib/auth";
import { REVIEWS_TAG } from "@/lib/data/reviews";
import { SETTINGS_TAG, mergeSettings } from "@/lib/data/settings";
import { getClientIp, hashIp, rateLimit } from "@/lib/security";
import { getSupabaseAdmin, requireSupabase } from "@/lib/supabase";
import { QUOTE_STATUSES } from "@/lib/utils";
import type { FormState } from "@/lib/validation";

/* ---------------------------------------------------------------- Auth -- */

export async function adminLogin(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: "error", message: "Please enter your email and password.", values: { email } };

  if (!isAdminAuthConfigured()) {
    return { status: "error", message: "Admin login is not configured. Set SESSION_SECRET and ADMIN_EMAILS.", values: { email } };
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return { status: "error", message: "Supabase is not configured.", values: { email } };

  const ipHash = hashIp(await getClientIp());
  if (!(await rateLimit("admin-login", ipHash, 10, 15 * 60))) {
    return { status: "error", message: "Too many login attempts. Please wait 15 minutes and try again." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  // Same message for every failure so we don't reveal which accounts exist.
  if (error || !data.user?.email || !isAllowedAdmin(data.user.email)) {
    return { status: "error", message: "Invalid email or password.", values: { email } };
  }

  await createAdminSession({ userId: data.user.id, email: data.user.email });
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

/* -------------------------------------------------------------- Quotes -- */

const statusSchema = z.enum(QUOTE_STATUSES.map((s) => s.value) as [string, ...string[]]);
const idSchema = z.uuid();

export async function updateQuote(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const status = formData.get("status");
  if (status !== null) update.status = statusSchema.parse(status);
  const notes = formData.get("admin_notes");
  if (typeof notes === "string") update.admin_notes = notes.slice(0, 5000);

  const { error } = await requireSupabase().from("quote_requests").update(update).eq("id", id);
  if (error) throw new Error(`Could not update quote: ${error.message}`);
  refresh();
}

export async function deleteQuote(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const supabase = requireSupabase();
  const { data } = await supabase.from("quote_requests").select("photos").eq("id", id).maybeSingle();
  const photos = (data?.photos as string[] | undefined) ?? [];
  if (photos.length) await supabase.storage.from("quote-photos").remove(photos);
  const { error } = await supabase.from("quote_requests").delete().eq("id", id);
  if (error) throw new Error(`Could not delete quote: ${error.message}`);
  redirect("/admin/quotes");
}

/* ------------------------------------------------------------- Reviews -- */

const reviewStatusSchema = z.enum(["approved", "rejected", "pending"]);

export async function setReviewStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const status = reviewStatusSchema.parse(formData.get("status"));
  const { error } = await requireSupabase()
    .from("reviews")
    .update({ status, approved_at: status === "approved" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(`Could not update review: ${error.message}`);
  updateTag(REVIEWS_TAG);
  refresh();
}

export async function deleteReview(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const { error } = await requireSupabase().from("reviews").delete().eq("id", id);
  if (error) throw new Error(`Could not delete review: ${error.message}`);
  updateTag(REVIEWS_TAG);
  refresh();
}

/* ------------------------------------------------------------ Messages -- */

export async function setMessageRead(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const isRead = formData.get("is_read") === "true";
  const { error } = await requireSupabase().from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) throw new Error(`Could not update message: ${error.message}`);
  refresh();
}

export async function deleteMessage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const { error } = await requireSupabase().from("contact_messages").delete().eq("id", id);
  if (error) throw new Error(`Could not delete message: ${error.message}`);
  refresh();
}

/* ------------------------------------------------------------ Settings -- */

const urlOrEmpty = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "Must start with https://");

const settingsSchema = z.object({
  companyName: z.string().trim().min(2, "Required").max(120),
  shortName: z.string().trim().min(1, "Required").max(40),
  tagline: z.string().trim().max(160),
  phone: z.string().trim().min(7, "Required").max(40),
  email: z.email("Enter a valid email"),
  address: z.string().trim().max(300),
  serviceArea: z.string().trim().max(300),
  yearsInBusiness: z.string().trim().max(20),
  projectsCompleted: z.string().trim().max(20),
  licenseInfo: z.string().trim().max(160),
  aboutIntro: z.string().trim().max(2000),
  aboutStory: z.string().trim().max(3000),
  facebook: urlOrEmpty,
  instagram: urlOrEmpty,
  linkedin: urlOrEmpty,
  youtube: urlOrEmpty,
  hours: z.string().max(2000),
});

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = Object.fromEntries(Object.keys(settingsSchema.shape).map((k) => [k, String(formData.get(k) ?? "")]));
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const errs: Record<string, string> = {};
    for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: errs, values: raw };
  }
  const p = parsed.data;
  // Hours are entered one per line as "Days | Hours".
  const hours = p.hours
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter(([days]) => days)
    .map(([days, hrs]) => ({ days, hours: hrs ?? "" }));

  const data = mergeSettings({
    ...p,
    hours,
    socials: { facebook: p.facebook, instagram: p.instagram, linkedin: p.linkedin, youtube: p.youtube },
  });

  const { error } = await requireSupabase()
    .from("site_settings")
    .upsert({ id: 1, data, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) return { status: "error", message: `Could not save settings: ${error.message}`, values: raw };

  updateTag(SETTINGS_TAG);
  return { status: "success", message: "Website information saved. Changes are live now." };
}
