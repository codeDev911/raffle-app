import { requireMerchant } from "@/lib/merchants/session"
import { createCampaign, listCampaigns } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const store = await requireMerchant(req)
    return ok({ campaigns: await listCampaigns(store.id) })
  } catch (err) {
    return handleRouteError(err, "list campaigns")
  }
}

export async function POST(req: Request) {
  try {
    const store = await requireMerchant(req)
    const campaign = await createCampaign(store, await readJson(req))
    return ok({ campaign }, 201)
  } catch (err) {
    return handleRouteError(err, "create campaign")
  }
}
