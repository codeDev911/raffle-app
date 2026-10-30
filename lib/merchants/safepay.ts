// Safepay (hosted checkout) client for Merchant Connect.
//
// Three rules keep this safe to build on:
//  1. Nothing is hardcoded. Keys, host and webhook secret all come from the environment, so
//     sandbox → live is a config change, never a code change.
//  2. A redirect or a webhook is only a *signal* to look at the tracker again. The reporter API
//     is the source of truth for whether money actually arrived (a shopper can replay a URL or
//     close the tab mid-payment).
//  3. Amounts travel in the lowest denomination (paisa for PKR), exactly as the ledger stores
//     them, so a capture can be compared with what we billed without any rounding.
import { createHmac, timingSafeEqual } from "crypto"

export type SafepayEnvironment = "sandbox" | "production"

export interface SafepaySettings {
  /** `merchant_api_key` from the Safepay dashboard (sec_…). */
  apiKey: string
  /** Merchant secret used to create trackers, passport tokens and reporter calls. */
  secret: string
  environment: SafepayEnvironment
  /** API host without trailing slash. */
  apiHost: string
  /** Hosted checkout page, with trailing slash. */
  checkoutHost: string
  /** Shared secret configured for webhooks; null when signature checks are not set up yet. */
  webhookSecret: string | null
  currency: string
}

const API_HOSTS: Record<SafepayEnvironment, string> = {
  sandbox: "https://sandbox.api.getsafepay.com",
  // Live API and hosted checkout live on different hosts, matching Safepay's own SDK.
  production: "https://api.getsafepay.com",
}

const CHECKOUT_HOSTS: Record<SafepayEnvironment, string> = {
  sandbox: "https://sandbox.api.getsafepay.com/embedded/",
  production: "https://getsafepay.com/embedded/",
}

/** Reads the configuration on every call so tests (and a restart) never hold stale keys. */
export function safepaySettings(): SafepaySettings | null {
  const apiKey = (process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY || "").trim()
  const secret = (process.env.SAFEPAY_SECRET || "").trim()
  if (!apiKey || !secret) return null
  const environment: SafepayEnvironment =
    (process.env.SAFEPAY_ENV || "sandbox").trim().toLowerCase() === "production" ? "production" : "sandbox"
  const webhookSecret = (process.env.SAFEPAY_WEBHOOK_SECRET || "").trim() || null
  return {
    apiKey,
    secret,
    environment,
    apiHost: API_HOSTS[environment],
    checkoutHost: CHECKOUT_HOSTS[environment],
    webhookSecret,
    currency: (process.env.SAFEPAY_CURRENCY || "PKR").trim().toUpperCase() || "PKR",
  }
}

export function isSafepayConfigured(): boolean {
  return safepaySettings() !== null
}

// ───────────────────────── transport (injectable for tests) ─────────────────────────

export interface SafepayRequest {
  method: "GET" | "POST"
  url: string
  headers: Record<string, string>
  body?: string
}

export interface SafepayResponse {
  status: number
  body: any
}

type SafepayTransport = (request: SafepayRequest) => Promise<SafepayResponse>

let injectedTransport: SafepayTransport | null = null

/** Harness hook: route requests to an in-memory fake instead of the network. */
export function __setSafepayTransport(transport: SafepayTransport | null) {
  injectedTransport = transport
}

/** A hung socket must fail the checkout instead of holding the request open. */
const REQUEST_TIMEOUT_MS = 15_000

/** A gateway answer we can act on: what failed, whether retrying could help, and why. */
export class SafepayError extends Error {
  /** HTTP status Safepay answered with — undefined when the call never connected. */
  readonly status?: number
  /** True when Safepay refused the request itself (bad input/credentials), so a retry cannot help. */
  readonly rejected: boolean

  constructor(what: string, message: string, status?: number, rejected = false) {
    super(`Safepay ${what} failed: ${message}`)
    this.name = "SafepayError"
    this.status = status
    this.rejected = rejected
  }
}

const describe = (request: SafepayRequest) => `${request.method} ${new URL(request.url).pathname}`

async function send(request: SafepayRequest): Promise<SafepayResponse> {
  if (injectedTransport) return injectedTransport(request)

  const started = Date.now()
  let res: Response
  try {
    res = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err: any) {
    const cause = err?.cause?.code || err?.cause?.message || err?.message || "network error"
    console.error(`[Safepay] ${describe(request)} unreachable after ${Date.now() - started}ms: ${cause}`)
    throw new SafepayError("request", `could not reach ${new URL(request.url).host} (${cause})`, 503, false)
  }

  let body: any = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  if (res.status >= 400) {
    const detail = body?.status?.errors || body?.status?.message || "no detail"
    console.error(`[Safepay] ${describe(request)} → ${res.status} in ${Date.now() - started}ms: ${JSON.stringify(detail)}`)
  }
  return { status: res.status, body }
}

