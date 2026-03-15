/**
 * pages/api/revalidate.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ISR On-Demand Revalidation — MiniFanzo
 *
 * Called by a WooCommerce webhook when:
 *  - A product is created/updated/deleted
 *  - An order status changes
 *
 * This triggers Next.js ISR to immediately regenerate the relevant pages
 * so content is always fresh without a full redeploy.
 *
 * Setup in WooCommerce:
 *  WooCommerce > Settings > Advanced > Webhooks > Add webhook
 *  Delivery URL: https://yourdomain.com/api/revalidate?secret=YOUR_SECRET
 *  Topic: Product Updated, Product Created, etc.
 *
 * Environment Variables:
 *  REVALIDATE_SECRET — random secret to prevent unauthorized calls
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default async function handler(req, res) {
  // ── Verify secret token ───────────────────────────────────────────────────
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: "Invalid revalidation token" });
  }

  // ── Determine what to revalidate based on webhook topic ──────────────────
  const topic = req.headers["x-wc-webhook-topic"] || "";
  const body  = req.body;

  try {
    const pathsToRevalidate = ["/"];  // Always revalidate homepage

    // Revalidate shop page
    if (topic.startsWith("product.")) {
      pathsToRevalidate.push("/shop");

      // If we have a product slug, revalidate the product detail page
      if (body?.slug) {
        pathsToRevalidate.push(`/products/${body.slug}`);
      }
    }

    // Revalidate all specified paths
    await Promise.all(
      pathsToRevalidate.map((path) => res.revalidate(path))
    );

    console.log(`[Revalidate] Revalidated: ${pathsToRevalidate.join(", ")}`);
    return res.json({ revalidated: true, paths: pathsToRevalidate });

  } catch (error) {
    console.error("[Revalidate] Error:", error.message);
    return res.status(500).json({ message: "Revalidation failed" });
  }
}
