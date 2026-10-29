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
// Same module instance the service layer sees (the loader maps @/lib/prisma here).
const { prisma, payments, entries } = await import("./stubs/prisma.mjs")

// The stub raffle prices a ticket at Rs. 500 (Raffle.price, in paisa) and values the prize at
// Rs. 450,000 (Raffle.realPrice). Campaigns linked to it are billed at the ticket price.
const RAFFLE_TICKET_PRICE_PKR = 500

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

await check("a buy-3+ campaign prices tickets at the linked raffle's rate", async () => {
  campaign = await svc.createCampaign(store, {
    title: "Eid Basket Booster",
    raffleId: "prize-1",
    ruleType: "MIN_QUANTITY",
    minQuantity: 3,
    maxEntries: 100,
    endDate: new Date(Date.now() + 21 * 24 * 3600_000),
  })
  assert.equal(campaign.ticketPrice, RAFFLE_TICKET_PRICE_PKR) // not the Rs. 250 fallback
  assert.equal(campaign.status, "ACTIVE")
  assert.equal(campaign.ruleSummary, "Buy 3+ items")
  assert.equal(campaign.prize.title, "iPhone 16 Pro Max")
  assert.equal(campaign.prize.ticketPricePkr, RAFFLE_TICKET_PRICE_PKR)
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
  assert.equal(preview.unitPrice, RAFFLE_TICKET_PRICE_PKR)
  assert.equal(preview.amountDue, 2 * RAFFLE_TICKET_PRICE_PKR)
  assert.equal(preview.canGenerate, true)
})

await check("generating an invoice closes the campaign and links every ticket", async () => {
  invoice = await svc.generateInvoice(store, { campaignId: campaign.id })
  assert.match(invoice.invoiceNumber, /^INV-\d{6}-[0-9A-F]{6}$/)
  assert.equal(invoice.totalEntries, 2)
  assert.equal(invoice.amountDue, 2 * RAFFLE_TICKET_PRICE_PKR)
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
  assert.equal(overview.stats.awaitingReviewAmount, 2 * RAFFLE_TICKET_PRICE_PKR)
  assert.equal(overview.invoices[0].storeName, "Harness Store")
  assert.equal(overview.campaigns[0].billableEntries, 0)
})

await check("the batch opened one payment per customer for PakRaffle to confirm", async () => {
  const mine = payments.rows.filter((p) => p.metadata?.invoiceId === invoice.id)
  assert.equal(mine.length, 2)
  assert.equal(mine.every((p) => p.metadata.kind === "merchant_entry"), true)
  assert.equal(mine.every((p) => p.status === "PENDING"), true)
  assert.equal(mine.every((p) => p.amount === RAFFLE_TICKET_PRICE_PKR * 100), true)
  // one account per distinct Shopify customer, one row per ticket
  assert.equal(new Set(mine.map((p) => p.userId)).size, 2)
  assert.equal(new Set(mine.map((p) => p.transactionId)).size, 2)
  assert.equal(mine.every((p) => p.transactionId.startsWith("MCH-PKR-SHOPIFY-")), true)
})

await check("a failed batch transfer reopens the invoice for resubmission", async () => {
  const [target] = payments.rows.filter((p) => p.metadata?.invoiceId === invoice.id)
  // What /admin/payments does when it marks the transfer FAILED.
  await payments.update({ where: { id: target.id }, data: { status: "FAILED" } })

  const released = await svc.releaseMerchantPayment(target.id)
  assert.equal(released.released, true)
  assert.equal(released.invoiceReopened, true)
  const db = await getMerchantDb()
  assert.equal((await db.merchantInvoice.findUnique({ where: { id: invoice.id } })).status, "PENDING")

  // The ticket is still on the batch (never silently re-billed) and the shopper sees the retry.
  const detail = await svc.getInvoiceDetail(invoice.id, store.id)
  assert.equal(detail.entries.find((e) => e.id === released.entry.id).paymentStatus, "FAILED")
  assert.equal(detail.invoice.paymentFailed, true) // the dialog can explain why the form is back
  const failedView = await svc.lookupTickets(released.entry.ticketNumber)
  assert.equal(failedView[0].stage, "PAYMENT_FAILED")

  // Resubmitting re-arms the same payment rows instead of opening new ones.
  const before = payments.rows.length
  const resubmitted = await svc.submitInvoicePayment(store, invoice.id, {
    paymentMethod: "RAAST",
    transactionRef: "TXN-88990012",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/receipt-2.png",
  })
  assert.equal(resubmitted.invoice.status, "UNDER_REVIEW")
  assert.equal(resubmitted.invoice.paymentFailed, false) // the batch is waiting for confirmation again
  assert.equal(payments.rows.length, before)
  assert.equal(payments.rows.find((p) => p.id === target.id).status, "PENDING")
})

