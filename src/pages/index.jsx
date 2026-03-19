/**
 * pages/index.jsx — MiniFanzo Homepage
 * Exact design match to original HTML/CSS/JS site
 */

import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { getProducts, getProductById, getCategories } from "@/lib/woocommerce";
import { fixRelativeImageUrls } from "@/lib/woocommerce";
import { CATEGORIES } from "@/lib/products";

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

  const rawDesc = wcProduct.short_description || wcProduct.description || "";
  const fixedRawDesc = fixRelativeImageUrls(decodeHTMLEntities(rawDesc), WC_URL);
  const plainDesc = decodeHTMLEntities(stripHTML(rawDesc));

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
    specs: [],
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

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onQuickView, onWishlist, inWishlist }) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  return (
    <div className="product-card">
      {product.badge && (
        <span className={`product-badge badge-${product.badge}`}>{product.badgeLabel}</span>
      )}
      <button
        className={`product-wishlist${inWishlist ? " active" : ""}`}
        onClick={() => onWishlist(product.id)}
        title="Wishlist"
      >
        <i className={`${inWishlist ? "fas" : "far"} fa-heart`} />
      </button>
      <div className="product-img-wrap" onClick={() => onQuickView(product)} style={{ cursor: "pointer" }}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-info">
        <p className="product-category">{product.categoryLabel}</p>
        <h3 className="product-name"><a href={`/products/${product.slug}`} onClick={(e) => { e.preventDefault(); onQuickView(product); }}>{product.name}</a></h3>
        <div className="product-rating">
          <StarsHTML rating={product.rating} className="stars-sm" />
          <span className="rating-text">{product.rating} ({product.reviews})</span>
        </div>
        <div className="product-price-row">
          <div>
            <span className="product-price">৳{product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <span className="product-price-old">৳{product.oldPrice.toLocaleString()}</span>
            )}
          </div>
          {discount > 0 && (
            <span className="discount-badge-desktop" style={{ fontSize: "0.72rem", background: "var(--accent)", color: "var(--primary-dark)", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>
              {discount}% OFF
            </span>
          )}
        </div>
        <div className="product-top-actions">
          {discount > 0 && (
            <span className="discount-badge-mobile" style={{ fontSize: "0.72rem", background: "var(--accent)", color: "var(--primary-dark)", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>
              {discount}% OFF
            </span>
          )}
          <button className="btn-view-mobile" onClick={() => onQuickView(product)} title="Quick View">
            <i className="fas fa-eye" />
          </button>
        </div>
        <div className="product-actions">
          <button className="btn-add-cart" onClick={() => onAddToCart(product.id, 1)}>
            <i className="fas fa-shopping-cart" /> Add to Cart
          </button>
          <button className="btn-view" onClick={() => onQuickView(product)} title="Quick View">
            <i className="fas fa-eye" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Quick View Modal ──────────────────────────────────────────────────
function ProductModal({ product, onClose, onAddToCart, onBuyNow }) {
  const [qty, setQty] = useState(1);
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);
  if (!product) return null;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  return (
    <>
      <div className="modal-overlay active" onClick={onClose} />
      <div className="product-modal active">
        <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        <div className="modal-content">
          <div className="modal-product-grid">
            <div className="modal-img-wrap">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="modal-details">
              <p className="modal-category">{product.categoryLabel} · SKU: {product.sku}</p>
              <h2 className="modal-name">{product.name}</h2>
              <div className="modal-rating">
                <StarsHTML rating={product.rating} className="stars" />
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: 4 }}>
                  {product.rating} · {product.reviews} reviews
                </span>
              </div>
              <div className="modal-price-wrap">
                <span className="modal-price">৳{product.price.toLocaleString()}</span>
                {product.oldPrice && <span className="modal-price-old">৳{product.oldPrice.toLocaleString()}</span>}
                {discount > 0 && <span className="modal-price-badge">{discount}% OFF</span>}
              </div>
              <p className="modal-desc">{product.desc}</p>
              {product.specs && product.specs.length > 0 && (
                <div className="modal-specs">
                  <h4><i className="fas fa-list-ul" style={{ color: "var(--primary)", marginRight: 6 }} />Specifications</h4>
                  <div className="spec-list">
                    {product.specs.map((s, i) => (
                      <div key={i} className="spec-item">
                        <i className="fas fa-check" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-qty">
                <label>Quantity:</label>
                <div className="qty-control">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}><i className="fas fa-minus" /></button>
                  <span className="qty-val">{qty}</span>
                  <button onClick={() => setQty(qty + 1)}><i className="fas fa-plus" /></button>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { onAddToCart(product.id, qty); onClose(); }}>
                  <i className="fas fa-shopping-cart" /> Add to Cart
                </button>
                <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => { onBuyNow(product.id, qty); onClose(); }}>
                  <i className="fas fa-bolt" /> Buy Now
                </button>
              </div>
              <a 
                href={`/products/${product.slug}`} 
                className="btn btn-outline" 
                style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <i className="fas fa-external-link-alt" /> View Full Details
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Order Modal ───────────────────────────────────────────────────────────────
function OrderModal({ cart, onClose }) {
  const { clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", payment: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = form.city === "Dhaka" ? 70 : (form.city ? 110 : 80);
  const total = subtotal + delivery;

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
        line_items: cart.map(item => ({
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
              <p>Thank you, <strong>{form.name}</strong>! Your order has been received. We will call you at <strong>{form.phone}</strong> to confirm your order and delivery details.</p>
              <p style={{ marginTop: 8, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Expected delivery: {form.city === "Dhaka" ? "1-2 business days" : "2-4 business days"}
              </p>
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
                {cart.map((item, i) => (
                  <div key={i} className="order-sum-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
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

// ── Main Homepage ─────────────────────────────────────────────────────────────
export default function HomePage({ products = [], homepageData = null, categories = CATEGORIES }) {
  const { cart, addToCart, cartCount } = useCart();
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy]             = useState("default");
  const [visibleCount, setVisibleCount] = useState(8);
  const [wishlist, setWishlist]         = useState([]);
  const [modalProduct, setModalProduct] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderCart, setOrderCart]       = useState([]);
  const [toast, setToast]               = useState({ show: false, msg: "" });
  const toastTimer = useRef(null);

  // Default values
  const defaults = {
    hero: {
      subtitle: 'New Arrivals 2026',
      title: 'Stay Cool\nAnywhere,\nAnytime.',
      description: "Bangladesh's most loved portable mini fans — crafted for your comfort, designed for your lifestyle. Beat the heat with MiniFanzo.",
      image: 'https://www.genspark.ai/api/files/s/z6GEJqHZ',
    },
    discount: {
      title: 'Buy 2 Fans, Get 15% OFF',
      description: 'Mix and match any two fans from our collection and enjoy instant savings. Perfect for gifting!',
      image: 'https://www.genspark.ai/api/files/s/uSasC68h',
    },
    about: {
      content: '<p>MiniFanzo was born from a simple idea — every Bangladeshi deserves affordable, quality cooling products. We source the best portable fans directly from premium manufacturers in China and bring them to your doorstep.</p><p>From Dhaka\'s bustling streets to Chittagong\'s coastal air — wherever you are, MiniFanzo keeps you cool. Our fans are tested for quality, safety, and durability before reaching you.</p>',
      image_1: 'https://www.genspark.ai/api/files/s/z6GEJqHZ',
      image_2: 'https://www.genspark.ai/api/files/s/uSasC68h',
      badge_text: 'Trusted Brand In 2026',
    },
    reviews: [],
    stats: {
      customers: '2026',
      products: '20+',
      rating: '4.9',
    },
  };

  // Merge with homepage data (from WP) or use defaults
  console.log('🔍 Received homepageData:', homepageData ? 'YES' : 'NO');
  
  // Handle different key names from API
  const apiHero = homepageData?.hero || {};
  const apiDiscount = homepageData?.discount || {};
  const apiAbout = homepageData?.about || {};
  const apiStats = homepageData?.stats || {};
  
  const hero = {
    ...defaults.hero,
    subtitle: apiHero.subtitle || defaults.hero.subtitle,
    title: apiHero.title || defaults.hero.title,
    description: apiHero.description || apiHero.desc || defaults.hero.description,
    image: apiHero.image || defaults.hero.image,
  };
  
  const discount = {
    ...defaults.discount,
    title: apiDiscount.title || defaults.discount.title,
    description: apiDiscount.description || apiDiscount.desc || defaults.discount.description,
    image: apiDiscount.image || defaults.discount.image,
  };
  
  const about = {
    ...defaults.about,
    content: apiAbout.content || defaults.about.content,
    image_1: apiAbout.image_1 || apiAbout.img1 || defaults.about.image_1,
    image_2: apiAbout.image_2 || apiAbout.img2 || defaults.about.image_2,
    badge_text: apiAbout.badge_text || apiAbout.badge || defaults.about.badge_text,
  };
  
  const reviews = homepageData?.reviews?.length > 0 ? homepageData.reviews : [
    { rating: 5, initials: "RA", bg: "#005840", name: "Rahim Ahmed", location: "Dhaka, Bangladesh", text: '"এই নেক ফ্যানটা আমার জীবন বদলে দিয়েছে! গরমের দিনে অফিসে যাওয়া আর কষ্টের না। সাউন্ডও নেই বললেই চলে।"' },
    { rating: 5, initials: "SB", bg: "#4a9e6b", name: "Sumaiya Begum", location: "Chittagong, Bangladesh", text: '"The burger neck fan is super cute! My daughter loves it. Battery lasts the whole day for school. Fast delivery too!"' },
    { rating: 4.5, initials: "MH", bg: "#005840", name: "Mohammad Hasan", location: "Sylhet, Bangladesh", text: '"Desk fan quality is excellent. Very powerful airflow for such a compact size. My home office is much more comfortable now."' },
    { rating: 5, initials: "FK", bg: "#4a9e6b", name: "Fatema Khatun", location: "Rajshahi, Bangladesh", text: '"দাম একদম সাশ্রয়ী, কিন্তু কোয়ালিটি অনেক ভালো। MiniFanzo থেকে ৩টা ফ্যান কিনেছি, সবগুলো পারফেক্ট!""' },
  ];
  
  const stats = {
    customers: apiStats.customers || apiStats.c || defaults.stats.customers,
    products: apiStats.products || apiStats.p || defaults.stats.products,
    rating: apiStats.rating || apiStats.r || defaults.stats.rating,
  };

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("mfz_wishlist") || "[]");
    setWishlist(saved);
  }, []);

  // Animate on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const selectors = [
      ".feature-card", ".testimonial-card", ".category-card",
      ".delivery-item", ".about-content", ".about-visual",
      ".contact-info", ".contact-form-wrap"
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(28px)";
        el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
        observer.observe(el);
      });
    });

    return () => observer.disconnect();
  }, []);

  function showToast(msg) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, msg });
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  }

  function handleAddToCart(productId, qty = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    addToCart(product, qty);
    showToast(`"${product.name}" added to cart! 🎉`);
  }

  function handleBuyNow(productId, qty = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const items = [{ ...product, quantity: qty }];
    setOrderCart(items);
    setShowOrderModal(true);
  }

  function handleCheckout() {
    // Cart items already contain all product data
    const items = cart.map(item => ({
      ...item,
      quantity: item.quantity
    }));
    setOrderCart(items);
    setShowOrderModal(true);
  }

  function handleWishlist(productId) {
    const product = products.find(p => p.id === productId);
    setWishlist(prev => {
      const newList = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem("mfz_wishlist", JSON.stringify(newList));
      if (!prev.includes(productId)) showToast(`"${product?.name}" added to wishlist! ❤️`);
      else showToast("Removed from wishlist");
      return newList;
    });
  }

  function filterByCategory(cat) {
    setActiveFilter(cat);
    setVisibleCount(8);
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Filter & sort products
  let filtered = [...products];
  if (activeFilter !== "all") filtered = filtered.filter(p => p.category === activeFilter);
  if (sortBy === "price-low")  filtered.sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
  if (sortBy === "popular")    filtered.sort((a, b) => b.reviews - a.reviews);
  if (sortBy === "newest")     filtered.sort((a, b) => b.id - a.id);
  const toShow = filtered.slice(0, visibleCount);

  return (
    <>
      <Head>
        <title>MiniFanzo — Beat the Heat | Portable Mini Fans Bangladesh</title>
        <meta name="description" content="MiniFanzo — Bangladesh's #1 destination for portable mini fans." />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />
      </Head>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="hero" id="home">
        <div className="hero-bg-shape" />
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content" data-aos="fade-right">
              <span className="hero-badge"><i className="fas fa-bolt" /> {hero.subtitle}</span>
              <h1 className="hero-title">
                {hero.title.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < hero.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>
              <p className="hero-subtitle">
                {hero.description}
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">{stats.customers}</span>
                  <span className="stat-label">New Collection</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-number">{stats.products}</span>
                  <span className="stat-label">Fan Models</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-number">Mission</span>
                  <span className="stat-label">Beat The Heat</span>
                </div>
              </div>
              <div className="hero-cta">
                <a href="#products" className="btn btn-primary" onClick={e => { e.preventDefault(); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}>
                  <i className="fas fa-wind" /> Shop Now
                </a>
                <a href="#features" className="btn btn-outline" onClick={e => { e.preventDefault(); document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }}>
                  Learn More <i className="fas fa-arrow-right" />
                </a>
              </div>
            </div>
            <div className="hero-visual" data-aos="fade-left">
              <div className="hero-img-wrapper">
                <div className="hero-glow" />
                <img
                  src={hero.image}
                  alt="MiniFanzo Product"
                  className="hero-product-img"
                />
                <div className="hero-badge-float badge-float-1">
                  <i className="fas fa-battery-full" />
                  <span>Long Battery Life</span>
                </div>
                <div className="hero-badge-float badge-float-2">
                  <i className="fas fa-volume-mute" />
                  <span>Ultra Quiet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ── CATEGORIES STRIP ────────────────────────────────────────────── */}
      <section className="categories-strip">
        <div className="container">
          <div className="categories-grid">
            {categories.map(cat => (
              <div key={cat.key} className="category-card" onClick={() => filterByCategory(cat.key)}>
                <div className="category-icon"><i className={cat.icon} /></div>
                <span className="category-name">{cat.label}</span>
                <span className="category-count">{cat.count} Products</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS SECTION ────────────────────────────────────────────── */}
      <section className="products-section" id="products">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Collection</span>
            <h2 className="section-title">Explore Our <span className="text-accent">Fan Range</span></h2>
            <p className="section-subtitle">From neck fans to desk fans — find your perfect cooling companion</p>
          </div>

          <div className="products-toolbar">
            <div className="filter-tabs">
              {[
                { key: "all",          label: "All" },
                { key: "neck-fans",    label: "Neck Fans" },
                { key: "desk-fans",    label: "Desk Fans" },
                { key: "handheld-fans", label: "Handheld" },
                { key: "clip-fans",    label: "Clip Fans" },
              ].map(f => (
                <button
                  key={f.key}
                  className={`filter-tab${activeFilter === f.key ? " active" : ""}`}
                  onClick={() => { setActiveFilter(f.key); setVisibleCount(8); }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="sort-wrap">
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          <div className="products-grid">
            {toShow.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px" }}>
                <i className="fas fa-wind" style={{ fontSize: "3rem", color: "var(--gray-300)" }} />
                <p style={{ fontSize: "1rem", color: "var(--text-muted)", marginTop: 16 }}>No products found. Try a different filter.</p>
              </div>
            ) : (
              toShow.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={product => setModalProduct(product)}
                  onWishlist={handleWishlist}
                  inWishlist={wishlist.includes(product.id)}
                />
              ))
            )}
          </div>

          <div className="load-more-wrap">
            {filtered.length > visibleCount && (
              <button className="btn btn-outline-green" onClick={() => setVisibleCount(v => v + 4)}>
                <i className="fas fa-plus" /> Load More Products
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ────────────────────────────────────────────── */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why MiniFanzo?</span>
            <h2 className="section-title">Cool Features for a <span className="text-accent">Cooler Life</span></h2>
            <p className="section-subtitle">We bring the best portable cooling technology straight from China to Bangladesh</p>
          </div>
          <div className="features-grid">
            {[
              { icon: "fas fa-bolt", color: "#005840", bg: "#e8f9e9", title: "USB Rechargeable", desc: "All fans come with USB-C or USB-A charging. No batteries needed — charge anywhere, anytime." },
              { icon: "fas fa-volume-mute", color: "#D1F843", bg: "#f0fde4", title: "Ultra Silent Motors", desc: "Whisper-quiet operation below 25dB — perfect for offices, studying, and sleeping.", dim: true },
              { icon: "fas fa-battery-three-quarters", color: "#005840", bg: "#e8f9e9", title: "Long Battery Life", desc: "Up to 12 hours of continuous cooling on a single charge. All-day comfort guaranteed." },
              { icon: "fas fa-wind", color: "#D1F843", bg: "#f0fde4", title: "3-Speed Settings", desc: "Choose your perfect airflow with Low, Medium, and High speed modes to suit every situation.", dim: true },
              { icon: "fas fa-feather-alt", color: "#005840", bg: "#e8f9e9", title: "Lightweight Design", desc: "Weighing under 200g, MiniFanzo fans are barely noticeable — pure comfort, zero burden." },
              { icon: "fas fa-palette", color: "#D1F843", bg: "#f0fde4", title: "Fun Designs", desc: "From burger-shaped to classic — express yourself with our playful, Insta-worthy fan designs.", dim: true },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ background: f.bg }}>
                  <i className={f.icon} style={{ color: f.color, filter: f.dim ? "brightness(0.6)" : "none" }} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO SECTION ───────────────────────────────────────────────── */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-card">
            <div className="promo-content">
              <span className="promo-tag">Limited Time Offer</span>
              <h2 dangerouslySetInnerHTML={{ __html: discount.title.replace(/(\d+%)/, '<span>$1</span>') }} />
              <p>{discount.description}</p>
              <a
                href="#products"
                className="btn btn-primary-light"
                onClick={e => { e.preventDefault(); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}
              >
                <i className="fas fa-tag" /> Grab the Deal
              </a>
            </div>
            <div className="promo-visual">
              <img src={discount.image} alt="MiniFanzo Product" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="testimonials-section" id="reviews">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Customer Reviews</span>
            <h2 className="section-title">What Our <span className="text-accent">Customers Say</span></h2>
          </div>
          <div className="testimonials-grid">
            {reviews.map((t, i) => (
              <div key={i} className="testimonial-card">
                <StarsHTML rating={t.rating} className="stars" />
                <p>{t.text}</p>
                <div className="reviewer">
                  <div className="reviewer-avatar" style={{ background: t.bg }}>{t.initials}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ───────────────────────────────────────────────── */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-visual">
              <div className="about-img-stack">
                <img src={about.image_1} alt="MiniFanzo Product" className="about-img-main" />
                <img src={about.image_2} alt="MiniFanzo Product" className="about-img-secondary" />
                <div className="about-badge-float">
                  <i className="fas fa-award" />
                  <div>
                    <strong>Minifanzo</strong>
                    <span>{about.badge_text}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-content">
              <div className="section-header" style={{ textAlign: "left", marginBottom: 20 }}>
                <span className="section-tag">About MiniFanzo</span>
                <h2 className="section-title" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
                  Keeping Bangladesh <span className="text-accent">Cool in 2026</span>
                </h2>
              </div>
              <div dangerouslySetInnerHTML={{ __html: about.content }} />
              <div className="about-values">
                {["Quality Tested Products", "Affordable Prices for Bangladesh", "Fast Nationwide Delivery", "30-Day Return Guarantee"].map((v, i) => (
                  <div key={i} className="value-item">
                    <i className="fas fa-check-circle" />
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <a
                href="#products"
                className="btn btn-primary"
                onClick={e => { e.preventDefault(); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}
              >
                <i className="fas fa-shopping-bag" /> Shop Our Collection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── DELIVERY STRIP ──────────────────────────────────────────────── */}
      <section className="delivery-strip">
        <div className="container">
          <div className="delivery-grid">
            {[
              { icon: "fas fa-shipping-fast", title: "Fast Delivery", desc: "Dhaka: 1-2 days | Outside Dhaka: 2-4 days" },
              { icon: "fas fa-money-bill-wave", title: "Cash on Delivery", desc: "Pay when your order arrives" },
              { icon: "fas fa-undo-alt", title: "Easy Returns", desc: "30-day hassle-free return policy" },
              { icon: "fas fa-lock", title: "Secure Payment", desc: "bKash, Nagad, Card & COD accepted" },
            ].map((d, i) => (
              <div key={i} className="delivery-item">
                <i className={d.icon} />
                <div>
                  <strong>{d.title}</strong>
                  <span>{d.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ─────────────────────────────────────────────── */}
      <section className="contact-section" id="contact">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Get In Touch</span>
            <h2 className="section-title">We&apos;re Here to <span className="text-accent">Help You</span></h2>
            <p className="section-subtitle">Have questions? Our friendly team is ready to assist you</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-info-grid">
                <div className="contact-col">
                  {[
                    { icon: "fas fa-map-marker-alt", title: "Address", text: "Mirpur, Dhaka-1216, Bangladesh" },
                    { icon: "fas fa-phone-alt", title: "Phone / WhatsApp", text: "+880 1788039222" },
                  ].map((c, i) => (
                    <div key={i} className="contact-item">
                      <div className="contact-icon"><i className={c.icon} /></div>
                      <div>
                        <strong>{c.title}</strong>
                        <span>{c.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="contact-col">
                  {[
                    { icon: "fas fa-envelope", title: "Email", text: "tjihad847@gmail.com" },
                    { icon: "fas fa-clock", title: "Business Hours", text: "Saturday – Thursday: 9AM – 9PM" },
                  ].map((c, i) => (
                    <div key={i} className="contact-item">
                      <div className="contact-icon"><i className={c.icon} /></div>
                      <div>
                        <strong>{c.title}</strong>
                        <span>{c.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="social-links">
                <a href="https://www.facebook.com/minifanzo" target="_blank" rel="noopener noreferrer" className="social-link fb"><i className="fab fa-facebook-f" /></a>
                <a href="#" className="social-link ig"><i className="fab fa-instagram" /></a>
                <a href="https://wa.me/8801788039222" target="_blank" rel="noopener noreferrer" className="social-link wa"><i className="fab fa-whatsapp" /></a>
                <a href="#" className="social-link yt"><i className="fab fa-youtube" /></a>
              </div>
            </div>
            <ContactForm showToast={showToast} />
          </div>
        </div>
      </section>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      {showOrderModal && (
        <OrderModal
          cart={orderCart}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {/* ── TOAST ───────────────────────────────────────────────────────── */}
      <div className={`toast${toast.show ? " show" : ""}`}>
        <i className="fas fa-check-circle" />
        <span>{toast.msg}</span>
      </div>
    </>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm({ showToast }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast("Your message has been sent! We'll respond soon. 📩");
      setTimeout(() => setSubmitted(false), 3000);
      e.target.reset();
    }, 1500);
  }

  return (
    <div className="contact-form-wrap">
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" placeholder="e.g. Karim Hossain" required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="e.g. 01700-000000" required />
          </div>
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="your@email.com" />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea placeholder="Write your message or order inquiry here..." rows={5} required />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {submitted
            ? <><i className="fas fa-check" /> Message Sent!</>
            : loading
              ? <><i className="fas fa-spinner fa-spin" /> Sending...</>
              : <><i className="fas fa-paper-plane" /> Send Message</>
          }
        </button>
      </form>
    </div>
  );
}

/**
 * getStaticProps — Fetch products and homepage data from WooCommerce at build time
 * Revalidates every 60 seconds (ISR — Incremental Static Regeneration)
 */
export async function getStaticProps() {
  try {
    // Fetch products from WooCommerce API
    const wcProducts = await getProducts({ per_page: 100 });
    
    // Transform WooCommerce format to app format
    const products = wcProducts.map(transformWCProduct);
    
    // Fetch categories from WooCommerce to get actual counts
    const wcCategories = await getCategories({ per_page: 100 });
    
    // Map WooCommerce categories to our category keys with counts
    const categoryMap = {
      'neck-fans': 0,
      'desk-fans': 0,
      'handheld-fans': 0,
      'clip-fans': 0,
    };
    
    // Count products by category
    products.forEach(p => {
      if (categoryMap.hasOwnProperty(p.category)) {
        categoryMap[p.category]++;
      }
    });
    
    // Update CATEGORIES with actual counts
    const categoriesWithCounts = CATEGORIES.map(cat => ({
      ...cat,
      count: categoryMap[cat.key] || 0
    }));

    // Fetch homepage data from WordPress REST API
    let homepageData = null;
    try {
      const WC_URL = process.env.NEXT_PUBLIC_WC_URL || '';
      // Remove trailing slash and /wp-json if present, then build the URL
      const baseUrl = WC_URL.replace(/\/$/, '').replace('/wp-json', '');
      // Add timestamp to prevent caching
      const homepageUrl = `${baseUrl}/wp-json/minifanzo/v1/homepage?t=${Date.now()}`;
      
      const response = await fetch(homepageUrl, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const data = await response.json();
        homepageData = data;
        console.log('✅ Homepage data fetched:', JSON.stringify(data).substring(0, 200));
      } else {
        console.log('⚠️ API error:', response.status);
      }
    } catch (e) {
      console.log('⚠️ Fetch error:', e.message);
    }

    return {
      props: { products, homepageData, categories: categoriesWithCounts },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    
    return {
      props: { products: [], homepageData: null },
      revalidate: 60,
    };
  }
}
