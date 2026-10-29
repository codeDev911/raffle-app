import { processShopifyWebhook } from "@/lib/merchants/service"
import { fail, handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

const MAX_BODY_BYTES = 1024 * 1024

/**
 * POST /api/merchants/webhooks/shopify
 *
 * Configure in Shopify Admin → Settings → Notifications → Webhooks (JSON format):
 *   orders/fulfilled  → mints tickets for qualifying orders
 *   orders/cancelled, refunds/create → voids un-settled tickets
 * The store is resolved from X-Shopify-Shop-Domain (or ?store=<id> for custom domains) and
 * every delivery must carry a valid X-Shopify-Hmac-Sha256 over the raw body.
 * Re-deliveries are idempotent: the same order never mints a second ticket.
 */
export async function POST(req: Request) {
  try {
    // HMAC must be computed over the exact bytes Shopify sent, so read the raw text.
    const rawBody = await req.text()
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return fail("Payload too large", 413, { code: "PAYLOAD_TOO_LARGE" })
    }

    const result = await processShopifyWebhook({
      rawBody,
      topic: req.headers.get("x-shopify-topic"),
      shopDomain: req.headers.get("x-shopify-shop-domain"),
      hmac: req.headers.get("x-shopify-hmac-sha256"),
      storeId: new URL(req.url).searchParams.get("store"),
    })
    return ok({ result })
  } catch (err) {
    return handleRouteError(err, "shopify webhook")
  }
}
