import { requireMerchant } from "@/lib/merchants/session"
import { updateStoreSettings } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// PATCH /api/merchants/me/settings — profile, payout details and webhook signing secret.
export async function PATCH(req: Request) {
  try {
    const store = await requireMerchant(req)
    const { dto, webhookSecret } = await updateStoreSettings(store, await readJson(req))
    return ok({ store: dto, webhookSecret })
  } catch (err) {
    return handleRouteError(err, "update merchant settings")
  }
}
