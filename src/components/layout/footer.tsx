import Link from "next/link";
import { cacheLife } from "next/cache";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { navLinks } from "@/config/site";
import { services } from "@/config/services";
import { getSiteSettings } from "@/lib/data/settings";
import { telHref } from "@/lib/utils";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export async function Footer() {
  const s = await getSiteSettings();
  return (
    <footer className="relative border-t border-white/10 bg-charcoal">
      <div className="stripe-accent h-1.5 opacity-80" aria-hidden />
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo name={s.companyName} short={s.shortName} />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">{s.aboutIntro.split(". ")[0]}.</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-lime">{s.licenseInfo}</p>
          <SocialLinks socials={s.socials} className="mt-6" />
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Company</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted transition-colors hover:text-lime">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/quote" className="text-muted transition-colors hover:text-lime">
                Request a Quote
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Services</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {services.map((svc) => (
              <li key={svc.slug}>
                <Link href={`/services#${svc.slug}`} className="text-muted transition-colors hover:text-lime">
                  {svc.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Get in touch</h2>
          <ul className="mt-5 space-y-4 text-sm text-muted">
            <li>
              <a href={telHref(s.phone)} className="flex gap-3 transition-colors hover:text-lime">
                <Phone className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden /> {s.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${s.email}`} className="flex gap-3 break-all transition-colors hover:text-lime">
                <Mail className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden /> {s.email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden />
              <span>{s.address || s.serviceArea}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden />
              <span>
                {s.hours.map((h) => (
                  <span key={h.days} className="block">
                    <span className="text-white/80">{h.days}:</span> {h.hours}
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {s.companyName}. All rights reserved.
          </p>
          <p>{s.serviceArea}</p>
        </div>
      </div>
    </footer>
  );
}
