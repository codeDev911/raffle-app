import { createMerchantSession } from "@/lib/merchants/session"
import { connectStore } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson, webhookUrlFor } from "@/lib/merchants/http"
import { enforceRateLimit } from "@/lib/merchants/rate-limit"
import { MERCHANT_ENTRY_FEE_PKR } from "@/lib/merchants/config"

export const dynamic = "force-dynamic"

// POST /api/merchants/connect — onboard a Shopify store. Credentials are returned once.
export async function POST(req: Request) {
  try {
    enforceRateLimit(req, "merchant-connect", 10, 60 * 60 * 1000)
    const { store, dto, apiKey, webhookSecret } = await connectStore(await readJson(req))
    await createMerchantSession(store)
    return ok(
      {
        store: dto,
        credentials: { apiKey, webhookSecret },
        webhookUrl: webhookUrlFor(req),
        entryFee: MERCHANT_ENTRY_FEE_PKR,
      },
      201,
    )
  } catch (err) {
    return handleRouteError(err, "connect store")
  }
}
