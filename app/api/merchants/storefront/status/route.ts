import { NextResponse } from "next/server"
import { getStorefrontStatus, parseCartInput } from "@/lib/merchants/services/storefront"

export const dynamic = "force-dynamic"

// Public: called by the storefront widget from the shopper's browser on every store's own domain.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

/**
 * POST /api/merchants/storefront/status
 * Body: { storeId, amount, items: [{ title, sku, productId, variantId, quantity, unitPrice }] }
 *
 * Returns whether the live cart qualifies for a free draw entry, and how far it is from the
 * threshold. The authoritative check still runs on the order webhook.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const storeId = String(body?.storeId || "").trim()
    if (!storeId) {
      return NextResponse.json({ success: false, error: "storeId is required" }, { status: 400, headers: CORS })
    }
    const status = await getStorefrontStatus(storeId, parseCartInput(body))
    if (!status) {
      return NextResponse.json({ success: false, error: "Store not available" }, { status: 404, headers: CORS })
    }
    return NextResponse.json({ success: true, ...status }, { headers: CORS })
  } catch (err) {
    console.error("[Storefront] status failed:", err)
    return NextResponse.json({ success: false, error: "Could not read campaign" }, { status: 500, headers: CORS })
  }
}
