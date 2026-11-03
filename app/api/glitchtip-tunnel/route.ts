import { GLOTCHTIP_DSN, dsnFromEnvelope, glitchtipEnvelopeUrl } from "@/lib/glitchtip"

export const dynamic = "force-dynamic"

/**
 * Same-origin relay for browser error events (the `tunnel` option in sentry.client.config.ts).
 *
 * Privacy-blocker lists routinely match app.glitchtip.com, and a blocked reporter fails silently
 * — the site looks healthy while no errors ever arrive. Posting to this route instead keeps the
 * request on our own domain.
 *
 * The client DSN is already public, so forwarding from the server leaks nothing new: the
 * ingestion key travels in the envelope, which this handler never inspects or logs.
 */
export async function POST(req: Request) {
  try {
    const body = await req.text()

    // A single envelope is normally a few KB. Cap it so this route cannot be used as a free
    // proxy to flood GlitchTip (or to exhaust server memory).
    if (body.length > 0 && body.length <= 1_000_000) {
      await fetch(glitchtipEnvelopeUrl(dsnFromEnvelope(body) ?? GLOTCHTIP_DSN), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body,
      })
    }
  } catch {
    // Never surface a relay failure to the browser: the SDK has already moved on, and an error
    // response here would only generate more error events.
  }

  return new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: { "Content-Type": "application/json" } })
}
