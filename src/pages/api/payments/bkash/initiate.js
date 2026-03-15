/**
 * pages/api/payments/bkash/initiate.js
 * ─────────────────────────────────────────────────────────────────────────────
 * bKash Tokenized Checkout — Payment Initiation — MiniFanzo
 *
 * Flow:
 *  1. Client POSTs { orderId, amount } to this route
 *  2. We authenticate with bKash (get token)
 *  3. We create a bKash payment session
 *  4. Return { bkashURL } to client for redirect
 *
 * Environment Variables (see .env.example):
 *   NEXT_PUBLIC_BKASH_APP_KEY  — app key (public)
 *   BKASH_APP_SECRET           — secret (private)
 *   BKASH_USERNAME             — merchant username
 *   BKASH_PASSWORD             — merchant password
 *   BKASH_BASE_URL             — sandbox or production URL
 *
 * bKash API Docs: https://developer.bka.sh/docs/checkout-process-overview
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BKASH_BASE_URL = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout";
const BKASH_APP_KEY  = process.env.NEXT_PUBLIC_BKASH_APP_KEY;
const BKASH_SECRET   = process.env.BKASH_APP_SECRET;
const BKASH_USER     = process.env.BKASH_USERNAME;
const BKASH_PASS     = process.env.BKASH_PASSWORD;

/**
 * Step 1: Obtain bKash access token
 * @returns {string} id_token
 */
async function getBkashToken() {
  const res = await fetch(`${BKASH_BASE_URL}/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "username":       BKASH_USER,
      "password":       BKASH_PASS,
    },
    body: JSON.stringify({
      app_key:    BKASH_APP_KEY,
      app_secret: BKASH_SECRET,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id_token) {
    throw new Error(data.message || "bKash token grant failed");
  }
  return data.id_token;
}

/**
 * Step 2: Create bKash payment session
 * @param {string} token  — bKash id_token
 * @param {string} amount — amount in BDT (string)
 * @param {string} orderId — our WC order ID (used as merchant invoice number)
 * @returns {{ bkashURL, paymentID }}
 */
async function createBkashPayment(token, amount, orderId) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://minifanzo.com";
  const res = await fetch(`${BKASH_BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": token,
      "X-APP-Key":     BKASH_APP_KEY,
    },
    body: JSON.stringify({
      mode:                   "0011",    // checkout URL mode
      payerReference:         String(orderId),
      callbackURL:            `${siteUrl}/api/payments/bkash/callback?orderId=${orderId}`,
      amount:                 String(amount),
      currency:               "BDT",
      intent:                 "sale",
      merchantInvoiceNumber:  `MFZ-${orderId}`,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.bkashURL) {
    throw new Error(data.message || "bKash payment creation failed");
  }
  return { bkashURL: data.bkashURL, paymentID: data.paymentID };
}

// ── API Handler ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ message: "orderId and amount are required" });
  }

  try {
    // Step 1: Get token
    const token = await getBkashToken();

    // Step 2: Create payment and get bKash URL
    const { bkashURL, paymentID } = await createBkashPayment(token, amount, orderId);

    return res.status(200).json({ bkashURL, paymentID });

  } catch (error) {
    console.error("[bKash Initiate] Error:", error.message);
    return res.status(500).json({ message: error.message || "bKash payment initiation failed" });
  }
}
