import { startEntryCheckout } from "@/lib/merchants/service"
import { handleRouteError, ok, publicBaseUrl } from "@/lib/merchants/http"
import { requireMerchant } from "@/lib/merchants/session"

export const dynamic = "force-dynamic"

// POST — opens a Safepay hosted checkout for this ticket.
// The amount is computed server-side from the campaign price; the response only hands back the
// checkout URL. Money is settled later by /api/payments/safepay/callback (and the webhook).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = await requireMerchant(req)
    return ok(await startEntryCheckout(store, params.id, { baseUrl: publicBaseUrl(req) }), 201)
  } catch (err) {
    return handleRouteError(err, "start ticket checkout")
  }
}
