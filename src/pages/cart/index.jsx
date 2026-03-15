/**
 * pages/cart/index.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full Cart Page — MiniFanzo
 *
 * Displays all cart items in a table layout with:
 *  - Product image, name, price, qty controls, item total, remove button
 *  - Cart summary (subtotal, delivery fee, total)
 *  - Free delivery progress bar
 *  - Coupon code input
 *  - Proceed to checkout CTA
 *
 * Uses CartContext for all state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import {
  FiTrash2, FiPlus, FiMinus, FiShoppingBag,
  FiArrowRight, FiArrowLeft, FiTag
} from "react-icons/fi";
import { useCart }  from "@/context/CartContext";
import Breadcrumb   from "@/components/ui/Breadcrumb";

export default function CartPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const {
    cart,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    removeFromCart,
    updateQty,
    clearCart,
    FREE_DELIVERY_THRESHOLD,
  } = useCart();

  // Prevent hydration mismatch - only render after client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - cartSubtotal);
  const deliveryProgress     = Math.min((cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  return (
    <>
      <NextSeo title="Your Cart | MiniFanzo" noindex />

      <div className="bg-base min-h-screen">
        {!isHydrated ? (
          <div className="container-main py-20 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4" style={{ animation: "pulse 2s infinite" }} />
            <p className="text-gray-500">Loading cart...</p>
          </div>
        ) : (
          <div className="container-main py-6">
            <Breadcrumb items={[
              { label: "Home",  href: "/" },
              { label: "Cart" },
            ]} />

            <div className="flex items-center justify-between mb-6 mt-2">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-800">
                Shopping Cart
                {cartCount > 0 && (
                  <span className="ml-2 text-base text-gray-400 font-normal">({cartCount} items)</span>
                )}
              </h1>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
                >
                  Clear cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
            /* ── Empty cart ──────────────────────────────────────────────── */
            <div className="py-20 text-center bg-white rounded-3xl shadow-card">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="font-heading font-bold text-xl text-gray-700 mb-2">Your cart is empty</h2>
              <p className="text-gray-400 mb-6">Looks like you haven't added any fans yet!</p>
              <Link href="/shop" className="btn-primary">
                Start Shopping
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

              {/* ── Cart Items ─────────────────────────────────────────── */}
              <div className="space-y-4">

                {/* Free delivery progress */}
                {cartSubtotal < FREE_DELIVERY_THRESHOLD && (
                  <div className="bg-white rounded-2xl p-4 shadow-card">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      🚚 Add <strong className="text-primary">৳{amountToFreeDelivery.toLocaleString()}</strong> more for Free Delivery
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${deliveryProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">{Math.round(deliveryProgress)}% there!</p>
                  </div>
                )}
                {cartSubtotal >= FREE_DELIVERY_THRESHOLD && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm font-semibold text-center">
                    🎉 You've unlocked FREE delivery!
                  </div>
                )}

                {/* Item list */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  {/* Header */}
                  <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_40px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    <span>Product</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Total</span>
                    <span />
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100">
                    {cart.map((item) => (
                      <CartRow
                        key={`${item.id}-${item.variationId}`}
                        item={item}
                        onRemove={() => removeFromCart(item.id, item.variationId)}
                        onUpdateQty={(qty) => updateQty(item.id, item.variationId, qty)}
                      />
                    ))}
                  </div>
                </div>

                {/* Continue shopping */}
                <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                  <FiArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>

              {/* ── Order Summary ─────────────────────────────────────── */}
              <div className="space-y-4">
                {/* Summary card */}
                <div className="bg-white rounded-2xl shadow-card p-5">
                  <h2 className="font-heading font-bold text-lg text-gray-800 mb-4">Order Summary</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cartCount} items)</span>
                      <span className="font-semibold">৳{cartSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                        {deliveryFee === 0 ? "FREE" : `৳${deliveryFee}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800 text-lg">
                      <span>Total</span>
                      <span className="text-primary">৳{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link href="/checkout" className="btn-primary w-full justify-center py-4 text-base mt-5">
                    Proceed to Checkout
                    <FiArrowRight className="w-5 h-5" />
                  </Link>

                  {/* Payment icons */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {["COD", "bKash", "Nagad", "VISA", "MC"].map((m) => (
                      <span key={m} className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-500">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Coupon code */}
                <div className="bg-white rounded-2xl shadow-card p-5">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                    <FiTag className="w-4 h-4 text-primary" />
                    Have a coupon?
                  </h3>
                  <form
                    onSubmit={(e) => { e.preventDefault(); /* coupon logic handled at checkout */ }}
                    className="flex gap-2"
                  >
                    <input
                      placeholder="Enter coupon code"
                      className="input-field flex-1 text-sm py-2.5"
                    />
                    <button type="submit" className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap">
                      Apply
                    </button>
                  </form>
                  <p className="text-xs text-gray-400 mt-2">Coupons are applied at checkout.</p>
                </div>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    </>
  );
}

// ── CartRow Component ─────────────────────────────────────────────────────────
function CartRow({ item, onRemove, onUpdateQty }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_40px] gap-4 items-center px-5 py-4">
      {/* Product info */}
      <div className="flex items-center gap-4">
        <Link href={`/products/${item.slug}`} className="shrink-0">
          <div className="w-18 h-18 w-[72px] h-[72px] bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={item.image || "/images/placeholder.jpg"}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
        </Link>
        <div className="min-w-0">
          <Link href={`/products/${item.slug}`}>
            <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-primary transition-colors">
              {item.name}
            </h4>
          </Link>
          {item.attributes?.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {item.attributes.map((a) => `${a.name}: ${a.option}`).join(", ")}
            </p>
          )}
          <p className="text-primary font-semibold text-sm mt-1">৳{item.price.toLocaleString()} each</p>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-start sm:justify-center gap-2">
        <button
          onClick={() => onUpdateQty(item.quantity - 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
        >
          <FiMinus className="w-3.5 h-3.5" />
        </button>
        <span className="font-bold text-gray-800 w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.quantity + 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
        >
          <FiPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Total */}
      <div className="text-right">
        <span className="font-bold text-gray-800">
          ৳{(item.price * item.quantity).toLocaleString()}
        </span>
      </div>

      {/* Remove */}
      <div className="flex justify-end">
        <button
          onClick={onRemove}
          className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
          aria-label="Remove item"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
