import Link from "next/link";

/** Text-based logo. Swap the SVG mark for your own logo file if you have one. */
export function Logo({ name, short }: { name: string; short: string }) {
  const rest = name.startsWith(short) ? name.slice(short.length).trim() : name;
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={`${name} — home`}>
      <span className="relative grid size-10 shrink-0 place-items-center bg-lime text-ink transition-transform duration-300 group-hover:rotate-[-6deg]">
        <svg viewBox="0 0 32 32" className="size-6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinejoin="miter" aria-hidden>
          <path d="M4 27V13L16 4l12 9v14" />
          <path d="M11 27V17h10v10" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-extrabold uppercase tracking-[0.08em] text-white">{short}</span>
        {rest && (
          <span className="mt-1 hidden text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted sm:block">
            {rest.replace(/^[-–—]\s*/, "")}
          </span>
        )}
      </span>
    </Link>
  );
}
