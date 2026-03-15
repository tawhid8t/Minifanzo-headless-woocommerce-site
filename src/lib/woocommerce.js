/**
 * lib/woocommerce.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WooCommerce REST API Service Layer — MiniFanzo
 *
 * This is the SINGLE source of truth for all WooCommerce data fetching.
 * All pages import from here — NOT directly from the WC API.
 *
 * Why server-side only?
 *   WC_CONSUMER_KEY & WC_CONSUMER_SECRET are server-side env vars (no
 *   NEXT_PUBLIC_ prefix), so they are NEVER exposed to the browser.
 *   All fetching happens in:
 *     - getStaticProps / getServerSideProps (Pages Router)
 *     - Server Components (App Router)
 *     - API Routes (/pages/api/*)
 *
 * WooCommerce REST API docs: https://woocommerce.github.io/woocommerce-rest-api-docs/
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Credentials (server-side only) ──────────────────────────────────────────
const WC_URL            = process.env.NEXT_PUBLIC_WC_URL;
const WC_KEY            = process.env.WC_CONSUMER_KEY;
const WC_SECRET         = process.env.WC_CONSUMER_SECRET;
const WC_API_BASE       = `${WC_URL}/wp-json/wc/v3`;

// ─── Base64 encode credentials for Basic Auth header ─────────────────────────
// WooCommerce REST API uses HTTP Basic Auth
const authHeader = () => {
  const credentials = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
  return `Basic ${credentials}`;
};

// ─── Generic fetch helper ─────────────────────────────────────────────────────
/**
 * wcFetch — Authenticated fetch to WooCommerce REST API
 * @param {string} endpoint  - e.g. "/products", "/orders"
 * @param {object} options   - fetch options (method, body, etc.)
 * @param {object} params    - query parameters as object
 * @returns {Promise<any>}   - parsed JSON response
 */
