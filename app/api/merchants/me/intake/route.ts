import { z } from "zod"
import { requireMerchant } from "@/lib/merchants/session"
import { getMerchantDb } from "@/lib/merchants/db"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"
import { toStoreDTO } from "@/lib/merchants/dto"
import { MerchantError } from "@/lib/merchants/errors"
import { INTAKE_OTHER, INTAKE_QUESTIONS, type IntakeAnswers } from "@/lib/merchants/intake"

export const dynamic = "force-dynamic"

/**
 * The shape is derived from INTAKE_QUESTIONS, so adding a question needs no change here.
 * `<key>Other` only arrives when the merchant picked "Other" on a dropdown question.
 */
const intakeSchema = z.object({
  ...Object.fromEntries(INTAKE_QUESTIONS.map((question) => [question.key, z.string().trim().min(1).max(160)])),
  ...Object.fromEntries(
    INTAKE_QUESTIONS.filter((question) => question.options.length).map((question) => [
      `${question.key}Other`,
      z.string().trim().max(160).optional(),
    ]),
  ),
})

/** Drops unknown keys and checks every choice against the published option list. */
function normalise(input: Record<string, string | undefined>): IntakeAnswers {
  const answers: IntakeAnswers = {}
  for (const question of INTAKE_QUESTIONS) {
    const value = input[question.key]
    if (!value) {
      throw new MerchantError(`Answer Q${question.number} — ${question.label}`, 400, "INTAKE_INCOMPLETE")
    }
    if (!question.options.length) {
      answers[question.key] = value
      continue
    }
    if (!question.options.some((option) => option.value === value)) {
      throw new MerchantError(`Q${question.number}: pick one of the listed options`, 400, "INTAKE_INVALID_OPTION")
    }
    if (value === INTAKE_OTHER) {
      const other = input[`${question.key}Other`]
      if (!other) {
        throw new MerchantError(`Q${question.number}: write your answer`, 400, "INTAKE_OTHER_REQUIRED")
      }
      answers[`${question.key}Other`] = other
    }
    answers[question.key] = value
  }
  return answers
}

/**
 * POST /api/merchants/me/intake
 *
 * Stores the six store-intake answers collected by the welcome wizard. Tally's public API only
 * reads submissions — it cannot create them — so the answers live in our own table and the
 * dashboard reads them back through the store DTO.
 */
export async function POST(req: Request) {
  try {
    const store = await requireMerchant(req)
    const answers = normalise(intakeSchema.parse(await readJson(req)))

    const db = await getMerchantDb()
    const updated = await db.merchantStore.update({
      where: { id: store.id },
      data: { intakeAnswers: answers, intakeSubmittedAt: new Date(), onboardingStep: "TALLY" },
    })

    return ok({ store: toStoreDTO(updated) })
  } catch (err) {
    return handleRouteError(err, "save store intake")
  }
}
