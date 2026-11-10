"use client";

import { useEffect } from "react";

export default function GlobalSegmentError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-32 text-center">
      <div>
        <p className="eyebrow justify-center">Something went wrong</p>
        <h1 className="heading-xl mt-5 text-4xl sm:text-5xl">We hit a snag</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">An unexpected error occurred. Please try again.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-8 bg-lime px-7 py-4 font-display font-bold uppercase tracking-[0.14em] text-ink hover:bg-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
