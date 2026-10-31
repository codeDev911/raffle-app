import { checkStoreCampaigns } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"
import { enforceRateLimit } from "@/lib/merchants/rate-limit"

export const dynamic = "force-dynamic"

// GET /api/merchants/store-check?store=<domain> — public, read-only, rate-limited.
export async function GET(req: Request) {
  try {
    enforceRateLimit(req, "merchant-store-check", 40, 60 * 1000)
    const store = new URL(req.url).searchParams.get("store") || ""
    return ok(await checkStoreCampaigns(store))
  } catch (err) {
    return handleRouteError(err, "store campaign check")
  }
}
