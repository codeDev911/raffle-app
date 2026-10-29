import { processShopifyWebhook } from "@/lib/merchants/service"
import { MerchantError } from "@/lib/merchants/errors"
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
/**
 * GET /api/merchants/webhooks/shopify
 *
 * Not used by Shopify. A JSON reply here confirms the endpoint is actually deployed
 * (an HTML 404 page instead means the running deployment is stale).
 */
export async function GET() {
  return ok({ endpoint: "shopify-webhook", method: "POST", ready: true })
}

export async function POST(req: Request) {
  const topic = req.headers.get("x-shopify-topic")
  const shopDomain = req.headers.get("x-shopify-shop-domain")
  try {
    // HMAC must be computed over the exact bytes Shopify sent, so read the raw text.
    const rawBody = await req.text()
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return fail("Payload too large", 413, { code: "PAYLOAD_TOO_LARGE" })
    }

    const result = await processShopifyWebhook({
      rawBody,
      topic,
      shopDomain,
      hmac: req.headers.get("x-shopify-hmac-sha256"),
      storeId: new URL(req.url).searchParams.get("store"),
    })
    return ok({ result })
  } catch (err) {
    // Domain lookup / HMAC failures are the usual causes of a 404/401 here; make them
    // visible in the server logs along with the exact domain Shopify sent.
    if (err instanceof MerchantError) {
      console.warn(
        `[MerchantConnect] shopify webhook rejected: ${err.status} ${err.message} (topic=${topic ?? "?"}, domain=${shopDomain ?? "?"})`,
      )
    }
    return handleRouteError(err, "shopify webhook")
  }
}
