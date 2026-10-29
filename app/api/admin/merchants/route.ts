import { requireAdmin } from "@/lib/merchants/session"
import { adminOverview } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// GET /api/admin/merchants — stores, campaigns, invoices and settlement KPIs.
export async function GET(req: Request) {
  try {
    await requireAdmin(req)
    return ok(await adminOverview())
  } catch (err) {
    return handleRouteError(err, "admin merchants overview")
  }
}
