"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, MessageSquare, Settings, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/quotes", label: "Quote Requests", Icon: FileText },
  { href: "/admin/reviews", label: "Reviews", Icon: Star },
  { href: "/admin/messages", label: "Messages", Icon: MessageSquare },
  { href: "/admin/settings", label: "Website Settings", Icon: Settings },
];

export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}

/** Hook-free version, also used as the Suspense fallback while the URL is resolved. */
export function AdminNavLinks({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin navigation">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors",
                  active ? "bg-lime text-ink" : "text-white/75 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
