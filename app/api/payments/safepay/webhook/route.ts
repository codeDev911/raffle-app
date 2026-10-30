import { NextResponse } from "next/server"
import { trackerFromWebhook, verifySafepaySignature } from "@/lib/merchants/safepay"
import { syncTracker } from "@/lib/merchants/service"
import { fail, noCacheHeaders } from "@/lib/merchants/http"

export const dynamic = "force-dynamic"

// POST — Safepay server-to-server notification.
// The body is only a hint: the signature is verified over the RAW payload, then the tracker is
// re-read from Safepay's reporter API. A forged or replayed body therefore cannot settle a ticket.
export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-sfpy-signature") || req.headers.get("x-sfpy-signature-v2")
  const timestamp = req.headers.get("x-sfpy-timestamp")

  if (!verifySafepaySignature(rawBody, signature, timestamp)) {
    return fail("Invalid signature", 401, { code: "INVALID_SIGNATURE" })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return fail("Request body must be valid JSON", 400, { code: "INVALID_JSON" })
  }

  const tracker = trackerFromWebhook(payload)
  if (!tracker) {
    // Nothing to reconcile — acknowledge so Safepay stops retrying a payload we cannot use.
    return NextResponse.json({ success: true, ignored: "no_tracker" }, { headers: noCacheHeaders })
  }

  try {
    const result = await syncTracker(tracker)
    return NextResponse.json(
      { success: true, tracker: result.tracker, status: result.status },
      { headers: noCacheHeaders },
    )
  } catch (err) {
    // Non-2xx makes Safepay retry, which is what we want when our own lookup failed.
    console.error("[MerchantConnect] Safepay webhook sync failed:", err)
    return fail("Could not reconcile payment yet", 503, { code: "RETRY_LATER" })
  }
}
