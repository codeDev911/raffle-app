// Safepay checkout checks: the hosted-checkout path has to prove that (a) the amount is decided
// server-side, (b) only Safepay's own reporter can settle a ticket, (c) replays and forged
// callbacks are no-ops, and (d) an abandoned session releases the ticket again.
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { check } from "./_util.mjs"

// Credentials first: the client reads the environment on every call, so these win over any .env.
process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY = "sec_harness_public_key"
process.env.SAFEPAY_SECRET = "harness-merchant-secret"
process.env.SAFEPAY_ENV = "sandbox"
process.env.SAFEPAY_WEBHOOK_SECRET = "harness-webhook-secret"

const svc = await import("../../lib/merchants/service.ts")
const safepay = await import("../../lib/merchants/safepay.ts")
const { signShopifyPayload } = await import("../../lib/merchants/shopify.ts")
const { getMerchantDb } = await import("../../lib/merchants/db.ts")
const { payments, entries } = await import("./stubs/prisma.mjs")

const settings = safepay.safepaySettings()
const WEBHOOK_SECRET = settings.webhookSecret
const TICKET_PKR = 500
const TICKET_PAISA = TICKET_PKR * 100
const DOMAIN = "checkout-store.myshopify.com"
const BASE_URL = "https://merchant.pakraffle.test"

// ── fake Safepay: sessions, passport, reporter ──
const sessions = new Map()
let seq = 0
let lastSession = null
let reporterAmountPaisa = null // when set, the reporter reports a different amount
let rejectSession = null // when set, the next session call answers with this instead

safepay.__setSafepayTransport(async (request) => {
  if (request.method === "POST" && request.url.endsWith("/order/payments/v3/")) {
    if (rejectSession) {
      const reply = rejectSession
      rejectSession = null
      return reply
    }
    const body = JSON.parse(request.body || "{}")
    const tracker = `track_harness_${++seq}`
    sessions.set(tracker, { state: "TRACKER_STARTED", amountPaisa: body.amount, currency: body.currency })
    lastSession = { tracker, body }
    return { status: 200, body: { data: { tracker: { token: tracker, state: "TRACKER_STARTED" } } } }
  }
  if (request.method === "POST" && request.url.endsWith("/client/passport/v1/token")) {
    return { status: 200, body: { data: "harness-tbt" } }
  }
  if (request.method === "GET" && request.url.includes("/reporter/api/v1/payments/")) {
    const tracker = decodeURIComponent(request.url.split("/reporter/api/v1/payments/")[1])
    const session = sessions.get(tracker)
    if (!session) return { status: 404, body: { status: { message: "Not found" } } }
    return {
      status: 200,
      body: {
        // Mirror the real reporter payload: the tracker fields sit flat inside `data`, with the
        // amount already in paisa. A fake that nests them under `data.tracker` hides the bug where
        // every session reads back as PENDING.
        ok: true,
        data: {
          token: tracker,
          environment: "sandbox",
          state: session.state,
          purchase_totals: {
            quote_amount: { currency: session.currency, amount: reporterAmountPaisa ?? session.amountPaisa },
            base_amount: { currency: session.currency, amount: reporterAmountPaisa ?? session.amountPaisa },
          },
          charge: { token: "ch_harness" },
        },
      },
    }
  }
  throw new Error(`unexpected Safepay call: ${request.method} ${request.url}`)
})

function setTrackerState(tracker, state) {
  sessions.get(tracker).state = state
}

// ── fixtures ──
const db = await getMerchantDb()
const store = await svc.connectStore({
  name: "Checkout Store",
  storeUrl: `https://${DOMAIN}`,
  contactEmail: "owner@checkout.pk",
  contactPhone: "0300 1112223",
})
const storeRecord = await db.merchantStore.findUnique({ where: { id: store.store.id } })
const shop = storeRecord

async function newCampaign(title) {
  // Every campaign matches ALL_ORDERS, so park the previous ones to keep minting deterministic.
  await db.merchantCampaign.updateMany({ where: { storeId: shop.id, status: "ACTIVE" }, data: { status: "PAUSED" } })
  return svc.createCampaign(shop, {
    title,
    raffleId: "prize-1",
    ruleType: "ALL_ORDERS",
    maxEntries: 50,
    endDate: new Date(Date.now() + 14 * 24 * 3600_000),
  })
}

