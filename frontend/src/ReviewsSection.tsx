import { useEffect, useState } from "react";
import ReviewCard from "./ReviewCard";
import {
  loadReviews,
  reviewsMode,
  safeReviewUrl,
  showDemoReviews,
  type ReviewsResult,
} from "./reviews";
export default function ReviewsSection() {
  const [result, setResult] = useState<ReviewsResult | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    loadReviews(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      })
      .finally(() => clearTimeout(timeout));
    const onAbort = () => setFailed(true);
    controller.signal.addEventListener("abort", onAbort);
    return () => {
      clearTimeout(timeout);
      controller.signal.removeEventListener("abort", onAbort);
      controller.abort();
    };
  }, []);
  if (reviewsMode === "DEMO" && !showDemoReviews) return null;
  const demo = reviewsMode === "DEMO";
  return (
    <section
      id="reviews"
      className="reviews-section"
      aria-labelledby="reviews-heading"
    >
      <div className="reviews-inner">
        <div className="reviews-heading-row">
          <div>
            <p className="reviews-eyebrow">
              <span />{" "}
              {demo
                ? "A PREVIEW OF FUTURE FEEDBACK"
                : "PERSPECTIVES & EXPERIENCES"}
            </p>
            <h2 id="reviews-heading">
              What People
              <br className="reviews-heading-break" /> Are Saying
              <span className="reviews-heading-dot">.</span>
            </h2>
          </div>
          <p className="reviews-intro">
            {demo
              ? "A space for the voices that will shape our story. Explore the review experience in this demonstration."
              : "Feedback shared on Google Maps. Reviews are provided in Google’s relevance order."}
          </p>
        </div>
        {demo && (
          <p className="reviews-demo-notice">
            <span aria-hidden="true">◈</span> Demonstration only. These four
            reviews, names, ratings and dates are illustrative, not customer
            testimonials.
          </p>
        )}
        {result?.reviews.length ? (
          <div className="reviews-grid">
            {result.reviews.slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="reviews-status" role="status">
            {failed
              ? "Reviews are temporarily unavailable. Please check back later."
              : !result
                ? "Loading reviews…"
                : result.status === "unconfigured"
                  ? "Reviews will be available once the Google Business Profile is connected."
                  : "No reviews are available yet."}
          </p>
        )}
        {!demo && result?.reviews.length ? (
          <div className="reviews-attribution">
            <span translate="no">Google Maps</span>
            <a
              href="https://support.google.com/contributionpolicy/answer/7400114"
              target="_blank"
              rel="noopener noreferrer"
            >
              About Google’s review policies ↗
            </a>
            {result.attributions?.map((a, i) => (
              <span key={i}>
                {safeReviewUrl(a.url) ? (
                  <a
                    href={safeReviewUrl(a.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {a.name}
                  </a>
                ) : (
                  a.name
                )}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
