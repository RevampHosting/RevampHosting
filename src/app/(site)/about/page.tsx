import type { Metadata } from "next";
import { Award, CheckCircle2, Eye, Handshake, HardHat, Ruler } from "lucide-react";
import { images } from "@/config/images";
import { getSiteSettings } from "@/lib/data/settings";
import { CtaBanner } from "@/components/sections/cta-banner";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our team, our commitment to quality craftsmanship, and how we work.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    Icon: Award,
    title: "Quality craftsmanship",
    text: "We use proven methods and quality materials, and we never cut corners — even where no one will see them.",
  },
  {
    Icon: HardHat,
    title: "Experience & professionalism",
    text: "Seasoned carpenters and builders who show up on time, communicate clearly, and respect your home.",
  },
  {
    Icon: Eye,
    title: "Attention to detail",
    text: "Tight joints, clean lines, square corners. The small details are what separate good work from great work.",
  },
  {
    Icon: Handshake,
    title: "Customer satisfaction",
    text: "We aren't finished until you're happy. Every project ends with a detailed walkthrough together.",
  },
  {
    Icon: Ruler,
    title: "Construction & carpentry expertise",
    text: "From structural framing to fine finish carpentry and custom woodworking — under one roof.",
  },
];

export default async function AboutPage() {
  const s = await getSiteSettings();
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            Builders by trade. <span className="text-lime">Craftsmen by choice.</span>
          </>
        }
        intro={s.tagline}
        image={images.aboutBlueprint}
      />

      <section className="py-20 sm:py-28">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="Who we are" title={s.companyName} />
            <p className="mt-6 text-lg leading-relaxed text-white/85">{s.aboutIntro}</p>
            <p className="mt-5 leading-relaxed text-muted">{s.aboutStory}</p>
            <ul className="mt-8 space-y-3">
              {[s.licenseInfo, "Free, detailed written estimates", "Clean, safe and organized job sites", "Workmanship you can count on"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="size-5 shrink-0 text-lime" aria-hidden /> {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="grid grid-cols-2 gap-4">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden">
              <SmartImage src={images.aboutCrew} alt="Our team at work" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center bg-lime p-6 text-ink">
              <p className="font-display text-5xl font-extrabold">{s.yearsInBusiness}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em]">Years in business</p>
            </div>
            <div className="flex flex-col justify-center border border-white/10 bg-charcoal p-6">
              <p className="font-display text-5xl font-extrabold text-lime">{s.projectsCompleted}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/80">Projects completed</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-charcoal py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading
            align="center"
            eyebrow="Our commitment"
            title={
              <>
                What we <span className="text-lime">stand for</span>
              </>
            }
          />
          <ul className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map(({ Icon, title, text }, i) => (
              <Reveal
                as="li"
                key={title}
                delay={(i % 3) * 90}
                className="group border border-white/10 bg-ink p-8 transition-all hover:-translate-y-1 hover:border-lime/50"
              >
                <span className="grid size-14 place-items-center bg-lime/10 text-lime transition-colors group-hover:bg-lime group-hover:text-ink">
                  <Icon className="size-7" aria-hidden />
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-wide">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{text}</p>
              </Reveal>
            ))}
            <Reveal as="li" delay={180} className="relative min-h-64 overflow-hidden">
              <SmartImage src={images.customCarpentry} alt="Finish carpentry detail" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </Reveal>
          </ul>
        </div>
      </section>

      <CtaBanner phone={s.phone} />
    </>
  );
}