async function mint(orderId, quantity = 1) {
  const payload = {
    id: orderId,
    name: `#${orderId}`,
    customer: { first_name: "Ayesha", last_name: "Khan", phone: "03211234567" },
    financial_status: "paid",
    fulfillment_status: "fulfilled",
    total_price: String(quantity * 1500),
    line_items: [{ id: 1, title: "Lawn Suit", sku: "SKU-1", product_id: 1, variant_id: 1, quantity, price: "1500.0" }],
  }
  const rawBody = JSON.stringify(payload)
  const result = await svc.processShopifyWebhook({
    rawBody,
    topic: "orders/fulfilled",
    shopDomain: DOMAIN,
    hmac: signShopifyPayload(rawBody, shop.webhookSecret),
  })
  const issued = result.outcomes.find((o) => o.result === "ISSUED")
  assert.ok(issued, `expected order ${orderId} to mint a ticket`)
  return db.merchantEntry.findUnique({ where: { id: issued.entryId } })
}

const paymentFor = (ticketNumber) => payments.rows.find((row) => row.transactionId === `MCH-${ticketNumber}`)
const entryOf = (id) => db.merchantEntry.findUnique({ where: { id } })
const raffleEntryCount = () => entries.rows.length

console.log("\nsafepay checkout")

await check("a ticket checkout is priced server-side and locks the ticket", async () => {
  assert.equal(safepay.isSafepayConfigured(), true)
  await newCampaign("Card Campaign")
  const entry = await mint("card-1")

  const started = await svc.startEntryCheckout(shop, entry.id, { baseUrl: BASE_URL })
  assert.equal(started.amount, TICKET_PKR)
  assert.equal(started.amountPaisa, TICKET_PAISA)
  assert.match(started.checkoutUrl, /^https:\/\/sandbox\.api\.getsafepay\.com\/embedded\/\?/)
  assert.match(started.checkoutUrl, /source=hosted/)
  assert.match(started.checkoutUrl, /redirect_url=https%3A%2F%2Fmerchant\.pakraffle\.test%2Fapi%2Fpayments%2Fsafepay%2Fcallback%3Fref%3Dentry/)

  // The gateway was asked for exactly what we billed, not for anything the client sent.
  assert.equal(lastSession.body.amount, TICKET_PAISA)
  assert.equal(lastSession.body.currency, "PKR")
  assert.equal(lastSession.body.metadata.order_id, entry.ticketNumber)
  // Safepay refuses any meta key other than order_id ("unsupported meta key …"), which used to
  // fail every checkout with an opaque 502.
  assert.deepEqual(Object.keys(lastSession.body.metadata), ["order_id"])

  assert.equal((await entryOf(entry.id)).status, "INVOICED")
  const row = paymentFor(entry.ticketNumber)
  assert.equal(row?.status, "PENDING")
  assert.equal(row?.method, "SAFEPAY")
  assert.equal(row?.gatewayRef, started.tracker)
  assert.equal(row?.metadata.gateway.tracker, started.tracker)
})

await check("a paid tracker creates a verified payment and the raffle entry with no admin", async () => {
  const tracker = lastSession.tracker
  setTrackerState(tracker, "TRACKER_ENDED")

  const result = await svc.syncTracker(tracker)
  assert.equal(result.status, "paid")
  assert.equal(result.settled, 1)

  const fresh = await entryOf(result.entryId)
  assert.equal(fresh.status, "PAID")

  const row = payments.rows.find((p) => p.gatewayRef === tracker)
  assert.equal(row.status, "COMPLETED")
  assert.equal(row.amount, TICKET_PAISA)
  assert.equal(row.metadata.gateway.provider, "safepay")
  assert.ok(row.metadata.gateway.paidAt)
  assert.ok(row.metadata.settledAt)

  const raffleEntries = entries.rows.filter((e) => e.paymentId === row.id)
  assert.equal(raffleEntries.length, 1)
  assert.equal(row.metadata.raffleEntryId, raffleEntries[0].id)
})

await check("replaying the same tracker settles exactly once", async () => {
  const tracker = lastSession.tracker
  const before = raffleEntryCount()
  const replay = await svc.syncTracker(tracker)
  assert.equal(replay.status, "paid")
  assert.equal(raffleEntryCount(), before) // no second raffle entry
  assert.equal(payments.rows.filter((p) => p.gatewayRef === tracker).length, 1)
})

