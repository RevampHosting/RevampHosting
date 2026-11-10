import Link from "next/link";
import { ArrowRight, Award, ClipboardList, HardHat, Ruler, ShieldCheck, Users } from "lucide-react";
import { images } from "@/config/images";
import { projects } from "@/config/projects";
import { services } from "@/config/services";
import { getReviewSummary } from "@/lib/data/reviews";
import { getSiteSettings } from "@/lib/data/settings";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Hero } from "@/components/sections/hero";
import { ProjectGallery } from "@/components/sections/project-gallery";
import { ReviewCard } from "@/components/sections/reviews-display";
import { ServiceCard } from "@/components/sections/service-card";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";
import { Stars } from "@/components/ui/stars";

export default async function HomePage() {
  const [settings, reviews] = await Promise.all([getSiteSettings(), getReviewSummary()]);
  const featuredServices = services.filter((s) => s.featured).slice(0, 6);
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 6);

  const stats = [
    { value: settings.yearsInBusiness, label: "Years of experience" },
    { value: settings.projectsCompleted, label: "Projects completed" },
    reviews.total
      ? { value: `${reviews.average.toFixed(1)}★`, label: "Average customer rating" }
      : { value: "Free", label: "No-obligation estimates" },
    { value: "1 Day", label: "Quote response time" },
  ];

  return (
    <>
      <Hero settings={settings} />

      {/* Stats strip */}
      <section aria-label="Company highlights" className="relative border-y border-white/10 bg-charcoal">
        <div className="container-x grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 80}
              className="border-white/10 px-2 py-10 text-center odd:border-r lg:border-r lg:last:border-r-0"
            >
              <p className="font-display text-5xl font-extrabold text-lime sm:text-6xl">{s.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="What we do"
              title={
                <>
                  Construction & carpentry <span className="text-lime">done right</span>
                </>
              }
              intro="One experienced team for every phase of your project — from the first stud to the final coat of finish."
            />
            <ButtonLink href="/services" variant="outline" className="shrink-0 self-start lg:self-auto">
              All services <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((service, i) => (
              <Reveal as="li" key={service.slug} delay={(i % 3) * 100}>
                <ServiceCard service={service} index={i} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Why choose us */}
      <section className="relative overflow-hidden bg-charcoal py-24 sm:py-32">
        <div className="grid-texture absolute inset-0 opacity-50" aria-hidden />
        <div className="container-x relative grid items-center gap-16 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <SmartImage
                src={images.aboutCrew}
                alt="Carpenter measuring and cutting lumber"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 border-l-4 border-lime bg-ink p-6 shadow-2xl sm:-right-6 sm:p-8">
              <p className="font-display text-5xl font-extrabold text-lime">{settings.yearsInBusiness}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Years building trust</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <SectionHeading
              eyebrow="Why choose us"
              title={
                <>
                  Craftsmanship you can <span className="text-lime">count on</span>
                </>
              }
              intro={settings.aboutIntro}
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {[
                { Icon: Ruler, title: "Precision workmanship", text: "Measured twice, built right — every joint, every line." },
                { Icon: ShieldCheck, title: "Licensed & insured", text: "Full coverage and permits handled for your peace of mind." },
                { Icon: ClipboardList, title: "Clear, honest pricing", text: "Detailed written estimates with no surprise charges." },
                { Icon: Users, title: "Respectful crews", text: "On time, clean job sites, and constant communication." },
              ].map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center border border-lime/40 text-lime">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <ButtonLink href="/about" variant="outline" className="mt-10">
              About our company <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title={
              <>
                A simple, <span className="text-lime">proven</span> process
              </>
            }
          />
          <ol className="mt-16 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
            {[
              { Icon: ClipboardList, title: "Request a quote", text: "Tell us about your project online or by phone." },
              { Icon: Ruler, title: "Site visit & plan", text: "We measure, discuss options, and refine the scope." },
              { Icon: HardHat, title: "Expert build", text: "Our crew builds to spec with regular progress updates." },
              { Icon: Award, title: "Final walkthrough", text: "We review every detail with you until it's perfect." },
            ].map(({ Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 90} className="group relative bg-ink p-8 transition-colors hover:bg-charcoal">
                <span className="font-display text-6xl font-extrabold text-white/[0.07] transition-colors group-hover:text-lime/20">
                  0{i + 1}
                </span>
                <Icon className="mt-4 size-8 text-lime" aria-hidden />
                <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-wide">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured projects */}
      <section className="bg-charcoal py-24 sm:py-32">
        <div className="container-x">
          <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Featured work"
              title={
                <>
                  Recent <span className="text-lime">projects</span>
                </>
              }
              intro="A selection of homes and spaces we've built, remodeled, and finished. Click any project to view it larger."
            />
            <ButtonLink href="/projects" variant="outline" className="shrink-0 self-start lg:self-auto">
              View full portfolio <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <ProjectGallery projects={featuredProjects} showFilters={false} />
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Customer reviews"
              title={
                <>
                  What our clients <span className="text-lime">say</span>
                </>
              }
            />
            {reviews.total > 0 && (
              <div className="flex items-center gap-4 border border-white/10 bg-charcoal px-6 py-4">
                <span className="font-display text-5xl font-extrabold">{reviews.average.toFixed(1)}</span>
                <div>
                  <Stars rating={reviews.average} size={18} />
                  <p className="mt-1 text-sm text-muted">
                    {reviews.total} {reviews.total === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
            )}
          </div>
          {reviews.total > 0 ? (
            <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.reviews.slice(0, 3).map((r, i) => (
                <Reveal as="li" key={r.id} delay={i * 100}>
                  <ReviewCard review={r} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <div className="mt-14 border border-dashed border-white/15 p-10 text-center">
              <p className="font-display text-2xl font-bold uppercase">Worked with us?</p>
              <p className="mx-auto mt-2 max-w-lg text-muted">
                We&apos;d love to hear about your experience. Your review helps other homeowners choose with confidence.
              </p>
            </div>
          )}
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/reviews" variant="outline">
              Read all reviews
            </ButtonLink>
            <Link
              href="/reviews#write-review"
              className="inline-flex items-center gap-2 px-2 py-3.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-lime hover:text-white"
            >
              Leave a review <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner phone={settings.phone} />
    </>
  );
}
