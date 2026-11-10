import Link from "next/link";
import { Suspense } from "react";
import { deleteReview, setReviewStatus } from "@/app/actions/admin";
import { AdminSubmit } from "@/components/admin/confirm-button";
import { AdminLoading, AdminPageHeader, NotConfigured } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Stars } from "@/components/ui/stars";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Reviews" };

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export default function ReviewsAdminPage({ searchParams }: PageProps<"/admin/reviews">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ReviewsList searchParams={searchParams} />
    </Suspense>
  );
}

async function ReviewsList({ searchParams }: { searchParams: PageProps<"/admin/reviews">["searchParams"] }) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return <NotConfigured />;
  const params = await searchParams;
  const status = TABS.find((t) => t.value === params.status)?.value ?? "pending";

  const [{ data, error }, ...counts] = await Promise.all([
    supabase.from("reviews").select("id, created_at, name, rating, body, status").eq("status", status).order("created_at", { ascending: false }).limit(200),
    ...TABS.map((t) => supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", t.value)),
  ]);

  return (
    <>
      <AdminPageHeader title="Reviews" description="New reviews stay hidden until you approve them. Ratings shown on the website are calculated from approved reviews only." />
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {TABS.map((t, i) => (
          <Link
            key={t.value}
            href={`/admin/reviews?status=${t.value}`}
            aria-current={status === t.value ? "page" : undefined}
            className={cn(
              "border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em]",
              status === t.value ? "border-lime bg-lime text-ink" : "border-white/15 text-white/75 hover:border-lime hover:text-lime",
            )}
          >
            {t.label} ({counts[i].count ?? 0})
          </Link>
        ))}
      </div>

      {error && <p className="text-red-400">Could not load reviews: {error.message}</p>}
      {data && data.length === 0 && <p className="border border-dashed border-white/15 p-10 text-center text-muted">No {status} reviews.</p>}
      <ul className="space-y-4">
        {data?.map((r) => (
          <li key={r.id} className="border border-white/10 bg-charcoal p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{r.name}</p>
                <div className="mt-1 flex items-center gap-3">
                  <Stars rating={r.rating} size={15} />
                  <span className="text-xs text-muted">{formatDateTime(r.created_at)}</span>
                </div>
              </div>
              <StatusBadge status={r.status} label={r.status} />
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/85">{r.body}</p>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              {r.status !== "approved" && (
                <form action={setReviewStatus}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="approved" />
                  <AdminSubmit>Approve</AdminSubmit>
                </form>
              )}
              {r.status !== "rejected" && (
                <form action={setReviewStatus}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <AdminSubmit variant="ghost">{r.status === "approved" ? "Unpublish" : "Reject"}</AdminSubmit>
                </form>
              )}
              <form action={deleteReview}>
                <input type="hidden" name="id" value={r.id} />
                <AdminSubmit variant="danger" confirmMessage={`Delete the review from ${r.name} permanently?`}>
                  Delete
                </AdminSubmit>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
