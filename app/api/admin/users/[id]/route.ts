import { requireAdmin } from "@/lib/merchants/session"
import { adminUpdateUserStatus } from "@/lib/merchants/service"
import { handleRouteError, ok, readJson } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// PATCH { isActive: boolean } — suspends or reactivates a merchant account.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    const body = await readJson(req)
    return ok({ user: await adminUpdateUserStatus(params.id, body) })
  } catch (err) {
    return handleRouteError(err, "admin update user")
  }
}
