import samples from "./data/reviews.json";
import { apiUrl } from "./hosting";
export type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  demo: boolean;
  avatarUrl: string;
  authorUrl: string;
  reviewUrl: string;
};
export type ReviewsResult = {
  mode: "DEMO" | "GOOGLE";
  status: string;
  reviews: Review[];
  attributions?: { name: string; url: string }[];
};
export const reviewsMode =
  import.meta.env.VITE_REVIEWS_MODE === "GOOGLE" ? "GOOGLE" : "DEMO";
export const showDemoReviews =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_REVIEWS === "true";
export const safeReviewUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
};
export async function loadReviews(signal: AbortSignal): Promise<ReviewsResult> {
  if (reviewsMode === "DEMO")
    return {
      mode: "DEMO",
      status: "ready",
      reviews: showDemoReviews ? samples : [],
    };
  const response = await fetch(apiUrl("/api/reviews"), {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("REVIEWS_UNAVAILABLE");
  const result: unknown = await response.json();
  if (
    !result ||
    typeof result !== "object" ||
    !("mode" in result) ||
    result.mode !== "GOOGLE" ||
    !("reviews" in result) ||
    !Array.isArray(result.reviews)
  )
    throw new Error("REVIEWS_UNAVAILABLE");
  const data = result as ReviewsResult;
  if (
    data.attributions !== undefined &&
    (!Array.isArray(data.attributions) ||
      data.attributions.some(
        (a) => !a || typeof a.name !== "string" || typeof a.url !== "string",
      ))
  )
    throw new Error("REVIEWS_UNAVAILABLE");
  if (
    data.reviews.some(
      (r) =>
        !r ||
        r.demo !== false ||
        typeof r.name !== "string" ||
        typeof r.text !== "string" ||
        typeof r.date !== "string" ||
        !Number.isFinite(r.rating) ||
        r.rating < 1 ||
        r.rating > 5,
    )
  )
    throw new Error("REVIEWS_UNAVAILABLE");
  return data;
}
