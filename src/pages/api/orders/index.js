/**
 * pages/api/orders/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API Route: Create WooCommerce Order — MiniFanzo
 *
 * POST /api/orders
 *
 * Why server-side?
 *   WC_CONSUMER_KEY & WC_CONSUMER_SECRET are NEVER exposed to the browser.
 *   All WooCommerce mutations go through these API routes.
 *
 * Request body: WooCommerce order payload (see lib/woocommerce.js createOrder)
 * Response: Created order object { id, order_key, status, ... }
 *
 * Error handling:
 *  - 400: Missing or invalid request body
 *  - 405: Method not allowed (only POST)
 *  - 500: WooCommerce API error
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createOrder } from "@/lib/woocommerce";

export default async function handler(req, res) {
  // ── Only allow POST ────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const orderData = req.body;

    // ── Basic validation ──────────────────────────────────────────────────
    if (!orderData || !orderData.line_items || orderData.line_items.length === 0) {
      return res.status(400).json({ message: "Order must have at least one item" });
    }

    if (!orderData.billing?.phone && !orderData.billing?.email) {
      return res.status(400).json({ message: "Billing phone or email is required" });
    }

    // ── Create order in WooCommerce ───────────────────────────────────────
    const order = await createOrder(orderData);

    // ── Return created order ──────────────────────────────────────────────
    return res.status(201).json(order);

  } catch (error) {
    console.error("[API /api/orders] Error:", error.message);
    return res.status(500).json({
      message: error.message || "Failed to create order",
    });
  }
}
