import { requireMerchant } from "@/lib/merchants/session"
import { toStoreDTO } from "@/lib/merchants/dto"
import { handleRouteError, ok, publicBaseUrl, webhookUrlFor } from "@/lib/merchants/http"
import { MERCHANT_ENTRY_FEE_PKR, getSettlementAccounts } from "@/lib/merchants/config"
import { getMerchantDbMode } from "@/lib/merchants/db"
import { isSafepayConfigured } from "@/lib/merchants/safepay"
import { WEBHOOK_TOPIC_NAMES, WEBHOOK_TOPICS } from "@/lib/merchants/webhook-topics"
import { widgetSnippet, widgetScriptUrl } from "@/lib/shopify/server"

export const dynamic = "force-dynamic"

// GET /api/merchants/me — current store profile + integration settings for the dashboard.
export async function GET(req: Request) {
  try {
    const store = await requireMerchant(req)
    const base = publicBaseUrl(req)
    return ok({
      store: toStoreDTO(store),
      integration: {
        webhookUrl: webhookUrlFor(req, store.id),
        topics: WEBHOOK_TOPIC_NAMES,
        /** Admin dropdown label + exact topic + what it does, for the setup checklist. */
        webhookTopics: WEBHOOK_TOPICS,
        entryFee: MERCHANT_ENTRY_FEE_PKR,
        storage: await getMerchantDbMode(),
        /** Card / wallet checkout is only offered when the gateway credentials are present. */
        safepay: isSafepayConfigured(),
        /** Paste-ready storefront widget tag for the merchant's theme.liquid. */
        widgetUrl: widgetScriptUrl(base, store.id),
        widgetSnippet: widgetSnippet(base, store.id),
      },
      settlementAccounts: getSettlementAccounts(),
    })
  } catch (err) {
    return handleRouteError(err, "get merchant profile")
  }
}
