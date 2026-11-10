import type { Metadata } from "next";
import { images } from "@/config/images";
import { getReviewSummary } from "@/lib/data/reviews";
import { PageHero } from "@/components/sections/page-hero";
import { ReviewCard, ReviewStats } from "@/components/sections/reviews-display";
import { ReviewForm } from "@/components/forms/review-form";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "Read verified reviews from our construction and carpentry customers, or share your own experience.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const summary = await getReviewSummary();
  return (
    <>
      <PageHero
        eyebrow="Customer reviews"
        title={
          <>
            Our reputation is <span className="text-lime">built on trust</span>
          </>
        }
        intro="Real feedback from the homeowners and businesses we've worked with."
        image={images.livingRoom}
      />

      <section className="py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[22rem_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <ReviewStats summary={summary} />
            <a
              href="#write-review"
              className="block bg-lime px-6 py-4 text-center font-display font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-white"
            >
              Write a review
            </a>
          </aside>

          <div>
            {summary.reviews.length ? (
              <ul className="grid gap-6 md:grid-cols-2">
                {summary.reviews.map((r, i) => (
                  <Reveal as="li" key={r.id} delay={(i % 2) * 80}>
                    <ReviewCard review={r} />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <div className="grid h-full min-h-64 place-items-center border border-dashed border-white/15 p-10 text-center">
                <div>
                  <p className="font-display text-3xl font-bold uppercase">No reviews yet</p>
                  <p className="mx-auto mt-3 max-w-md text-muted">Be the first to share your experience working with our team.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="write-review" className="scroll-mt-24 border-t border-white/10 bg-charcoal py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Share your experience</p>
            <h2 className="heading-xl mt-5 text-4xl sm:text-5xl">
              Leave a <span className="text-lime">review</span>
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted">
              Your honest feedback helps us improve and helps other homeowners make confident decisions. All reviews are
              reviewed by our team before being published.
            </p>
          </div>
          <div className="border border-white/10 bg-ink p-6 sm:p-10">
            <ReviewForm />
          </div>
        </div>
      </section>
    </>
  );
}
