import { Quote } from "lucide-react";
import type { PublicReview, ReviewSummary } from "@/lib/data/reviews";
import { formatDate, initials } from "@/lib/utils";
import { Stars } from "../ui/stars";

export function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <article className="relative flex h-full flex-col border border-white/10 bg-charcoal p-7 transition-colors hover:border-lime/40">
      <Quote className="absolute right-6 top-6 size-10 text-lime/15" aria-hidden />
      <Stars rating={review.rating} />
      <p className="mt-5 flex-1 whitespace-pre-line text-[0.97rem] leading-relaxed text-white/85">{review.body}</p>
      <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
        <span className="grid size-10 place-items-center bg-lime font-display font-bold text-ink" aria-hidden>
          {initials(review.name)}
        </span>
        <div>
          <p className="font-semibold text-white">{review.name}</p>
          <p className="text-xs text-muted">
            <time dateTime={review.createdAt}>{formatDate(review.createdAt, { dateStyle: "long" })}</time>
          </p>
        </div>
      </footer>
    </article>
  );
}

export function ReviewStats({ summary }: { summary: ReviewSummary }) {
  return (
    <div className="border border-white/10 bg-charcoal p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Overall rating</p>
      <div className="mt-4 flex items-end gap-3">
        <span className="font-display text-7xl font-extrabold leading-none text-white">
          {summary.total ? summary.average.toFixed(1) : "—"}
        </span>
        <span className="mb-2 text-sm text-muted">/ 5</span>
      </div>
      <Stars rating={summary.average} size={22} className="mt-4" />
      <p className="mt-3 text-sm text-muted">
        Based on <strong className="text-white">{summary.total}</strong> verified {summary.total === 1 ? "review" : "reviews"}
      </p>
      <ul className="mt-6 space-y-2" aria-label="Rating breakdown">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = summary.distribution[star];
          const pct = summary.total ? Math.round((count / summary.total) * 100) : 0;
          return (
            <li key={star} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-white/70">{star} star</span>
              <span className="h-2 flex-1 overflow-hidden bg-white/10">
                <span className="block h-full bg-lime" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-8 text-right text-muted">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
