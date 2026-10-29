import { clearMerchantSession } from "@/lib/merchants/session"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    await clearMerchantSession()
    return ok({ message: "Logged out" })
  } catch (err) {
    return handleRouteError(err, "merchant logout")
  }
}
