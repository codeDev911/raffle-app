/**
 * GlitchTip connection details, kept in one module because four places need them: the client,
 * server and edge SDK configs, and the browser event tunnel.
 *
 * GlitchTip speaks the Sentry protocol, so the official @sentry/nextjs SDK talks to it directly.
 * A DSN is public by design — it identifies a project and authorises event *ingestion* only; it
 * cannot read issues back. It stays overridable per environment through .env.
 */

export const GLOTCHTIP_DSN: string =
  (process.env.NEXT_PUBLIC_GLITCHTIP_DSN || "").trim() ||
  "https://ef91f785a8e948438e0b0faa94bebb26@app.glitchtip.com/29497"

/**
 * 1% of requests get a trace. Errors are always sent (that is not sampled); this knob only
 * controls performance spans, and GlitchTip stores everything on our own disk, so a low value
 * is about keeping the volume sane rather than about cost per span.
 */
export const GLOTCHTIP_TRACES_SAMPLE_RATE = 0.01

/** Same-origin relay the browser posts events to, so ad blockers cannot drop them. */
export const GLOTCHTIP_TUNNEL_ROUTE = "/api/glitchtip-tunnel"

/** Envelope protocol version GlitchTip speaks (same number the SDK itself sends). */
const SENTRY_API_VERSION = "7"

/**
 * The authenticated ingest endpoint for a DSN.
 *
 * A tunneled browser request carries no credentials in its URL — that is the point of a tunnel —
 * so the relay rebuilds the query the SDK would have used: sentry_version plus sentry_key, which
 * is the user part of the DSN. Tested against this project: an envelope with neither these
 * parameters nor a DSN in its header is refused (403), while either one alone is accepted. The
 * relay sends both, so it works regardless of how the SDK shapes the envelope header.
 */
export function glitchtipEnvelopeUrl(dsn: string = GLOTCHTIP_DSN): string {
  const url = new URL(dsn)
  const projectId = url.pathname.replace(/^\//, "")
  const params = new URLSearchParams({ sentry_version: SENTRY_API_VERSION })
  if (url.username) params.set("sentry_key", url.username)
  return `${url.protocol}//${url.host}/api/${projectId || "0"}/envelope/?${params.toString()}`
}

/**
 * The DSN a tunneled envelope asks to be delivered to.
 *
 * When the SDK sends through a tunnel it writes the full DSN into the envelope's own header
 * (first line), so the relay can stay correct even if the project changes and a browser tab is
 * still holding an old bundle. Absent or unparsable headers simply fall back to the configured
 * DSN — a malformed envelope is GlitchTip's problem to reject, not ours to guess at.
 */
export function dsnFromEnvelope(body: string): string | null {
  const headerLine = body.split("\n", 1)[0]?.trim()
  if (!headerLine) return null
  try {
    const header = JSON.parse(headerLine) as { dsn?: unknown }
    return typeof header.dsn === "string" && header.dsn.includes("://") ? header.dsn : null
  } catch {
    return null
  }
}
