"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { Project } from "@/config/projects";
import { cn } from "@/lib/utils";
import { SmartImage } from "../ui/smart-image";

export function ProjectGallery({
  projects,
  categories,
  showFilters = true,
}: {
  projects: Project[];
  categories?: string[];
  showFilters?: boolean;
}) {
  const [category, setCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = useMemo(
    () => (category === "All" ? projects : projects.filter((p) => p.category === category)),
    [category, projects],
  );

  return (
    <div>
      {showFilters && categories && (
        <div role="group" aria-label="Filter projects by category" className="mb-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "border px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.14em] transition-all",
                category === c
                  ? "border-lime bg-lime text-ink"
                  : "border-white/15 text-white/80 hover:border-lime hover:text-lime",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project, i) => (
          <li key={project.id} className={cn(i % 5 === 0 && visible.length > 3 && "sm:col-span-2 lg:col-span-1 lg:row-span-2")}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative block h-full min-h-72 w-full overflow-hidden bg-charcoal text-left"
              aria-label={`Open photo: ${project.title}`}
            >
              <SmartImage
                src={project.image}
                alt={project.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
              <span className="absolute right-4 top-4 grid size-10 place-items-center bg-lime text-ink opacity-0 transition-all duration-300 group-hover:opacity-100">
                <Expand className="size-4" aria-hidden />
              </span>
              <span className="absolute inset-x-0 bottom-0 p-6">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime">{project.category}</span>
                <span className="mt-2 block font-display text-2xl font-bold uppercase leading-tight text-white">{project.title}</span>
                <span className="mt-2 line-clamp-2 block max-h-0 text-sm text-white/75 opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:opacity-100">
                  {project.description}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && visible[openIndex] && (
        <Lightbox
          projects={visible}
          index={openIndex}
          onChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}

function Lightbox({
  projects,
  index,
  onChange,
  onClose,
}: {
  projects: Project[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const project = projects[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const prev = useCallback(() => onChange((index - 1 + projects.length) % projects.length), [index, onChange, projects.length]);
  const next = useCallback(() => onChange((index + 1) % projects.length), [index, onChange, projects.length]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Tab" && dialogRef.current) {
        // Keep keyboard focus inside the dialog.
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-sm animate-fade-up [animation-duration:300ms]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
          {index + 1} / {projects.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="grid size-11 place-items-center border border-white/20 text-white transition-colors hover:border-lime hover:text-lime"
          aria-label="Close gallery"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="relative h-full w-full max-w-6xl">
          <SmartImage key={project.id} src={project.image} alt={project.title} fill sizes="100vw" quality={85} className="object-contain" />
        </div>
        {projects.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous project"
              className="absolute left-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-ink/70 text-white transition-colors hover:bg-lime hover:text-ink sm:left-6"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next project"
              className="absolute right-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-ink/70 text-white transition-colors hover:bg-lime hover:text-ink sm:right-6"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      <div className="mx-auto w-full max-w-4xl px-6 py-6 text-center sm:py-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-lime">
          {project.category} · {project.location}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase sm:text-3xl">{project.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">{project.description}</p>
      </div>
    </div>
  );
}
