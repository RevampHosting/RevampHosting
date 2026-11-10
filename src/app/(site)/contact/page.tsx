import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { images } from "@/config/images";
import { getSiteSettings } from "@/lib/data/settings";
import { ContactForm } from "@/components/forms/contact-form";
import { SocialLinks, hasSocials } from "@/components/layout/social-links";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with our construction and carpentry team — phone, email, service area and business hours.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getSiteSettings();
  const cards = [
    { Icon: Phone, label: "Call us", value: s.phone, href: telHref(s.phone) },
    { Icon: Mail, label: "Email us", value: s.email, href: `mailto:${s.email}` },
    { Icon: MapPin, label: s.address ? "Visit us" : "Service area", value: s.address || s.serviceArea },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s talk about <span className="text-lime">your project</span>
          </>
        }
        intro="Questions, scheduling, or a project you'd like to discuss — we're here to help."
        image={images.tools}
      />

      <section className="py-20 sm:py-28">
        <div className="container-x">
          <ul className="grid gap-4 md:grid-cols-3">
            {cards.map(({ Icon, label, value, href }) => (
              <li key={label} className="group border border-white/10 bg-charcoal p-7 transition-colors hover:border-lime/50">
                <Icon className="size-7 text-lime" aria-hidden />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-muted">{label}</p>
                {href ? (
                  <a href={href} className="mt-2 block break-words font-display text-2xl font-bold transition-colors hover:text-lime">
                    {value}
                  </a>
                ) : (
                  <p className="mt-2 font-display text-2xl font-bold">{value}</p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_24rem]">
            <div className="border border-white/10 bg-charcoal p-6 sm:p-10">
              <h2 className="font-display text-3xl font-bold uppercase">Send us a message</h2>
              <p className="mt-2 mb-8 text-muted">
                Looking for pricing? The{" "}
                <Link href="/quote" className="font-semibold text-lime underline-offset-4 hover:underline">
                  quote request form
                </Link>{" "}
                lets you share project details and photos.
              </p>
              <ContactForm />
            </div>

            <aside className="space-y-6">
              <div className="border border-white/10 bg-charcoal p-7">
                <h2 className="flex items-center gap-3 font-display text-xl font-bold uppercase tracking-wide">
                  <Clock className="size-5 text-lime" aria-hidden /> Business hours
                </h2>
                <dl className="mt-5 divide-y divide-white/10">
                  {s.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4 py-3 text-sm">
                      <dt className="text-white/80">{h.days}</dt>
                      <dd className="text-right text-muted">{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="border border-white/10 bg-charcoal p-7">
                <h2 className="flex items-center gap-3 font-display text-xl font-bold uppercase tracking-wide">
                  <MapPin className="size-5 text-lime" aria-hidden /> Service area
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted">{s.serviceArea}</p>
              </div>
              {hasSocials(s.socials) && (
                <div className="border border-white/10 bg-charcoal p-7">
                  <h2 className="font-display text-xl font-bold uppercase tracking-wide">Follow our work</h2>
                  <SocialLinks socials={s.socials} className="mt-4" />
                </div>
              )}
              <div className="bg-lime p-7 text-ink">
                <h2 className="font-display text-2xl font-extrabold uppercase">Need a price?</h2>
                <p className="mt-2 text-sm">Get a free, no-obligation estimate for your project.</p>
                <ButtonLink href="/quote" variant="dark" className="mt-5 w-full">
                  Request a Free Quote
                </ButtonLink>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {s.address && (
        <section aria-label="Map" className="h-[420px] border-t border-white/10 bg-charcoal">
          <iframe
            title={`Map showing ${s.address}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
            className="size-full grayscale invert-[0.92] hue-rotate-180"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      )}
    </>
  );
}
