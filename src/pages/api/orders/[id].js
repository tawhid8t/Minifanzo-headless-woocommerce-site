/**
 * pages/api/orders/[id].js
 * ─────────────────────────────────────────────────────────────────────────────
 * API Route: Get / Update Single WooCommerce Order — MiniFanzo
 *
 * GET  /api/orders/[id]  — fetch order by ID (for order confirmation page)
 * PUT  /api/orders/[id]  — update order (e.g., mark as paid after bKash)
 *
 * Server-side only — hides WC credentials from browser.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getOrderById, updateOrder } from "@/lib/woocommerce";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  // ── GET: Fetch order ──────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const order = await getOrderById(Number(id));
      return res.status(200).json(order);
    } catch (error) {
      console.error(`[API /api/orders/${id} GET] Error:`, error.message);
      return res.status(error.message.includes("404") ? 404 : 500).json({
        message: error.message || "Failed to fetch order",
      });
    }
  }

  // ── PUT: Update order ─────────────────────────────────────────────────────
  if (req.method === "PUT") {
    try {
      const updateData = req.body;
      if (!updateData || typeof updateData !== "object") {
        return res.status(400).json({ message: "Invalid update data" });
      }
      const order = await updateOrder(Number(id), updateData);
      return res.status(200).json(order);
    } catch (error) {
      console.error(`[API /api/orders/${id} PUT] Error:`, error.message);
      return res.status(500).json({
        message: error.message || "Failed to update order",
      });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
