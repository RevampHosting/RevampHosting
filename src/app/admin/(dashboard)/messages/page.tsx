import { Suspense } from "react";
import { deleteMessage, setMessageRead } from "@/app/actions/admin";
import { AdminSubmit } from "@/components/admin/confirm-button";
import { AdminLoading, AdminPageHeader, NotConfigured } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { cn, formatDateTime, telHref } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <MessagesList />
    </Suspense>
  );
}

async function MessagesList() {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return <NotConfigured />;
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);

  return (
    <>
      <AdminPageHeader title="Messages" description="Messages sent through the website contact form." />
      {error && <p className="text-red-400">Could not load messages: {error.message}</p>}
      {data && data.length === 0 && <p className="border border-dashed border-white/15 p-10 text-center text-muted">No messages yet.</p>}
      <ul className="space-y-4">
        {data?.map((m) => (
          <li key={m.id} className={cn("border bg-charcoal p-6", m.is_read ? "border-white/10" : "border-lime/50")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {!m.is_read && <span className="mr-2 inline-block size-2 rounded-full bg-lime align-middle" aria-label="Unread" />}
                  {m.name}
                  {m.subject && <span className="font-normal text-muted"> — {m.subject}</span>}
                </p>
                <p className="mt-1 text-sm">
                  <a href={`mailto:${m.email}`} className="text-lime hover:underline">{m.email}</a>
                  {m.phone && (
                    <>
                      {" · "}
                      <a href={telHref(m.phone)} className="text-lime hover:underline">{m.phone}</a>
                    </>
                  )}
                </p>
              </div>
              <span className="text-xs text-muted">{formatDateTime(m.created_at)}</span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/85">{m.message}</p>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              <form action={setMessageRead}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="is_read" value={m.is_read ? "false" : "true"} />
                <AdminSubmit variant="ghost">{m.is_read ? "Mark unread" : "Mark as read"}</AdminSubmit>
              </form>
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={m.id} />
                <AdminSubmit variant="danger" confirmMessage="Delete this message permanently?">Delete</AdminSubmit>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
