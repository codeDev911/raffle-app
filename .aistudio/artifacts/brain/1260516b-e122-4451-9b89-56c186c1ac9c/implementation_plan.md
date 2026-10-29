# PakRaffle Merchant Connect & Shopify Lucky Draw Loyalty Engine

Enable e-commerce sellers (Shopify stores & independent brands) to connect with PakRaffle, launch automated customer lucky draws as sales incentives (e.g. "Buy 4 items get free lucky draw entry"), track shipped orders via webhooks, and settle ticket fees via manual batch invoicing before draw finalization.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during requirements clarification:
> - **Merchant Payment Collection**: **Manual batch payment before draw finalization**. Sellers accumulate customer entries as orders are fulfilled and shipped. Before PakRaffle finalizes the campaign draw and announces the winner, the seller receives an itemized batch invoice to settle via Raast / Direct IBFT / JazzCash / Card with receipt upload and admin clearance.
> - **Entry Minting Milestone**: **When order is fulfilled and marked shipped**. Unfulfilled, draft, or refunded orders do not consume tickets.
> - **Campaign Rules & Filters**: **Custom flexible criteria**, including product quantity thresholds (e.g., 4+ items), minimum order value (e.g., > Rs. 5,000), or specific SKU/category tags.

---

## 1. Overview & Core Concept

PakRaffle transforms from a standalone ticket portal into a **Merchant Sales Accelerator**. Instead of heavy price discounts that erode brand value, e-commerce merchants incentivize customers with high-value lucky draw tickets (iPhones, motorcycles, electronics, cash prizes) provided by PakRaffle.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MERCHANT STORE LIFECYCLE                        │
└────────────────────────────────────────────────────────────────────────┘
  1. Connect Store      2. Create Campaign       3. Shopify Webhook
     (Shopify/API)    ("Buy 4+ Items -> Free")   (Order Fulfilled)
           │                     │                       │
           ▼                     ▼                       ▼
   Store Credentials     Rule Engine Filter       Entry Generated
    & Webhook Secret     Linked Prize Campaign   (Customer Phone/Email)
                                                         │
                                                         ▼
  6. Live Draw Executed ◄─ 5. Admin Approves  ◄─ 4. Batch Invoice
    (Winner Announced)      (Clears Campaign)     (Merchant Settles)
```

### Key Personas & Value
- **Merchants / Sellers**: Increase average order value (AOV) and conversion rate with zero inventory risk. Only pay for tickets on orders they actually ship and deliver.
- **Store Shoppers**: Receive authentic, verifiable lucky draw tickets instantly via SMS/WhatsApp with no extra payment.
- **PakRaffle Platform**: Predictable B2B ticket volumes, diversified revenue streams beyond retail buyers, and organic acquisition of verified shoppers.

---

## 2. User Experience & Visual Design

Following the **Universal Frontend Design Constitution** and **SaaS Dashboard Architecture**:
- **Palette**: Deep slate workspace (`#0B0F19`, `#111827`) with emerald operational highlights (`#10B981`) and neutral warm borders (`border-slate-800`).
- **Data Density & Numerals**: Monospace tabular figures (`font-mono tabular-nums`) for currency amounts, order IDs, and ticket ranges.
- **Anti-Slop Discipline**: Zero static pills; clean typographic separators (`·`, `/`) for timestamps and store status.

### Merchant User Flows

```
[Merchant Landing] ──► [Store Connect Modal] ──► [Merchant Dashboard]
                                                        │
                      ┌─────────────────────────────────┼──────────────────────────────┐
                      ▼                                 ▼                              ▼
              [Active Campaigns]              [Live Entry Feed]             [Batch Invoices]
           - Rule: Buy >= 4 items           - Real Shopify Orders         - Itemized Orders List
           - Linked Prize: iPhone 16        - Customer Phone/Email        - Raast / IBFT Receipt Upload
           - Entries Minted: 42/100         - Delivery Proof Verified     - "Settle & Authorize Draw"
```

1. **Merchant Portal Landing & Connect (`/merchants`)**:
   - Value pitch for e-commerce brands: "Boost Cart Size with Guaranteed Prize Draws".
   - One-click Shopify store connector: enter `mystore.myshopify.com` and generate private webhook ingestion endpoint.
   - Store settings: Webhook Secret, Store Name, Contact Email/WhatsApp, Raast IBFT payout details.

2. **Campaign Builder ("Lucky Draw Sales Incentive")**:
   - Select Prize Campaign: Choose from active PakRaffle official prizes (iPhone 16, Honda 125, ₨100,000 Cash) or seller custom assets.
   - Define Trigger Logic:
     - **Minimum Quantity**: "Customer must purchase at least $N$ items" (e.g. 4 items).
     - **Cart Value Minimum**: "Order subtotal must equal or exceed Rs. $X$".
     - **Category/Collection Restriction**: Optional inclusion of specific product handles or tags.
   - Entry Cap & Ticket Budget: Set maximum entries (e.g., 100 entries) or continuous campaign.

3. **Shopify Order Ingestion & Webhook Simulator**:
   - Live endpoint: `/api/merchants/webhooks/shopify`.
   - Ingests `orders/fulfilled` payload (customer name, email, phone, line item count, order total).
   - Verifies store HMAC signature and evaluates campaign qualification rules.
   - Issues clean ticket numbers (e.g. `PKR-SHOPIFY-8921`) and links them to the customer profile.
   - **Interactive Developer Webhook Simulator**: Built-in test console inside the merchant dashboard allowing sellers to trigger mock Shopify `orders/fulfilled` events with 2 items, 4 items, or custom totals to verify rules before launching.

