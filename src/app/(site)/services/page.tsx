import type { Metadata } from "next";
import { images } from "@/config/images";
import { services } from "@/config/services";
import { getSiteSettings } from "@/lib/data/settings";
import { CtaBanner } from "@/components/sections/cta-banner";
import { PageHero } from "@/components/sections/page-hero";
import { ServiceCard } from "@/components/sections/service-card";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Services",
  description:
    "General construction, residential remodeling, custom carpentry, framing, decks, flooring, interior and exterior renovations, and custom woodworking.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title={
          <>
            Every phase. <span className="text-lime">One team.</span>
          </>
        }
        intro="Whether it's a new build, a full remodel, or a single piece of custom millwork, we bring the same precision and accountability to every job."
        image={images.framing}
      />
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal as="li" key={service.slug} delay={(i % 3) * 90}>
                <ServiceCard service={service} index={i} detailed />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <CtaBanner phone={settings.phone} title="Don't see your project listed?" text="We take on a wide range of construction and carpentry work. Tell us what you have in mind and we'll let you know how we can help." />
    </>
  );
}