/**
 * Safepay refuses input with a 4xx, and sometimes with a 500 carrying `status.errors` — both mean
 * the request itself was rejected, which a retry cannot fix. The joined `errors` are also the only
 * useful part of the answer, so they win over the generic `message: "fail"`.
 */
function failure(what: string, response: SafepayResponse) {
  const status = response.body?.status
  const errors = Array.isArray(status?.errors)
    ? status.errors.filter((entry: unknown) => typeof entry === "string").join("; ")
    : ""
  const message =
    errors || status?.message || response.body?.error || response.body?.message || `HTTP ${response.status}`
  const rejected = Boolean(errors) || (response.status >= 400 && response.status < 500 && response.status !== 429)
  return new SafepayError(what, message, response.status, rejected)
}

// ───────────────────────── checkout session ─────────────────────────

export interface CreateCheckoutInput {
  /** Total to collect, in the lowest denomination (paisa). */
  amountPaisa: number
  /** Our own identifier for the thing being paid (ticket number / invoice number). */
  orderId: string
  redirectUrl: string
  cancelUrl: string
}

export interface SafepayCheckoutSession {
  tracker: string
  checkoutUrl: string
  environment: SafepayEnvironment
  amountPaisa: number
  currency: string
}

/**
 * Creates a tracker, an authentication token and the hosted checkout URL.
 * The tracker is the only handle we need afterwards: it identifies the session for the redirect,
 * the webhook and the reporter lookup.
 */
export async function createSafepayCheckout(input: CreateCheckoutInput): Promise<SafepayCheckoutSession> {
  const settings = safepaySettings()
  if (!settings) {
    throw new SafepayError("config", "set NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY and SAFEPAY_SECRET", undefined, true)
  }
  const amountPaisa = Math.round(input.amountPaisa)
  if (!Number.isFinite(amountPaisa) || amountPaisa <= 0) {
    throw new SafepayError("session setup", "amount must be a positive integer", undefined, true)
  }

  const auth = { "x-sfpy-merchant-secret": settings.secret }
  const session = await send({
    method: "POST",
    url: `${settings.apiHost}/order/payments/v3/`,
    headers: { ...auth, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      merchant_api_key: settings.apiKey,
      intent: "CYBERSOURCE",
      mode: "payment",
      entry_mode: "raw",
      currency: settings.currency,
      amount: amountPaisa,
      include_fees: false,
      // `order_id` is the ONLY meta key Safepay accepts — anything else is refused with
      // "unsupported meta key <name>". Our own references live on the payment row, keyed by the
      // tracker, so nothing is lost by sending just this.
      metadata: { order_id: input.orderId },
    }),
  })
  if (session.status >= 400) throw failure("session setup", session)

  const tracker = session.body?.data?.tracker?.token
  if (!tracker || typeof tracker !== "string") throw failure("session setup", session)

  const passport = await send({
    method: "POST",
    url: `${settings.apiHost}/client/passport/v1/token`,
    headers: { ...auth, Accept: "application/json" },
  })
  if (passport.status >= 400) throw failure("passport token", passport)
  const tbt = passport.body?.data
  if (!tbt || typeof tbt !== "string") throw failure("passport token", passport)

  return {
    tracker,
    checkoutUrl: buildCheckoutUrl(settings, {
      tracker,
      tbt,
      redirectUrl: input.redirectUrl,
      cancelUrl: input.cancelUrl,
      orderId: input.orderId,
    }),
    environment: settings.environment,
    amountPaisa,
    currency: settings.currency,
  }
}

/** Same query shape the official SDK builds, kept here so the URL is verifiable in tests. */
function buildCheckoutUrl(
  settings: SafepaySettings,
  params: { tracker: string; tbt: string; redirectUrl: string; cancelUrl: string; orderId: string },
): string {
  const query = new URLSearchParams({
    environment: settings.environment,
    tracker: params.tracker,
    tbt: params.tbt,
    source: "hosted",
    order_id: params.orderId,
    redirect_url: params.redirectUrl,
    cancel_url: params.cancelUrl,
  })
  return `${settings.checkoutHost}?${query.toString()}`
}

// ───────────────────────── outcome (reporter) ─────────────────────────

/** Three outcomes only: money arrived, money did not arrive, or we cannot tell yet. */
export type SafepayOutcome = "paid" | "failed" | "pending"

