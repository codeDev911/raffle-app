import { requireMerchant } from "@/lib/merchants/session"
import { payEntry } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// POST { paymentMethod, transactionRef, paymentProof }
// Pays for a single ticket. The payment lands in /admin/payments under the Shopify customer's
// account; confirming it there is what turns the ticket into a raffle entry.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = await requireMerchant(req)
    return ok(await payEntry(store, params.id, await readJson(req)), 201)
  } catch (err) {
    return handleRouteError(err, "pay merchant entry")
  }
}
