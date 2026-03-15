/**
 * pages/api/payments/ssl/success.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SSLCommerz Payment Success Handler — MiniFanzo
 *
 * SSLCommerz redirects the user to this URL after a successful payment.
 * We verify the payment and update the WooCommerce order status.
 *
 * SSLCommerz Docs: https://developer.sslcommerz.com/doc/v4/#validation
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STORE_ID   = process.env.SSLCZ_STORE_ID;
const STORE_PASS = process.env.SSLCZ_STORE_PASSWORD;
const IS_LIVE    = process.env.SSLCZ_IS_LIVE === "true";

const SSL_VALIDATE_URL = IS_LIVE
  ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
  : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

export default async function handler(req, res) {
  // SSLCommerz uses POST for success callback
  const body     = req.method === "POST" ? req.body : req.query;
  const orderId  = req.query.orderId;
  const { val_id, status } = body;

  // ── Payment not successful ────────────────────────────────────────────────
  if (status !== "VALID" && status !== "VALIDATED") {
    console.error("[SSL Success] Invalid status:", status);
    return res.redirect(302, `/checkout?error=Payment+verification+failed`);
  }

  try {
    // ── Validate transaction with SSLCommerz ─────────────────────────────
    const validateUrl = `${SSL_VALIDATE_URL}?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PASS}&format=json`;
    const validateRes = await fetch(validateUrl);
    const validateData = await validateRes.json();

    if (
      validateData.status === "VALID" ||
      validateData.status === "VALIDATED"
    ) {
      // ── Mark WooCommerce order as processing ──────────────────────────
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://minifanzo.com";
      await fetch(`${siteUrl}/api/orders/${orderId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status:   "processing",
          set_paid: true,
          meta_data: [{
            key:   "_ssl_transaction_id",
            value: validateData.tran_id,
          }],
        }),
      });

      return res.redirect(302, `/order-confirmation?id=${orderId}&method=card`);

    } else {
      console.error("[SSL Validate] Failed:", validateData);
      return res.redirect(302, `/checkout?error=Payment+not+verified`);
    }

  } catch (error) {
    console.error("[SSL Success] Error:", error.message);
    return res.redirect(302, `/checkout?error=Payment+error`);
  }
}

// Required for SSLCommerz POST
export const config = {
  api: {
    bodyParser: true,
  },
};
