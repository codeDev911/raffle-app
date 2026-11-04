import { requireAdmin } from "@/lib/merchants/session"
import { decideRefund, listRefundsForAdmin } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"
import { refundDecisionSchema } from "@/lib/merchants/validators"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * GET — every refund across stores, newest first. Credits are here too, so the desk can see what
 * settled itself and only act on the rows that genuinely need a human: payout requests.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req)
    const params = new URL(req.url).searchParams
    return ok({
      requests: await listRefundsForAdmin({
        status: params.get("status"),
        storeId: params.get("storeId"),
      }),
    })
  } catch (err) {
    return handleRouteError(err, "list merchant refunds")
  }
}

/**
 * PATCH { id, action, note? } — approve a payout, refuse a refund, or confirm the money was sent.
 * Credits never come through here; they are applied when the merchant closes their next batch.
 */
export async function PATCH(req: Request) {
  try {
    await requireAdmin(req)
    const { id, action, note } = refundDecisionSchema.parse(await readJson(req))
    // The session carries only an id; fall back to a stable label when the desk acts by token.
    const session = await getSession().catch(() => null)
    const staff = (session as { userId?: string } | null)?.userId || "PakRaffle staff"
    return ok(await decideRefund(id, action, staff, note))
  } catch (err) {
    return handleRouteError(err, "decide merchant refund")
  }
}
