"use server";

import { getSiteUrl } from "@/config/site";
import { env } from "@/lib/env";
import { renderEmail, sendEmail } from "@/lib/email";
import { createFormToken, looksLikeSpam, runSpamChecks } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";
import { contactSchema, fieldErrors, reviewSchema, textValues, type FormState } from "@/lib/validation";
import { getSiteSettings } from "@/lib/data/settings";

/** Issues the signed timestamp used to reject instant (bot) submissions. */
export async function getFormToken(): Promise<string> {
  return createFormToken();
}

/* -------------------------------------------------------------- Reviews -- */

export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData, ["name", "rating", "body"]);
  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values };
  }

  const spam = await runSpamChecks(formData, { bucket: "review", limit: 3, windowSeconds: 60 * 60 * 24 });
  if (!spam.ok) {
    if (spam.silent) return { status: "success", message: "Thank you! Your review has been submitted for approval." };
    return { status: "error", message: spam.message, values };
  }
  if (looksLikeSpam(parsed.data.body) || looksLikeSpam(parsed.data.name)) {
    return { status: "error", message: "Reviews can't contain links. Please remove them and try again.", values };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("[review] Supabase is not configured");
    return { status: "error", message: "Reviews can't be submitted right now. Please try again later.", values };
  }

  // Always stored as pending — only an admin can approve a review.
  const { error } = await supabase.from("reviews").insert({
    name: parsed.data.name,
    rating: parsed.data.rating,
    body: parsed.data.body,
    status: "pending",
    ip_hash: spam.ipHash,
  });
  if (error) {
    console.error("[review] insert failed:", error.message);
    return { status: "error", message: "Something went wrong saving your review. Please try again.", values };
  }

  // Let the owner know there's a review to moderate (non-blocking).
  const to = env.reviewNotificationEmail();
  if (to) {
    const { html, text } = renderEmail({
      heading: "New review awaiting approval",
      intro: `${parsed.data.name} left a ${parsed.data.rating}-star review. It won't appear on the website until you approve it.`,
      rows: [
        { label: "Name", value: parsed.data.name },
        { label: "Rating", value: `${"★".repeat(parsed.data.rating)}${"☆".repeat(5 - parsed.data.rating)} (${parsed.data.rating}/5)` },
      ],
      longText: { label: "Review", value: parsed.data.body },
      cta: { label: "Moderate reviews", href: `${getSiteUrl()}/admin/reviews` },
      footer: `Sent from ${getSiteUrl()}.`,
    });
    const result = await sendEmail({ to, subject: `New ${parsed.data.rating}-star review from ${parsed.data.name}`, html, text });
    if (!result.ok) console.error("[review] notification email failed:", result.error);
  }

  return {
    status: "success",
    message: "Thank you for your feedback! Your review has been submitted and will appear once it has been approved.",
  };
}

/* -------------------------------------------------------------- Contact -- */

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData, ["name", "email", "phone", "subject", "message"]);
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values };
  }
  const data = parsed.data;
  const settings = await getSiteSettings();
  const fallback = `Please call us at ${settings.phone} or email ${settings.email}.`;

  const spam = await runSpamChecks(formData, { bucket: "contact", limit: 5, windowSeconds: 60 * 60 });
  if (!spam.ok) {
    if (spam.silent) return { status: "success", message: "Thanks! Your message has been sent." };
    return { status: "error", message: spam.message, values };
  }
  if (looksLikeSpam(data.message)) {
    return { status: "error", message: "Please remove links from your message and try again.", values };
  }

  const supabase = getSupabaseAdmin();
  let savedId: string | null = null;
  if (supabase) {
    const { data: row, error } = await supabase
      .from("contact_messages")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        subject: data.subject ?? null,
        message: data.message,
        ip_hash: spam.ipHash,
      })
      .select("id")
      .single();
    if (error) console.error("[contact] insert failed:", error.message);
    else savedId = row.id as string;
  }

  const to = env.contactNotificationEmail();
  if (!to) {
    console.error("[contact] CONTACT_NOTIFICATION_EMAIL / QUOTE_NOTIFICATION_EMAIL is not configured");
    if (savedId) return { status: "success", message: "Thanks! Your message has been received. We'll be in touch soon." };
    return { status: "error", message: `We couldn't send your message right now. ${fallback}`, values };
  }

  const { html, text } = renderEmail({
    heading: `New message${data.subject ? `: ${data.subject}` : ""}`,
    intro: `${data.name} sent a message through your website's contact form.`,
    rows: [
      { label: "Name", value: data.name },
      { label: "Email", value: data.email, href: `mailto:${data.email}` },
      { label: "Phone", value: data.phone },
      { label: "Subject", value: data.subject },
    ],
    longText: { label: "Message", value: data.message },
    cta: savedId ? { label: "View in admin dashboard", href: `${getSiteUrl()}/admin/messages` } : undefined,
    footer: `Reply directly to this email to respond to ${data.name}.`,
  });
  const result = await sendEmail({
    to,
    subject: `Website message from ${data.name}${data.subject ? ` — ${data.subject}` : ""}`,
    html,
    text,
    replyTo: data.email,
  });

  if (!result.ok) {
    console.error("[contact] email failed:", result.error);
    return { status: "error", message: `Sorry — we couldn't send your message. ${fallback}`, values };
  }
  if (supabase && savedId) await supabase.from("contact_messages").update({ email_sent: true }).eq("id", savedId);

  return { status: "success", message: `Thanks, ${data.name.split(" ")[0]}! Your message has been sent. We'll get back to you shortly.` };
}
