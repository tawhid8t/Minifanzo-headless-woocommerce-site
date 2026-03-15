/**
 * pages/products/[slug].jsx — MiniFanzo Product Detail
 * Exact design match to original HTML/CSS/JS site
 */

import Head from "next/head";
import { useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { getProductBySlug, getProducts } from "@/lib/woocommerce";
import { fixRelativeImageUrls } from "@/lib/woocommerce";

const WC_URL = process.env.NEXT_PUBLIC_WC_URL || '';

function decodeHTMLEntities(text) {
  if (!text) return "";
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;#/g, '&#');
}

function stripHTML(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, '');
}

// Transform WooCommerce product to app format
function transformWCProduct(wcProduct) {
  const regularPrice = parseFloat(wcProduct.regular_price || wcProduct.price || 0);
  const salePrice = parseFloat(wcProduct.sale_price || wcProduct.price || 0);
  const displayPrice = salePrice || regularPrice;

  // Use description if short_description is empty
  const rawDesc = wcProduct.description || wcProduct.short_description || "";
  const fixedRawDesc = fixRelativeImageUrls(decodeHTMLEntities(rawDesc), WC_URL);
  const plainDesc = decodeHTMLEntities(stripHTML(rawDesc));

  // Get all attributes including non-visible ones
  const specs = (wcProduct.attributes || [])
    .map(attr => ({
      name: attr.name,
      options: Array.isArray(attr.options) ? attr.options.join(", ") : String(attr.options || "")
    }))
    .filter(attr => attr.options);

  const allImages = (wcProduct.images || []).map(img => ({
    id: img.id,
    src: img.src,
    alt: img.alt || wcProduct.name
  }));

  return {
    id: wcProduct.id,
    name: wcProduct.name,
    category: wcProduct.categories?.[0]?.slug || "other",
    categoryLabel: wcProduct.categories?.[0]?.name || "Other",
    price: Math.round(displayPrice),
    oldPrice: salePrice && regularPrice > salePrice ? Math.round(regularPrice) : null,
    image: wcProduct.images?.[0]?.src || "https://via.placeholder.com/300x300",
    images: allImages.length > 0 ? allImages : [{ id: 1, src: "https://via.placeholder.com/300x300", alt: wcProduct.name }],
    badge: wcProduct.featured ? "bestseller" : wcProduct.on_sale ? "sale" : null,
    badgeLabel: wcProduct.featured ? "Best Seller" : wcProduct.on_sale ? "On Sale" : "",
    rating: parseFloat(wcProduct.average_rating || 0) || 4.5,
    reviews: parseInt(wcProduct.rating_count || 0) || 0,
    sku: wcProduct.sku || "",
    slug: wcProduct.slug,
    desc: plainDesc,
    rawDesc: fixedRawDesc,
    specs,
    featured: wcProduct.featured || false,
  };
}

// ── Stars helper ──────────────────────────────────────────────────────────────
function StarsHTML({ rating, className = "" }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className={className}>
      {Array(full).fill(0).map((_, i) => <i key={`f${i}`} className="fas fa-star" />)}
      {half && <i className="fas fa-star-half-alt" />}
      {Array(empty).fill(0).map((_, i) => <i key={`e${i}`} className="far fa-star" />)}
    </span>
  );
}

