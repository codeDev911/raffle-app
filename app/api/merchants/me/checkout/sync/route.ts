import { syncStoreCheckouts } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"
import { requireMerchant } from "@/lib/merchants/session"

export const dynamic = "force-dynamic"

// POST — re-reads every open checkout session for this store from Safepay.
// The dashboard calls it after the redirect and while a session is pending, so a lost webhook can
// never leave a paid ticket looking unpaid.
export async function POST(req: Request) {
  try {
    const store = await requireMerchant(req)
    return ok(await syncStoreCheckouts(store))
  } catch (err) {
    return handleRouteError(err, "recheck store checkouts")
  }
}
