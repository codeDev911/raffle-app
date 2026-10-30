import { deleteSession } from "@/lib/auth"
import { clearMerchantSession } from "@/lib/merchants/session"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// POST /api/merchants/logout — clears both the API-key merchant session and the
// unified account session (email/password or Google) so neither can reopen the dashboard.
export async function POST() {
  try {
    await clearMerchantSession()
    try {
      await deleteSession()
    } catch {
      // no unified session to clear
    }
    return ok({ message: "Logged out" })
  } catch (err) {
    return handleRouteError(err, "merchant logout")
  }
}
