import { requireMerchant } from "@/lib/merchants/session"
import { updateCampaignCreative } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

/**
 * PATCH /api/merchants/me/campaigns/[id]/creative
 * Body: { bannerUrl?, popupUrl?, showBannerHome?, showPopupHome?, showBannerProduct?,
 *         showPopupProduct?, showCustomPage?, pageSlug? }
 *
 * Only the storefront creative lives here; the campaign's rule, cap and dates stay on the parent
 * route so a half-filled creative form can never touch a billing-relevant field. Omitted fields are
 * left as stored, and any placement enabled without its image is rejected by the service.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const store = await requireMerchant(req)
    const campaign = await updateCampaignCreative(store, params.id, await readJson(req))
    return ok({ campaign })
  } catch (err) {
    return handleRouteError(err, "update campaign creative")
  }
}