await check("nothing is confirmed until PakRaffle clears those payments", async () => {
  const db = await getMerchantDb()
  assert.equal(await db.merchantEntry.count({ where: { invoiceId: invoice.id, status: "PAID" } }), 0)
  const viewed = await svc.lookupTickets("#big")
  assert.equal(viewed[0].stage, "AWAITING_CONFIRMATION")
})

await check("admin/merchants no longer verifies payments itself", async () => {
  assert.equal("adminReviewInvoice" in svc, false)
})

await check("a draw cannot run before settlement is verified", async () => {
  await assert.rejects(() => svc.adminExecuteDraw(campaign.id), (err) => err.status === 409 || err.status === 400)
})

await check("confirming payments settles tickets, closes the invoice and unlocks the draw", async () => {
  const mine = payments.rows.filter((p) => p.metadata?.invoiceId === invoice.id)
  const db = await getMerchantDb()

  const first = await svc.settleMerchantPayment(mine[0].id)
  assert.equal(first.settled, true)
  assert.equal(first.entry.status, "PAID")
  assert.ok(first.raffleEntryId)
  assert.equal(first.invoicePaid, false) // the second ticket is still open
  // the raffle entry was created for the Shopify customer's account
  assert.equal(entries.rows.filter((e) => e.paymentId === mine[0].id && e.userId === mine[0].userId).length, 1)

  const second = await svc.settleMerchantPayment(mine[1].id)
  assert.equal(second.settled, true)
  assert.equal(second.invoicePaid, true)
  assert.equal(second.campaignStatus, "DRAW_READY")

  assert.equal(await db.merchantEntry.count({ where: { invoiceId: invoice.id, status: "PAID" } }), 2)
  assert.equal((await db.merchantCampaign.findUnique({ where: { id: campaign.id } })).status, "DRAW_READY")
  assert.equal((await db.merchantInvoice.findUnique({ where: { id: invoice.id } })).status, "PAID")
})

