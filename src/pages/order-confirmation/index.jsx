/**
 * pages/order-confirmation/index.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Order Confirmation Page — MiniFanzo
 *
 * Shows:
 *  - Success animation / checkmark
 *  - Order number, payment method, delivery ETA
 *  - Order items summary
 *  - Delivery address
 *  - Next steps (COD vs paid orders)
 *  - CTA: Continue Shopping / Track via WhatsApp
 *
 * Reads ?id= and ?method= from URL query params.
 * Fetches order details from /api/orders/[id] (server-side proxy).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useRouter }           from "next/router";
import Link                    from "next/link";
import { NextSeo }             from "next-seo";
import {
  FiCheck, FiPackage, FiPhone, FiMapPin,
  FiArrowRight, FiShoppingBag
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { id: orderId, method } = router.query;

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // ── Fetch order details ───────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    async function fetchOrder() {
      try {
        const res  = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load order");
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  // ── Delivery ETA based on district ───────────────────────────────────────
  function getDeliveryETA(city) {
    if (!city) return "2-3 business days";
    const dhakaAreas = ["Dhaka", "Gazipur", "Narayanganj"];
    return dhakaAreas.includes(city) ? "Within 24 hours" : "2-3 business days";
  }

  // ── Payment method display ────────────────────────────────────────────────
  const paymentLabels = {
    cod:   "Cash on Delivery",
    bkash: "bKash",
    card:  "Credit/Debit Card",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !orderId) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-5xl">😕</span>
        <h1 className="font-heading font-bold text-xl text-gray-800">Order Not Found</h1>
        <p className="text-gray-500 max-w-sm">{error || "We couldn't find your order. Please contact support."}</p>
        <Link href="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const deliveryETA = getDeliveryETA(order?.billing?.city);

  return (
    <>
      <NextSeo title="Order Confirmed! | MiniFanzo" noindex />

      <div className="min-h-screen bg-base py-10 sm:py-16">
        <div className="container-main max-w-2xl">

          {/* ── Success Header ──────────────────────────────────────── */}
          <div className="text-center mb-8 animate-fade-in">
            {/* Animated checkmark circle */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-scale-in">
              <FiCheck className="w-12 h-12 text-green-600" strokeWidth={3} />
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-800 mb-2">
              Order Confirmed! 🎉
            </h1>
            <p className="text-gray-500">
              Thank you for shopping with <strong className="text-primary">MiniFanzo</strong>!
              Your order has been received.
            </p>
          </div>

          {/* ── Order Details Card ──────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-card overflow-hidden">

            {/* Order meta */}
            <div className="bg-primary/5 border-b border-primary/10 px-6 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Order #</p>
                  <p className="font-bold text-primary text-lg mt-0.5">#{order?.id || orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</p>
                  <p className="font-semibold text-gray-700 mt-0.5 capitalize">{order?.status || "pending"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Payment</p>
                  <p className="font-semibold text-gray-700 mt-0.5">
                    {paymentLabels[method] || order?.payment_method_title || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Delivery ETA</p>
                  <p className="font-semibold text-green-600 mt-0.5">{deliveryETA}</p>
                </div>
              </div>
            </div>

            {/* Order items */}
            {order?.line_items?.length > 0 && (
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FiShoppingBag className="w-4 h-4 text-primary" /> Items Ordered
                </h3>
                <div className="space-y-3">
                  {order.line_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        {item.image?.src && (
                          <img src={item.image.src} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 shrink-0">
                        ৳{parseFloat(item.subtotal).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>৳{parseFloat(order.subtotal || 0).toLocaleString()}</span>
                  </div>
                  {order.shipping_lines?.[0] && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery</span>
                      <span className={parseFloat(order.shipping_lines[0].total) === 0 ? "text-green-600 font-semibold" : ""}>
                        {parseFloat(order.shipping_lines[0].total) === 0
                          ? "FREE"
                          : `৳${parseFloat(order.shipping_lines[0].total).toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-primary">৳{parseFloat(order.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery address */}
            {order?.billing && (
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-primary" /> Delivery Address
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {order.billing.first_name} {order.billing.last_name}<br />
                  {order.billing.address_1}
                  {order.billing.address_2 && `, ${order.billing.address_2}`}<br />
                  {order.billing.city}, Bangladesh<br />
                  <span className="flex items-center gap-1 mt-1">
                    <FiPhone className="w-3 h-3" /> {order.billing.phone}
                  </span>
                </p>
              </div>
            )}

            {/* Next steps */}
            <div className="px-6 py-5">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiPackage className="w-4 h-4 text-primary" /> What Happens Next?
              </h3>
              <ol className="space-y-3">
                {[
                  { step: "1", text: "Our team will confirm your order within 1 hour via SMS/WhatsApp" },
                  { step: "2", text: method === "cod" ? "Your order will be packed and handed to the courier" : "Payment verified and order is being prepared" },
                  { step: "3", text: `You'll receive your delivery in ${deliveryETA}` },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-accent text-primary text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <p className="text-sm text-gray-600">{item.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ── Action Buttons ──────────────────────────────────────── */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`https://wa.me/8801788039222?text=${encodeURIComponent(`Hi MiniFanzo! I placed order #${orderId}. Can you confirm?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl
                         bg-[#25D366] text-white font-semibold
                         hover:bg-[#20ba57] transition-colors"
            >
              <FaWhatsapp className="w-5 h-5" />
              Track on WhatsApp
            </a>

            <Link href="/shop" className="btn-primary py-3.5 justify-center">
              Continue Shopping
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Order note */}
          {order?.customer_note && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-700 font-medium">Your note: {order.customer_note}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
