import { Phone } from "lucide-react";
import { navLinks } from "@/config/site";
import { getSiteSettings } from "@/lib/data/settings";
import { telHref } from "@/lib/utils";
import { ButtonLink } from "../ui/button";
import { Logo } from "./logo";
import { NavShell, NavLink, MobileMenu } from "./nav-client";

export async function Header() {
  const settings = await getSiteSettings();
  return (
    <NavShell>
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Logo name={settings.companyName} short={settings.shortName} />

        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={telHref(settings.phone)}
            className="hidden items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-lime xl:flex"
          >
            <Phone className="size-4 text-lime" aria-hidden />
            {settings.phone}
          </a>
          <ButtonLink href="/quote" size="sm">
            Request a Quote
          </ButtonLink>
        </div>

        <MobileMenu phone={settings.phone} links={navLinks.map((l) => ({ href: l.href, label: l.label }))} />
      </div>
    </NavShell>
  );
}
