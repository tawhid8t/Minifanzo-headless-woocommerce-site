/**
 * pages/wishlist/index.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wishlist Page — MiniFanzo
 *
 * Shows all wishlisted products in a grid.
 * Users can add items directly to cart from here or remove from wishlist.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Link        from "next/link";
import { NextSeo } from "next-seo";
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from "react-icons/fi";
import { useWishlist } from "@/context/WishlistContext";
import { useCart }     from "@/context/CartContext";
import Breadcrumb      from "@/components/ui/Breadcrumb";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  return (
    <>
      <NextSeo title="Wishlist | MiniFanzo" noindex />

      <div className="bg-base min-h-screen">
        <div className="container-main py-6">
          <Breadcrumb items={[
            { label: "Home",     href: "/" },
            { label: "Wishlist" },
          ]} />

          <div className="flex items-center justify-between mt-2 mb-6">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-800">
              My Wishlist
              {wishlistCount > 0 && (
                <span className="ml-2 text-base text-gray-400 font-normal">
                  ({wishlistCount} items)
                </span>
              )}
            </h1>
          </div>

          {wishlist.length === 0 ? (
            /* ── Empty wishlist ─────────────────────────────────────── */
            <div className="py-20 text-center bg-white rounded-3xl shadow-card">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiHeart className="w-12 h-12 text-red-300" />
              </div>
              <h2 className="font-heading font-bold text-xl text-gray-700 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-400 mb-6">
                Save your favorite fans here and come back later!
              </p>
              <Link href="/shop" className="btn-primary">
                Discover Products
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* ── Wishlist grid ─────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {wishlist.map((item) => (
                  <WishlistCard
                    key={item.id}
                    item={item}
                    onRemove={() => removeFromWishlist(item.id)}
                    onAddToCart={() => addToCart({
                      id:             item.id,
                      name:           item.name,
                      price:          item.price,
                      sale_price:     item.sale_price,
                      images:         [{ src: item.image }],
                      slug:           item.slug,
                    }, 1)}
                  />
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <Link href="/shop" className="btn-outline">
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── WishlistCard ─────────────────────────────────────────────────────────────
function WishlistCard({ item, onRemove, onAddToCart }) {
  return (
    <div className="card overflow-hidden group">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="block relative overflow-hidden bg-gray-50 rounded-t-2xl">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={item.image || "/images/placeholder.jpg"}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />
        </div>
        {/* Remove button */}
        <button
          onClick={(e) => { e.preventDefault(); onRemove(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center
                     text-red-400 hover:bg-red-50 hover:text-red-600
                     shadow-card transition-all"
          aria-label="Remove from wishlist"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/products/${item.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-primary transition-colors mb-2">
            {item.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-primary">
            ৳{(parseFloat(item.sale_price || item.price || 0)).toLocaleString()}
          </span>
          {item.on_sale && item.regular_price && parseFloat(item.regular_price) > parseFloat(item.sale_price) && (
            <span className="text-xs text-gray-400 line-through">
              ৳{parseFloat(item.regular_price).toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={onAddToCart}
          className="w-full btn-primary py-2.5 text-sm"
        >
          <FiShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
