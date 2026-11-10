import { ArrowRight, Phone } from "lucide-react";
import { images } from "@/config/images";
import { telHref } from "@/lib/utils";
import { ButtonLink, buttonClasses } from "../ui/button";
import { Reveal } from "../ui/reveal";
import { SmartImage } from "../ui/smart-image";

export function CtaBanner({ phone, title, text }: { phone: string; title?: string; text?: string }) {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      <SmartImage src={images.ctaBackground} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-ink/85" aria-hidden />
      <div className="absolute inset-y-0 left-0 -z-10 w-2 bg-lime" aria-hidden />
      <Reveal className="container-x flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
        <div className="max-w-3xl">
          <p className="eyebrow">Let&apos;s build something great</p>
          <h2 className="heading-xl mt-5 text-4xl sm:text-5xl lg:text-6xl">
            {title ?? (
              <>
                Ready to start <span className="text-lime">your project?</span>
              </>
            )}
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            {text ??
              "Tell us about your plans and get a free, no-obligation estimate. We respond to every request within one business day."}
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
          <ButtonLink href="/quote" size="lg">
            Request a Free Quote <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
          </ButtonLink>
          <a href={telHref(phone)} className={buttonClasses("outline", "lg")}>
            <Phone className="size-5" aria-hidden /> {phone}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
