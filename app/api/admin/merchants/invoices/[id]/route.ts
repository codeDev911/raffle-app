import { requireAdmin } from "@/lib/merchants/session"
import { adminGetInvoiceDetail, adminUpdateInvoiceNotes } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// GET — invoice, its ledger lines, the campaign behind it, the store and the pay-in accounts.
// Merchant payments are still confirmed in Admin → Payments; this view never settles money.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    return ok(await adminGetInvoiceDetail(params.id))
  } catch (err) {
    return handleRouteError(err, "admin get invoice")
  }
}

// PATCH { adminNotes: string } — annotate the settlement for the audit trail. Clears on empty.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    const body = await readJson(req)
    return ok({ invoice: await adminUpdateInvoiceNotes(params.id, body) })
  } catch (err) {
    return handleRouteError(err, "admin update invoice notes")
  }
}
