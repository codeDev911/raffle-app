import { requireAdmin } from "@/lib/merchants/session"
import { adminUpdateStoreStatus } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// PATCH { status: "ACTIVE" | "PAUSED" } — paused stores stop minting and cannot create campaigns.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    return ok({ store: await adminUpdateStoreStatus(params.id, await readJson(req)) })
  } catch (err) {
    return handleRouteError(err, "admin update store")
  }
}
