import type { ReactNode } from "react";
import { SmartImage } from "../ui/smart-image";

/** Banner used at the top of inner pages. */
export function PageHero({ eyebrow, title, intro, image }: { eyebrow: string; title: ReactNode; intro?: string; image: string }) {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-40 sm:pb-24 sm:pt-48">
      <SmartImage src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/55" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink to-transparent" aria-hidden />
      <div className="grid-texture absolute inset-0 -z-10" aria-hidden />
      <div className="container-x">
        <p className="eyebrow animate-fade-up">{eyebrow}</p>
        <h1 className="heading-xl mt-5 max-w-4xl animate-fade-up text-5xl [animation-delay:100ms] sm:text-6xl lg:text-7xl">{title}</h1>
        {intro && (
          <p className="mt-6 max-w-2xl animate-fade-up text-base leading-relaxed text-white/75 [animation-delay:200ms] sm:text-lg">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
