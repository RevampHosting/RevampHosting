import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { Service } from "@/config/services";
import { SmartImage } from "../ui/smart-image";

export function ServiceCard({ service, index, detailed = false }: { service: Service; index: number; detailed?: boolean }) {
  return (
    <article
      id={detailed ? service.slug : undefined}
      className="group relative flex h-full scroll-mt-28 flex-col overflow-hidden border border-white/10 bg-charcoal transition-all duration-500 hover:-translate-y-1.5 hover:border-lime/60 hover:shadow-[0_24px_60px_-20px_rgba(164,255,0,0.25)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={service.image}
          alt={`${service.title} project`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" aria-hidden />
        <span className="absolute left-5 top-5 font-display text-sm font-bold tracking-[0.2em] text-lime">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="relative flex flex-1 flex-col p-7">
        <span className="absolute left-0 top-0 h-0.5 w-0 bg-lime transition-all duration-500 group-hover:w-full" aria-hidden />
        <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">{service.title}</h3>
        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted">{detailed ? service.description : service.short}</p>
        {detailed && (
          <ul className="mt-5 space-y-2">
            {service.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-sm text-white/85">
                <Check className="size-4 shrink-0 text-lime" aria-hidden /> {h}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={detailed ? `/quote?type=${encodeURIComponent(service.title)}` : `/services#${service.slug}`}
          className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.16em] text-lime transition-colors hover:text-white"
        >
          {detailed ? "Get a quote" : "Learn more"}
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          <span className="sr-only"> for {service.title}</span>
        </Link>
      </div>
    </article>
  );
}
