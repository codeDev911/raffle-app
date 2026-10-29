import { requireAdmin } from "@/lib/merchants/session"
import { adminExecuteDraw } from "@/lib/merchants/service"
import { handleRouteError, ok } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// POST — runs the CSPRNG draw over the campaign's paid entries (DRAW_READY → COMPLETED).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req)
    return ok(await adminExecuteDraw(params.id))
  } catch (err) {
    return handleRouteError(err, "admin execute draw")
  }
}
