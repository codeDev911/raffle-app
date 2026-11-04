import { z } from "zod"
import { requireMerchant } from "@/lib/merchants/session"
import { getMerchantDb } from "@/lib/merchants/db"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"
import { toStoreDTO } from "@/lib/merchants/dto"

export const dynamic = "force-dynamic"

const acknowledgeSchema = z.object({ submitted: z.boolean().optional() })

/**
 * POST /api/merchants/me/intake
 *
 * Stamps the store-intake step as done so the wizard and dashboard can show progress. The six
 * answers themselves now go straight from the browser to Formbold
 * (NEXT_PUBLIC_FORMBOLD_MERCHANT_FORM_ID) and are not written to our table any more, so anything
 * the client sends beyond the acknowledgement is ignored on purpose. Answers saved before the
 * move stay readable in the dashboard for the merchants who gave them.
 */
export async function POST(req: Request) {
  try {
    const store = await requireMerchant(req)
    acknowledgeSchema.parse(await readJson(req))

    const db = await getMerchantDb()
    const updated = await db.merchantStore.update({
      where: { id: store.id },
      data: { intakeSubmittedAt: new Date(), onboardingStep: "TALLY" },
    })

    return ok({ store: toStoreDTO(updated) })
  } catch (err) {
    return handleRouteError(err, "record store intake")
  }
}
