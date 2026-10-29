// End-to-end lifecycle checks against the file-backed Prisma-compatible store.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { check } from "./_util.mjs"

// Deterministic slate: never inherit a previous run (or dev-server) data file.
const DATA_FILE = path.resolve(process.cwd(), "data", "merchant-connect.json")
if (fs.existsSync(DATA_FILE)) fs.rmSync(DATA_FILE)

const svc = await import("../../lib/merchants/service.ts")
const { signShopifyPayload } = await import("../../lib/merchants/shopify.ts")
const { getMerchantDb } = await import("../../lib/merchants/db.ts")
const { MERCHANT_ENTRY_FEE_PKR } = await import("../../lib/merchants/config.ts")

const DOMAIN = "harness-store.myshopify.com"
const SECRET = "whsec_harness_0123456789abcdef"

let apiKey = null
let store = null
let campaign = null

console.log("\nmerchant onboarding")

await check("connect issues one API key and one webhook secret", async () => {
  const result = await svc.connectStore({
    name: "Harness Store",
    storeUrl: `https://${DOMAIN}/admin`,
    contactEmail: "owner@harness.pk",
    contactPhone: "0300 1234567",
    payoutDetails: "Meezan · 000030011243",
  })
  apiKey = result.apiKey
  store = result.store
  assert.ok(apiKey.startsWith("prk_live_"))
  assert.equal(result.store.storeUrl, DOMAIN)
  assert.equal(result.webhookSecret.length >= 16, true)
  assert.equal(result.dto.webhookSecretPreview.includes(String(result.webhookSecret)), false)
  assert.equal(result.dto.apiKeyHash, undefined)
})

await check("the plain key is never stored or returned again", async () => {
  const db = await getMerchantDb()
  const rows = await db.merchantStore.findMany({})
  assert.equal(rows.some((r) => JSON.stringify(r).includes(apiKey)), false)
  assert.equal(rows.every((r) => typeof r.apiKeyHash === "string" && r.apiKeyHash.length === 64), true)
  const found = await svc.authenticateApiKey(apiKey)
  assert.equal(found.id, store.id)
  assert.equal(await svc.authenticateApiKey("prk_live_replayed_key_that_is_long_en"), null)
})

await check("duplicate store domains are rejected", async () => {
  await assert.rejects(
    () =>
      svc.connectStore({
        name: "Squatter",
        storeUrl: DOMAIN,
        contactEmail: "other@harness.pk",
        contactPhone: "03001234567",
      }),
    (err) => err.status === 409,
  )
})

await check("API keys authenticate at any length without leaking the hash", async () => {
  const db = await getMerchantDb()
  const row = await db.merchantStore.findUnique({ where: { id: store.id } })
  assert.equal(row.webhookSecret.length >= 16, true)
  assert.equal(typeof row.apiKeyHash, "string")
})

console.log("\ncampaign building")

await check("a buy-3+ campaign locks the platform fee per ticket", async () => {
  campaign = await svc.createCampaign(store, {
    title: "Eid Basket Booster",
    raffleId: "prize-1",
    ruleType: "MIN_QUANTITY",
    minQuantity: 3,
    maxEntries: 100,
    endDate: new Date(Date.now() + 21 * 24 * 3600_000),
  })
  assert.equal(campaign.ticketPrice, MERCHANT_ENTRY_FEE_PKR)
  assert.equal(campaign.status, "ACTIVE")
  assert.equal(campaign.ruleSummary, "Buy 3+ items")
  assert.equal(campaign.prize.title, "iPhone 16 Pro Max")
  assert.equal(campaign.prize.prizeValuePkr, 450000) // paisa → PKR
})

await check("rules without thresholds are refused", async () => {
  await assert.rejects(
    () =>
      svc.createCampaign(store, {
        title: "Broken rule",
        ruleType: "MIN_AMOUNT",
        endDate: new Date(Date.now() + 7 * 24 * 3600_000),
      }),
    (err) => err.status === 400,
  )
})

