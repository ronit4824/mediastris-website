import { useState } from "react";
import { safeReviewUrl, type Review } from "./reviews";
export default function ReviewCard({ review }: { review: Review }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const avatar = safeReviewUrl(review.avatarUrl);
  const author = safeReviewUrl(review.authorUrl);
  const reviewLink = safeReviewUrl(review.reviewUrl);
  const date = new Date(review.date);
  const initials = review.demo
    ? review.name.slice(-2)
    : review.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("");
  return (
    <article className="review-card" aria-label={`Review by ${review.name}`}>
      <div className="review-card-top">
        <span
          className="review-stars"
          role="img"
          aria-label={`${review.rating} out of 5 stars${review.demo ? ", illustrative rating" : ""}`}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={i < review.rating ? "filled" : ""}
            >
              <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01Z" />
            </svg>
          ))}
        </span>
        <svg
          className="review-quote"
          viewBox="0 0 40 32"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 32V18C0 8 5 2 15 0v7c-5 1-7 4-7 8h8v17H0Zm23 0V18C23 8 28 2 38 0v7c-5 1-7 4-7 8h8v17H23Z" />
        </svg>
      </div>
      {review.demo && (
        <span className="review-preview-label">Sample Review — Preview</span>
      )}
      <blockquote>
        <p>{review.text}</p>
      </blockquote>
      <div className="review-person">
        <span className="review-avatar" aria-hidden="true">
          {avatar && !photoFailed ? (
            <img
              src={avatar}
              alt=""
              width="48"
              height="48"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            initials
          )}
        </span>
        <div>
          <h3>
            {author && !review.demo ? (
              <a href={author} target="_blank" rel="noopener noreferrer">
                {review.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              review.name
            )}
          </h3>
          {!Number.isNaN(date.getTime()) && (
            <time dateTime={review.date}>
              {review.demo ? "Sample date · " : ""}
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              }).format(date)}
            </time>
          )}
        </div>
        {!review.demo && reviewLink && (
          <a
            className="review-original"
            href={reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read ${review.name}'s review on Google Maps (opens in a new tab)`}
          >
            ↗
          </a>
        )}
      </div>
    </article>
  );
}
