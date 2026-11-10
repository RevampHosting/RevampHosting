import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabaseAdmin } from "../supabase";

export const REVIEWS_TAG = "approved-reviews";

export type PublicReview = { id: string; name: string; rating: number; body: string; createdAt: string };

export type ReviewSummary = {
  average: number; // 0 when there are no reviews
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: PublicReview[];
};

const emptySummary = (): ReviewSummary => ({
  average: 0,
  total: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  reviews: [],
});

/**
 * Approved reviews plus statistics. The average and total are always
 * computed on the server from approved rows only — they are never accepted
 * from user input.
 */
export async function getReviewSummary(): Promise<ReviewSummary> {
  "use cache";
  cacheTag(REVIEWS_TAG);
  cacheLife("hours");

  const supabase = getSupabaseAdmin();
  if (!supabase) return emptySummary();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, rating, body, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !data) {
    if (error) console.error("[reviews] load failed:", error.message);
    return emptySummary();
  }

  const summary = emptySummary();
  let sum = 0;
  for (const row of data) {
    const rating = Math.min(5, Math.max(1, Math.round(Number(row.rating)))) as 1 | 2 | 3 | 4 | 5;
    summary.distribution[rating] += 1;
    sum += rating;
  }
  summary.total = data.length;
  summary.average = data.length ? Math.round((sum / data.length) * 10) / 10 : 0;
  summary.reviews = data.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    rating: Number(r.rating),
    body: r.body as string,
    createdAt: r.created_at as string,
  }));
  return summary;
}
