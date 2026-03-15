/**
 * pages/shop/index.jsx — MiniFanzo Shop
 * Exact design match to original HTML/CSS/JS products section
 */

import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import { getProducts } from "@/lib/woocommerce";
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

// ── Product Card (exact match) ────────────────────────────────────────────────
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
            <span style={{ fontSize: "0.72rem", background: "var(--accent)", color: "var(--primary-dark)", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>
              {discount}% OFF
            </span>
          )}
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

// ── Product Modal ─────────────────────────────────────────────────────────────
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
                <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => { onBuyNow(product, qty); onClose(); }}>
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

export default function ShopPage({ products = [] }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy]             = useState("default");
  const [visibleCount, setVisibleCount] = useState(12);
  const [wishlist, setWishlist]         = useState([]);
  const [modalProduct, setModalProduct] = useState(null);
  const [toast, setToast]               = useState({ show: false, msg: "" });
  const [searchQuery, setSearchQuery]   = useState("");
  const toastTimer = useRef(null);

  // Read category/search from URL query
  useEffect(() => {
    if (router.query.category) setActiveFilter(router.query.category);
    if (router.query.search)   setSearchQuery(router.query.search);
  }, [router.query]);

  // Load wishlist
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("mfz_wishlist") || "[]");
    setWishlist(saved);
  }, []);

  // Scroll animations
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
      { threshold: 0.1 }
    );
    document.querySelectorAll(".product-card").forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [activeFilter, sortBy, visibleCount]);

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

  // Filter, search & sort
  let filtered = [...products];
  if (activeFilter !== "all") filtered = filtered.filter(p => p.category === activeFilter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  }
  if (sortBy === "price-low")  filtered.sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
  if (sortBy === "popular")    filtered.sort((a, b) => b.reviews - a.reviews);
  if (sortBy === "newest")     filtered.sort((a, b) => b.id - a.id);
  const toShow = filtered.slice(0, visibleCount);

  return (
    <>
      <Head>
        <title>Shop — MiniFanzo | Portable Mini Fans Bangladesh</title>
        <meta name="description" content="Browse our full range of portable mini fans — neck fans, desk fans, handheld fans & clip fans." />
      </Head>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, var(--base) 0%, #d8ede9 50%, #c5e8e0 100%)",
        padding: "60px 0 48px",
        textAlign: "center"
      }}>
        <div className="container">
          <span className="section-tag">Our Collection</span>
          <h1 className="section-title" style={{ marginTop: 8 }}>
            All <span className="text-accent">Fan Products</span>
          </h1>
          <p className="section-subtitle">
            Find your perfect cooling companion from our full range
          </p>
        </div>
      </div>

      {/* ── CATEGORIES STRIP ────────────────────────────────────────────── */}
      <section className="categories-strip">
        <div className="container">
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <div
                key={cat.key}
                className={`category-card${activeFilter === cat.key ? " active" : ""}`}
                onClick={() => { setActiveFilter(cat.key); setVisibleCount(12); }}
                style={activeFilter === cat.key ? { borderColor: "var(--primary)", background: "var(--white)", boxShadow: "var(--shadow-md)" } : {}}
              >
                <div className="category-icon"><i className={cat.icon} /></div>
                <span className="category-name">{cat.label}</span>
                <span className="category-count">{cat.count} Products</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS SECTION ────────────────────────────────────────────── */}
      <section className="products-section" id="products" style={{ paddingTop: 48 }}>
        <div className="container">

          {/* Search bar */}
          {searchQuery && (
            <div style={{ marginBottom: 24, padding: "14px 20px", background: "var(--white)", borderRadius: "var(--radius-md)", border: "2px solid var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Showing results for: <strong style={{ color: "var(--primary)" }}>&quot;{searchQuery}&quot;</strong>
              </span>
              <button
                onClick={() => { setSearchQuery(""); router.push("/shop"); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem" }}
              >
                <i className="fas fa-times" /> Clear
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="filter-tabs">
              {[
                { key: "all",      label: "All" },
                { key: "neck",     label: "Neck Fans" },
                { key: "desk",     label: "Desk Fans" },
                { key: "handheld", label: "Handheld" },
                { key: "clip",     label: "Clip Fans" },
              ].map(f => (
                <button
                  key={f.key}
                  className={`filter-tab${activeFilter === f.key ? " active" : ""}`}
                  onClick={() => { setActiveFilter(f.key); setVisibleCount(12); }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="sort-wrap" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {filtered.length} products
              </span>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="products-grid">
            {toShow.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px" }}>
                <i className="fas fa-wind" style={{ fontSize: "3rem", color: "var(--gray-300)" }} />
                <p style={{ fontSize: "1rem", color: "var(--text-muted)", marginTop: 16 }}>No products found. Try a different filter.</p>
                <button className="btn btn-outline-green" style={{ marginTop: 20 }} onClick={() => { setActiveFilter("all"); setSearchQuery(""); }}>
                  <i className="fas fa-redo" /> Reset Filters
                </button>
              </div>
            ) : (
              toShow.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={p => setModalProduct(p)}
                  onWishlist={handleWishlist}
                  inWishlist={wishlist.includes(product.id)}
                />
              ))
            )}
          </div>

          {/* Load More */}
          <div className="load-more-wrap">
            {filtered.length > visibleCount && (
              <button className="btn btn-outline-green" onClick={() => setVisibleCount(v => v + 8)}>
                <i className="fas fa-plus" /> Load More Products
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={(product, qty) => {
            handleAddToCart(product.id, qty);
            setModalProduct(null);
          }}
        />
      )}

      {/* Toast */}
      <div className={`toast${toast.show ? " show" : ""}`}>
        <i className="fas fa-check-circle" />
        <span>{toast.msg}</span>
      </div>
    </>
  );
}

/**
 * getStaticProps — Fetch products from WooCommerce at build time
 * Revalidates every 60 seconds (ISR — Incremental Static Regeneration)
 */
export async function getStaticProps() {
  try {
    // Fetch products from WooCommerce API
    const wcProducts = await getProducts({ per_page: 100 });
    
    // Transform WooCommerce format to app format
    const products = wcProducts.map(transformWCProduct);

    return {
      props: { products },
    };
  } catch (error) {
    console.error("Error fetching products from WooCommerce:", error);
    
    return {
      props: { products: [] },
    };
  }
}