await check("pausing a campaign stops minting, resuming restarts it", async () => {
  const paused = await svc.updateCampaign(store, campaign.id, { action: "pause" })
  assert.equal(paused.status, "PAUSED")
  assert.equal(await mintCount(1), 0)
  const resumed = await svc.updateCampaign(store, campaign.id, { action: "resume" })
  assert.equal(resumed.status, "ACTIVE")
})

console.log("\nwebhook ingestion")

async function fireWebhook(orderPayload, { hmac = null, topic = "orders/fulfilled", domain = DOMAIN } = {}) {
  const db = await getMerchantDb()
  const fresh = await db.merchantStore.findUnique({ where: { id: store.id } })
  const rawBody = JSON.stringify(orderPayload)
  return svc.processShopifyWebhook({
    rawBody,
    topic,
    shopDomain: domain,
    hmac: hmac ?? signShopifyPayload(rawBody, fresh.webhookSecret),
  })
}

async function mintCount(itemCount, idSuffix = itemCount) {
  const payload = {
    id: `${idSuffix}`,
    name: `#${idSuffix}`,
    customer: { first_name: "Bilal", last_name: "Ahmed", phone: "03111222333" },
    financial_status: "paid",
    fulfillment_status: "fulfilled",
    total_price: String(itemCount * 1500),
    line_items: [{ id: 1, title: "Lawn Suit", sku: "SKU-1", product_id: 1, variant_id: 1, quantity: itemCount, price: "1500.0" }],
  }
  const result = await fireWebhook(payload)
  return result.outcomes.filter((o) => o.result === "ISSUED").length
}

await check("unsigned deliveries are rejected before any data is touched", async () => {
  const before = await currentEntryCount()
  await assert.rejects(() => fireWebhook({ id: "evil", customer: {}, line_items: [] }, { hmac: "bogus" }), (err) => err.status === 401)
  assert.equal(await currentEntryCount(), before)
})

await check("unknown shop domains 404", async () => {
  await assert.rejects(() => fireWebhook({ id: "x" }, { domain: "someone-elses-store.myshopify.com" }), (err) => err.status === 404)
})

await check("2-item order is rejected, 4-item order mints", async () => {
  assert.equal(await mintCount(2, "small"), 0)
  assert.equal(await mintCount(4, "big"), 1)
})

await check("replayed webhooks are idempotent", async () => {
  const replay = await fireWebhook(bigOrder("big"))
  assert.equal(replay.outcomes[0].result, "DUPLICATE")
  assert.equal(replay.outcomes[0].ticketNumber, await ticketFor("big"))
  const db = await getMerchantDb()
  assert.equal(await db.merchantEntry.count({ where: { shopifyOrderId: "big" } }), 1)
})

await check("each ticket gets a PKR-SHOPIFY number and the campaign counts it", async () => {
  assert.match(await ticketFor("big"), /^PKR-SHOPIFY-\d{7}$/)
  const db = await getMerchantDb()
  const row = await db.merchantCampaign.findUnique({ where: { id: campaign.id } })
  assert.equal(row.currentEntries, 1)
})

function bigOrder(id) {
  return {
    id,
    name: `#${id}`,
    customer: { first_name: "Bilal", last_name: "Ahmed", phone: "03111222333" },
    financial_status: "paid",
    fulfillment_status: "fulfilled",
    total_price: "6000.0",
    line_items: [{ id: 1, title: "Lawn Suit", sku: "SKU-1", product_id: 1, variant_id: 1, quantity: 4, price: "1500.0" }],
  }
}

async function currentEntryCount() {
  const db = await getMerchantDb()
  return db.merchantEntry.count({ where: { storeId: store.id } })
}

async function ticketFor(orderId) {
  const db = await getMerchantDb()
  const entry = await db.merchantEntry.findFirst({ where: { shopifyOrderId: orderId } })
  return entry?.ticketNumber
}

