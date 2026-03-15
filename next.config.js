/**
 * next.config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MiniFanzo — Next.js Configuration
 *
 * Key settings:
 *  - images.domains: allow WooCommerce media and remote image hosts
 *  - env: expose NEXT_PUBLIC_ vars to the browser
 *  - async rewrites: proxy WooCommerce API calls to hide credentials
 *  - headers: add security headers
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // ── Image optimization ──────────────────────────────────────────────────────
  // Add your WooCommerce domain so next/image can optimize product photos.
  // Replace "yourdomain.com" with your actual WooCommerce site domain.
  images: {
    remotePatterns: [
      {
        // Your WooCommerce WordPress site — replace with actual domain
        protocol: "https",
        hostname:  "yourdomain.com",
        pathname:  "/wp-content/uploads/**",
      },
      {
        // Common pattern if hosted on a subdomain e.g. shop.yourdomain.com
        protocol: "https",
        hostname:  "shop.yourdomain.com",
        pathname:  "/wp-content/uploads/**",
      },
      {
        // Allow any http domain in dev (remove in production)
        protocol: "http",
        hostname:  "localhost",
      },
      {
        // Placeholder images (picsum, etc.)
        protocol: "https",
        hostname:  "picsum.photos",
      },
      {
        protocol: "https",
        hostname:  "via.placeholder.com",
      },
    ],
    // Image formats — prefer AVIF then WebP for better compression
    formats: ["image/avif", "image/webp"],
    // Minimum cache TTL for optimized images (1 week)
    minimumCacheTTL: 604800,
  },

  // ── Environment variables ───────────────────────────────────────────────────
  // NEXT_PUBLIC_* vars are automatically available on both server and client.
  // Non-prefixed vars (WC_CONSUMER_KEY etc.) are server-side only.
  env: {
    // Exposed to browser — the frontend WooCommerce site URL
    NEXT_PUBLIC_WC_URL:       process.env.NEXT_PUBLIC_WC_URL       || "",
    NEXT_PUBLIC_SITE_NAME:    process.env.NEXT_PUBLIC_SITE_NAME    || "MiniFanzo",
    NEXT_PUBLIC_WHATSAPP_NO:  process.env.NEXT_PUBLIC_WHATSAPP_NO  || "8801700000000",
    NEXT_PUBLIC_BKASH_APP_KEY:process.env.NEXT_PUBLIC_BKASH_APP_KEY|| "",
  },

  // ── Compiler options ────────────────────────────────────────────────────────
  compiler: {
    // Remove console.log in production builds (keeps console.warn/error)
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ── Experimental features ────────────────────────────────────────────────────
  experimental: {
    // Optimize package imports (tree-shake large icon libraries)
    optimizePackageImports: ["react-icons", "framer-motion"],
  },

  // ── Headers — security hardening ─────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",      value: "nosniff" },
          { key: "X-Frame-Options",              value: "DENY" },
          { key: "X-XSS-Protection",             value: "1; mode=block" },
          { key: "Referrer-Policy",              value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",           value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // ── Rewrites — proxy internal API calls ──────────────────────────────────────
  // All WooCommerce fetches happen server-side via lib/woocommerce.js.
  // These rewrites are for convenience if you ever need client-side proxy.
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
