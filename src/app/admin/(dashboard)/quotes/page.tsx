import Link from "next/link";
import { Suspense } from "react";
import { ImageIcon } from "lucide-react";
import { AdminLoading, AdminPageHeader, NotConfigured } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { cn, formatDateTime, QUOTE_STATUSES } from "@/lib/utils";

export const metadata = { title: "Quote Requests" };

export default function QuotesPage({ searchParams }: PageProps<"/admin/quotes">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <QuotesList searchParams={searchParams} />
    </Suspense>
  );
}

async function QuotesList({ searchParams }: { searchParams: PageProps<"/admin/quotes">["searchParams"] }) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return <NotConfigured />;

  const params = await searchParams;
  const status = typeof params.status === "string" && QUOTE_STATUSES.some((s) => s.value === params.status) ? params.status : "all";

  let query = supabase
    .from("quote_requests")
    .select("id, created_at, full_name, email, phone, location, project_type, budget, status, photos, email_sent")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;

  const tabs = [{ value: "all", label: "All" }, ...QUOTE_STATUSES];

  return (
    <>
      <AdminPageHeader title="Quote Requests" description="Every request submitted through the website quote form." />
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/admin/quotes" : `/admin/quotes?status=${t.value}`}
            aria-current={status === t.value ? "page" : undefined}
            className={cn(
              "border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em]",
              status === t.value ? "border-lime bg-lime text-ink" : "border-white/15 text-white/75 hover:border-lime hover:text-lime",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {error && <p className="text-red-400">Could not load quotes: {error.message}</p>}
      {data && data.length === 0 && <p className="border border-dashed border-white/15 p-10 text-center text-muted">No quote requests found.</p>}
      {data && data.length > 0 && (
        <div className="overflow-x-auto border border-white/10 bg-charcoal">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-5 py-3 font-semibold">Project</th>
                <th scope="col" className="px-5 py-3 font-semibold">Budget</th>
                <th scope="col" className="px-5 py-3 font-semibold">Received</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.map((q) => (
                <tr key={q.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <Link href={`/admin/quotes/${q.id}`} className="font-semibold text-white hover:text-lime">
                      {q.full_name}
                    </Link>
                    <p className="text-xs text-muted">{q.email}{q.phone ? ` · ${q.phone}` : ""}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p>{q.project_type ?? "—"}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted">
                      {q.location ?? ""}
                      {q.photos?.length ? (
                        <span className="inline-flex items-center gap-1 text-lime">
                          <ImageIcon className="size-3.5" aria-hidden /> {q.photos.length}
                        </span>
                      ) : null}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-muted">{q.budget ?? "—"}</td>
                  <td className="px-5 py-4 text-muted">
                    {formatDateTime(q.created_at)}
                    {!q.email_sent && <p className="text-xs text-amber-300">Email not delivered</p>}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={q.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