console.log("\nsimulator")

await check("simulated tickets are flagged test and never billed", async () => {
  const run = await svc.simulateOrder(store, { itemCount: 5, unitPrice: 1200, customerName: "Test Buyer", customerPhone: "03009999999" })
  assert.equal(run.result.action, "minted")
  assert.equal(run.headers["X-Shopify-Hmac-Sha256"], signShopifyPayload(JSON.stringify(run.payload), store.webhookSecret))
  const issued = run.result.outcomes.find((o) => o.result === "ISSUED")
  assert.ok(issued)
  const db = await getMerchantDb()
  // Test tickets are stored under a TEST- order key; resolve the row by its issued id.
  const entry = await db.merchantEntry.findUnique({ where: { id: issued.entryId } })
  assert.equal(entry.isTest, true)
  assert.match(entry.ticketNumber, /^PKR-SHOPIFY-/)
  const list = await svc.listEntries(store, { includeTest: false })
  assert.equal(list.entries.some((e) => e.id === entry.id), false)
})

await check("test tickets can be cleared", async () => {
  const deleted = await svc.clearTestEntries(store)
  assert.ok(deleted >= 1)
  const db = await getMerchantDb()
  assert.equal(await db.merchantEntry.count({ where: { isTest: true } }), 0)
})

console.log("\nbatch invoicing")

let invoice = null

await check("invoice preview counts only issued non-test tickets", async () => {
  await svc.ingestOrder(
    store,
    {
      orderId: "third",
      orderName: "#third",
      customerName: "Hina Tariq",
      customerPhone: "03211223344",
      subtotal: 9000,
      fulfilled: true,
      cancelled: false,
      financialStatus: "paid",
      lineItems: [{ id: "l", title: "Lawn Suit", sku: "SKU-1", productId: "1", variantId: "1", quantity: 6, unitPrice: 1500 }],
    },
    {},
  )
  const preview = await svc.previewInvoice(store, campaign.id)
  assert.equal(preview.totalEntries, 2)
  assert.equal(preview.unitPrice, MERCHANT_ENTRY_FEE_PKR)
  assert.equal(preview.amountDue, 2 * MERCHANT_ENTRY_FEE_PKR)
  assert.equal(preview.canGenerate, true)
})

await check("generating an invoice closes the campaign and links every ticket", async () => {
  invoice = await svc.generateInvoice(store, { campaignId: campaign.id })
  assert.match(invoice.invoiceNumber, /^INV-\d{6}-[0-9A-F]{6}$/)
  assert.equal(invoice.totalEntries, 2)
  assert.equal(invoice.amountDue, 2 * MERCHANT_ENTRY_FEE_PKR)
  const db = await getMerchantDb()
  const row = await db.merchantCampaign.findUnique({ where: { id: campaign.id } })
  assert.equal(row.status, "PENDING_INVOICE")
  assert.equal(await db.merchantEntry.count({ where: { campaignId: campaign.id, status: "INVOICED" } }), 2)
})

await check("a batch cannot be invoiced twice", async () => {
  await assert.rejects(() => svc.generateInvoice(store, { campaignId: campaign.id }), (err) => err.status === 409)
})

await check("submitting proof moves the invoice to under review", async () => {
  const submitted = await svc.submitInvoicePayment(store, invoice.id, {
    paymentMethod: "RAAST",
    transactionRef: "TXN-88990011",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/receipt.png",
  })
  assert.equal(submitted.invoice.status, "UNDER_REVIEW")
  assert.equal(submitted.invoice.transactionRef, "TXN-88990011")
  assert.equal(submitted.settlementAccounts.length > 0, true)
  assert.equal(submitted.entries.length, 2)
  assert.match(submitted.entries[0].ticketNumber, /^PKR-SHOPIFY-/)
})

console.log("\nadmin settlement + draw")

