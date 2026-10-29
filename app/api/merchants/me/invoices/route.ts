import { requireMerchant } from "@/lib/merchants/session"
import { generateInvoice, listInvoices } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const store = await requireMerchant(req)
    return ok({ invoices: await listInvoices(store) })
  } catch (err) {
    return handleRouteError(err, "list invoices")
  }
}

// POST { campaignId } — closes the campaign and bills its fulfilled entries.
export async function POST(req: Request) {
  try {
    const store = await requireMerchant(req)
    const invoice = await generateInvoice(store, await readJson(req))
    return ok({ invoice }, 201)
  } catch (err) {
    return handleRouteError(err, "generate invoice")
  }
}
