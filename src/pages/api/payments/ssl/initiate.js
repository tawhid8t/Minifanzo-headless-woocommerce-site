/**
 * pages/api/payments/ssl/initiate.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SSLCommerz Payment Initiation — MiniFanzo
 *
 * Used for Credit/Debit Card payments via SSLCommerz gateway.
 *
 * Flow:
 *  1. Client POSTs { orderId, amount, billing } to this route
 *  2. We POST to SSLCommerz /session API with order data
 *  3. Return { GatewayPageURL } to client for redirect
 *
 * Environment Variables:
 *   SSLCZ_STORE_ID       — SSLCommerz store ID
 *   SSLCZ_STORE_PASSWORD — SSLCommerz store password
 *   SSLCZ_IS_LIVE        — "true" for production, "false" for sandbox
 *
 * SSLCommerz Docs: https://developer.sslcommerz.com/doc/v4/
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STORE_ID   = process.env.SSLCZ_STORE_ID;
const STORE_PASS = process.env.SSLCZ_STORE_PASSWORD;
const IS_LIVE    = process.env.SSLCZ_IS_LIVE === "true";

// SSLCommerz API URLs
const SSL_URL = IS_LIVE
  ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
  : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { orderId, amount, billing } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ message: "orderId and amount are required" });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://minifanzo.com";

  try {
    // Build SSLCommerz payment data
    const data = new URLSearchParams({
      store_id:       STORE_ID,
      store_passwd:   STORE_PASS,
      total_amount:   String(amount),
      currency:       "BDT",
      tran_id:        `MFZ-${orderId}-${Date.now()}`,    // unique transaction ID

      // Success / fail / cancel URLs
      success_url:    `${siteUrl}/api/payments/ssl/success?orderId=${orderId}`,
      fail_url:       `${siteUrl}/checkout?error=Payment+failed`,
      cancel_url:     `${siteUrl}/checkout?error=Payment+cancelled`,
      ipn_url:        `${siteUrl}/api/payments/ssl/ipn`,  // Instant Payment Notification

      // Customer info
      cus_name:       `${billing?.first_name || ""} ${billing?.last_name || ""}`.trim() || "Customer",
      cus_email:      billing?.email   || "customer@minifanzo.com",
      cus_add1:       billing?.address_1 || "Dhaka",
      cus_city:       billing?.city    || "Dhaka",
      cus_country:    "Bangladesh",
      cus_phone:      billing?.phone   || "01700000000",

      // Shipping info (same as billing for e-commerce)
      ship_name:      `${billing?.first_name || ""} ${billing?.last_name || ""}`.trim() || "Customer",
      ship_add1:      billing?.address_1 || "Dhaka",
      ship_city:      billing?.city    || "Dhaka",
      ship_country:   "Bangladesh",

      // Product info
      product_name:   "Mini Portable Fan",
      product_category: "Electronics",
      product_profile: "general",
    });

    const response = await fetch(SSL_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    data.toString(),
    });

    const result = await response.json();

    if (result.status === "SUCCESS" && result.GatewayPageURL) {
      return res.status(200).json({ GatewayPageURL: result.GatewayPageURL });
    } else {
      throw new Error(result.failedreason || "SSLCommerz session creation failed");
    }

  } catch (error) {
    console.error("[SSL Initiate] Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
}