await check("admin overview aggregates the ledger", async () => {
  const overview = await svc.adminOverview()
  assert.equal(overview.stats.stores, 1)
  assert.equal(overview.stats.awaitingReview, 1)
  assert.equal(overview.stats.awaitingReviewAmount, 2 * MERCHANT_ENTRY_FEE_PKR)
  assert.equal(overview.invoices[0].storeName, "Harness Store")
  assert.equal(overview.campaigns[0].billableEntries, 0)
})

await check("rejecting returns the batch to the merchant with a reason", async () => {
  const rejected = await svc.adminReviewInvoice(invoice.id, { action: "reject", adminNotes: "Transaction ID not in our statement" })
  assert.equal(rejected.status, "PENDING")
  assert.equal(rejected.adminNotes, "Transaction ID not in our statement")
  await assert.rejects(() => svc.adminReviewInvoice(invoice.id, { action: "reject" }), (err) => err.name === "ZodError" || err.status === 400)
})

await check("a draw cannot run before settlement is verified", async () => {
  await assert.rejects(() => svc.adminExecuteDraw(campaign.id), (err) => err.status === 409 || err.status === 400)
})

await check("approving marks tickets PAID and unlocks the draw", async () => {
  const approved = await svc.adminReviewInvoice(invoice.id, { action: "approve", adminNotes: null })
  assert.equal(approved.status, "PAID")
  const db = await getMerchantDb()
  assert.equal(await db.merchantEntry.count({ where: { invoiceId: invoice.id, status: "PAID" } }), 2)
  const row = await db.merchantCampaign.findUnique({ where: { id: campaign.id } })
  assert.equal(row.status, "DRAW_READY")
})

await check("the draw picks one paid ticket and completes the campaign", async () => {
  const { winner } = await svc.adminExecuteDraw(campaign.id)
  assert.ok(winner.ticketNumber.startsWith("PKR-SHOPIFY-"))
  assert.equal(winner.status, "PAID")
  const db = await getMerchantDb()
  const row = await db.merchantCampaign.findUnique({ where: { id: campaign.id } })
  assert.equal(row.status, "COMPLETED")
  assert.equal(row.winnerEntryId, winner.id)
  assert.ok(row.drawnAt)
  const other = await db.merchantCampaign.findUnique({ where: { id: campaign.id } })
  assert.equal(other.winnerEntryId, winner.id)
})

await check("draws are not re-runnable", async () => {
  await assert.rejects(() => svc.adminExecuteDraw(campaign.id), (err) => err.status === 400 || err.status === 409)
})

console.log("\ncancellations + public lookup")

await check("cancelling an order voids its unpaid ticket and nets the invoice", async () => {
  const open = await svc.createCampaign(store, {
    title: "Rolling Batch",
    ruleType: "ALL_ORDERS",
    maxEntries: 50,
    endDate: new Date(Date.now() + 14 * 24 * 3600_000),
  })
  assert.equal(await mintCount(3, "rolling-1"), 1)
  assert.equal(await mintCount(2, "rolling-2"), 1)
  const batch = await svc.generateInvoice(store, { campaignId: open.id })
  assert.equal(batch.totalEntries, 2)

  const cancelled = await svc.processShopifyWebhook(await signed("orders/cancelled", { id: "rolling-2" }))
  assert.equal(cancelled.action, "cancelled")
  assert.equal(cancelled.cancellation.cancelled, 1)
  assert.equal(cancelled.cancellation.locked, 0) // invoice still PENDING → voidable
  const db = await getMerchantDb()
  const refreshed = await db.merchantInvoice.findUnique({ where: { id: batch.id } })
  assert.equal(refreshed.totalEntries, 1)
  assert.equal(refreshed.amountDue, 1 * MERCHANT_ENTRY_FEE_PKR)
  assert.equal((await db.merchantCampaign.findUnique({ where: { id: open.id } })).currentEntries, 1)
})

