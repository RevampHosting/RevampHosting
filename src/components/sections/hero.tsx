import { ArrowRight, ShieldCheck } from "lucide-react";
import { images } from "@/config/images";
import type { SiteSettings } from "@/config/site";
import { ButtonLink } from "../ui/button";
import { SmartImage } from "../ui/smart-image";

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-16 pt-32 sm:items-center sm:pb-24">
      <SmartImage
        src={images.hero}
        alt="Construction crew at work on a job site"
        fill
        priority
        sizes="100vw"
        quality={80}
        className="-z-20 object-cover object-center"
      />
      {/* Layered overlays keep text readable over any photo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-transparent to-ink/50" aria-hidden />
      <div className="grid-texture absolute inset-0 -z-10 opacity-60" aria-hidden />

      <div className="container-x">
        <div className="max-w-4xl">
          <p className="eyebrow animate-fade-up">{settings.companyName}</p>
          <h1 className="heading-xl mt-6 animate-fade-up text-[3.2rem] [animation-delay:120ms] sm:text-7xl lg:text-[6.5rem]">
            Built with <span className="text-lime">precision.</span>
            <br />
            Built to last.
          </h1>
          <p className="mt-7 max-w-2xl animate-fade-up text-base leading-relaxed text-white/80 [animation-delay:240ms] sm:text-xl">
            From structural framing and full remodels to custom carpentry and fine woodworking, we deliver craftsmanship
            you can see, schedules you can count on, and results built to stand the test of time.
          </p>
          <div className="mt-10 flex animate-fade-up flex-col gap-4 [animation-delay:360ms] sm:flex-row">
            <ButtonLink href="/quote" size="lg">
              Request a Free Quote
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/projects" size="lg" variant="outline">
              View Our Work
            </ButtonLink>
          </div>
          <p className="mt-10 flex animate-fade-up items-center gap-2 text-sm text-white/70 [animation-delay:480ms]">
            <ShieldCheck className="size-5 text-lime" aria-hidden /> {settings.licenseInfo}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 hidden h-1.5 w-1/3 stripe-accent lg:block" aria-hidden />
    </section>
  );
}
