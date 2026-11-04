import { requireMerchant } from "@/lib/merchants/session"
import { listRefundRequests, refundSummary } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

/**
 * GET — this store's refunds with their full trail plus the credit totals. One call, because the tab
 * shows both together.
 *
 * There is no POST on purpose: a refund is raised by Shopify telling us about the return, never by a
 * button a merchant has to remember to press. That keeps the credit and the payment ledger honest
 * about the same event instead of allowing two versions of it.
 */
export async function GET(req: Request) {
  try {
    const store = await requireMerchant(req)
    const params = new URL(req.url).searchParams
    // ?summary=1 feeds the tab badge and the overview card without pulling every row.
    if (params.get("summary")) return ok(await refundSummary(store))
    return ok(await listRefundRequests(store, { status: params.get("status") }))
  } catch (err) {
    return handleRouteError(err, "list refunds")
  }
}
