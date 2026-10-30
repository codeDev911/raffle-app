import { NextResponse } from "next/server"
import { syncTracker } from "@/lib/merchants/service"
import { publicBaseUrl } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// GET — where Safepay sends the browser back after a hosted checkout.
// The query string is NOT trusted (anyone can open it); the tracker is only used to look the
// session up again on Safepay's side, so a replayed or hand-typed URL cannot settle anything.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const tracker = (url.searchParams.get("tracker") || "").trim()
  const scope = url.searchParams.get("ref") === "invoice" ? "invoice" : "entry"
  const cancelled = url.searchParams.get("cancelled") === "1"

  const target = new URL("/merchants/dashboard", publicBaseUrl(req))
  target.searchParams.set("tab", scope === "invoice" ? "invoices" : "entries")

  if (!tracker) {
    target.searchParams.set("payment", cancelled ? "cancelled" : "pending")
    return NextResponse.redirect(target, { status: 303 })
  }

  try {
    const result = await syncTracker(tracker)
    const payment =
      result.status === "paid"
        ? "success"
        : result.status === "pending"
          ? cancelled
            ? "cancelled"
            : "pending"
          : result.status === "unknown"
            ? "pending"
            : "failed"

    target.searchParams.set("payment", payment)
    target.searchParams.set("tracker", result.tracker)
    if (result.invoiceId) target.searchParams.set("invoice", result.invoiceId)
    if (result.reason) target.searchParams.set("reason", result.reason)
  } catch (err) {
    // A gateway hiccup must never strand the merchant: land on the dashboard with a pending
    // banner, where the recheck button (POST /api/merchants/me/checkout/sync) retries the sync.
    console.error("[MerchantConnect] Safepay callback sync failed:", err)
    target.searchParams.set("payment", "pending")
    target.searchParams.set("tracker", tracker)
  }

  return NextResponse.redirect(target, { status: 303 })
}
