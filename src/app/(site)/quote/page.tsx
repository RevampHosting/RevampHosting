import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2, Clock, Mail, Phone } from "lucide-react";
import { images } from "@/config/images";
import { getSiteSettings } from "@/lib/data/settings";
import { QuoteForm } from "@/components/forms/quote-form";
import { PageHero } from "@/components/sections/page-hero";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Request a Free Quote",
  description: "Tell us about your construction or carpentry project and receive a free, no-obligation estimate.",
  alternates: { canonical: "/quote" },
};

export default async function QuotePage() {
  const s = await getSiteSettings();
  return (
    <>
      <PageHero
        eyebrow="Free estimate"
        title={
          <>
            Request a <span className="text-lime">free quote</span>
          </>
        }
        intro="Share a few details about your project. We'll review everything and get back to you within one business day."
        image={images.residentialRemodeling}
      />

      <section className="py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_22rem]">
          <div className="border border-white/10 bg-charcoal p-6 sm:p-10">
            <Suspense fallback={<div className="h-[900px] animate-pulse bg-white/[0.03]" aria-label="Loading form" />}>
              <QuoteForm />
            </Suspense>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-white/10 bg-charcoal p-7">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide">What happens next?</h2>
              <ol className="mt-5 space-y-5">
                {[
                  "We review your project details and photos.",
                  "We contact you to ask questions or schedule a site visit.",
                  "You receive a clear, detailed written estimate.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-4 text-sm leading-relaxed text-white/80">
                    <span className="grid size-8 shrink-0 place-items-center bg-lime font-display font-bold text-ink">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="border border-white/10 bg-charcoal p-7">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide">Prefer to talk?</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  <a href={telHref(s.phone)} className="flex items-center gap-3 text-white/85 hover:text-lime">
                    <Phone className="size-5 text-lime" aria-hidden /> {s.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${s.email}`} className="flex items-center gap-3 break-all text-white/85 hover:text-lime">
                    <Mail className="size-5 shrink-0 text-lime" aria-hidden /> {s.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/70">
                  <Clock className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden />
                  <span>{s.hours[0] ? `${s.hours[0].days}: ${s.hours[0].hours}` : ""}</span>
                </li>
              </ul>
            </div>
            <ul className="space-y-3 px-1 text-sm text-white/80">
              {["100% free, no obligation", s.licenseInfo, "Your details are never shared"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 shrink-0 text-lime" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
