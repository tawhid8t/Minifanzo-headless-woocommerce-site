/**
 * components/products/ProductCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Product card used in grid listings — MiniFanzo
 *
 * Features:
 *  - Product image with hover zoom + second-image swap on hover
 *  - New / Sale / Hot badge
 *  - Product name, short description
 *  - Star rating
 *  - Price display (regular + sale + discount %)
 *  - Add to Cart button
 *  - Wishlist toggle heart button
 *  - Quick-view button (optional)
 *  - Stock status indicator
 *
 * Props:
 *   product  {object}  — WooCommerce product object
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import Link from "next/link";
import { FiHeart, FiShoppingCart, FiEye, FiStar } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useCart }      from "@/context/CartContext";
import { useWishlist }  from "@/context/WishlistContext";
import { getBadgeInfo, getDiscountPercent } from "@/lib/woocommerce";

export default function ProductCard({ product }) {
  const { addToCart }                    = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isHovered, setIsHovered]        = useState(false);
  const [addingToCart, setAddingToCart]  = useState(false);

  if (!product) return null;

  // ── Image handling ─────────────────────────────────────────────────────────
  // Show second image on hover if available, else first image
  const images       = product.images || [];
  const primaryImg   = images[0]?.src  || "/images/placeholder.jpg";
  const secondaryImg = images[1]?.src  || primaryImg;
  const currentImg   = isHovered && images.length > 1 ? secondaryImg : primaryImg;

  // ── Badge (New / Sale / Hot) ───────────────────────────────────────────────
  const badge        = getBadgeInfo(product);

  // ── Price ─────────────────────────────────────────────────────────────────
  const regularPrice  = parseFloat(product.regular_price || product.price || 0);
  const salePrice     = parseFloat(product.sale_price || 0);
  const displayPrice  = product.on_sale && salePrice ? salePrice : regularPrice;
  const discountPct   = getDiscountPercent(product.regular_price, product.sale_price);

  // ── Rating ────────────────────────────────────────────────────────────────
  const avgRating    = parseFloat(product.average_rating || 0);
  const ratingCount  = parseInt(product.rating_count     || 0);

  // ── Stock ─────────────────────────────────────────────────────────────────
  const inStock = product.stock_status !== "outofstock";

  // ── Add to cart handler ────────────────────────────────────────────────────
  async function handleAddToCart(e) {
    e.preventDefault(); // don't navigate to product page
    if (!inStock || addingToCart) return;
    setAddingToCart(true);
    addToCart(product, 1);
    setTimeout(() => setAddingToCart(false), 1000);
  }

  // ── Wishlist handler ───────────────────────────────────────────────────────
  function handleWishlist(e) {
    e.preventDefault();
    toggleWishlist(product);
  }

  const wishlisted = isWishlisted(product.id);

  return (
    <article
      className="card group relative overflow-hidden flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Product Image ──────────────────────────────────────────────────── */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden bg-gray-50 rounded-t-2xl">
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={currentImg}
            alt={images[0]?.alt || product.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* ── Badges ─────────────────────────────────────────────────────── */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {badge && (
            <span className={`badge ${badge.style}`}>
              {badge.label}
            </span>
          )}
          {discountPct > 0 && (
            <span className="badge badge-sale">
              -{discountPct}%
            </span>
          )}
          {!inStock && (
            <span className="badge badge-out">
              Out of Stock
            </span>
          )}
        </div>

        {/* ── Wishlist Button ──────────────────────────────────────────────── */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`
            absolute top-3 right-3 w-9 h-9 rounded-full
            flex items-center justify-center
            shadow-card transition-all duration-200
            ${wishlisted
              ? "bg-red-500 text-white scale-110"
              : "bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"}
          `}
        >
          {wishlisted
            ? <FaHeart className="w-4 h-4" />
            : <FiHeart className="w-4 h-4" />
          }
        </button>

        {/* ── Quick View Button ────────────────────────────────────────────── */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center
                        translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                        transition-all duration-300">
          <span className="bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold
                           px-4 py-1.5 rounded-full shadow-card flex items-center gap-1.5">
            <FiEye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </Link>

      {/* ── Product Info ────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        {product.categories?.[0] && (
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            {product.categories[0].name}
          </span>
        )}

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 leading-snug
                         hover:text-primary transition-colors duration-200 mb-1.5">
            {product.name}
          </h3>
        </Link>

        {/* Star Rating */}
        {ratingCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <FiStar
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({ratingCount})</span>
          </div>
        )}

        {/* Spacer pushes price + button to bottom */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`font-bold text-lg ${product.on_sale && salePrice ? "text-red-600" : "text-primary"}`}>
            ৳{displayPrice.toLocaleString()}
          </span>
          {product.on_sale && salePrice && regularPrice > salePrice && (
            <span className="text-sm text-gray-400 line-through">
              ৳{regularPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
          className={`
            w-full flex items-center justify-center gap-2
            py-2.5 rounded-full text-sm font-semibold
            transition-all duration-200 active:scale-95
            ${!inStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : addingToCart
              ? "bg-accent text-primary scale-95"
              : "bg-primary text-white hover:bg-primary-dark hover:shadow-btn"}
          `}
        >
          {addingToCart ? (
            <>
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Added!
            </>
          ) : (
            <>
              <FiShoppingCart className="w-4 h-4" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}
