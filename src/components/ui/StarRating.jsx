/**
 * components/ui/StarRating.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Star rating display + review section — MiniFanzo
 *
 * Exports:
 *   StarRating     — displays N stars (read-only)
 *   ReviewSection  — full review list with summary bar + individual reviews
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { FiStar } from "react-icons/fi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

// ── StarRating — Read-only star display ────────────────────────────────────
/**
 * @param {number}  rating   - e.g. 4.5
 * @param {number}  count    - total review count (optional)
 * @param {string}  size     - "sm" | "md" | "lg"
 * @param {boolean} showCount - show "(42 reviews)" text
 */
export function StarRating({ rating = 0, count = 0, size = "md", showCount = true }) {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-6 h-6",
  };

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center gap-1.5">
      {/* Star icons */}
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const diff = rating - (star - 1);
          if (diff >= 1) {
            // Full star
            return (
              <FaStar key={star} className={`${iconSize} text-yellow-400`} />
            );
          } else if (diff > 0) {
            // Half star
            return (
              <FaStarHalfAlt key={star} className={`${iconSize} text-yellow-400`} />
            );
          } else {
            // Empty star
            return (
              <FiStar key={star} className={`${iconSize} text-gray-300`} />
            );
          }
        })}
      </div>

      {/* Rating number */}
      <span className={`font-semibold text-gray-700 ${textSize[size]}`}>
        {parseFloat(rating).toFixed(1)}
      </span>

      {/* Review count */}
      {showCount && count > 0 && (
        <span className={`text-gray-400 ${textSize[size]}`}>
          ({count})
        </span>
      )}
    </div>
  );
}

// ── ReviewSection — Full review list ────────────────────────────────────────
/**
 * Displays a star summary bar + individual customer reviews.
 *
 * @param {Array}   reviews  - array of WC review objects
 * @param {number}  avgRating
 * @param {number}  totalCount
 */
export function ReviewSection({ reviews = [], avgRating = 0, totalCount = 0 }) {

  // Calculate distribution of each star rating (1-5)
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct   = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { star, count, pct };
  });

  return (
    <section className="mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 font-heading">
        Customer Reviews
      </h3>

      {/* ── Rating Summary ───────────────────────────────────────────── */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* Average score */}
            <div className="text-center shrink-0">
              <div className="text-5xl font-black text-primary font-heading">
                {parseFloat(avgRating).toFixed(1)}
              </div>
              <StarRating rating={avgRating} showCount={false} size="lg" />
              <p className="text-sm text-gray-500 mt-1">{totalCount} reviews</p>
            </div>

            {/* Star distribution bars */}
            <div className="flex-1 w-full space-y-2">
              {distribution.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-4 text-right shrink-0">{star}</span>
                  <FaStar className="w-3 h-3 text-yellow-400 shrink-0" />
                  {/* Bar */}
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Individual Reviews ───────────────────────────────────────── */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <FiStar className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── ReviewCard — single review ───────────────────────────────────────────────
function ReviewCard({ review }) {
  // Format date
  const date = review.date_created
    ? new Date(review.date_created).toLocaleDateString("en-BD", {
        year:  "numeric",
        month: "short",
        day:   "numeric",
      })
    : "";

  // Strip HTML from review body (WC returns HTML)
  const reviewText = review.review
    ? review.review.replace(/<[^>]*>/g, "").trim()
    : "";

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card animate-fade-in">
      <div className="flex items-start justify-between gap-4">

        {/* Reviewer avatar (initial) */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-sm uppercase">
            {review.reviewer?.charAt(0) || "U"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + verified badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm">
              {review.reviewer || "Anonymous"}
            </span>
            {review.verified && (
              <span className="badge badge-stock text-xs">✓ Verified</span>
            )}
          </div>

          {/* Stars + date */}
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={review.rating} showCount={false} size="sm" />
            <span className="text-xs text-gray-400">{date}</span>
          </div>

          {/* Review text */}
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            {reviewText}
          </p>
        </div>
      </div>
    </div>
  );
}
