// Pure-logic checks: rule engine, Shopify HMAC, privacy masking, ticket numbering.
import assert from "node:assert/strict"
import { check } from "./_util.mjs"

const { evaluateOrder, describeRule, qualifyingLineItems, validateRuleConfig } = await import(
  "../../lib/merchants/rules.ts"
)
const { signShopifyPayload, verifyShopifyHmac, normalizeShopifyOrder } = await import("../../lib/merchants/shopify.ts")
const { maskName, maskPhone, maskSecret, generateTicketNumber } = await import("../../lib/merchants/utils.ts")

const campaign = (overrides = {}) => ({
  ruleType: "MIN_QUANTITY",
  minQuantity: 3,
  minAmount: null,
  productFilters: [],
  status: "ACTIVE",
  startDate: new Date(Date.now() - 3600_000),
  endDate: new Date(Date.now() + 30 * 24 * 3600_000),
  ...overrides,
})

const order = (overrides = {}) => ({
  orderId: "9001",
  orderName: "#1042",
  customerName: "Ayesha Khan",
  customerEmail: null,
  customerPhone: "03001234567",
  subtotal: 6000,
  fulfilled: true,
  cancelled: false,
  financialStatus: "paid",
  lineItems: [{ id: "l1", title: "Lawn Suit", sku: "SKU-1", productId: "1", variantId: "1", quantity: 4, unitPrice: 1500 }],
  ...overrides,
})

console.log("\nrules engine")

await check("4-item order qualifies against a buy-3+ rule", () => {
  const result = evaluateOrder(campaign(), order())
  assert.equal(result.qualified, true)
  assert.equal(result.itemCount, 4)
  assert.equal(result.amount, 6000)
})

await check("2-item order is rejected with a merchant-readable reason", () => {
  const result = evaluateOrder(campaign(), order({ lineItems: [{ id: "l", title: "Cap", quantity: 2, unitPrice: 500 }] }))
  assert.equal(result.qualified, false)
  assert.match(result.reason, /Needs 3\+ qualifying items/)
})

await check("unfulfilled orders never mint", () => {
  assert.equal(evaluateOrder(campaign(), order({ fulfilled: false })).qualified, false)
})

await check("cancelled and refunded orders never mint", () => {
  assert.equal(evaluateOrder(campaign(), order({ cancelled: true })).qualified, false)
  assert.equal(evaluateOrder(campaign(), order({ financialStatus: "refunded" })).qualified, false)
})

await check("ended and not-yet-started campaigns are closed", () => {
  assert.equal(evaluateOrder(campaign({ endDate: new Date(Date.now() - 1000) }), order()).qualified, false)
  assert.equal(evaluateOrder(campaign({ startDate: new Date(Date.now() + 60_000) }), order()).qualified, false)
})

await check("MIN_AMOUNT reads the order subtotal", () => {
  const minAmount = campaign({ ruleType: "MIN_AMOUNT", minQuantity: null, minAmount: 5000 })
  assert.equal(evaluateOrder(minAmount, order()).qualified, true)
  assert.equal(evaluateOrder(minAmount, order({ subtotal: 4999 })).qualified, false)
})

await check("combined rule needs both thresholds", () => {
  const both = campaign({ ruleType: "MIN_QUANTITY_AND_AMOUNT", minQuantity: 3, minAmount: 7000 })
  assert.equal(evaluateOrder(both, order()).qualified, false)
  assert.equal(evaluateOrder(both, order({ subtotal: 7000 })).qualified, true)
})

await check("product filters scope quantity and amount to matching lines", () => {
  const filtered = campaign({ productFilters: ["lawn"] })
  const mixed = order({
    lineItems: [
      { id: "a", title: "Lawn Suit", sku: "SKU-1", quantity: 2, unitPrice: 1000 },
      { id: "b", title: "Dupatta", sku: "SKU-2", quantity: 1, unitPrice: 500 },
      { id: "c", title: "Socks", sku: "SKU-9", quantity: 8, unitPrice: 200 },
    ],
  })
  assert.equal(qualifyingLineItems(mixed, ["lawn"]).length, 1)
  const result = evaluateOrder(filtered, mixed)
  assert.equal(result.itemCount, 2)
  assert.equal(result.amount, 2000) // filtered rules price off matching lines, not subtotal
})

await check("SKU filters match exactly", () => {
  const bySku = campaign({ productFilters: ["SKU-9"], minQuantity: 0, ruleType: "ALL_ORDERS" })
  assert.equal(qualifyingLineItems(order({ lineItems: [{ id: "x", title: "Anything", sku: "SKU-9", quantity: 1, unitPrice: 10 }] }), ["SKU-9"]).length, 1)
  assert.equal(qualifyingLineItems(order(), ["sku-does-not-exist"]).length, 0)
  assert.ok(describeRule(bySku).includes("SKU-9"))
})

