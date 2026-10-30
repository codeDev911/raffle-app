import { z } from "zod"
import { requireMerchant } from "@/lib/merchants/session"
import { getMerchantDb } from "@/lib/merchants/db"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"
import { toStoreDTO } from "@/lib/merchants/dto"

export const dynamic = "force-dynamic"

const STEPS = ["WELCOME", "STORE", "SHOPIFY_CONNECTED", "TALLY", "DONE"] as const

const onboardingSchema = z.object({
  step: z.enum(STEPS).optional(),
  completed: z.boolean().optional(),
  tallySubmissionId: z.string().trim().max(120).optional().nullable(),
})

/**
 * PATCH /api/merchants/me/onboarding
 *
 * Persists the welcome wizard's progress so a merchant can close the tab and resume on any
 * device. Completing the wizard stamps onboardingCompletedAt, which the dashboard uses to stop
 * redirecting back into onboarding.
 */
export async function PATCH(req: Request) {
  try {
    const store = await requireMerchant(req)
    const data = onboardingSchema.parse(await readJson(req))

    const patch: Record<string, unknown> = {}
    if (data.step) patch.onboardingStep = data.step
    if (data.tallySubmissionId !== undefined) patch.tallySubmissionId = data.tallySubmissionId || null
    if (data.completed) {
      patch.onboardingStep = "DONE"
      patch.onboardingCompletedAt = new Date()
    }

    const db = await getMerchantDb()
    const updated = Object.keys(patch).length
      ? await db.merchantStore.update({ where: { id: store.id }, data: patch })
      : store

    return ok({ store: toStoreDTO(updated) })
  } catch (err) {
    return handleRouteError(err, "update onboarding progress")
  }
}
