import { describeCheckoutSession, syncTracker } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"
import { requireMerchant } from "@/lib/merchants/session"

export const dynamic = "force-dynamic"

// GET — describes a checkout session this store owns, for the branded checkout page.
// Read-only: it never asks Safepay anything, so the page can poll it while the merchant types
// without spending gateway calls. Only POST (below) re-reads the tracker.
export async function GET(req: Request, { params }: { params: { tracker: string } }) {
  try {
    const store = await requireMerchant(req)
    return ok(await describeCheckoutSession(store, params.tracker))
  } catch (err) {
    return handleRouteError(err, "describe checkout session")
  }
}

// POST — re-reads this one session from Safepay and applies the outcome.
// The page calls it when the merchant says they have paid, and after the frame returns, so a lost
// webhook can never leave a paid ticket looking unpaid.
export async function POST(req: Request, { params }: { params: { tracker: string } }) {
  try {
    const store = await requireMerchant(req)
    // Ownership first: an unknown or foreign tracker must never reach the gateway.
    const before = await describeCheckoutSession(store, params.tracker)

    const result = await syncTracker(before.tracker)
    const after = await describeCheckoutSession(store, params.tracker)
    return ok({ ...after, sync: { status: result.status, reason: result.reason ?? null } })
  } catch (err) {
    return handleRouteError(err, "recheck checkout session")
  }
}
