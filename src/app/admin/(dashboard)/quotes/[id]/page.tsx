import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { deleteQuote, updateQuote } from "@/app/actions/admin";
import { AdminSubmit } from "@/components/admin/confirm-button";
import { AdminLoading, NotConfigured } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin, PHOTO_BUCKET } from "@/lib/supabase";
import { formatDate, formatDateTime, QUOTE_STATUSES, telHref } from "@/lib/utils";

export const metadata = { title: "Quote Request" };

export default function QuoteDetailPage({ params }: PageProps<"/admin/quotes/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <QuoteDetail params={params} />
    </Suspense>
  );
}

async function QuoteDetail({ params }: { params: PageProps<"/admin/quotes/[id]">["params"] }) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return <NotConfigured />;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: q } = await supabase.from("quote_requests").select("*").eq("id", id).maybeSingle();
  if (!q) notFound();

  const photoPaths = (q.photos as string[]) ?? [];
  const { data: signed } = photoPaths.length
    ? await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(photoPaths, 60 * 60)
    : { data: [] as { signedUrl: string; path: string | null }[] };

  const rows: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${q.email}`} className="text-lime hover:underline">{q.email}</a>],
    ["Phone", q.phone ? <a key="p" href={telHref(q.phone)} className="text-lime hover:underline">{q.phone}</a> : "—"],
    ["Preferred contact", q.contact_method ?? "—"],
    ["Project address / city", q.location ?? "—"],
    ["Type of project", q.project_type ?? "—"],
    ["Budget", q.budget ?? "—"],
    ["Desired start date", q.start_date ? formatDate(`${q.start_date}T12:00:00`, { dateStyle: "long" }) : "—"],
    ["Received", formatDateTime(q.created_at)],
    ["Email notification", q.email_sent ? "Delivered" : "Not delivered"],
  ];

  return (
    <>
      <Link href="/admin/quotes" className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-lime">
        <ArrowLeft className="size-4" aria-hidden /> All quote requests
      </Link>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase">{q.full_name}</h1>
          <p className="mt-2 flex items-center gap-3 text-sm text-muted">
            {q.project_type ?? "General inquiry"} <StatusBadge status={q.status} />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${q.email}?subject=${encodeURIComponent("Your quote request")}`} className="inline-flex items-center gap-2 bg-lime px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-ink hover:bg-white">
            <Mail className="size-4" aria-hidden /> Email customer
          </a>
          {q.phone && (
            <a href={telHref(q.phone)} className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] hover:border-lime hover:text-lime">
              <Phone className="size-4" aria-hidden /> Call
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <section className="border border-white/10 bg-charcoal">
            <h2 className="border-b border-white/10 px-6 py-4 font-display text-lg font-bold uppercase tracking-wide">Contact & project</h2>
            <dl className="divide-y divide-white/10">
              {rows.map(([label, value]) => (
                <div key={label} className="grid gap-1 px-6 py-3 text-sm sm:grid-cols-[14rem_1fr]">
                  <dt className="text-muted">{label}</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border border-white/10 bg-charcoal p-6">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">Project description</h2>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-white/85">{q.description}</p>
          </section>

          <section className="border border-white/10 bg-charcoal p-6">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">Project photos ({photoPaths.length})</h2>
            {signed && signed.length ? (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {signed.map((s, i) =>
                  s.signedUrl ? (
                    <li key={s.path ?? i}>
                      <a href={s.signedUrl} target="_blank" rel="noopener noreferrer" className="group block aspect-square overflow-hidden border border-white/10 bg-ink">
                        {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                        <img src={s.signedUrl} alt={`Customer project photo ${i + 1}`} className="size-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">No photos were uploaded with this request.</p>
            )}
            {photoPaths.length > 0 && <p className="mt-3 text-xs text-white/40">Click a photo to open the full-size image (links expire after 1 hour).</p>}
          </section>
        </div>

        <aside className="space-y-6">
          <form action={updateQuote} className="space-y-4 border border-white/10 bg-charcoal p-6">
            <input type="hidden" name="id" value={q.id} />
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">Status & notes</h2>
            <div>
              <label htmlFor="quote-status" className="field-label">Status</label>
              <select id="quote-status" name="status" defaultValue={q.status} className="field">
                {QUOTE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="quote-notes" className="field-label">Internal notes</label>
              <textarea id="quote-notes" name="admin_notes" rows={6} defaultValue={q.admin_notes ?? ""} maxLength={5000} className="field resize-y" placeholder="Only visible to admins" />
            </div>
            <AdminSubmit className="w-full">Save changes</AdminSubmit>
          </form>

          <form action={deleteQuote} className="border border-red-500/20 p-6">
            <input type="hidden" name="id" value={q.id} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-300">Danger zone</h2>
            <p className="mt-2 text-xs text-muted">Permanently delete this request and its photos.</p>
            <AdminSubmit variant="danger" className="mt-4 w-full" confirmMessage="Delete this quote request and its photos permanently?">
              Delete request
            </AdminSubmit>
          </form>
        </aside>
      </div>
    </>
  );
}
