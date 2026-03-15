/**
 * components/ui/Spinner.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Loading spinner component — MiniFanzo
 *
 * Usage:
 *   <Spinner />              — default medium size
 *   <Spinner size="lg" />    — large
 *   <Spinner size="sm" />    — small (inline)
 *   <Spinner fullScreen />   — full-page loading overlay
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function Spinner({ size = "md", fullScreen = false, label = "Loading..." }) {

  // Size variants
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Spinning ring — brand green */}
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-200 border-t-primary
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label={label}
      />
      {/* Accessible label (visually hidden for inline sizes) */}
      {size !== "sm" && (
        <span className="text-sm text-gray-500 font-medium animate-pulse">
          {label}
        </span>
      )}
    </div>
  );

  // Full-screen overlay variant
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-base/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-modal flex flex-col items-center gap-4">
          {/* Brand logo mark */}
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-accent font-heading font-black text-xl">M</span>
          </div>
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

/**
 * SkeletonCard — Placeholder card while products are loading
 * Shows a grey shimmer animation matching the ProductCard shape.
 */
export function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="bg-gray-200 aspect-[3/4] w-full rounded-t-2xl" />
      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded-full w-full mt-2" />
      </div>
    </div>
  );
}

/**
 * SkeletonGrid — Grid of skeleton cards
 */
export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonProductDetail — Skeleton for the product detail page
 */
export function SkeletonProductDetail() {
  return (
    <div className="container-main py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images skeleton */}
        <div className="space-y-4">
          <div className="bg-gray-200 aspect-square rounded-2xl" />
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-200 aspect-square rounded-xl" />
            ))}
          </div>
        </div>
        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
