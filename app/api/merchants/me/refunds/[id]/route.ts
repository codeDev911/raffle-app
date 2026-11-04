import { requireMerchant } from "@/lib/merchants/session"
import { changeRefundSettlement } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"
import { refundSettlementSchema } from "@/lib/merchants/validators"

export const dynamic = "force-dynamic"

/**
 * PATCH { settlement } — change an unspent refund between a credit on the next batch and a payout
 * request. Spent credits and approved payouts are refused by the service, not silently rewritten.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = await requireMerchant(req)
    const { settlement } = refundSettlementSchema.parse(await readJson(req))
    return ok(await changeRefundSettlement(store, params.id, settlement))
  } catch (err) {
    return handleRouteError(err, "change refund settlement")
  }
}
