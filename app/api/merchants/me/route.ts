import { requireMerchant } from "@/lib/merchants/session"
import { toStoreDTO } from "@/lib/merchants/dto"
import { handleRouteError, ok, webhookUrlFor } from "@/lib/merchants/http"
import { MERCHANT_ENTRY_FEE_PKR, getSettlementAccounts } from "@/lib/merchants/config"
import { getMerchantDbMode } from "@/lib/merchants/db"

export const dynamic = "force-dynamic"

// GET /api/merchants/me — current store profile + integration settings for the dashboard.
export async function GET(req: Request) {
  try {
    const store = await requireMerchant(req)
    return ok({
      store: toStoreDTO(store),
      integration: {
        webhookUrl: webhookUrlFor(req),
        topics: ["orders/fulfilled", "orders/cancelled", "refunds/create"],
        entryFee: MERCHANT_ENTRY_FEE_PKR,
        storage: await getMerchantDbMode(),
      },
      settlementAccounts: getSettlementAccounts(),
    })
  } catch (err) {
    return handleRouteError(err, "get merchant profile")
  }
}
