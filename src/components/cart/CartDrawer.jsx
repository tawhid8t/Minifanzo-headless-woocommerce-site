/**
 * components/cart/CartDrawer.jsx — MiniFanzo
 * Exact design match to original HTML/CSS/JS cart sidebar
 */

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer({ isOpen, onClose }) {
  const {
    cart,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    removeFromCart,
    updateQty,
    setDeliveryFee,
    FREE_DELIVERY_THRESHOLD,
  } = useCart();

  const [showOrderModal, setShowOrderModal] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  function handleCheckout() {
    onClose();
    setShowOrderModal(true);
  }

  // Cart items already contain all product data from CartContext
  const cartItems = cart;

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay${isOpen ? " active" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`cart-sidebar${isOpen ? " active" : ""}`} id="cartSidebar">
        <div className="cart-header">
          <h3><i className="fas fa-shopping-cart" /> Your Cart</h3>
          <button className="cart-close" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <i className="fas fa-wind" />
              <p>Your cart is empty</p>
              <button className="btn btn-primary" onClick={onClose}>Browse Fans</button>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromCart(item.id)}
                  onQtyChange={(qty) => updateQty(item.id, 0, qty)}
                />
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>
                Subtotal: {cartSubtotal >= FREE_DELIVERY_THRESHOLD ? (
                  <span style={{ fontSize: "0.78rem", color: "#22c55e", fontWeight: 600, marginLeft: 4 }}>
                    FREE delivery! 🎉
                  </span>
                ) : (
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginLeft: 4 }}>
                    (৳{FREE_DELIVERY_THRESHOLD - cartSubtotal} more for free delivery)
                  </span>
                )}
              </span>
              <strong>৳{cartTotal.toLocaleString()}</strong>
            </div>
            <button className="btn btn-primary w-full" onClick={handleCheckout}>
              <i className="fas fa-lock" /> Proceed to Order
            </button>
            <p className="cart-note">
              <i className="fas fa-truck" /> Free delivery on orders above ৳1,500
            </p>
          </div>
        )}
      </div>

      {/* Inline Order Modal */}
      {showOrderModal && (
        <OrderModal
          cartItems={cartItems}
          cartTotal={cartTotal}
          deliveryFee={deliveryFee}
          cartSubtotal={cartSubtotal}
          setDeliveryFee={setDeliveryFee}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </>
  );
}

// ── Cart Item ─────────────────────────────────────────────────────────────────
function CartItem({ item, onRemove, onQtyChange }) {
  return (
    <div className="cart-item">
      <div className="cart-item-img">
        <img src={item.image} alt={item.name} />
      </div>
      <div className="cart-item-info">
        <p className="cart-item-name">{item.name}</p>
        <p className="cart-item-price">৳{(item.price * item.quantity).toLocaleString()}</p>
        <div className="cart-item-qty">
          <button className="qty-btn" onClick={() => onQtyChange(item.quantity - 1)}>
            <i className="fas fa-minus" />
          </button>
          <span className="qty-num">{item.quantity}</span>
          <button className="qty-btn" onClick={() => onQtyChange(item.quantity + 1)}>
            <i className="fas fa-plus" />
          </button>
        </div>
      </div>
      <button className="cart-item-remove" onClick={onRemove} title="Remove">
        <i className="fas fa-trash-alt" />
      </button>
    </div>
  );
}

// ── Order Modal ───────────────────────────────────────────────────────────────
function OrderModal({ cartItems, cartTotal, deliveryFee, cartSubtotal, setDeliveryFee, onClose }) {
  const { clearCart, FREE_DELIVERY_THRESHOLD } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", payment: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
      const orderData = {
        payment_method: form.payment === "Cash on Delivery (COD)" ? "cod" : 
                        form.payment === "bKash" ? "bkash" :
                        form.payment === "Nagad" ? "nagad" : "card",
        payment_method_title: form.payment,
        set_paid: false,
        billing: {
          first_name: form.name.split(" ")[0],
          last_name: form.name.split(" ").slice(1).join(" ") || "-",
          address_1: form.address,
          city: form.city,
          country: "BD",
          phone: form.phone,
        },
        shipping: {
          first_name: form.name.split(" ")[0],
          last_name: form.name.split(" ").slice(1).join(" ") || "-",
          address_1: form.address,
          city: form.city,
          country: "BD",
        },
        line_items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        customer_note: form.notes || "",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create order");
      }

      const createdOrder = await response.json();
      console.log("Order created:", createdOrder);
      
      clearCart();
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      console.error("Order error:", err);
      setError(err.message || "Failed to place order. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <div className="order-modal-overlay active" onClick={onClose} />
        <div className="order-modal active">
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
          <div className="order-modal-content">
            <div className="order-success">
              <div className="success-icon"><i className="fas fa-check" /></div>
              <h3>Order Placed Successfully! 🎉</h3>
              <p>Thank you, <strong>{form.name}</strong>! Your order has been received. We will call you at <strong>{form.phone}</strong> to confirm.</p>
              <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 20 }}>
                <i className="fas fa-home" /> Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="order-modal-overlay active" onClick={onClose} />
      <div className="order-modal active">
        <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        <div className="order-modal-content">
          <div className="order-modal-header">
            <h3><i className="fas fa-shopping-bag" /> Place Your Order</h3>
            <p>Fill in your details and we&apos;ll confirm your order soon!</p>
          </div>
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
              <textarea placeholder="Full address with area and district..." rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Division *</label>
                <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required>
                  <option value="">Select Division</option>
                  {["Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barisal","Rangpur","Mymensingh","Other"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
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
            <div className="form-group">
              <label>Order Summary</label>
              <div className="order-summary-box">
                {cartItems.map((item, i) => (
                  <div key={i} className="order-sum-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="order-sum-item">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? <span style={{ color: "var(--primary)", fontWeight: 700 }}>FREE</span> : `৳${deliveryFee}`}</span>
                </div>
                <div className="order-sum-total">
                  <span>Total:</span>
                  <span>৳{cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Special Notes (optional)</label>
              <input type="text" placeholder="Any special instructions..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            {error && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#991b1b", fontSize: "0.9rem" }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin" /> Processing...</> : <><i className="fas fa-check-circle" /> Confirm Order</>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