export default function ProductDetailPage({ product }) {
  const { addToCart } = useCart();
  const [qty, setQty]             = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [toast, setToast]         = useState({ show: false, msg: "" });
  const toastTimer = useRef(null);

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <i className="fas fa-wind" style={{ fontSize: "4rem", color: "var(--gray-300)" }} />
        <h2 style={{ marginTop: 20, fontFamily: "var(--font-primary)", color: "var(--text-primary)" }}>Product Not Found</h2>
        <a href="/shop" className="btn btn-primary" style={{ marginTop: 20, display: "inline-flex" }}>
          <i className="fas fa-arrow-left" /> Back to Shop
        </a>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  function showToast(msg) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, msg });
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  }

  function handleAddToCart() {
    addToCart(product, qty);
    showToast(`"${product.name}" added to cart! 🎉`);
  }

  // Related products would need to be fetched from WooCommerce - disabled for now
  // const related = ...

  return (
    <>
      <Head>
        <title>{product.name} — MiniFanzo</title>
        <meta name="description" content={product.desc} />
      </Head>

      {/* ── BREADCRUMB ──────────────────────────────────────────────────── */}
      <div style={{ background: "var(--base)", padding: "16px 0", borderBottom: "1px solid var(--gray-200)" }}>
        <div className="container">
          <nav style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/" style={{ color: "var(--text-muted)" }}>Home</a>
            <i className="fas fa-chevron-right" style={{ fontSize: "0.65rem" }} />
            <a href="/shop" style={{ color: "var(--text-muted)" }}>Shop</a>
            <i className="fas fa-chevron-right" style={{ fontSize: "0.65rem" }} />
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── PRODUCT DETAIL ──────────────────────────────────────────────── */}
      <section style={{ padding: "60px 0 80px", background: "var(--white)" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "start"
          }} className="product-detail-grid">

            {/* Product Image Gallery */}
            <div style={{ background: "var(--base)", borderRadius: "var(--radius-xl)", padding: 20 }}>
              <div style={{ position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden", aspectRatio: "1/1", background: "var(--white)", cursor: "pointer" }}>
                <img
                  src={product.images?.[activeImageIndex]?.src || product.image}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
                {product.images?.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImageIndex(i => (i - 1 + product.images.length) % product.images.length)}
                      style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <i className="fas fa-chevron-left" style={{ color: "var(--text-primary)" }} />
                    </button>
                    <button 
                      onClick={() => setActiveImageIndex(i => (i + 1) % product.images.length)}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <i className="fas fa-chevron-right" style={{ color: "var(--text-primary)" }} />
                    </button>
                  </>
                )}
              </div>
              {product.images?.length > 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 12 }}>
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: "var(--radius-lg)",
                        overflow: "hidden",
                        border: idx === activeImageIndex ? "2px solid var(--primary)" : "2px solid transparent",
                        padding: 0,
                        background: "var(--white)",
                        cursor: "pointer"
                      }}
                    >
                      <img src={img.src} alt={img.alt || `${product.name} view ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Badge + Category */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  color: "var(--text-muted)"
                }}>
                  {product.categoryLabel}
                </span>
                {product.badge && (
                  <span className={`product-badge badge-${product.badge}`} style={{ position: "static" }}>
                    {product.badgeLabel}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 style={{
                fontFamily: "var(--font-primary)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                lineHeight: 1.25,
                marginBottom: 14
              }}>
                {product.name}
              </h1>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <StarsHTML rating={product.rating} className="stars" />
                <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  {product.rating} · {product.reviews} reviews
                </span>
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <span style={{
                  fontFamily: "var(--font-primary)",
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "var(--primary)"
                }}>
                  ৳{product.price.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span style={{ fontSize: "1.1rem", color: "var(--gray-400)", textDecoration: "line-through" }}>
                    ৳{product.oldPrice.toLocaleString()}
                  </span>
                )}
                {discount > 0 && (
                  <span className="modal-price-badge">{discount}% OFF</span>
                )}
              </div>

              {/* Description */}
              <div 
                className="product-desc"
                style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 24 }} 
                dangerouslySetInnerHTML={{ __html: product.rawDesc || '' }} 
              />

              {/* Specs */}
              {product.specs.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h4 style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--text-primary)",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em"
                }}>
                  <i className="fas fa-list-ul" style={{ color: "var(--primary)", marginRight: 8 }} />
                  Specifications
                </h4>
                <div className="spec-list">
                  {product.specs.map((s, i) => (
                    <div key={i} className="spec-item">
                      <i className="fas fa-check" />
                      <span>{s.name}: {s.options}</span>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* SKU */}
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 24 }}>
                SKU: <strong>{product.sku}</strong>
              </p>

              {/* Quantity */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Quantity:</label>
                <div className="qty-control">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}><i className="fas fa-minus" /></button>
                  <span className="qty-val">{qty}</span>
                  <button onClick={() => setQty(qty + 1)}><i className="fas fa-plus" /></button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddToCart}>
                  <i className="fas fa-shopping-cart" /> Add to Cart
                </button>
                <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => {
                  addToCart(product, qty);
                  setShowOrderModal(true);
                }}>
                  <i className="fas fa-bolt" /> Buy Now
                </button>
              </div>

              {/* Trust badges */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                marginTop: 28,
                padding: 20,
                background: "var(--base)",
                borderRadius: "var(--radius-lg)"
              }}>
                {[
                  { icon: "fas fa-shipping-fast", text: "Free delivery above ৳1,500" },
                  { icon: "fas fa-undo-alt", text: "30-day easy returns" },
                  { icon: "fas fa-shield-alt", text: "Quality tested product" },
                  { icon: "fas fa-money-bill-wave", text: "Cash on delivery" },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    <i className={b.icon} style={{ color: "var(--primary)", fontSize: "1rem", width: 16 }} />
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products - Coming Soon */}
      {/* Related products would be fetched from WooCommerce API */}

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal
          product={product}
          qty={qty}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {/* Toast */}
      <div className={`toast${toast.show ? " show" : ""}`}>
        <i className="fas fa-check-circle" />
        <span>{toast.msg}</span>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
        .product-desc img {
          max-width: 100% !important;
          height: auto !important;
          margin: 16px 0 !important;
          display: block !important;
        }
        .product-desc p {
          margin-bottom: 16px !important;
        }
        .spec-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .spec-item {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .spec-item i {
          color: var(--primary);
          font-size: 0.75rem;
        }
      `}</style>
      <style jsx>{`
        :global(.product-desc img) {
          max-width: 100%;
          height: auto;
          margin: 10px 0;
        }
      `}</style>
    </>
  );
}

