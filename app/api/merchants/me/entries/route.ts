import { requireMerchant } from "@/lib/merchants/session"
import { listEntries } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// GET /api/merchants/me/entries?campaignId=&status=&search=&includeTest=true&take=
export async function GET(req: Request) {
  try {
    const store = await requireMerchant(req)
    const { searchParams } = new URL(req.url)
    const result = await listEntries(store, {
      campaignId: searchParams.get("campaignId"),
      status: searchParams.get("status"),
      search: searchParams.get("search"),
      includeTest: searchParams.get("includeTest") === "true",
      take: Number(searchParams.get("take")) || undefined,
    })
    return ok(result)
  } catch (err) {
    return handleRouteError(err, "list entries")
  }
}
