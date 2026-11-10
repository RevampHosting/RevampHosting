"use server";

import { randomUUID } from "node:crypto";
import { getSiteUrl } from "@/config/site";
import { env, isEmailConfigured, isSupabaseConfigured } from "@/lib/env";
import { renderEmail, sendEmail } from "@/lib/email";
import { runSpamChecks, looksLikeSpam } from "@/lib/security";
import { getSupabaseAdmin, PHOTO_BUCKET } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import {
  detectImageType,
  fieldErrors,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  quoteSchema,
  textValues,
  type FormState,
} from "@/lib/validation";
import { getSiteSettings } from "@/lib/data/settings";

const FIELDS = ["fullName", "email", "phone", "location", "projectType", "budget", "startDate", "description", "contactMethod"];
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 7;

type Photo = { bytes: Buffer; mime: string; ext: string; name: string };

export async function submitQuote(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = textValues(formData, FIELDS);
  const settings = await getSiteSettings();
  const fallback = `Please call us at ${settings.phone} or email ${settings.email}.`;

  // 1. Validate fields ------------------------------------------------------
  const parsed = quoteSchema.safeParse(Object.fromEntries(FIELDS.map((k) => [k, values[k] ?? ""])));
  const errors = parsed.success ? {} : fieldErrors(parsed.error);

  // 2. Validate photos (type is checked from the file contents) -------------
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const photos: Photo[] = [];
  if (files.length > MAX_PHOTOS) {
    errors.photos = `Please upload no more than ${MAX_PHOTOS} photos.`;
  } else {
    for (const file of files) {
      if (file.size > MAX_PHOTO_BYTES) {
        errors.photos = `"${file.name}" is larger than 10 MB.`;
        break;
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const type = detectImageType(bytes);
      if (!type) {
        errors.photos = `"${file.name}" is not a supported image (JPG, PNG, WEBP, GIF or HEIC).`;
        break;
      }
      photos.push({ bytes, ...type, name: file.name.slice(0, 120) });
    }
  }

  if (!parsed.success || Object.keys(errors).length) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: errors, values };
  }
  const data = parsed.data;

  // 3. Spam protection --------------------------------------------------------
  const spam = await runSpamChecks(formData, { bucket: "quote", limit: 5, windowSeconds: 60 * 60 });
  if (!spam.ok) {
    // Bots that trip the honeypot get a generic success so they don't adapt.
    if (spam.silent) return { status: "success", message: "Thank you! Your quote request has been received." };
    return { status: "error", message: spam.message, values };
  }
  if (looksLikeSpam(data.description)) {
    return { status: "error", message: "Please remove links from your project description and try again.", values };
  }

  const recipient = env.quoteNotificationEmail();
  if (!isEmailConfigured() || !recipient) {
    console.error("[quote] RESEND_API_KEY or QUOTE_NOTIFICATION_EMAIL is not configured");
    return { status: "error", message: `We couldn't send your request right now. ${fallback}`, values };
  }

  // 4. Store photos + request in Supabase (when configured) -----------------
  const id = randomUUID();
  const supabase = getSupabaseAdmin();
  let storedPaths: string[] = [];
  let saved = false;

  if (supabase) {
    try {
      const month = new Date().toISOString().slice(0, 7);
      for (const [i, p] of photos.entries()) {
        const path = `${month}/${id}/${i + 1}-${randomUUID().slice(0, 8)}.${p.ext}`;
        const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, p.bytes, { contentType: p.mime, upsert: false });
        if (error) throw new Error(`Photo upload failed: ${error.message}`);
        storedPaths.push(path);
      }
      const { error } = await supabase.from("quote_requests").insert({
        id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        location: data.location ?? null,
        project_type: data.projectType ?? null,
        budget: data.budget ?? null,
        start_date: data.startDate ?? null,
        description: data.description,
        contact_method: data.contactMethod ?? null,
        photos: storedPaths,
        ip_hash: spam.ipHash,
      });
      if (error) throw new Error(`Database insert failed: ${error.message}`);
      saved = true;
    } catch (err) {
      console.error("[quote] storage error:", err);
      if (storedPaths.length) await supabase.storage.from(PHOTO_BUCKET).remove(storedPaths);
      storedPaths = [];
    }
  } else if (isSupabaseConfigured()) {
    console.error("[quote] Supabase client unavailable");
  }

  // 5. Email the company ----------------------------------------------------
  let photoLinks: { url: string; name: string }[] = [];
  if (supabase && saved && storedPaths.length) {
    const { data: signed } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(storedPaths, SIGNED_URL_SECONDS);
    photoLinks = (signed ?? []).flatMap((s, i) => (s.signedUrl ? [{ url: s.signedUrl, name: photos[i]?.name ?? `Photo ${i + 1}` }] : []));
  }

  const site = getSiteUrl();
  const { html, text } = renderEmail({
    heading: `New quote request — ${data.projectType ?? "Project"}`,
    intro: `${data.fullName} submitted a quote request on your website.${saved ? "" : " (It could not be saved to the database, so this email is the only copy.)"}`,
    rows: [
      { label: "Full name", value: data.fullName },
      { label: "Email", value: data.email, href: `mailto:${data.email}` },
      { label: "Phone", value: data.phone, href: data.phone ? `tel:${data.phone.replace(/[^\d+]/g, "")}` : undefined },
      { label: "Project address / city", value: data.location },
      { label: "Type of project", value: data.projectType },
      { label: "Budget", value: data.budget },
      { label: "Desired start date", value: data.startDate ? formatDate(`${data.startDate}T12:00:00`, { dateStyle: "long" }) : undefined },
      { label: "Preferred contact", value: data.contactMethod },
      { label: "Photos", value: photos.length ? `${photos.length} attached` : "None" },
    ],
    longText: { label: "Project description", value: data.description },
    photos: photoLinks,
    cta: saved ? { label: "Open in admin dashboard", href: `${site}/admin/quotes/${id}` } : undefined,
    footer: `Reply directly to this email to respond to ${data.fullName}. Sent from ${site}.`,
  });

  // Without database storage, attach the photos directly so nothing is lost.
  const attachments =
    !saved && photos.length ? photos.map((p, i) => ({ filename: `photo-${i + 1}.${p.ext}`, content: p.bytes })) : undefined;

  const result = await sendEmail({
    to: recipient,
    subject: `New Quote Request: ${data.fullName}${data.projectType ? ` — ${data.projectType}` : ""}`,
    html,
    text,
    replyTo: data.email,
    attachments,
  });

  if (!result.ok) {
    console.error("[quote] email failed:", result.error);
    if (saved) {
      return {
        status: "error",
        message: `Your request was saved, but we couldn't send our confirmation email. To make sure we see it quickly, ${fallback.charAt(0).toLowerCase()}${fallback.slice(1)}`,
      };
    }
    return { status: "error", message: `Sorry — we couldn't send your request. ${fallback}`, values };
  }

  if (supabase && saved) await supabase.from("quote_requests").update({ email_sent: true }).eq("id", id);

  return {
    status: "success",
    message: `Thank you, ${data.fullName.split(" ")[0]}! Your quote request has been received. A member of our team will reach out within one business day.`,
  };
}
