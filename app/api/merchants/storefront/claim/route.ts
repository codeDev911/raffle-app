import { NextResponse } from "next/server"
import { getStorefrontClaims } from "@/lib/merchants/services/storefront"

export const dynamic = "force-dynamic"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

/**
 * GET /api/merchants/storefront/claim?store=<id>&token=<cart nonce>
 *
 * After checkout the shoper's browser still holds the nonce it stamped on the cart, so this
 * returns the ticket(s) minted for that cart — the congratulations popup data.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const storeId = String(url.searchParams.get("store") || "").trim()
    const token = String(url.searchParams.get("token") || "").trim()
    if (!storeId || !token) {
      return NextResponse.json({ success: false, error: "store and token are required" }, { status: 400, headers: CORS })
    }
    const claims = await getStorefrontClaims(storeId, token)
    return NextResponse.json({ success: true, claims }, { headers: CORS })
  } catch (err) {
    console.error("[Storefront] claim lookup failed:", err)
    return NextResponse.json({ success: false, error: "Could not read entry" }, { status: 500, headers: CORS })
  }
}
