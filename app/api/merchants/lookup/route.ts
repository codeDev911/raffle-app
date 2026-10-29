import { lookupTickets } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"
import { enforceRateLimit } from "@/lib/merchants/rate-limit"

export const dynamic = "force-dynamic"

// GET /api/merchants/lookup?q=<order # | ticket # | phone> — public, masked, rate-limited.
export async function GET(req: Request) {
  try {
    enforceRateLimit(req, "merchant-lookup", 30, 60 * 1000)
    const q = new URL(req.url).searchParams.get("q") || ""
    return ok({ tickets: await lookupTickets(q) })
  } catch (err) {
    return handleRouteError(err, "ticket lookup")
  }
}
