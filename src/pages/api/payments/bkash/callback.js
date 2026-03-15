/**
 * pages/api/payments/bkash/callback.js
 * ─────────────────────────────────────────────────────────────────────────────
 * bKash Payment Callback Handler — MiniFanzo
 *
 * After the user completes (or cancels) payment on bKash's page,
 * bKash redirects the user back to this URL with:
 *   ?paymentID=...&status=success|cancel|failure&orderId=...
 *
 * This handler:
 *  1. Calls bKash /execute to confirm the payment
 *  2. If success: updates WC order status to "processing"
 *  3. Redirects user to /order-confirmation or /checkout with error
 *
 * bKash Docs: https://developer.bka.sh/docs/execute-payment
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BKASH_BASE_URL = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout";
const BKASH_APP_KEY  = process.env.NEXT_PUBLIC_BKASH_APP_KEY;
const BKASH_SECRET   = process.env.BKASH_APP_SECRET;
const BKASH_USER     = process.env.BKASH_USERNAME;
const BKASH_PASS     = process.env.BKASH_PASSWORD;

// Get a fresh bKash token
async function getBkashToken() {
  const res = await fetch(`${BKASH_BASE_URL}/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "username": BKASH_USER,
      "password": BKASH_PASS,
    },
    body: JSON.stringify({ app_key: BKASH_APP_KEY, app_secret: BKASH_SECRET }),
  });
  const data = await res.json();
  return data.id_token;
}

// Execute (confirm) payment with bKash
async function executeBkashPayment(token, paymentID) {
  const res = await fetch(`${BKASH_BASE_URL}/execute`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": token,
      "X-APP-Key":     BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID }),
  });
  return res.json();
}

export default async function handler(req, res) {
  const { paymentID, status, orderId } = req.query;

  // ── Payment cancelled by user ─────────────────────────────────────────────
  if (status === "cancel") {
    console.log(`[bKash] Payment cancelled for order ${orderId}`);
    return res.redirect(302, `/checkout?error=Payment+cancelled`);
  }

  // ── Payment failed ────────────────────────────────────────────────────────
  if (status === "failure") {
    console.error(`[bKash] Payment failed for order ${orderId}`);
    return res.redirect(302, `/checkout?error=Payment+failed`);
  }

  // ── Payment success — execute to confirm ──────────────────────────────────
  if (status === "success" && paymentID) {
    try {
      const token  = await getBkashToken();
      const result = await executeBkashPayment(token, paymentID);

      if (result.transactionStatus === "Completed") {
        // ── Update WooCommerce order to "processing" ──────────────────────
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/orders/${orderId}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status:     "processing",
            set_paid:   true,
            // Store bKash transaction ID in order meta
            meta_data: [{
              key:   "_bkash_transaction_id",
              value: result.trxID,
            }],
          }),
        });

        return res.redirect(302, `/order-confirmation?id=${orderId}&method=bkash`);

      } else {
        console.error("[bKash] Execute failed:", result);
        return res.redirect(302, `/checkout?error=Payment+verification+failed`);
      }

    } catch (error) {
      console.error("[bKash Callback] Error:", error.message);
      return res.redirect(302, `/checkout?error=Payment+error`);
    }
  }

  return res.redirect(302, "/checkout");
}
