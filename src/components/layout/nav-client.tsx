"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, Phone, X } from "lucide-react";
import { cn, telHref } from "@/lib/utils";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

/** Sticky header that turns solid once the page is scrolled. */
export function NavShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/10 bg-ink/92 shadow-2xl shadow-black/40 backdrop-blur-md" : "bg-gradient-to-b from-black/70 to-transparent",
      )}
    >
      {children}
    </header>
  );
}

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative px-3.5 py-2 font-display text-[0.92rem] font-semibold uppercase tracking-[0.12em] transition-colors",
        "after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-lime after:transition-transform after:duration-300",
        active ? "text-lime after:scale-x-100" : "text-white/85 after:scale-x-0 hover:text-white hover:after:scale-x-100",
      )}
    >
      {children}
    </Link>
  );
}

export function MobileMenu({ links, phone }: { links: { href: string; label: string }[]; phone: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll while open; close with Escape. (Links close the menu on click.)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative z-[60] grid size-11 place-items-center border border-white/15 text-white transition-colors hover:border-lime hover:text-lime"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-ink/98 px-6 pt-28 pb-10 backdrop-blur-lg transition-all duration-300",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Mobile navigation" className="flex-1">
          <ul className="space-y-1">
            {links.map((link, i) => (
              <li
                key={link.href}
                className={cn("transition-all duration-500", open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0")}
                style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "block border-b border-white/10 py-4 font-display text-3xl font-bold uppercase tracking-wide",
                    isActive(pathname, link.href) ? "text-lime" : "text-white",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-4">
          <Link
            href="/quote"
            onClick={() => setOpen(false)}
            className="block bg-lime py-4 text-center font-display text-lg font-bold uppercase tracking-[0.14em] text-ink"
          >
            Request a Free Quote
          </Link>
          <a href={telHref(phone)} className="flex items-center justify-center gap-2 py-2 text-white/80">
            <Phone className="size-4 text-lime" aria-hidden /> {phone}
          </a>
        </div>
      </div>
    </div>
  );
}