await check("ALL_ORDERS mints for any fulfilled order", () => {
  const all = campaign({ ruleType: "ALL_ORDERS", minQuantity: null })
  assert.equal(evaluateOrder(all, order({ lineItems: [{ id: "z", title: "One", quantity: 1, unitPrice: 100 }] })).qualified, true)
})

await check("paused campaigns reject", () => {
  assert.equal(evaluateOrder(campaign({ status: "PAUSED" }), order()).qualified, false)
})

await check("describeRule renders the plan's summary strings", () => {
  assert.equal(describeRule(campaign()), "Buy 3+ items")
  assert.equal(describeRule(campaign({ ruleType: "MIN_AMOUNT", minQuantity: null, minAmount: 5000 })), "Spend Rs. 5,000+")
  assert.equal(describeRule(campaign({ ruleType: "ALL_ORDERS", minQuantity: null })), "Every fulfilled order")
  assert.match(describeRule(campaign({ productFilters: ["lawn", "kidswear"] })), /from lawn, kidswear/)
})

await check("validateRuleConfig blocks missing thresholds", () => {
  assert.ok(validateRuleConfig({ ruleType: "MIN_QUANTITY", minQuantity: null }))
  assert.ok(validateRuleConfig({ ruleType: "MIN_AMOUNT", minAmount: 0 }))
  assert.equal(validateRuleConfig({ ruleType: "MIN_QUANTITY", minQuantity: 3 }), null)
})

console.log("\nshopify hmac + payload")

await check("sign/verify round-trip", () => {
  const secret = "shf_secret_0123456789abcdef"
  const body = JSON.stringify({ id: 1, total_price: "10.0" })
  const hmac = signShopifyPayload(body, secret)
  assert.equal(verifyShopifyHmac(body, hmac, secret), true)
})

await check("base64 HMAC-SHA256 matches Shopify's scheme", async () => {
  const crypto = await import("node:crypto")
  const body = '{"id":7}'
  const expected = crypto.createHmac("sha256", "secret-key-123456789").update(body, "utf8").digest("base64")
  assert.equal(signShopifyPayload(body, "secret-key-123456789"), expected)
})

await check("tampered bodies and wrong secrets are rejected", () => {
  const secret = "shf_secret_0123456789abcdef"
  const hmac = signShopifyPayload('{"id":1}', secret)
  assert.equal(verifyShopifyHmac('{"id":2}', hmac, secret), false)
  assert.equal(verifyShopifyHmac('{"id":1}', hmac, "other_secret_0123456789"), false)
  assert.equal(verifyShopifyHmac('{"id":1}', null, secret), false)
  assert.equal(verifyShopifyHmac('{"id":1}', hmac, ""), false)
})

await check("mock payload normalizes into the ingestion shape", async () => {
  const { buildMockShopifyOrder } = await import("../../lib/merchants/shopify.ts")
  const payload = buildMockShopifyOrder({ itemCount: 4, unitPrice: 1500, customerName: "Ali", customerPhone: "03001234567" })
  const normalized = normalizeShopifyOrder(payload)
  assert.equal(normalized.fulfilled, true)
  assert.equal(normalised_qty(normalized), 4)
  assert.equal(Math.round(normalized.subtotal), 6000)
  assert.equal(normalized.customerName, "Ali")
  assert.ok(normalized.orderId)
})

function normalised_qty(order) {
  return order.lineItems.reduce((sum, i) => sum + i.quantity, 0)
}

console.log("\nprivacy + identity helpers")

await check("lookup views are masked", () => {
  assert.equal(maskPhone("03001234567"), maskPhone("+92 300 1234567"))
  assert.equal(maskPhone("0300-1234567"), "0300 •••• 567")
  assert.equal(maskName("Muhammad Afnan"), "Muhammad A.")
  assert.ok(maskSecret("whsec_0123456789abcdef").includes("•"))
})

await check("ticket numbers carry the PKR-SHOPIFY prefix", () => {
  const ticket = generateTicketNumber()
  assert.match(ticket, /^PKR-SHOPIFY-\d{7}$/)
  assert.notEqual(generateTicketNumber(), generateTicketNumber())
})

await check("store domains and phones normalize before storage", async () => {
  const { normalizeStoreDomain, isValidStoreDomain, normalizePhone } = await import("../../lib/merchants/utils.ts")
  assert.equal(normalizeStoreDomain("https://MyStore.myshopify.com/admin"), "mystore.myshopify.com")
  assert.equal(isValidStoreDomain("mystore.myshopify.com"), true)
  assert.equal(isValidStoreDomain("not a url"), false)
  assert.equal(normalizePhone("0300-1234567"), "923001234567")
})
