import { requireAdmin } from "@/lib/merchants/session"
import { getInvoiceDetail } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// Read-only. Merchant payments are confirmed in Admin → Payments, not here.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    return ok(await getInvoiceDetail(params.id))
  } catch (err) {
    return handleRouteError(err, "admin get invoice")
  }
}
