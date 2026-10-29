import { createMerchantSession } from "@/lib/merchants/session"
import { authenticateApiKey } from "@/lib/merchants/service"
import { toStoreDTO } from "@/lib/merchants/dto"
import { fail, handleRouteError, ok, readJson } from "@/lib/merchants/http"
import { enforceRateLimit } from "@/lib/merchants/rate-limit"
import { loginSchema } from "@/lib/merchants/validators"

export const dynamic = "force-dynamic"

// POST /api/merchants/login — exchange an API key for a dashboard session cookie.
export async function POST(req: Request) {
  try {
    enforceRateLimit(req, "merchant-login", 10, 15 * 60 * 1000)
    const { apiKey } = loginSchema.parse(await readJson(req))
    const store = await authenticateApiKey(apiKey)
    if (!store) return fail("Invalid API key", 401, { code: "INVALID_API_KEY" })
    await createMerchantSession(store)
    return ok({ store: toStoreDTO(store) })
  } catch (err) {
    return handleRouteError(err, "merchant login")
  }
}
