import { startInvoiceCheckout } from "@/lib/merchants/service"
import { handleRouteError, ok, publicBaseUrl } from "@/lib/merchants/http"
import { requireMerchant } from "@/lib/merchants/session"

export const dynamic = "force-dynamic"

// POST — opens one Safepay hosted checkout covering every open ticket on the batch.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = await requireMerchant(req)
    return ok(await startInvoiceCheckout(store, params.id, { baseUrl: publicBaseUrl(req) }), 201)
  } catch (err) {
    return handleRouteError(err, "start invoice checkout")
  }
}
