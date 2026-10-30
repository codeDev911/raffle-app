import { requireMerchant } from "@/lib/merchants/session"
import { getMerchantDb } from "@/lib/merchants/db"
import { handleRouteError, ok, fail, readJson } from "@/lib/merchants/http"
import { toStoreDTO } from "@/lib/merchants/dto"

export const dynamic = "force-dynamic"

/**
 * POST /api/merchants/me/shopify
 * Body: { action: "confirm" | "reset" }
 *
 * Shopify is wired up by hand: the merchant creates the order webhooks with the URL we show and
 * pastes the widget snippet into the theme. confirm records that they finished it; reset clears
 * the marker so the setup checklist comes back.
 */
export async function POST(req: Request) {
  try {
    const store = await requireMerchant(req)
    const body = await readJson(req)
    const action = String(body?.action || "").trim()
    const db = await getMerchantDb()

    if (action === "confirm") {
      const updated = await db.merchantStore.update({
        where: { id: store.id },
        data: { shopifyConnectedAt: store.shopifyConnectedAt ?? new Date(), shopifyWebhooksReady: true },
      })
      return ok({ store: toStoreDTO(updated), message: "Shopify setup confirmed" })
    }

    if (action === "reset") {
      const updated = await db.merchantStore.update({
        where: { id: store.id },
        data: {
          shopifyConnectedAt: null,
          shopifyWebhooksReady: false,
          shopifyAccessToken: null,
          shopifyScope: null,
          shopifyScriptTagId: null,
        },
      })
      return ok({ store: toStoreDTO(updated), message: "Shopify setup reset" })
    }

    return fail("Unknown action", 400, { code: "INVALID_ACTION" })
  } catch (err) {
    return handleRouteError(err, "update shopify setup")
  }
}
