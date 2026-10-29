import { requireMerchant } from "@/lib/merchants/session"
import { clearTestEntries, simulateOrder } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"
import { enforceRateLimit } from "@/lib/merchants/rate-limit"

export const dynamic = "force-dynamic"

// POST — sends a signed mock `orders/fulfilled` webhook through the real pipeline (test mode).
export async function POST(req: Request) {
  try {
    const store = await requireMerchant(req)
    enforceRateLimit(req, `merchant-simulate:${store.id}`, 60, 60 * 1000)
    return ok(await simulateOrder(store, await readJson(req)))
  } catch (err) {
    return handleRouteError(err, "simulate webhook")
  }
}

// DELETE — removes all simulator-generated test tickets for this store.
export async function DELETE(req: Request) {
  try {
    const store = await requireMerchant(req)
    return ok({ deleted: await clearTestEntries(store) })
  } catch (err) {
    return handleRouteError(err, "clear test entries")
  }
}
