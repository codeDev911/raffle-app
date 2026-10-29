import { requireMerchant } from "@/lib/merchants/session"
import { listPrizeOptions } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// GET /api/merchants/prizes — active PakRaffle prizes a campaign can be linked to.
export async function GET(req: Request) {
  try {
    await requireMerchant(req)
    return ok({ prizes: await listPrizeOptions() })
  } catch (err) {
    return handleRouteError(err, "list prizes")
  }
}
