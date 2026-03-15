/**
 * components/products/ProductImageGallery.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Product Image Gallery — MiniFanzo
 *
 * Displays 4-5 product images with:
 *  - Large main image viewer
 *  - Thumbnail strip (click to switch main image)
 *  - Keyboard navigation (arrow keys)
 *  - Lightbox/zoom modal on click
 *  - Touch/swipe support via CSS
 *  - Smooth transitions
 *
 * Props:
 *   images  {Array}   — WC images array: [{id, src, alt}]
 *   name    {string}  — product name (for alt text fallback)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn } from "react-icons/fi";

export default function ProductImageGallery({ images = [], name = "" }) {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Clamp images to max 5 (WooCommerce can return more)
  const displayImages = images.slice(0, 5);
  const activeImage   = displayImages[activeIndex] || { src: "/images/placeholder.jpg", alt: name };

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % displayImages.length);
  }, [displayImages.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "Escape")     setLightboxOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // ── Lock scroll when lightbox is open ────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  if (displayImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400 text-sm">No image available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Main Image ──────────────────────────────────────────────────────── */}
      <div
        className="relative bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in aspect-square group"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={activeImage.src}
          alt={activeImage.alt || name}
          className="w-full h-full object-contain transition-all duration-400 group-hover:scale-105"
        />

        {/* Zoom icon hint */}
        <div className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full
                        flex items-center justify-center shadow-card
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FiZoomIn className="w-4 h-4 text-primary" />
        </div>

        {/* Image counter badge */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-medium
                          px-2.5 py-1 rounded-full backdrop-blur-sm">
            {activeIndex + 1} / {displayImages.length}
          </div>
        )}

        {/* Prev / Next arrows (only when multiple images) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full
                         flex items-center justify-center shadow-card
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         hover:bg-white hover:shadow-hover"
              aria-label="Previous image"
            >
              <FiChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full
                         flex items-center justify-center shadow-card
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         hover:bg-white hover:shadow-hover"
              aria-label="Next image"
            >
              <FiChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail Strip ─────────────────────────────────────────────────── */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {displayImages.map((img, index) => (
            <button
              key={img.id || index}
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`
                relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200
                ${activeIndex === index
                  ? "border-primary shadow-btn scale-95"
                  : "border-transparent hover:border-gray-300 hover:scale-95"}
              `}
            >
              <img
                src={img.src}
                alt={img.alt || `${name} view ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Dimmed overlay for inactive thumbnails */}
              {activeIndex !== index && (
                <div className="absolute inset-0 bg-white/30" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox / Zoom Modal ─────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20
                       rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Prev/Next in lightbox */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20
                           rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Previous image"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20
                           rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Next image"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main lightbox image */}
          <div
            className="max-w-3xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.src}
              alt={activeImage.alt || name}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-modal animate-scale-in"
            />
          </div>

          {/* Thumbnail dots in lightbox */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {displayImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === activeIndex ? "bg-accent w-6" : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
