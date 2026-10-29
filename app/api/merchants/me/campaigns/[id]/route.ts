import { requireMerchant } from "@/lib/merchants/session"
import { previewInvoice, updateCampaign } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// GET — billing preview (uninvoiced entries × locked fee) for the campaign.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = await requireMerchant(req)
    return ok({ preview: await previewInvoice(store, params.id) })
  } catch (err) {
    return handleRouteError(err, "preview campaign invoice")
  }
}

// PATCH — pause / resume, rename, extend end date, change entry cap.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = await requireMerchant(req)
    const campaign = await updateCampaign(store, params.id, await readJson(req))
    return ok({ campaign })
  } catch (err) {
    return handleRouteError(err, "update campaign")
  }
}