await check("a forged webhook body is rejected, a signed one is accepted", async () => {
  const raw = JSON.stringify({ data: { tracker: { token: "track_harness_1", state: "TRACKER_ENDED" } } })
  const signed = createHmac("sha256", WEBHOOK_SECRET).update(raw, "utf8").digest("hex")

  assert.equal(safepay.verifySafepaySignature(raw, null), false)
  assert.equal(safepay.verifySafepaySignature(raw, "deadbeef"), false)
  assert.equal(safepay.verifySafepaySignature(raw, signed), true)
  // Newer accounts sign the timestamp and the body together.
  assert.equal(
    safepay.verifySafepaySignature(raw, createHmac("sha256", WEBHOOK_SECRET).update(`1700000000.${raw}`, "utf8").digest("hex"), "1700000000"),
    true,
  )
  // A tampered amount produces a different digest.
  assert.equal(safepay.verifySafepaySignature(raw.replace("TRACKER_ENDED", "TRACKER_FAILED"), signed), false)

  assert.equal(safepay.trackerFromWebhook({ data: { tracker: { token: "track_abc" } } }), "track_abc")
  assert.equal(safepay.trackerFromWebhook({ tracker: "track_abc" }), "track_abc")
  assert.equal(safepay.trackerFromWebhook({ data: { tracker: { token: "not-a-tracker" } } }), null)
})

await check("an amount mismatch refuses to settle and never mints an entry", async () => {
  const entry = await mint("card-2")
  const started = await svc.startEntryCheckout(shop, entry.id, { baseUrl: BASE_URL })
  const before = raffleEntryCount()

  reporterAmountPaisa = TICKET_PAISA - 100
  setTrackerState(started.tracker, "TRACKER_ENDED")
  const result = await svc.syncTracker(started.tracker)
  reporterAmountPaisa = null

  assert.equal(result.status, "mismatch")
  assert.equal(result.reason, "amount_mismatch")
  assert.equal(raffleEntryCount(), before)
  assert.equal((await entryOf(entry.id)).status, "INVOICED")
  assert.equal(paymentFor(entry.ticketNumber).status, "PENDING")
})

await check("a failed tracker releases the ticket instead of leaving it locked", async () => {
  const tracker = lastSession.tracker
  setTrackerState(tracker, "TRACKER_CANCELLED")
  const result = await svc.syncTracker(tracker)

  assert.equal(result.status, "failed")
  const row = payments.rows.find((p) => p.gatewayRef === tracker)
  assert.equal(row.status, "FAILED")
  const fresh = await db.merchantEntry.findFirst({ where: { id: row.metadata.merchantEntryId } })
  assert.equal(fresh.status, "ISSUED")
})

await check("an abandoned session expires instead of holding the ticket forever", async () => {
  const entry = await mint("card-3")
  const started = await svc.startEntryCheckout(shop, entry.id, { baseUrl: BASE_URL })
  const row = paymentFor(entry.ticketNumber)
  const stale = new Date(Date.now() - 90 * 60 * 1000).toISOString()
  row.metadata = { ...row.metadata, gateway: { ...row.metadata.gateway, startedAt: stale } }

  const result = await svc.syncTracker(started.tracker) // tracker still TRACKER_STARTED
  assert.equal(result.status, "failed")
  assert.equal(result.reason, "session_expired")
  assert.equal(row.status, "CANCELLED")
  assert.equal((await entryOf(entry.id)).status, "ISSUED")
})

await check("a dashboard recheck settles a paid session whose webhook was lost", async () => {
  const entry = await mint("card-4")
  const started = await svc.startEntryCheckout(shop, entry.id, { baseUrl: BASE_URL })
  setTrackerState(started.tracker, "TRACKER_ENDED")

  const sweep = await svc.syncStoreCheckouts(shop)
  assert.ok(sweep.paid >= 1)
  assert.equal((await entryOf(entry.id)).status, "PAID")
})

