import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, FileText, MessageSquare, Star } from "lucide-react";
import { AdminLoading, AdminPageHeader, NotConfigured } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { isEmailConfigured, env } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";

export default function AdminHome() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const session = await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return <NotConfigured />;

  const [newQuotes, pendingReviews, unread, recent] = await Promise.all([
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase
      .from("quote_requests")
      .select("id, created_at, full_name, project_type, status")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const cards = [
    { label: "New quote requests", value: newQuotes.count ?? 0, href: "/admin/quotes?status=new", Icon: FileText },
    { label: "Reviews awaiting approval", value: pendingReviews.count ?? 0, href: "/admin/reviews?status=pending", Icon: Star },
    { label: "Unread messages", value: unread.count ?? 0, href: "/admin/messages", Icon: MessageSquare },
  ];

  return (
    <>
      <AdminPageHeader title="Overview" description={`Signed in as ${session.email}`} />
      {(!isEmailConfigured() || !env.quoteNotificationEmail()) && (
        <div role="alert" className="mb-6 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
          Email delivery is not configured. Set <code>RESEND_API_KEY</code> and <code>QUOTE_NOTIFICATION_EMAIL</code> so quote
          requests are emailed to you.
        </div>
      )}
      <ul className="grid gap-4 md:grid-cols-3">
        {cards.map(({ label, value, href, Icon }) => (
          <li key={label}>
            <Link href={href} className="group block border border-white/10 bg-charcoal p-6 transition-colors hover:border-lime/50">
              <Icon className="size-6 text-lime" aria-hidden />
              <p className="mt-4 font-display text-5xl font-extrabold">{value}</p>
              <p className="mt-1 flex items-center justify-between text-sm text-muted">
                {label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold uppercase">Latest quote requests</h2>
          <Link href="/admin/quotes" className="text-sm font-semibold text-lime hover:underline">
            View all
          </Link>
        </div>
        {recent.data?.length ? (
          <ul className="divide-y divide-white/10 border border-white/10 bg-charcoal">
            {recent.data.map((q) => (
              <li key={q.id}>
                <Link href={`/admin/quotes/${q.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-white/[0.03]">
                  <span>
                    <span className="font-semibold">{q.full_name}</span>
                    <span className="ml-2 text-sm text-muted">{q.project_type ?? "General inquiry"}</span>
                  </span>
                  <span className="flex items-center gap-4 text-sm text-muted">
                    {formatDateTime(q.created_at)} <StatusBadge status={q.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border border-dashed border-white/15 p-8 text-center text-muted">No quote requests yet.</p>
        )}
      </section>
    </>
  );
}