export interface SafepayTrackerSnapshot {
  tracker: string
  outcome: SafepayOutcome
  /** Raw Safepay state, e.g. TRACKER_ENDED — kept for logs and the payment audit trail. */
  state: string
  amountPaisa: number | null
  currency: string | null
  /** Card/wallet reference Safepay reports for the action, when available. */
  reference: string | null
}

// Tracker states that mean "money moved". Everything unknown stays PENDING on purpose: we never
// release or settle a ticket because of a state we failed to parse.
const PAID_STATES = new Set(["TRACKER_ENDED", "TRACKER_ENDED_SUCCESSFULLY"])
const FAILED_STATES = new Set([
  "TRACKER_FAILED",
  "TRACKER_CANCELLED",
  "TRACKER_CANCELED",
  "TRACKER_ABANDONED",
  "TRACKER_EXPIRED",
  "TRACKER_DECLINED",
])

/** Current state of a checkout session, straight from Safepay. Never throws on a 404. */
export async function fetchSafepayTracker(tracker: string): Promise<SafepayTrackerSnapshot> {
  const settings = safepaySettings()
  if (!settings) throw new Error("Safepay is not configured")
  const id = String(tracker || "").trim()
  if (!id) throw new Error("A tracker token is required")

  const response = await send({
    method: "GET",
    url: `${settings.apiHost}/reporter/api/v1/payments/${encodeURIComponent(id)}`,
    headers: { "x-sfpy-merchant-secret": settings.secret, Accept: "application/json" },
  })
  if (response.status >= 400) throw failure("tracker lookup", response)

  // Safepay answers with the tracker fields flat inside `data`:
  //   { ok: true, data: { token, state: "TRACKER_ENDED", purchase_totals: {…}, charge: {…} } }
  // Reading `data.tracker` (as an older payload did) yields nothing, which made every session look
  // PENDING and left settlement to a human. Accept both shapes.
  const payload = response.body || {}
  const trackerNode =
    (payload.data?.state ? payload.data : null) || payload.data?.tracker || payload.tracker || {}
  const state = String(trackerNode.state || "").toUpperCase()
  const quote = trackerNode.purchase_totals?.quote_amount || trackerNode.purchase_totals?.base_amount || null
  const amount = Number(quote?.amount)
  const reference =
    trackerNode.charge?.token ||
    payload.data?.charge?.token ||
    payload.data?.action?.token ||
    payload.data?.action?.payment_method?.token ||
    null

  return {
    tracker: String(trackerNode.token || id),
    outcome: PAID_STATES.has(state) ? "paid" : FAILED_STATES.has(state) ? "failed" : "pending",
    state: state || "UNKNOWN",
    amountPaisa: Number.isFinite(amount) ? Math.round(amount) : null,
    currency: quote?.currency ? String(quote.currency).toUpperCase() : null,
    reference: typeof reference === "string" ? reference : null,
  }
}

// ───────────────────────── webhook signature ─────────────────────────

/**
 * Verifies `X-SFPY-SIGNATURE`. Safepay signs with a shared secret configured in the dashboard;
 * both the plain-body HMAC and the timestamped variant (Raastwire / newer accounts) are accepted,
 * hex or base64 encoded. Without a configured secret every webhook is rejected — the redirect and
 * the dashboard recheck still settle payments, so refusing unsigned calls costs nothing.
 */
export function verifySafepaySignature(
  rawBody: string,
  signature: string | null | undefined,
  timestamp?: string | null,
): boolean {
  const secret = safepaySettings()?.webhookSecret
  if (!secret || !signature) return false

  const keys = [secret]
  const decoded = Buffer.from(secret, "base64").toString("utf8")
  if (decoded && decoded !== secret && !decoded.includes("\uFFFD")) keys.push(decoded)

  const bodies = timestamp ? [`${timestamp}.${rawBody}`, rawBody] : [rawBody]
  const provided = signature.trim()

  for (const key of keys) {
    for (const payload of bodies) {
      const digest = createHmac("sha256", key).update(payload, "utf8").digest()
      for (const candidate of [digest.toString("hex"), digest.toString("base64")]) {
        if (constantTimeEqual(candidate, provided)) return true
      }
    }
  }
  return false
}

function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8")
  const right = Buffer.from(b, "utf8")
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

/** Pulls the tracker out of a webhook payload without trusting its `state`/`success` fields. */
export function trackerFromWebhook(payload: any): string | null {
  const candidates = [
    payload?.data?.tracker?.token,
    payload?.data?.tracker,
    payload?.tracker?.token,
    payload?.tracker,
    payload?.payment?.tracker,
    payload?.data?.payment?.tracker,
  ]
  for (const value of candidates) {
    if (typeof value === "string" && value.trim().startsWith("track_")) return value.trim()
  }
  return null
}
