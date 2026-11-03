import { requireAdmin } from "@/lib/merchants/session"
import { adminGetCampaignDetail, adminUpdateCampaignStatus } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// GET — the whole campaign: rule, prize, every ledger line, its invoices and the drawn winner.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    return ok(await adminGetCampaignDetail(params.id))
  } catch (err) {
    return handleRouteError(err, "admin get campaign detail")
  }
}

// PATCH { status: "ACTIVE" | "PAUSED" } — stop or resume ticket minting.
// Campaigns that already raised an invoice, are draw-ready or completed are rejected by the service.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    const body = await readJson(req)
    return ok({ campaign: await adminUpdateCampaignStatus(params.id, body) })
  } catch (err) {
    return handleRouteError(err, "admin update campaign status")
  }
}
