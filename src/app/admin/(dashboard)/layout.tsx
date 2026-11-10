import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { adminLogout } from "@/app/actions/admin";
import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";
import { getAdminSession } from "@/lib/auth";

async function SignedInAs() {
  const session = await getAdminSession();
  if (!session) return null;
  return <p className="truncate text-xs text-white/50" title={session.email}>{session.email}</p>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-white/10 bg-charcoal lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-5">
          <Link href="/admin" className="font-display text-xl font-extrabold uppercase tracking-[0.1em]">
            Admin <span className="text-lime">Panel</span>
          </Link>
          <form action={adminLogout} className="lg:hidden">
            <button type="submit" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-lime">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </form>
        </div>
        <div className="px-3 pb-3 lg:flex-1">
          <Suspense fallback={<AdminNavLinks pathname="" />}>
            <AdminNav />
          </Suspense>
        </div>
        <div className="hidden space-y-3 border-t border-white/10 p-5 lg:block">
          <Suspense fallback={null}>
            <SignedInAs />
          </Suspense>
          <Link href="/" target="_blank" className="flex items-center gap-2 text-sm text-white/70 hover:text-lime">
            <ExternalLink className="size-4" aria-hidden /> View website
          </Link>
          <form action={adminLogout}>
            <button type="submit" className="flex items-center gap-2 text-sm text-white/70 hover:text-lime">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</div>
    </div>
  );
}
