/**
 * pages/checkout/index.jsx — MiniFanzo Checkout
 * Exact design match to original HTML/CSS/JS order modal — full page version
 */

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const { cart, cartSubtotal, deliveryFee, cartTotal, clearCart, getLineItems, setDeliveryFee, FREE_DELIVERY_THRESHOLD } = useCart();
  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", payment: "", notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (form.city === "Dhaka") {
      setDeliveryFee(70);
    } else if (form.city) {
      setDeliveryFee(110);
    } else {
      setDeliveryFee(null);
    }
  }, [form.city, setDeliveryFee]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.payment) return;
    
    setError("");
    setLoading(true);

    try {
      // Build WooCommerce order payload
      const orderData = {
        payment_method: form.payment,
        payment_method_title: form.payment === "cod" ? "Cash on Delivery" : form.payment.toUpperCase(),
        set_paid: false, // Don't mark as paid unless payment is confirmed
        billing: {
          first_name: form.name.split(" ")[0],
          last_name: form.name.split(" ").slice(1).join(" ") || "-",
          address_1: form.address,
          city: form.city,
          country: "BD",
          email: "", // Optional
          phone: form.phone,
        },
        shipping: {
          first_name: form.name.split(" ")[0],
          last_name: form.name.split(" ").slice(1).join(" ") || "-",
          address_1: form.address,
          city: form.city,
          country: "BD",
        },
        line_items: getLineItems(),
        customer_note: form.notes || "",
      };

      console.log("Submitting order:", orderData);

      // Send order to backend API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        let errData = { message: "Failed to create order" };
        try {
          errData = await response.json();
        } catch (parseErr) {
          errData = { message: `API Error: ${response.status} ${response.statusText}` };
        }
        throw new Error(errData.message || "Failed to create order");
      }

      const createdOrder = await response.json();
      console.log("Order created successfully:", createdOrder);

      // Clear cart and show success
      clearCart();
      setLoading(false);
      setSuccess(true);

      // Redirect to order confirmation after 2 seconds
      setTimeout(() => {
        router.push(`/order-confirmation/${createdOrder.id}`);
      }, 2000);
    } catch (err) {
      console.error("Order submission error:", err.message);
      setError(err.message || "Failed to place order. Please try again. Check browser console for details.");
      setLoading(false);
    }
  }

  if (cart.length === 0 && !success) {
    return (
      <>
        <Head><title>Checkout — MiniFanzo</title></Head>
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <i className="fas fa-shopping-cart" style={{ fontSize: "4rem", color: "var(--gray-300)" }} />
          <h2 style={{ marginTop: 20, fontFamily: "var(--font-primary)" }}>Your cart is empty</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 10 }}>Add some fans before checking out!</p>
          <a href="/shop" className="btn btn-primary" style={{ marginTop: 24, display: "inline-flex" }}>
            <i className="fas fa-wind" /> Browse Fans
          </a>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Head><title>Order Confirmed — MiniFanzo</title></Head>
        <section style={{ padding: "80px 0", background: "var(--base)", minHeight: "60vh", display: "flex", alignItems: "center" }}>
          <div className="container">
            <div style={{ maxWidth: 560, margin: "0 auto", background: "var(--white)", borderRadius: "var(--radius-xl)", padding: 48, boxShadow: "var(--shadow-lg)", textAlign: "center" }}>
              <div className="success-icon" style={{ margin: "0 auto 24px" }}>
                <i className="fas fa-check" />
              </div>
              <h2 style={{ fontFamily: "var(--font-primary)", fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
                Order Placed Successfully! 🎉
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 }}>
                Thank you, <strong>{form.name}</strong>! Your order has been received. We will call you at <strong>{form.phone}</strong> to confirm your order and delivery details.
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 32 }}>
                Expected delivery: {form.city === "Dhaka" ? "1-2 business days" : "2-4 business days"}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/" className="btn btn-primary">
                  <i className="fas fa-home" /> Back to Home
                </a>
                <a href="/shop" className="btn btn-outline">
                  <i className="fas fa-wind" /> Continue Shopping
                </a>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout — MiniFanzo</title>
        <meta name="description" content="Complete your order — MiniFanzo portable mini fans." />
      </Head>

      {!isHydrated ? (
        <div style={{ padding: "200px 20px", textAlign: "center", background: "var(--base)", minHeight: "100vh" }}>
          <div style={{ fontSize: "2rem", marginBottom: 20 }}>⏳</div>
          <p style={{ color: "var(--text-muted)" }}>Loading checkout...</p>
        </div>
      ) : (
        <>
          {/* Page header */}
          <div style={{ background: "var(--primary)", padding: "40px 0" }}>
            <div className="container">
              <h1 style={{ fontFamily: "var(--font-primary)", color: "var(--white)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
            <i className="fas fa-shopping-bag" /> Place Your Order
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", marginTop: 6, fontSize: "0.95rem" }}>
            Fill in your details and we&apos;ll confirm your order soon!
          </p>
        </div>
      </div>

      <section style={{ padding: "60px 0 80px", background: "var(--base)" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 40,
            alignItems: "start"
          }} className="checkout-grid">

            {/* ── Order Form ───────────────────────────────────────────── */}
            <div className="contact-form-wrap">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" placeholder="01700-000000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Delivery Address *</label>
                  <textarea placeholder="Full address with area, road, house number and district..." rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Division *</label>
                    <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required>
                      <option value="">Select Division</option>
                      {[
                        "Dhaka","Chittagong","Sylhet","Rajshahi","Khulna",
                        "Barisal","Rangpur","Mymensingh","Comilla","Jessore",
                        "Bogra","Dinajpur","Faridpur","Narsingdi","Narayanganj","Other"
                      ].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select value={form.payment} onChange={e => setForm({ ...form, payment: e.target.value })} required>
                      <option value="">Select Method</option>
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="card">Credit/Debit Card</option>
                    </select>
                  </div>
                </div>

                {/* bKash info */}
                {form.payment === "bkash" && (
                  <div style={{ background: "#fdf0f7", border: "2px solid #E2136E", borderRadius: "var(--radius-md)", padding: "16px 20px", marginBottom: 20 }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#E2136E", marginBottom: 6 }}>
                      <i className="fas fa-mobile-alt" /> bKash Payment Instructions
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#333", lineHeight: 1.6 }}>
                      1. Go to bKash app → Send Money<br />
                      2. Send to: <strong>01700-000000</strong><br />
                      3. Enter amount and use order reference as note<br />
                      4. Take a screenshot and WhatsApp us
                    </p>
                  </div>
                )}

                <div className="form-group">
                  <label>Special Notes (optional)</label>
                  <input type="text" placeholder="Any special instructions for delivery..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>

                {error && (
                  <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16, color: "#991b1b", fontSize: "0.9rem" }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />
                    {error}
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-full" style={{ fontSize: "1rem", padding: "16px" }} disabled={loading}>
                  {loading
                    ? <><i className="fas fa-spinner fa-spin" /> Processing Your Order...</>
                    : <><i className="fas fa-check-circle" /> Confirm Order — ৳{cartTotal.toLocaleString()}</>
                  }
                </button>

                <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 14 }}>
                  <i className="fas fa-lock" style={{ color: "var(--primary)", marginRight: 4 }} />
                  Your information is secure and will never be shared
                </p>
              </form>
            </div>

            {/* ── Order Summary ─────────────────────────────────────────── */}
            <div>
              <div style={{
                background: "var(--white)",
                borderRadius: "var(--radius-xl)",
                padding: 28,
                boxShadow: "var(--shadow-md)",
                position: "sticky",
                top: 100
              }}>
                <h3 style={{ fontFamily: "var(--font-primary)", fontWeight: 700, fontSize: "1.05rem", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fas fa-receipt" style={{ color: "var(--primary)" }} />
                  Order Summary
                </h3>

                {/* Items */}
                <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 16 }}>
                  {cart.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid var(--gray-100)" }}>
                      <div style={{ width: 60, height: 60, background: "var(--base)", borderRadius: "var(--radius-md)", overflow: "hidden", flexShrink: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{item.name}</p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Qty: {item.quantity}</p>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--primary)" }}>
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ borderTop: "2px solid var(--gray-100)", paddingTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                    <span>Subtotal</span>
                    <span>৳{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 12 }}>
                    <span>Delivery</span>
                    <span style={{ color: deliveryFee === 0 ? "#22c55e" : "inherit", fontWeight: deliveryFee === 0 ? 700 : 400 }}>
                      {deliveryFee === 0 ? "FREE 🎉" : `৳${deliveryFee}`}
                    </span>
                  </div>
                  {cartSubtotal < FREE_DELIVERY_THRESHOLD && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 12 }}>
                      <i className="fas fa-info-circle" style={{ color: "var(--primary)", marginRight: 4 }} />
                      Add ৳{FREE_DELIVERY_THRESHOLD - cartSubtotal} more for free delivery
                    </p>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-primary)", fontWeight: 800, fontSize: "1.2rem", color: "var(--primary)", paddingTop: 12, borderTop: "2px solid var(--gray-200)" }}>
                    <span>Total</span>
                    <span>৳{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment icons */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--gray-100)" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 10 }}>Accepted payment methods</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className="payment-badge" style={{ background: "#fdf0f7", color: "#E2136E" }}><i className="fas fa-mobile-alt" /> bKash</span>
                    <span className="payment-badge" style={{ background: "#edf8f0", color: "#00a652" }}><i className="fas fa-mobile-alt" /> Nagad</span>
                    <span className="payment-badge" style={{ background: "#f0f4ff", color: "#1a56db" }}><i className="fas fa-credit-card" /> Card</span>
                    <span className="payment-badge"><i className="fas fa-money-bill" /> COD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </>
      )}
    </>
  );
}