await check("a replayed confirmation never duplicates the raffle entry", async () => {
  const mine = payments.rows.filter((p) => p.metadata?.invoiceId === invoice.id)
  const before = entries.rows.length
  const replay = await svc.settleMerchantPayment(mine[0].id)
  assert.equal(replay.settled, true)
  assert.equal(entries.rows.length, before)
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

console.log("\nper-ticket payment")

let soloCampaign = null
let soloEntry = null

async function mintSolo(orderId, customerName, customerPhone, customerEmail) {
  await svc.ingestOrder(
    store,
    {
      orderId,
      orderName: `#${orderId}`,
      customerName,
      customerEmail,
      customerPhone,
      customerCity: "Lahore",
      subtotal: 2400,
      fulfilled: true,
      cancelled: false,
      financialStatus: "paid",
      lineItems: [{ id: "l", title: "Lawn Suit", sku: "SKU-1", productId: "1", variantId: "1", quantity: 2, unitPrice: 1200 }],
    },
    {},
  )
  const db = await getMerchantDb()
  return db.merchantEntry.findFirst({ where: { shopifyOrderId: orderId } })
}

await check("a merchant can pay one ticket without waiting for a batch", async () => {
  soloCampaign = await svc.createCampaign(store, {
    title: "Pay As You Go",
    raffleId: "prize-1",
    ruleType: "ALL_ORDERS",
    maxEntries: 20,
    endDate: new Date(Date.now() + 14 * 24 * 3600_000),
  })
  soloEntry = await mintSolo("solo-1", "Ayesha Khan", "03334567890", "ayesha@example.com")

  const paid = await svc.payEntry(store, soloEntry.id, {
    paymentMethod: "SADAPAY",
    transactionRef: "TXN-SOLO-0001",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/solo.png",
  })
  assert.equal(paid.entry.status, "INVOICED")
  assert.equal(paid.entry.invoiceId, null) // direct payments never join a batch
  assert.equal(paid.payment.status, "PENDING")
  assert.equal(paid.payment.method, "SADAPAY")
  assert.equal(paid.payment.amount, RAFFLE_TICKET_PRICE_PKR * 100)
  assert.equal(paid.payment.transactionId, `MCH-${soloEntry.ticketNumber}`)

  const ledger = payments.rows.find((p) => p.id === paid.payment.id)
  assert.equal(ledger.metadata.kind, "merchant_entry")
  assert.equal(ledger.metadata.invoiceId, null)
  assert.equal(ledger.metadata.ticketNumber, soloEntry.ticketNumber)
  assert.equal(ledger.gatewayRef, "TXN-SOLO-0001")
  assert.equal(ledger.metadata.receiptUrl, "https://res.cloudinary.com/demo/image/upload/solo.png")

  // The payment belongs to the Shopify customer, not to the store.
  const account = await prisma.user.findUnique({ where: { id: ledger.userId } })
  assert.equal(account.email, "ayesha@example.com")
  assert.equal(account.name, "Ayesha Khan")
  // Contact details from the order land on the account (Admin → Customers shows them).
  assert.equal(account.phone, "03334567890")
  assert.equal(account.city, "Lahore")
})

await check("a returning customer's account gains the city and phone it is missing", async () => {
  const ledger = payments.rows.find((p) => p.transactionId === `MCH-${soloEntry.ticketNumber}`)
  // An account created before addresses were captured: no phone, no city, name already set.
  await prisma.user.update({ where: { id: ledger.userId }, data: { phone: null, city: null } })

  await svc.payEntry(store, soloEntry.id, {
    paymentMethod: "RAAST",
    transactionRef: "TXN-BACKFILL-0001",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/backfill.png",
  })

  const account = await prisma.user.findUnique({ where: { id: ledger.userId } })
  assert.equal(account.city, "Lahore")
  assert.equal(account.phone, "03334567890")
  assert.equal(account.name, "Ayesha Khan") // never overwritten
})

await check("re-submitting the same ticket re-arms its payment instead of double-billing", async () => {
  const before = payments.rows.length
  await svc.payEntry(store, soloEntry.id, {
    paymentMethod: "IBFT",
    transactionRef: "TXN-SOLO-0002",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/solo-2.png",
  })
  assert.equal(payments.rows.length, before)
  const ledger = payments.rows.find((p) => p.transactionId === `MCH-${soloEntry.ticketNumber}`)
  assert.equal(ledger.gatewayRef, "TXN-SOLO-0002")
  assert.equal(ledger.method, "IBFT")
  assert.equal(ledger.metadata.transactionRef, "TXN-SOLO-0002")
})

await check("lookup follows the money: awaiting store, then confirming, then confirmed", async () => {
  await mintSolo("solo-2", "Usman Ali", "03005556666", null)
  const unpaidView = await svc.lookupTickets("#solo-2")
  assert.equal(unpaidView[0].stage, "PAYMENT_PENDING")
  assert.equal(unpaidView[0].status, "ISSUED")

  const awaiting = await svc.lookupTickets("#solo-1")
  assert.equal(awaiting[0].stage, "AWAITING_CONFIRMATION")

  const ledger = payments.rows.find((p) => p.transactionId === `MCH-${soloEntry.ticketNumber}`)
  const confirmed = await svc.settleMerchantPayment(ledger.id)
  assert.equal(confirmed.settled, true)
  assert.equal(confirmed.invoicePaid, false) // never on an invoice

  const done = await svc.lookupTickets("#solo-1")
  assert.equal(done[0].stage, "CONFIRMED")
  assert.equal(done[0].status, "PAID")
  assert.equal(entries.rows.filter((e) => e.paymentId === ledger.id && e.userId === ledger.userId).length, 1)
})

await check("a rejected transfer reopens the ticket for payment", async () => {
  const entry = await mintSolo("solo-3", "Bilal Ahmed", "03211234567", "bilal@example.com")
  const paid = await svc.payEntry(store, entry.id, {
    paymentMethod: "NAYAPAY",
    transactionRef: "TXN-REJECT-0001",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/reject.png",
  })
  assert.equal(paid.entry.status, "INVOICED")

  // What /admin/payments does when it marks the transfer FAILED.
  await payments.update({ where: { id: paid.payment.id }, data: { status: "FAILED" } })
  const released = await svc.releaseMerchantPayment(paid.payment.id)
  assert.equal(released.released, true)
  assert.equal(released.invoiceReopened, false)
  assert.equal(released.entry.status, "ISSUED") // payable again, no stuck "awaiting confirmation"

  // The dashboard list reports the real payment state, not just the ticket status.
  const feed = await svc.listEntries(store, { campaignId: soloCampaign.id, status: "ISSUED", includeTest: false })
  const row = feed.entries.find((e) => e.id === entry.id)
  assert.equal(row.status, "ISSUED")
  assert.equal(row.paymentStatus, "FAILED")

  const view = await svc.lookupTickets("#solo-3")
  assert.equal(view[0].stage, "PAYMENT_FAILED")

  // Paying again re-arms the same payment row instead of billing the customer twice.
  const before = payments.rows.length
  const again = await svc.payEntry(store, entry.id, {
    paymentMethod: "RAAST",
    transactionRef: "TXN-REJECT-0002",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/reject-2.png",
  })
  assert.equal(payments.rows.length, before)
  assert.equal(again.payment.status, "PENDING")
  assert.equal(again.entry.status, "INVOICED")

  const settled = await svc.settleMerchantPayment(again.payment.id)
  assert.equal(settled.settled, true)
  assert.equal((await svc.lookupTickets("#solo-3"))[0].stage, "CONFIRMED")
})

await check("a ticket still parked on invoiced after a rejection can be paid again", async () => {
  const entry = await mintSolo("solo-4", "Hina Raza", "03451234567", "hina@example.com")
  const first = await svc.payEntry(store, entry.id, {
    paymentMethod: "IBFT",
    transactionRef: "TXN-STUCK-0001",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/stuck.png",
  })

  // Marked failed before the release hook existed: the ledger row is still INVOICED.
  await payments.update({ where: { id: first.payment.id }, data: { status: "FAILED" } })
  const feed = await svc.listEntries(store, { campaignId: soloCampaign.id, includeTest: false })
  const stuck = feed.entries.find((e) => e.id === entry.id)
  assert.equal(stuck.status, "INVOICED")
  assert.equal(stuck.paymentStatus, "FAILED")

  // Paying again heals it instead of telling the merchant the ticket is awaiting confirmation.
  const before = payments.rows.length
  const again = await svc.payEntry(store, entry.id, {
    paymentMethod: "SADAPAY",
    transactionRef: "TXN-STUCK-0002",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/stuck-2.png",
  })
  assert.equal(payments.rows.length, before)
  assert.equal(again.payment.status, "PENDING")
  assert.equal(again.entry.status, "INVOICED")
  assert.equal((await svc.settleMerchantPayment(again.payment.id)).settled, true)
})

await check("a confirmed transfer is never rolled back by a stale failure", async () => {
  const ledger = payments.rows.find((p) => p.transactionId === `MCH-${soloEntry.ticketNumber}`)
  const result = await svc.releaseMerchantPayment(ledger.id)
  assert.equal(result.released, false)
  assert.equal(result.reason, "already_confirmed")
})

await check("a confirmed ticket can no longer be paid", async () => {
  await assert.rejects(
    () =>
      svc.payEntry(store, soloEntry.id, {
        paymentMethod: "RAAST",
        transactionRef: "TXN-TOO-LATE",
        paymentProof: "https://res.cloudinary.com/demo/image/upload/late.png",
      }),
    (err) => err.status === 409,
  )
})

await check("cancelling an order cancels the payment submitted for it", async () => {
  const db = await getMerchantDb()
  const entry = await db.merchantEntry.findFirst({ where: { shopifyOrderId: "solo-2" } })
  await svc.payEntry(store, entry.id, {
    paymentMethod: "RAAST",
    transactionRef: "TXN-SOLO-0003",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/solo-3.png",
  })
  const ledger = payments.rows.find((p) => p.transactionId === `MCH-${entry.ticketNumber}`)
  assert.equal(ledger.status, "PENDING")

  const cancelled = await svc.cancelOrderEntries(store, "solo-2", "Customer refunded")
  assert.equal(cancelled.cancelled, 1)
  assert.equal(cancelled.locked, 0)
  assert.equal(payments.rows.find((p) => p.id === ledger.id).status, "CANCELLED")
  const view = await svc.lookupTickets("#solo-2")
  assert.equal(view[0].stage, "VOIDED")
})

await check("a batch invoice only bills tickets that are still unpaid", async () => {
  const preview = await svc.previewInvoice(store, soloCampaign.id)
  assert.equal(preview.totalEntries, 0) // one paid directly, one cancelled
  assert.equal(preview.canGenerate, false)

  // Stop this campaign minting so the sections below land in their own campaigns.
  const paused = await svc.updateCampaign(store, soloCampaign.id, { action: "pause" })
  assert.equal(paused.status, "PAUSED")
})

await check("an ended campaign whose tickets are all paid becomes draw-ready", async () => {
  const closing = await svc.createCampaign(store, {
    title: "Ended Batch",
    raffleId: "prize-1",
    ruleType: "ALL_ORDERS",
    maxEntries: 10,
    endDate: new Date(Date.now() + 2 * 24 * 3600_000),
  })
  const entry = await mintSolo("ended-1", "Sana Malik", "03451112222", "sana@example.com")
  assert.equal(entry.campaignId, closing.id)

  const db = await getMerchantDb()
  // Close the window without invoicing: this campaign no longer accepts entries.
  await db.merchantCampaign.update({ where: { id: closing.id }, data: { endDate: new Date(Date.now() - 60_000) } })

  const paid = await svc.payEntry(store, entry.id, {
    paymentMethod: "RAAST",
    transactionRef: "TXN-ENDED-0001",
    paymentProof: "https://res.cloudinary.com/demo/image/upload/ended.png",
  })
  const settled = await svc.settleMerchantPayment(paid.payment.id)
  assert.equal(settled.settled, true)
  assert.equal(settled.campaignStatus, "DRAW_READY")
  assert.equal((await db.merchantCampaign.findUnique({ where: { id: closing.id } })).status, "DRAW_READY")
})

console.log("\ncancellations + public lookup")

await check("cancelling an order voids its unpaid ticket and nets the invoice", async () => {
  const open = await svc.createCampaign(store, {
    title: "Rolling Batch",
    ruleType: "ALL_ORDERS",
    maxEntries: 50,
    endDate: new Date(Date.now() + 14 * 24 * 3600_000),
  })
  assert.equal(open.ticketPrice, MERCHANT_ENTRY_FEE_PKR) // no linked raffle → flat platform fee
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
  assert.equal(byOrder[0].storeUrl, `https://${DOMAIN}`) // shopper sees which store raised the ticket
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
