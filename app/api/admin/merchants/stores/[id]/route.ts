import { requireAdmin } from "@/lib/merchants/session"
import { adminUpdateStoreSettings, adminUpdateStoreStatus } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// PATCH { status: "ACTIVE" | "PAUSED" } — paused stores stop minting and cannot create campaigns.
// PATCH { name, contactEmail, contactPhone, payoutDetails } — updates store settings.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    const body = await readJson(req)
    if ("status" in body) {
      return ok({ store: await adminUpdateStoreStatus(params.id, body) })
    }
    return ok({ store: await adminUpdateStoreSettings(params.id, body) })
  } catch (err) {
    return handleRouteError(err, "admin update store")
  }
}
