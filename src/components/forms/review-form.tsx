"use client";

import { useActionState, useState, startTransition, type FormEvent } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/public";
import { initialFormState } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { Field, SpamProtection, StatusMessage, SubmitButton, SuccessPanel } from "./form-kit";

const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewForm() {
  const [state, dispatch, pending] = useActionState(submitReview, initialFormState);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  }

  if (state.status === "success") {
    return <SuccessPanel title="Thank you!" message={state.message} />;
  }
  const err = state.fieldErrors ?? {};
  const shown = hover || rating;

  return (
    <form onSubmit={onSubmit} className="relative space-y-6">
      <fieldset>
        <legend className="field-label">
          Your rating <span className="text-lime" aria-hidden>*</span>
        </legend>
        <div className="mt-1 flex items-center gap-4">
          <div className="flex" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer p-1" onMouseEnter={() => setHover(n)}>
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="peer sr-only"
                  required
                  aria-label={`${n} star${n > 1 ? "s" : ""} — ${labels[n]}`}
                />
                <Star
                  className={cn(
                    "size-9 transition-all peer-focus-visible:scale-110 peer-focus-visible:drop-shadow-[0_0_6px_#A4FF00]",
                    n <= shown ? "text-lime" : "text-white/20",
                  )}
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden
                />
              </label>
            ))}
          </div>
          <span className="font-display text-lg font-semibold uppercase tracking-wider text-white/80" aria-live="polite">
            {labels[shown]}
          </span>
        </div>
        {err.rating && (
          <p className="mt-1.5 text-sm text-red-400" role="alert">
            {err.rating}
          </p>
        )}
      </fieldset>

      <Field label="Your name" name="name" required error={err.name} hint="Shown publicly with your review.">
        {(p) => <input {...p} type="text" autoComplete="name" maxLength={80} className="field" />}
      </Field>
      <Field label="Your review" name="body" required error={err.body}>
        {(p) => (
          <textarea
            {...p}
            rows={5}
            minLength={10}
            maxLength={2000}
            placeholder="Tell others about your project and your experience working with us."
            className="field resize-y"
          />
        )}
      </Field>

      <SpamProtection resetKey={state} />
      <StatusMessage state={state} />
      <p className="text-xs text-white/50">Reviews are checked by our team before they are published.</p>
      <SubmitButton pending={pending}>{pending ? "Submitting…" : "Submit Review"}</SubmitButton>
    </form>
  );
}
