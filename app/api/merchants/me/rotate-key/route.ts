import { createMerchantSession, requireMerchant } from "@/lib/merchants/session"
import { rotateApiKey } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// POST /api/merchants/me/rotate-key — revokes the old key (and all sessions bound to it).
export async function POST(req: Request) {
  try {
    const store = await requireMerchant(req)
    const rotated = await rotateApiKey(store)
    // Re-issue this browser's session against the new key so the merchant stays logged in.
    await createMerchantSession(rotated.store)
    return ok({ store: rotated.dto, apiKey: rotated.apiKey })
  } catch (err) {
    return handleRouteError(err, "rotate api key")
  }
}