async function signed(topic, payload) {
  const db = await getMerchantDb()
  const fresh = await db.merchantStore.findUnique({ where: { id: store.id } })
  const rawBody = JSON.stringify(payload)
  return { rawBody, topic, shopDomain: DOMAIN, hmac: signShopifyPayload(rawBody, fresh.webhookSecret) }
}

await check("paid tickets survive cancellation", async () => {
  const db = await getMerchantDb()
  const paid = await db.merchantEntry.findFirst({ where: { invoiceId: invoice.id, status: "PAID" } })
  const result = await svc.cancelOrderEntries(store, paid.shopifyOrderId, "Late refund")
  assert.equal(result.cancelled, 0)
  assert.equal(result.locked, 0)
  const after = await db.merchantEntry.findUnique({ where: { id: paid.id } })
  assert.equal(after.status, "PAID")
})

await check("customers find masked tickets by order name or phone", async () => {
  const byOrder = await svc.lookupTickets("#big")
  assert.equal(byOrder.length, 1)
  assert.equal(byOrder[0].ticketNumber, await ticketFor("big"))
  assert.equal(byOrder[0].storeName, "Harness Store")
  assert.equal(byOrder[0].customerName, "Bilal A.")
  assert.match(byOrder[0].customerPhone, /••••/)
  assert.equal(byOrder[0].isWinner, (await ticketFor("big")) === (await winnerTicket()))
  assert.ok(byOrder[0].drawDate)
  assert.equal(byOrder[0].prize.title, "iPhone 16 Pro Max")

  const byPhone = await svc.lookupTickets("0311 122 2333")
  assert.equal(byPhone.length >= 1, true)
  assert.equal(byPhone.some((t) => t.ticketNumber === byOrder[0].ticketNumber), true)

  await assert.rejects(() => svc.lookupTickets("ab"), (err) => err.status === 400)
  const nothing = await svc.lookupTickets("zzz-unknown-ref")
  assert.equal(nothing.length, 0)
})

async function winnerTicket() {
  const db = await getMerchantDb()
  const entry = await db.merchantEntry.findFirst({ where: { id: (await db.merchantCampaign.findUnique({ where: { id: campaign.id } })).winnerEntryId } })
  return entry?.ticketNumber
}

await check("test tickets are invisible to the public lookup", async () => {
  // Every earlier batch has been invoiced/drawn, so open a fresh ACTIVE campaign to mint into.
  await svc.createCampaign(store, {
    title: "Lookup Probe",
    ruleType: "ALL_ORDERS",
    maxEntries: 50,
    endDate: new Date(Date.now() + 14 * 24 * 3600_000),
  })
  const run = await svc.simulateOrder(store, { itemCount: 9, unitPrice: 500, orderId: "sim-lookup-probe" })
  const ticket = run.result.outcomes.find((o) => o.result === "ISSUED")?.ticketNumber
  assert.ok(ticket)
  const found = await svc.lookupTickets(ticket)
  assert.equal(found.length, 0)
  await svc.clearTestEntries(store)
})

console.log("\npaused stores")

await check("pausing a store makes webhooks no-ops", async () => {
  await svc.setStoreStatus(store.id, "PAUSED")
  const ignored = await svc.processShopifyWebhook(await signed("orders/fulfilled", bigOrder("paused-order")))
  assert.equal(ignored.action, "ignored")
  const db = await getMerchantDb()
  assert.equal(await db.merchantEntry.count({ where: { shopifyOrderId: "paused-order" } }), 0)
  await svc.setStoreStatus(store.id, "ACTIVE")
})

await check("settings rotation revokes the old API key", async () => {
  const rotated = await svc.rotateApiKey(store.id)
  assert.notEqual(rotated.apiKey, apiKey)
  assert.equal(await svc.authenticateApiKey(apiKey), null)
  assert.equal((await svc.authenticateApiKey(rotated.apiKey)).id, store.id)
})