4. **Batch Invoice & Settlement Flow**:
   - As orders ship, unpaid entries accrue in the **Current Campaign Batch Invoice**.
   - Before draw date, merchant clicks **"Review & Settle Batch Invoice"**:
     - View itemized list of all qualifying fulfilled orders.
     - Total payable (e.g. $48\text{ orders} \times \text{Rs. } 250 = \text{Rs. } 12,000$).
     - Payment options: Official PakRaffle Raast ID, Bank Alfalah IBFT, JazzCash / Easypaisa Till.
     - Upload payment transaction ID and screenshot receipt.
   - Once admin verifies payment, the campaign status becomes **READY_FOR_DRAW**, and the draw can be executed.

5. **Customer Ticket Lookup (`/lookup/store-ticket`)**:
   - External store customers can enter their Shopify Order ID or Phone number to view their verified entry status, ticket number, and live draw date.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Manual Batch Invoice vs. Auto-Charge Card**:
  - *Chosen*: Manual Batch Invoice with proof upload before draw finalization.
  - *Rationale*: In the Pakistani e-commerce ecosystem, corporate cards are rare among local Shopify merchants; 90%+ prefer Direct Raast/IBFT or mobile wallet transfers with digital payment receipts.
- **Decision 2: Fulfillment Milestone vs. Checkout Creation**:
  - *Chosen*: Trigger only on `orders/fulfilled` (shipped).
  - *Rationale*: Eliminates fraudulent or cancelled Cash-on-Delivery (COD) orders from claiming free raffle tickets.
- **Decision 3: Flexible Compound Qualification Rules**:
  - *Chosen*: Merchants can combine quantity (e.g., $\ge 4$ products), value threshold, or storewide rules.
  - *Rationale*: Allows merchants to run targeted promotions like "Clearance Sale: Buy Any 4 T-Shirts Win an iPhone" or "Spend Over ₨10,000 Win a Honda Bike".

---

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                     SYSTEM ARCHITECTURE & DATA FLOW                    │
└────────────────────────────────────────────────────────────────────────┘

  Shopify Store                     PakRaffle API Route                Database / Storage
 ┌──────────────┐                 ┌──────────────────────┐            ┌────────────────────┐
 │ Order Shipped│──Webhook HTTP──►│ /api/merchants/      │──Evaluate─►│ MerchantStore      │
 │  (Fulfilled) │  (HMAC Header)  │   webhooks/shopify   │   Rules    │ MerchantCampaign   │
 └──────────────┘                 └──────────────────────┘            │ MerchantEntry      │
                                              │                       │ MerchantInvoice    │
                                              ▼                       └────────────────────┘
                                    ┌──────────────────┐                         ▲
                                    │ Mint Ticket &    │─────────────────────────┘
                                    │ Queue Batch Fee  │
                                    └──────────────────┘
                                              │
                                              ▼
                                 ┌─────────────────────────┐
                                 │ Merchant Dashboard UI   │
                                 │ - Live Order Ledger     │
                                 │ - Invoice Settlement    │
                                 │ - Webhook Simulator     │
                                 └─────────────────────────┘
```

### Data Models & Schemas

1. **`MerchantStore`**:
   - `id`, `name`, `storeUrl`, `apiKey`, `webhookSecret`, `contactEmail`, `contactPhone`, `status` (`ACTIVE` / `PAUSED`), `createdAt`.

2. **`MerchantCampaign`**:
   - `id`, `storeId`, `raffleId` (linked prize), `title`, `ruleType` (`MIN_QUANTITY`, `MIN_AMOUNT`, `ALL_ORDERS`), `thresholdValue` (e.g. 4 products or Rs. 5,000), `ticketPrice` (cost to merchant per entry), `maxEntries`, `currentEntries`, `status` (`ACTIVE`, `PENDING_INVOICE`, `DRAW_READY`, `COMPLETED`), `endDate`.

3. **`MerchantEntry`**:
   - `id`, `campaignId`, `storeId`, `shopifyOrderId`, `customerName`, `customerEmail`, `customerPhone`, `ticketNumber`, `orderAmount`, `itemCount`, `status` (`ISSUED`, `INVOICED`, `PAID`, `CANCELLED`), `createdAt`.

4. **`MerchantInvoice`**:
   - `id`, `campaignId`, `storeId`, `invoiceNumber`, `totalEntries`, `amountDue`, `paymentMethod`, `paymentProof`, `transactionRef`, `status` (`PENDING`, `UNDER_REVIEW`, `PAID`), `paidAt`.

---

## 5. Verification & Testing Plan

1. **Webhook Simulator Testing**:
   - Simulate an order with 2 items $\rightarrow$ verify rejected by rule.
   - Simulate an order with 4 items $\rightarrow$ verify accepted, entry minted, ticket number generated.
   - Test duplicate order webhook $\rightarrow$ verify idempotency (no double ticket).
2. **Batch Invoicing & Settlement**:
   - Verify unbilled entries compile correctly into invoice total.
   - Upload bank slip $\rightarrow$ verify invoice transitions to `UNDER_REVIEW`.
   - Admin approves payment $\rightarrow$ campaign marks `DRAW_READY`.
3. **Public Customer Ticket Lookup**:
   - Query by phone/order ID $\rightarrow$ displays branded card with ticket number and draw schedule.
