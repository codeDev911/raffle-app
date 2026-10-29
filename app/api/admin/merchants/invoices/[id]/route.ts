import { requireAdmin } from "@/lib/merchants/session"
import { adminReviewInvoice, getInvoiceDetail } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    return ok(await getInvoiceDetail(params.id))
  } catch (err) {
    return handleRouteError(err, "admin get invoice")
  }
}

// PATCH { action: "approve" | "reject", adminNotes? }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    const invoice = await adminReviewInvoice(params.id, await readJson(req))
    return ok({ invoice })
  } catch (err) {
    return handleRouteError(err, "admin review invoice")
  }
}
