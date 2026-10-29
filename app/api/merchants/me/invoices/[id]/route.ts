import { requireMerchant } from "@/lib/merchants/session"
import { getInvoiceDetail, submitInvoicePayment } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// GET — itemized invoice + settlement accounts.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = await requireMerchant(req)
    return ok(await getInvoiceDetail(params.id, store.id))
  } catch (err) {
    return handleRouteError(err, "get invoice")
  }
}

// PATCH { paymentMethod, transactionRef, paymentProof } — submit settlement proof for review.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = await requireMerchant(req)
    return ok(await submitInvoicePayment(store, params.id, await readJson(req)))
  } catch (err) {
    return handleRouteError(err, "submit invoice payment")
  }
}
