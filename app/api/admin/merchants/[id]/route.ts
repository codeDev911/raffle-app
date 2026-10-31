import { requireAdmin } from "@/lib/merchants/session"
import { adminGetStoreDetail } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// GET /api/admin/merchants/[id] — store detail plus owner account.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    return ok(await adminGetStoreDetail(params.id))
  } catch (err) {
    return handleRouteError(err, "admin get merchant detail")
  }
}
