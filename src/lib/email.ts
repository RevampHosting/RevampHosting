import "server-only";
import { Resend } from "resend";
import { env } from "./env";

export type EmailResult = { ok: true; id?: string } | { ok: false; error: string };

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<EmailResult> {
  const apiKey = env.resendApiKey();
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set" };
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: env.emailFrom(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
      attachments: opts.attachments,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/* --------------------------------------------------------------- HTML -- */

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type Row = { label: string; value?: string | null; href?: string };

/** Builds a clean, email-client-safe HTML layout (tables + inline styles). */
export function renderEmail(opts: {
  heading: string;
  intro: string;
  rows: Row[];
  longText?: { label: string; value: string };
  photos?: { url: string; name: string }[];
  cta?: { label: string; href: string };
  footer: string;
}): { html: string; text: string } {
  const rowsHtml = opts.rows
    .map((r) => {
      const v = r.value?.trim() ? escapeHtml(r.value) : '<span style="color:#888">Not provided</span>';
      const cell = r.href && r.value ? `<a href="${escapeHtml(r.href)}" style="color:#4d7c0f;text-decoration:none">${v}</a>` : v;
      return `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;color:#666;font-size:13px;width:38%;vertical-align:top">${escapeHtml(r.label)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;color:#111;font-size:14px;vertical-align:top">${cell}</td>
      </tr>`;
    })
    .join("");

  const longHtml = opts.longText
    ? `<h3 style="margin:28px 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#666">${escapeHtml(opts.longText.label)}</h3>
       <div style="background:#f6f6f6;border-left:4px solid #A4FF00;padding:14px 16px;font-size:14px;line-height:1.6;color:#111;white-space:pre-wrap">${escapeHtml(opts.longText.value)}</div>`
    : "";

  const photosHtml = opts.photos?.length
    ? `<h3 style="margin:28px 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#666">Project photos (${opts.photos.length})</h3>
       <p style="margin:0 0 10px;font-size:12px;color:#888">Secure links expire in 7 days. Photos are always available in the admin dashboard.</p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%"><tr>${opts.photos
         .map(
           (p, i) =>
             `<td style="padding:4px;width:33%;vertical-align:top"><a href="${escapeHtml(p.url)}"><img src="${escapeHtml(p.url)}" alt="Project photo ${i + 1}" width="180" style="display:block;width:100%;max-width:180px;height:auto;border-radius:4px;border:1px solid #ddd" /></a><div style="font-size:11px;color:#888;padding-top:4px;word-break:break-all">${escapeHtml(p.name)}</div></td>${(i + 1) % 3 === 0 ? "</tr><tr>" : ""}`,
         )
         .join("")}</tr></table>`
    : "";

  const ctaHtml = opts.cta
    ? `<p style="margin:28px 0 0"><a href="${escapeHtml(opts.cta.href)}" style="display:inline-block;background:#A4FF00;color:#080808;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:4px;font-size:14px;letter-spacing:.5px">${escapeHtml(opts.cta.label)}</a></p>`
    : "";

  const html = `<!doctype html><html><body style="margin:0;background:#f1f1f1;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1f1;padding:24px 0"><tr><td align="center">
    <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:6px;overflow:hidden">
      <tr><td style="background:#080808;padding:22px 28px;border-bottom:4px solid #A4FF00">
        <div style="color:#A4FF00;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700">Website notification</div>
        <div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:6px">${escapeHtml(opts.heading)}</div>
      </td></tr>
      <tr><td style="padding:24px 28px">
        <p style="margin:0 0 18px;color:#333;font-size:14px;line-height:1.6">${escapeHtml(opts.intro)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;border-collapse:separate">${rowsHtml}</table>
        ${longHtml}${photosHtml}${ctaHtml}
      </td></tr>
      <tr><td style="padding:16px 28px;background:#fafafa;color:#999;font-size:11px">${escapeHtml(opts.footer)}</td></tr>
    </table>
  </td></tr></table></body></html>`;

  const text = [
    opts.heading,
    "",
    opts.intro,
    "",
    ...opts.rows.map((r) => `${r.label}: ${r.value?.trim() || "Not provided"}`),
    ...(opts.longText ? ["", `${opts.longText.label}:`, opts.longText.value] : []),
    ...(opts.photos?.length ? ["", "Project photos (links expire in 7 days):", ...opts.photos.map((p) => p.url)] : []),
    ...(opts.cta ? ["", `${opts.cta.label}: ${opts.cta.href}`] : []),
    "",
    opts.footer,
  ].join("\n");

  return { html, text };
}