// ── Order Modal ───────────────────────────────────────────────────────────────
function OrderModal({ product, qty, onClose }) {
  const { clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", payment: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const delivery = form.city === "Dhaka" ? 70 : (form.city ? 110 : 80);
  const total = product.price * qty + delivery;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.payment) return;
    
    setError("");
    setLoading(true);

    try {
      const orderData = {
        payment_method: form.payment,
        payment_method_title: form.payment === "cod" ? "Cash on Delivery" : form.payment.toUpperCase(),
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
        line_items: [{
          product_id: product.id,
          quantity: qty,
        }],
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
              <p>Thank you, <strong>{form.name}</strong>! We will call you at <strong>{form.phone}</strong> to confirm.</p>
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
              <textarea placeholder="Full address..." rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Division *</label>
                <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required>
                  <option value="">Select Division</option>
                  {["Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barisal","Rangpur","Mymensingh","Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Payment *</label>
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
                <div className="order-sum-item">
                  <span>{product.name} × {qty}</span>
                  <span>৳{(product.price * qty).toLocaleString()}</span>
                </div>
                <div className="order-sum-item">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? <span style={{ color: "var(--primary)", fontWeight: 700 }}>FREE</span> : `৳${delivery}`}</span>
                </div>
                <div className="order-sum-total">
                  <span>Total:</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
              </div>
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

// ── Static paths + props ──────────────────────────────────────────────────────
export async function getStaticPaths() {
  try {
    // Fetch all products from WooCommerce API
    const wcProducts = await getProducts({ per_page: 100 });
    
    // Generate paths for each product
    const paths = wcProducts.map(p => ({
      params: { slug: p.slug }
    }));

    return {
      paths,
      fallback: "blocking", // Use blocking mode to handle new products
    };
  } catch (error) {
    console.error("Error fetching products for static paths:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const wcProduct = await getProductBySlug(params.slug);
    
    if (!wcProduct) {
      return { notFound: true };
    }

    const product = transformWCProduct(wcProduct);

    return {
      props: { product },
    };
  } catch (error) {
    console.error(`Error fetching product ${params.slug}:`, error);
    return { notFound: true };
  }
}