async function wcFetch(endpoint, options = {}, params = {}) {
  // Build query string from params object
  const queryString = new URLSearchParams(params).toString();
  const url = `${WC_API_BASE}${endpoint}${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Authorization": authHeader(),
      "Content-Type":  "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  // Parse error responses properly
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `WooCommerce API error: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getProducts — Fetch a list of products with optional filtering
 *
 * @param {object} params - WC query params
 *   - page        {number}  Page number (default: 1)
 *   - per_page    {number}  Items per page (default: 12)
 *   - category    {string}  Category slug or ID
 *   - search      {string}  Search keyword
 *   - orderby     {string}  "date" | "popularity" | "price" | "rating"
 *   - order       {string}  "asc" | "desc"
 *   - status      {string}  "publish" (default)
 *   - featured    {boolean} Only featured products
 *   - on_sale     {boolean} Only on-sale products
 *   - tag         {string}  Tag slug
 * @returns {Promise<Array>} Array of product objects
 *
 * WC Product fields returned:
 *   id, name, slug, permalink, status, featured,
 *   description, short_description, sku, price,
 *   regular_price, sale_price, on_sale,
 *   images: [{id, src, alt}],
 *   categories: [{id, name, slug}],
 *   tags: [{id, name, slug}],
 *   attributes: [{name, options}],
 *   stock_status, stock_quantity,
 *   average_rating, rating_count
 */
export async function getProducts(params = {}) {
  return wcFetch("/products", {}, {
    per_page: 100,
    status:   "publish",
    _embed:   true,
    ...params,
  });
}

/**
 * getProductBySlug — Fetch a single product by its slug
 * Used on product detail pages: /products/[slug]
 *
 * @param {string} slug - product slug (URL-friendly name)
 * @returns {Promise<object|null>} product object or null if not found
 */
export async function getProductBySlug(slug) {
  const products = await wcFetch("/products", {}, { slug, _embed: true });
  return products.length > 0 ? products[0] : null;
}

/**
 * getProductById — Fetch a single product by its WooCommerce ID
 * Useful for cart price verification server-side.
 *
 * @param {number|string} id - WooCommerce product ID
 * @returns {Promise<object>} product object
 */
export async function getProductById(id) {
  return wcFetch(`/products/${id}`);
}

/**
 * getFeaturedProducts — Shortcut to fetch featured products
 * Used on the homepage hero/featured section.
 *
 * @param {number} limit - how many products to fetch (default: 8)
 * @returns {Promise<Array>}
 */
export async function getFeaturedProducts(limit = 8) {
  return wcFetch("/products", {}, {
    featured:  true,
    per_page:  limit,
    status:    "publish",
    _embed:    true,
  });
}

/**
 * getOnSaleProducts — Fetch products currently on sale
 * Used on the promotions/deals section.
 *
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getOnSaleProducts(limit = 8) {
  return wcFetch("/products", {}, {
    on_sale:   true,
    per_page:  limit,
    status:    "publish",
    _embed:    true,
  });
}

/**
 * getNewArrivals — Fetch newest products (sorted by date)
 *
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getNewArrivals(limit = 8) {
  return wcFetch("/products", {}, {
    orderby:   "date",
    order:     "desc",
    per_page:  limit,
    status:    "publish",
    _embed:    true,
  });
}

/**
 * getProductsByCategory — Fetch products filtered by category
 * Used on the category/shop page.
 *
 * @param {number|string} categoryId - WC category ID
 * @param {object} params - additional query params
 * @returns {Promise<Array>}
 */
export async function getProductsByCategory(categoryId, params = {}) {
  return wcFetch("/products", {}, {
    category: categoryId,
    status:   "publish",
    per_page: 12,
    _embed:   true,
    ...params,
  });
}

/**
 * getRelatedProducts — Fetch related products by category
 * Shown at the bottom of product detail pages.
 *
 * @param {number} categoryId
 * @param {number} excludeId - exclude the current product
 * @param {number} limit
 */
export async function getRelatedProducts(categoryId, excludeId, limit = 4) {
  return wcFetch("/products", {}, {
    category: categoryId,
    exclude:  excludeId,
    per_page: limit,
    status:    "publish",
    _embed:    true,
  });
}

/**
 * getAllProductSlugs — Get all product slugs for static generation
 * Used in getStaticPaths to pre-build all product pages.
 *
 * @returns {Promise<Array<{slug: string}>>}
 */
export async function getAllProductSlugs() {
  // Fetch up to 100 products — increase per_page if you have more
  const products = await wcFetch("/products", {}, {
    per_page: 100,
    status:   "publish",
    fields:   "slug",
  });
  return products.map((p) => ({ slug: p.slug }));
}

// ─────────────────────────────────────────────────────────────────────────────
//  CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getCategories — Fetch all product categories
 * Used in navigation, filter sidebar, and category strip on homepage.
 *
 * @param {object} params
 * @returns {Promise<Array>} Array of category objects:
 *   { id, name, slug, count, image: {src, alt}, parent }
 */
export async function getCategories(params = {}) {
  return wcFetch("/products/categories", {}, {
    per_page: 50,
    hide_empty: true,   // only categories with products
    ...params,
  });
}

/**
 * getCategoryBySlug — Get a single category by slug
 *
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getCategoryBySlug(slug) {
  const cats = await wcFetch("/products/categories", {}, { slug });
  return cats.length > 0 ? cats[0] : null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  REVIEWS / RATINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getProductReviews — Fetch reviews for a specific product
 *
 * @param {number} productId
 * @param {number} limit
 * @returns {Promise<Array>} Review objects:
 *   { id, reviewer, reviewer_email, review (HTML), rating, verified, date_created }
 */
export async function getProductReviews(productId, limit = 10) {
  return wcFetch("/products/reviews", {}, {
    product: productId,
    per_page: limit,
    status:  "approved",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  ORDERS  (server-side / API routes only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * createOrder — Create a new WooCommerce order
 * Called ONLY from /api/orders (server-side API route).
 * Never call this from client components — it exposes WC credentials.
 *
 * @param {object} orderData - WooCommerce order payload:
 * {
 *   payment_method: "cod" | "bkash" | "card",
 *   payment_method_title: "Cash on Delivery" | "bKash" | "Credit/Debit Card",
 *   set_paid: false,
 *   billing: {
 *     first_name, last_name, address_1, address_2,
 *     city, state, postcode, country: "BD",
 *     email, phone
 *   },
 *   shipping: { same as billing },
 *   line_items: [
 *     { product_id: 123, quantity: 2 },
 *     { product_id: 456, variation_id: 789, quantity: 1 }
 *   ],
 *   shipping_lines: [
 *     { method_id: "flat_rate", method_title: "Flat Rate", total: "80" }
 *   ],
 *   customer_note: "..."
 * }
 *
 * @returns {Promise<object>} Created order object with { id, order_key, status, ... }
 */
export async function createOrder(orderData) {
  return wcFetch("/orders", {
    method: "POST",
    // Don't use ISR cache for mutations
    next:   { revalidate: 0 },
    body:   JSON.stringify(orderData),
  });
}

/**
 * getOrderById — Fetch a single order (for order confirmation page)
 *
 * @param {number} orderId
 * @returns {Promise<object>} Order object
 */
export async function getOrderById(orderId) {
  return wcFetch(`/orders/${orderId}`, {
    next: { revalidate: 0 },  // always fresh for order status
  });
}

/**
 * updateOrder — Update an existing order (e.g., mark as paid after bKash)
 *
 * @param {number} orderId
 * @param {object} updateData - fields to update, e.g. { status: "processing" }
 * @returns {Promise<object>}
 */
export async function updateOrder(orderId, updateData) {
  return wcFetch(`/orders/${orderId}`, {
    method: "PUT",
    next:   { revalidate: 0 },
    body:   JSON.stringify(updateData),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  COUPONS (optional)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * validateCoupon — Check if a coupon code is valid
 *
 * @param {string} code - coupon code entered by user
 * @returns {Promise<object|null>} coupon object or null if invalid
 */
export async function validateCoupon(code) {
  const coupons = await wcFetch("/coupons", {}, { code });
  return coupons.length > 0 ? coupons[0] : null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHIPPING ZONES (optional — for dynamic shipping rates)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getShippingZones — Fetch all WooCommerce shipping zones
 * Useful for showing delivery estimates based on district.
 *
 * @returns {Promise<Array>}
 */
export async function getShippingZones() {
  return wcFetch("/shipping/zones");
}

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * formatPrice — Format a WooCommerce price string to BDT display
 *
 * @param {string|number} price - price value (WC returns strings)
 * @returns {string} e.g. "৳1,290"
 */
export function formatPrice(price) {
  const num = parseFloat(price) || 0;
  return `৳${num.toLocaleString("en-BD")}`;
}

/**
 * getDiscountPercent — Calculate discount percentage between regular and sale price
 *
 * @param {string} regularPrice
 * @param {string} salePrice
 * @returns {number} discount % (0 if no sale)
 */
export function getDiscountPercent(regularPrice, salePrice) {
  const reg  = parseFloat(regularPrice);
  const sale = parseFloat(salePrice);
  if (!reg || !sale || sale >= reg) return 0;
  return Math.round(((reg - sale) / reg) * 100);
}

/**
 * getProductImage — Get first product image src with fallback
 *
 * @param {Array} images - product.images array from WC
 * @param {number} index - image index (default 0 = main image)
 * @returns {string} image URL
 */
export function getProductImage(images, index = 0) {
  if (!images || images.length === 0) return "/images/placeholder.jpg";
  return images[index]?.src || "/images/placeholder.jpg";
}

/**
 * stripHtml — Strip HTML tags from WC descriptions (safe for <p>, <br>, etc.)
 *
 * @param {string} html
 * @returns {string} plain text
 */
export function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * getBadgeInfo — Determine which badge to show on a product card
 *
 * Priority: New → Featured → On Sale
 *
 * @param {object} product - WC product object
 * @returns {{ label: string, style: string } | null}
 */
export function getBadgeInfo(product) {
  const daysSinceCreated = (Date.now() - new Date(product.date_created).getTime()) / 86400000;
  if (daysSinceCreated < 30) return { label: "New",        style: "badge-new" };
  if (product.featured)      return { label: "Featured",   style: "badge-hot" };
  if (product.on_sale)       return { label: "Sale",       style: "badge-sale" };
  return null;
}

/**
 * fixRelativeImageUrls — Convert relative URLs in HTML content to absolute URLs
 * WooCommerce often stores image URLs as relative paths (e.g., /wp-content/uploads/...)
 * This helper converts them to absolute URLs using the WC store URL
 *
 * @param {string} htmlContent - HTML content with potential relative image URLs
 * @param {string} baseUrl - The base URL of the WordPress site (e.g., https://example.com)
 * @returns {string} HTML content with absolute image URLs
 */
export function fixRelativeImageUrls(htmlContent, baseUrl) {
  if (!htmlContent || !baseUrl) return htmlContent;
  
  var pattern = 'src=["' + "'" + '](/wp-content/uploads/[^"' + "'" + ']+)["' + "'" + ']';
  var regex = new RegExp(pattern, 'g');
  
  return htmlContent.replace(regex, function(match, path) {
      var absoluteUrl = path.indexOf('http') === 0 ? path : baseUrl + path;
      return 'src="' + absoluteUrl + '"';
  });
}