await check("one invoice checkout settles every ticket on the batch", async () => {
  const campaign = await newCampaign("Batch Campaign")
  const first = await mint("batch-1")
  const second = await mint("batch-2")
  const invoice = await svc.generateInvoice(shop, { campaignId: campaign.id })
  assert.equal(invoice.totalEntries, 2)

  const started = await svc.startInvoiceCheckout(shop, invoice.id, { baseUrl: BASE_URL })
  assert.equal(started.amountPaisa, TICKET_PAISA * 2)
  assert.equal(lastSession.body.amount, TICKET_PAISA * 2)
  assert.match(started.checkoutUrl, /ref%3Dinvoice/)

  const stored = await db.merchantInvoice.findUnique({ where: { id: invoice.id } })
  assert.equal(stored.gatewayRef, started.tracker)
  assert.equal(stored.gatewayAmount, TICKET_PAISA * 2)
  assert.equal(stored.checkoutUrl, started.checkoutUrl)
  assert.equal(stored.status, "PENDING") // opening a session must not fake a submission

  setTrackerState(started.tracker, "TRACKER_ENDED")
  const result = await svc.syncTracker(started.tracker)
  assert.equal(result.status, "paid")
  assert.equal(result.settled, 2)

  const settled = await db.merchantInvoice.findUnique({ where: { id: invoice.id } })
  assert.equal(settled.status, "PAID")
  assert.equal(settled.checkoutUrl, null)
  assert.equal((await entryOf(first.id)).status, "PAID")
  assert.equal((await entryOf(second.id)).status, "PAID")
  assert.equal(payments.rows.filter((p) => p.status === "COMPLETED" && p.metadata.invoiceId === invoice.id).length, 2)
})

await check("an underpaid batch settles nothing", async () => {
  const campaign = await newCampaign("Short Paid Campaign")
  const first = await mint("short-1")
  const second = await mint("short-2")
  const invoice = await svc.generateInvoice(shop, { campaignId: campaign.id })
  const started = await svc.startInvoiceCheckout(shop, invoice.id, { baseUrl: BASE_URL }) // asks for two tickets

  // A third ticket joins the batch after the session opened (a cancelled order reinstated).
  const clone = { ...(await entryOf(first.id)) }
  delete clone.id
  await db.merchantEntry.create({ data: { ...clone, ticketNumber: "PKR-SHOPIFY-9999999", shopifyOrderId: "short-3" } })

  setTrackerState(started.tracker, "TRACKER_ENDED") // pays exactly the two-ticket total
  const result = await svc.syncTracker(started.tracker)

  assert.equal(result.status, "mismatch")
  assert.equal(result.reason, "underpaid")
  assert.equal((await db.merchantInvoice.findUnique({ where: { id: invoice.id } })).status, "PENDING")
  assert.equal((await entryOf(first.id)).status, "INVOICED")
  assert.equal((await entryOf(second.id)).status, "INVOICED")
})

await check("clicking pay twice keeps the session that is already open", async () => {
  await newCampaign("Retry Campaign")
  const entry = await mint("retry-1")

  const first = await svc.startEntryCheckout(shop, entry.id, { baseUrl: BASE_URL })
  const opened = seq
  const second = await svc.startEntryCheckout(shop, entry.id, { baseUrl: BASE_URL })

  assert.equal(seq, opened) // no second tracker: the tab already open would orphan it
  assert.equal(second.tracker, first.tracker)
  assert.equal(second.checkoutUrl, first.checkoutUrl)
  assert.equal(paymentFor(entry.ticketNumber).gatewayRef, first.tracker)
  assert.equal((await entryOf(entry.id)).status, "INVOICED")
})

await check("a refused checkout reads as a refusal, not as an outage", async () => {
  await newCampaign("Refusal Campaign")
  const entry = await mint("refuse-1")

  // What Safepay actually answers for a bad payload: 500 with the reason in status.errors.
  rejectSession = { status: 500, body: { data: null, status: { errors: ["unsupported meta key kind"], message: "fail" } } }
  await assert.rejects(
    () => svc.startEntryCheckout(shop, entry.id, { baseUrl: BASE_URL }),
    (err) => err.status === 502 && err.code === "GATEWAY_REJECTED",
  )
  assert.equal((await entryOf(entry.id)).status, "ISSUED") // a failed attempt must not lock the ticket
})

await check("without credentials the checkout reports itself unavailable", async () => {
  const saved = process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY
  delete process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY
  try {
    assert.equal(safepay.isSafepayConfigured(), false)
    await assert.rejects(
      () => svc.startEntryCheckout(shop, "entry_does_not_matter", { baseUrl: BASE_URL }),
      (err) => err.status === 503 && err.code === "GATEWAY_UNAVAILABLE",
    )
  } finally {
    process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY = saved
  }
})

safepay.__setSafepayTransport(null)
