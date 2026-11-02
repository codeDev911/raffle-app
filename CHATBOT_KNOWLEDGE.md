# PakRaffle — AI Chatbot Knowledge Base

**Document purpose:** single-source reference for training or prompting an AI assistant that answers questions about the PakRaffle platform, its services, its pages, its fees and its policies.
**Entity:** PakRaffle (also written "PakRaffle.com") — a digital lucky-draw platform operating in Pakistan.
**Canonical site:** `https://pakraffle.com` · **Primary language for answers:** English (Pakistan locale, `en_PK`); amounts always in PKR ("Rs").
**Currency of this document:** facts are extracted from the production codebase and published pages. Every section names its source file so maintainers can re-verify.
**Confidence rule:** if a question is not covered here or in the legal pages, the assistant must say so and route to the support desk. It must never guess a number, a date or a policy.

---

## 0. Instructions for the assistant (answer policy)

### 0.1 Tone and format
- Plain, warm, factual. Short paragraphs; bullets for procedures; never marketing hyperbole.
- Lead with the direct answer, then the condition ("Tickets are final once verified. The one exception is a draw we cancel…").
- Always give the money amount and the timing when asked about a process (e.g. "24–48 business hours, back to the wallet you paid from").
- Quote PKR as `Rs 5,000`; quote times as ranges exactly as documented (`5–15 minutes`).
- When a legal document governs, name it: Terms & Conditions, Refund & Cancellation Policy, Privacy Policy.

### 0.2 Hard refusals (safety rails)
The assistant must **never**:
1. State, repeat or confirm **bank account numbers, IBANs or wallet mobile numbers**. Payment details are displayed only on the checkout page for a specific draw. (These values exist in `lib/merchants/config.ts` as env-driven fallbacks; they are deliberately absent from this document.)
2. Ask for or accept an **OTP, password, CNIC image, or a "release/customs/registration fee"**. PakRaffle never requests these. Flag any such request as fraud and point to `/make-complaint`.
3. Tell a user a draw **will** happen on a date that is not published on that draw's page.
4. Promise a **win**, a **refund outcome**, or a **delivery date** for a specific case; describe the policy and hand off to the desk.
5. Invent ticket prices, commissions, fees or SLAs not listed in §12.
6. Reveal internal admin capabilities, API secrets, webhook signing keys, or any detail from authenticated admin areas beyond "this area is staff-only".

### 0.3 Escalation matrix
Every route below terminates at the same desk. A **Tawk.to live-chat widget is injected on every page** of the site (see §10.1), so it is the default intake; the other channels are for when the widget is offline, when a document must be attached, or when a structured record is required.
| Situation | Route to |
|---|---|
| Paid but tickets missing after 15 min | WhatsApp desk with Transaction ID + screenshot |
| Duplicate debit | WhatsApp or email with statement; full reversal, no deduction |
| Complaint against a seller/store | `/make-complaint` |
| Cannot log in, forgot password, changed number | `/contact` or WhatsApp (≈30 min) |
| Merchant billing, webhook or ticket-void dispute | Merchant desk via `/merchants` or the merchant dashboard |
| Seller custody, inspection or payout question | Seller desk via `/list-product` reference details |
| Suspected fraud / someone asking for a fee | `/make-complaint` immediately |

---

## 1. Platform overview

**What it is.** PakRaffle runs verified lucky draws for real prizes it already holds in custody. Customers buy tickets with Pakistani wallets, banks and cards; when a draw's ticket pool is 100% sold, the winner is selected with a cryptographically secure random number generator and the draw is broadcast live, uncut, including the phone call to the winner.

**Four services, four audiences.**
| Service | Audience | Entry point | Who pays |
|---|---|---|---|
| Retail lucky draws | Shoppers | `/raffles` | Ticket buyer pays the per-draw ticket price |
| Merchant Connect | Shopify store owners | `/merchants` | Merchant pays per qualifying ticket; **shopper pays nothing** |
| Product listing draws | Sellers with a high-value item | `/list-product` | Seller pays a flat 8% platform fee from gross |
| Affiliate partner programme | Promoters, creators, everyday sharers | `/become-a-partner` | Free to join; PakRaffle pays 15–25% commission |

**The five promises** (used consistently across `/help` and `/about`):
1. A draw runs only when **100% of tickets are sold** — the pool stays open rather than drawing early against an unsold pool.
2. Payment matching takes **5–15 minutes** once the Transaction ID is reconciled against the bank statement.
3. A winner pays **Rs 0** — courier, insurance, applicable taxes and paperwork are covered by PakRaffle.
4. Tickets are refundable **only if PakRaffle cancels** the draw (entry finality protects everyone's odds).
5. Draw proof is an **uncut live stream**, backed by a recorded seed and ticket ledger.

**Prize categories seen on the board:** smartphones and tablets, motorcycles, gaming consoles and PCs, laptops, home appliances and TVs, luxury watches and gold, and cash grand prizes.

**Trust position.** Pakistani residents, 18+, valid CNIC. PakRaffle staff, directors and their immediate families are barred from entering any draw, and a seller may not enter a raffle listed for their own product.

---

## 2. How a draw works, step by step

1. **Prize sourced and held.** The prize is bought and verified before tickets go on sale; it is shown with a live progress bar, total ticket pool, remaining count, per-ticket price and draw status.
2. **Tickets sell.** Anyone with an account can buy as many tickets as remain in the pool. Unit price never changes with volume, and there is no platform or service charge added at checkout.
3. **Pool closes at 100% sold.** The draw date is then announced on the draw page and through the WhatsApp channel.
4. **Winner selected** from the closed pool of sold serials using a cryptographically secure RNG. Seed + ledger recorded so the selection is auditable afterwards.
5. **Live broadcast**, uncut, on YouTube and Facebook, including the call to the winner.
6. **Winner contacted**, normally **within two hours** of the draw ending; result published on `/winners`.
7. **Claim window: 7 days** for the winner to complete verification (per the published board rules).
8. **Delivery** per §6. A genuine win never requires any payment first.

**Ticket mechanics**
- A ticket is one equal chance. Ten tickets = ten times the probability of one; no per-person entry cap.
- Every confirmed order produces a receipt with the ticket serials; entries live under **Profile → My Entries**.
- The alphanumeric serial is proof of entry and is recorded in the draw ledger with the buyer's CNIC and a timestamp.
- Serials issued through Merchant Connect use the prefix **`PKR-SHOPIFY-`** (e.g. `PKR-SHOPIFY-7Q4K`).

**If a draw does not complete**
- The pool remains open until sold out. If the campaign is instead **cancelled** (prize discontinued, supply failure, compliance requirement), every participant receives a **100% refund of the ticket price**.

---

## 3. Service A — Retail lucky draws (shoppers)

**Finding a draw:** `/raffles` lists every draw with status tabs (Active / Completed / All), a prize-type rail with live counts, search across title, description and category, and sorting by most popular, newest, entry price low-to-high or high-to-low.

**Entering:** open the draw → choose ticket quantity → pay through a supported method → submit the Transaction ID → tickets appear once the payment is matched (5–15 minutes).

**Requirements:** a free account (phone number or email). Keep the registered mobile current — that is the number called live during the draw if a ticket wins.

**What a ticket is not:** not an exchangeable instrument. Once verified it cannot be cancelled, exchanged for cash, transferred to another account, or moved to a different draw.

**Sources:** `app/raffles/RafflesClient.tsx`, `app/help/page.tsx` (topics 01, 03, 05), `app/refund/page.tsx`, `app/raffles/[id]/page.tsx`.

---

## 4. Service B — Merchant Connect (Shopify stores)

**Pitch.** Replace margin-eating discounts with a reason to add one more item. The merchant sets a qualifying rule once; every qualifying Shopify order mints a ticket into a real, fully funded PakRaffle draw. PakRaffle sources the prize, runs the audited draw and delivers it.

**The order path (six nodes, from the live hero diagram):**
1. Order placed at the Shopify checkout →
2. Webhook verified (HMAC-SHA256) →
3. Rule matched (e.g. "3+ items" or "Rs 5,000+") →
4. Ticket minted (`PKR-SHOPIFY-…`, seconds after fulfilment) →
5. Invoice settled (Raast or IBFT) →
6. Draw runs live, public and audited.
A cancellation or refund at **any** node voids the ticket, and a voided ticket never reaches the invoice.

**Commercial terms**
| Item | Value |
|---|---|
| Setup / monthly fee | **Rs 0** |
| Cost to the shopper | **Rs 0** — always |
| Ticket price billed to the merchant | the **linked raffle's own ticket price**; a campaign not linked to a raffle falls back to the flat platform fee (default **Rs 250**, env `MERCHANT_ENTRY_FEE_PKR`) |
| When billed | when the merchant **closes a batch**; only fulfilled, non-cancelled orders are counted |
| Test tickets from the dashboard simulator | **never billed** |
| Tickets per order | **one per campaign** — duplicate webhook deliveries are detected and ignored, so Shopify retries never double-bill |
| Merchant ticket refund | available **up to the moment the draw runs**; refunded amount = ticket price minus the card/wallet charge already paid (**2.9% + Rs 30 per ticket**); the ticket is voided and its entry withdrawn |
| Checkout session validity | **30 minutes**, measured from when the session was opened (never from invoice creation) |
| Settlement accounts | Meezan Bank (Raast / IBFT), NayaPay wallet, SadaPay wallet — the same verified PakRaffle accounts used by retail checkout |

**Qualifying rule styles shown to merchants**
- *Spend Rs 5,000+* → raise average order value (best for repeat buyers).
- *Buy 3+ items* → move slow stock in bundles without discounting (best for multi-SKU stores).
- *Category + minimum* → filter to specific products or collections so the draw only rewards the basket the merchant wants to grow (best for launches).

**Product filters** accept comma-separated keywords, SKUs or product handles. Separator-insensitive matching: `moisturizing-cream` and `Moisturizing Cream` are treated as the same product. Blank = every item counts.

**Included with every connected store:** unlimited campaigns on one store, the storefront cart widget, signed Shopify webhooks with automatic voiding, a hosted customer ticket-lookup page, prize sourcing + live draw + winner delivery, and itemised invoices with Raast/IBFT receipts.

**Sources:** `app/merchants/MerchantsLanding.tsx`, `lib/merchants/config.ts`, `lib/merchants/rules.ts`, `app/api/merchants/*`.

---

## 5. Service C — Listing a product (sellers) & Service D — Partners

### 5.1 Product listing draws
**Pitch.** Sell at full price, in tickets, not bargains: convert a phone, bike, console, watch or appliance into a verified public draw. The seller keeps **92% of gross**, and money is collected before the draw ever runs.

**The four steps:** Submit the asset (dossier with market price, specs, photos, CNIC) → Verify & escrow (authenticity, PTA status or vehicle documents, then physical custody) → Campaign goes live (web, Instagram, WhatsApp) → Seller receives 92% wired to the verified bank account after the pool sells out and the draw runs.

**Custody chain shown on the page:** photos sent (box, serial, invoice) → verification (authenticity + condition report) → **insured custody** (collected and stored by PakRaffle) → tickets sold → draw, then payout.

**Rules sellers must be told accurately**
| Rule | Detail |
|---|---|
| Platform fee | flat **8%** of raffle gross, deducted on successful completion. No upfront listing fee, no hidden charges |
| Payout | **92%** of gross, wired to a bank account whose holder name matches the verified CNIC |
| Campaign window | maximum **3 months / 90 days** from launch. If the pool is not full by then, PakRaffle cancels, refunds buyers 100%, deducts the 8% fee and returns the item |
| Cancelling after go-live | allowed, but (1) all sold tickets are refunded 100% to buyers immediately and (2) the seller pays the 8% platform fee before the product is released and returned |
| Custody is mandatory | the item must be shipped or personally delivered to an inspection facility in **Lahore, Islamabad or Karachi** and held in insured escrow until completion or cancellation |
| Eligibility | legal Pakistani resident with valid CNIC, name matching the payout account (NADRA verification) |
| Response time after applying | the desk calls or messages within **24–48 hours** to confirm specs, schedule physical verification and discuss launch timing |
| Suggested ticket price | the calculator floors at **Rs 50** per ticket and suggests a price that reaches `market price ÷ 0.92` |
| Application tracking stages | Application received → Desk & identity check → Physical custody & inspection → Live campaign launch (trackable at `/application/status/[reqid]`) |

**Accepts (category list used on the form):** Smartphones & Tablets (iPhone, Samsung) · Motorcycles & Scooters (Honda, Yamaha, Suzuki) · Gaming Consoles & PCs (PS5, Xbox, custom rigs) · Laptops & Computing (MacBook, Dell, HP) · Home Appliances & 4K TVs · Luxury Watches & Gold · Other high-value assets.
**Cities offered:** Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Gujranwala, Sialkot, Quetta, Other city in Pakistan.

### 5.2 Affiliate partner programme
**Pitch.** Share a link; every ticket pays. 15–25% lifetime commission on tickets sold through the partner's link. No stock, no support tickets, no upfront cost.

**Published tier ladder** (the page's estimator reads the same thresholds, so the two cannot drift):
| Tier | Rate | Requirement | Band | Milestone bonus |
|---|---|---|---|---|
| Starter Partner | **15%** | 0 | 0–74 tickets / month | none |
| Pro Growth Partner | **20%** | 75 | 75–249 tickets / month | **+ Rs 15,000** |
| Elite VIP Partner | **25%** | 250 | 250+ tickets / month | **+ Rs 50,000** |

**Programme facts:** 100% free to join and always free · **30-day attribution** cookie on every link (a purchase within 30 days of a click is credited) · withdrawals from **Rs 500** · payouts land in **2–6 hours** to JazzCash, Easypaisa, Raast or any Pakistani bank account · PakRaffle handles 100% of customer support, ticket issuance, draw transparency and prize courier delivery · no large following or equipment needed — a personal WhatsApp status or family group is the documented starting point.

**Sources:** `app/list-product/ListProductClient.tsx`, `app/become-a-partner/BecomeACustomerPartnerClient.tsx`, `app/application/status/[reqid]/page.tsx`.

---

## 6. Prize delivery

| Prize type | How it is handed over | Typical timing |
|---|---|---|
| Phones, gadgets, jewellery, gold | Insured couriers (TCS or Leopard) direct to the winner's address | a few working days after identity verification |
| Cash prizes | Transfer to the winner's verified Pakistani bank account or mobile wallet | within **24 hours** of verification |
| Vehicles and high-value items | In person at the **Lahore or Islamabad** desk, or doorstep delivery arranged with full registration documents | by appointment |

**Winner obligations:** a valid CNIC to match the ticket record; for vehicles, the same for registration transfer (paperwork guided at handover).
**Cost to the winner: Rs 0** — courier, insurance, applicable taxes and paperwork are covered. Any message demanding a fee before release is not from PakRaffle and must be reported.
**Proxy collection:** allowed with a written no-objection from the registered winner plus copies of both CNICs, verified with the team in advance.
**Winner identity in public results is masked** (see §8.2).

---

## 7. Payments and money movement

**Methods accepted for tickets:** JazzCash, Easypaisa, Pakistani bank transfer, IBFT, Raast, NayaPay, Sadapay, Meezan Bank, and debit/credit cards through the integrated gateway where enabled for that draw. The options shown on the checkout screen for the specific raffle are the definitive list.

**Manual transfer flow:** pay into the account displayed on that draw's checkout page → submit the **Transaction ID (TID)** → the desk reconciles the TID against the institutional statement → tickets are allocated. Verification takes **5–15 minutes** and runs 24 hours a day.

**If tickets do not appear after 15 minutes:** message the help desk with the TID and a transfer screenshot; the bank record is cross-checked and serials allocated manually. **Do not pay a second time while a transfer is under review.**

**Proof of payment:** every confirmed order produces a receipt with ticket serials (a receipt can be re-sent via the receipts endpoint).

**Refunds (retail tickets)**
- Verified entries are **final**.
- PakRaffle-initiated cancellations, abandoned targets and duplicate debits are refunded **100% with zero deduction** within **24–48 business hours**.
- Refunds always go back to the **original wallet or bank account** — never a different one. This is deliberate: it keeps every reversal auditable and makes redirection to a third party impossible.

**What the buyer pays in fees:** nothing beyond the ticket price. No platform charge or service charge at checkout; the gateway cost is absorbed by the platform.

**Source of truth for figures:** `app/refund/page.tsx` (policy cards: Verified entries → Non-refundable · Cancelled draws → 100% returned · Processing window → 24–48 business hours · Duplicate charges → Reversed on proof · Merchant tickets → Before the draw only), `app/help/page.tsx`, `lib/merchants/config.ts`.

---

## 8. Eligibility, conduct and legal

### 8.1 Eligibility and conduct
- Pakistani resident, **aged 18 or above**, valid CNIC.
- **PakRaffle staff, directors and their immediate families are barred** from entering any draw.
- A **seller may not enter a raffle listed for their own product**.
- One order earns at most one ticket per Merchant Connect campaign.
- Terms & Conditions are authoritative; `/terms` overrides all explanatory pages.

### 8.2 Privacy position (from `/privacy`)
- Personal data (name, CNIC, contact details) is used to match a payment to a ticket and to verify a winner.
- Security posture published on the page: **256-bit SSL encryption**, **salted password hashing**, **masked winner details**, **no sale of participant data**, plus documented handling of Merchant Connect Shopify store/order data.
- **Account deletion** is available on request from the registered address; ticket records attached to a **completed draw are retained in anonymised form** because they are the audit trail proving the draw was fair.

### 8.3 Fraud awareness the assistant should push proactively
- Only ever pay into the account shown on the draw's own checkout page on `pakraffle.com`.
- PakRaffle **never** asks for an OTP or password, **never** asks for transfer to a personal wallet number, and **never** demands a "release fee", "customs fee" or "registration fee".
- A genuine win requires no payment at all.

---

## 9. Page inventory (every route the assistant may be asked about)

### 9.1 Public marketing and information
| Route | Name | Purpose / what the assistant should say |
|---|---|---|
| `/` | Home | Platform positioning, live draws, trust mechanics and entry points into every service |
| `/raffles` | Live draws | Browse board with status tabs, prize-type rail with live counts, search and four sort orders |
| `/raffles/[id]` | Raffle details | One draw: prize, ticket price, pool progress, remaining tickets, rules, enter CTA |
| `/raffles/[id]/winner` | Draw result | The outcome record for a completed draw |
| `/winners` | Winners gallery | Published winners with named prize, city and handover proof |
| `/about` | About PakRaffle | Who we are, mission, transparency mechanics, operating principles |
| `/help` | Help Centre | 7 topics, 35 answered questions — the primary FAQ source (§11) |
| `/contact` | Contact | Channels and SLAs (§10); 24/7 desk, WhatsApp under 15 minutes |
| `/make-complaint` | Report a seller | Confidential complaint intake routed to trust & safety (deliberately `noindex`) |
| `/merchants` | Merchant Connect | Shopify draw programme (§4) |
| `/list-product` | List your product | Seller listing dossier form + payout calculator (§5.1) |
| `/become-a-partner` | Affiliate programme | Tier ladder, estimator, partner-platform entry (§5.2) |
| `/lookup/store` | Store draw checker | Type a store name or city → see the free draw attached to shopping there |
| `/lookup/store-ticket` | Store ticket lookup | Verify a Merchant Connect entry by order number, ticket serial or phone — **no login required** |
| `/application/details/[id]` | Application detail | Full record of one seller's listing application |
| `/application/status/[reqid]` | Application tracking | Public status timeline: received → identity/desk check → custody & inspection → live launch |
| `/terms` | Terms & Conditions | Authoritative rules; cite it when policy questions conflict |
| `/privacy` | Privacy Policy | Data collection, security, retention, deletion rights |
| `/refund` | Refund & Cancellation Policy | Entry finality, 100% refunds on cancellation, merchant ticket refunds |
| `/not-found` | 404 | Off-route fallback page |

### 9.2 Shopper account area (login required)
| Route | Purpose |
|---|---|
| `/auth/login`, `/auth/register` | Shopper sign-in / sign-up (phone or email; Google sign-in available) |
| `/profile` | Account dashboard |
| `/profile/entries` | **My Entries** — tickets and receipts |
| `/profile/settings` | Update phone number, address, CNIC and contact details |
| `/(payments)/payment/pay` | Checkout: method selection and transfer instructions for a specific draw |
| `/(payments)/payment/callback` | Gateway return leg |
| `/(payments)/payment/thank-you` | Confirmation after a matched payment |

### 9.3 Merchant area
| Route | Purpose |
|---|---|
| `/auth/merchant/register`, `/auth/merchant/login` | Merchant account creation and sign-in |
| `/merchants/onboarding` | Store intake (embedded form collects store information after registration, before dashboard access) |
| `/merchants/dashboard` | Campaigns, entries, invoices, payments, settings, prize selection and an order simulator (test tickets are never billed) |
| `/merchants/checkout/[tracker]` | Secure invoice checkout (not indexed) |

### 9.4 Admin area (staff only — never describe internals to end users)
| Route | Purpose |
|---|---|
| `/admin`, `/admin/dashboard` | Operations overview |
| `/admin/raffles`, `/admin/raffles/create`, `/admin/raffles/[id]`, `/admin/raffles/[id]/edit`, `/admin/raffles/[id]/winner` | Draw lifecycle, editing and winner selection |
| `/admin/customers`, `/admin/customers/[id]` | Customer records |
| `/admin/payments`, `/admin/payments/[id]` | Payment verification and reconciliation |
| `/admin/merchants`, `/admin/merchants/[id]` | Merchant lifecycle: monitoring, suspension/reactivation, store settings |
| `/admin/requests`, `/admin/requests/[id]` | Listing-request approvals |

### 9.5 Developer surface (reference only)
59 API routes under `/api/*`, grouped as: `auth` (login, register, session, Google OAuth, merchant auth) · `raffles` (list/detail, expenses, winner selection) · `payments` (initiate, make, status, callback, webhook, plus `safepay/callback` and `safepay/webhook`) · `merchants` (self-serve `me/*` for campaigns, entries, invoices, checkout, settings, Shopify connect, key rotation, simulate; `storefront/status` and `storefront/claim` for the widget; `webhooks/shopify` for order events; `lookup`, `store-check`, `connect`, `prizes`) · `admin/*` · `listing-requests` · `receipts/send` · `upload/cloudinary` · `user/update`, `user/upload`.
All error responses are JSON. The widget talks to `storefront/status` (eligibility) and `storefront/claim` (post-order ticket claim token).

---

## 10. Support channels and response commitments

| Channel | Commitment | Use for |
|---|---|---|
| **Live chat widget** (Tawk.to, on every page) | **under 15 minutes** while agents are online | in-context help: a shopper mid-checkout or mid-payment does not have to leave the page |
| WhatsApp live — **+92 337 7155722** | **under 15 minutes** | payments, tickets, quick questions, sending screenshots |
| Email desk — **support@pakraffle.com** | same working day | audits, disputes, paperwork |
| **Knowledge base** — `https://pakraffle.tawk.help/` | self-serve, always available | "how do I…" questions that do not need an agent |
| Complaint form — `/make-complaint` | logged and answered | seller/store conduct, suspected fraud |
| Contact desk — `/contact` | 7 days a week, 24/7 | everything else |
| Regional desks | by appointment | in-person handovers and inspections |

**Service-level table (as published on `/contact`)**
| Window | Process | Detail |
|---|---|---|
| 5–15 min | Payment & ticket approval | Screenshot or TID reconciled against the institutional statement, 24 hours a day |
| Same day | Draw schedule updates | Broadcast date announced the moment the 100% target pool closes |
| 2 hours | Prize claim & verification | Winner identity validation starts within two hours of the draw ending |
| 30 min | Account & technical support | Password resets, profile corrections, login issues |

### 10.1 Live-chat and knowledge-base deployment (verified)

| Component | Value | Where it lives |
|---|---|---|
| Provider | **Tawk.to** hosted widget | Tawk.to dashboard → Administration → Chat Widget |
| Property ID | `6ae85667fceb143c3f37e8c6` | second path segment of both URLs below |
| Widget ID | `1k6dp31gm` | same embed path, after the property ID |
| **Embed actually shipped** | `https://embed.tawk.to/6ae85667fceb143c3f37e8c6/1k6dp31gm` | `app/layout.tsx` → `Scripts()`, a `<Script id="chatbase-loader" strategy="afterInteractive">` rendered inside `ClientLayout`, so it loads on every route |
| Direct chat link (shareable) | `https://tawk.to/chat/6ae85667fceb143c3f37e8c6/1k6dp31gm?layout=modern` | outreach, QR codes, email signatures — **not** the embed |
| Public knowledge base (KnowMe) | `https://pakraffle.tawk.help/` | Tawk.to dashboard → Knowledgebase. Resolves as a JS-rendered single-page site; its document title is currently **"Pakraffle Help Center"** |

**Facts an assistant (or a human agent) must know about this setup**
1. `?layout=modern` only styles the **direct link**. The embedded bubble's appearance comes from Tawk's Widget/Chat Page settings — it cannot be changed by adding query parameters to the embed URL.
2. Because the tag sits in the root layout, the widget currently renders on **staff areas too** (`/admin/*`, `/merchants/dashboard`, `/merchants/checkout/*`). Suppressing it there is a Tawk "Display Settings" URL-rule task, not a code change.
3. **This document is the source of truth.** KnowMe articles and any Tawk "AI Answers" training set must be produced from §11 (verbatim Q/A) and §12 (figures). If an article and this document disagree, this document and the legal pages win — fix the article.
4. **Never publish §9.4 (admin routes), §9.5 (API surface), or any settlement account detail into the public KnowMe** — it is indexed and reachable by anyone who guesses the URL.
5. Offline handling: outside covered hours the widget falls back to its form/email. The response commitments in §10 then apply from the next working window; the bot must not promise an instant reply when no agent is online.
6. The KnowMe site's own article list is **not verifiable from the codebase** (it is edited in the Tawk dashboard and renders client-side). Anyone updating policies must reconcile the articles by hand — see §15 item 8.
7. **Brand casing:** the KB renders "Pakraffle" where the brand is "PakRaffle". Set the KnowMe title/heading to `PakRaffle Help Centre` for consistency with `/help`.
8. **Visible entry points added:** besides the automatic bubble, the chat can now be opened from the `/help` hero ("Chat with support"), the `/help` channel grid ("Live chat"), the `/contact` hero ("Chat with an agent") and its channel cards, and the footer on **every** page ("Live Chat", "Help Articles"). The launcher calls `Tawk_API.maximize()` — and if the script was blocked, the same control behaves as a normal link to `LIVE_CHAT_URL` in a new tab, so nobody gets stuck.
9. **Canonical link constants:** `lib/support-links.ts` holds `LIVE_CHAT_URL`, `KNOWLEDGE_BASE_URL` and `SUPPORT_EMAIL`. Change the widget ID there (and the embed in `app/layout.tsx`) — not in page copy.

---

## 11. FAQ corpus (verbatim, ready for retrieval or fine-tuning)

### 11.1 Help Centre — 35 questions across 7 topics
Source: `app/help/page.tsx`. These are the published answers; reuse them verbatim so the bot never contradicts the site or the FAQPage rich results. **This block is also the intended seed corpus for the Tawk.to KnowMe articles and any Tawk "AI Answers" training set** — one article per question, answer pasted unchanged (§10.1).

**Topic 01 — Entering a draw for the first time**
- **What is PakRaffle and how do I enter a draw?** PakRaffle runs verified lucky draws for real prizes we already hold in custody. Browse the live draws, choose how many tickets you want, pay through a Pakistani wallet or bank transfer, submit your Transaction ID, and your ticket serials appear under Profile → My Entries once the payment is matched.
- **Do I need an account to take part?** Yes. An account holds your tickets, your receipts and your winning details, and it is how we reach you if a ticket of yours wins. Registration takes a phone number or email and is free.
- **Who is allowed to enter?** Pakistani residents aged 18 or above with a valid CNIC. PakRaffle staff, directors and their immediate families are barred from entering any draw, and sellers may not enter a raffle listed for their own product. The authoritative eligibility rules live in our Terms & Conditions.
- **How many tickets can I buy, and does buying more help?** As many as remain in the pool. Every ticket is one equal chance, so ten tickets genuinely gives you ten times the probability of one — with no limit on entries per person. The remaining ticket count and the live progress bar are shown on every draw page.
- **What does one entry cost?** The price is set per draw and shown on both the raffle card and its details page, starting from Rs 50. Bulk buying never changes the unit price, and there is no platform or service charge added at checkout.

**Topic 02 — Paying in, and getting your tickets**
- **Which payment methods does PakRaffle accept?** JazzCash, Easypaisa, Pakistani bank transfer and IBFT, Raast, NayaPay, Sadapay and Meezan, along with debit and credit cards through our integrated gateway where it is enabled for that draw. The payment options offered are shown on the checkout screen for the specific raffle.
- **I paid, but my tickets are not showing. What now?** Most payments clear in 5 to 15 minutes once your Transaction ID is matched against our statement. If 15 minutes pass with no tickets, message the help desk with your TID and a screenshot of the transfer — we cross-check the bank record and allocate your ticket serials manually. Do not pay a second time while a transfer is under review.
- **Do I get a receipt?** Yes. Every confirmed order produces a receipt with your ticket serials, and your entries stay listed in your profile. The alphanumeric ticket serial itself is proof of entry and is recorded in the draw ledger with your CNIC and a timestamp.
- **How do I know a payment request is really from PakRaffle?** Only ever pay into the account shown on the draw's own checkout page on this site. We never ask you to transfer to a personal wallet number, never request a 'release fee', 'customs fee' or 'registration fee', and never ask for your OTP or password.
- **I was charged twice for the same order.** Send us the statement showing both debits and we reverse the duplicate in full once it is confirmed — no questions and no deduction. This is covered in the Refund & Cancellation Policy.

**Topic 03 — How a draw is actually run**
- **What happens if a draw does not sell out?** The pool simply stays open until every ticket is sold — we do not move the goalposts or draw early against an unsold pool. If a campaign is cancelled instead (discontinued prize, supply failure or a compliance requirement), every participant receives a 100% refund of the ticket price.
- **How is the winner picked?** From a closed pool of sold ticket serials using a cryptographically secure random number generator. The seed and the ticket ledger are recorded so the selection can be audited after the fact, and no staff member or seller is eligible to be drawn.
- **Can I watch the draw happen?** Yes, and we would rather you did. Draws are broadcast live on YouTube and Facebook without camera cuts, including the phone call to the winner. Stream times are announced on the draw page and on our WhatsApp channel as soon as the ticket pool closes.
- **How will I know if I won?** Our team contacts the winning number directly, normally within two hours of the draw ending, and the result is published on the winners page. A genuine win never requires you to pay anything first — no clearance, courier, tax or processing charge.
- **Are past winners real?** Every published winner has a named prize, a city and handover proof, and the draws were broadcast. You can review the full gallery, and if you would like to audit a specific campaign, the help desk will walk you through its ledger and broadcast record.

**Topic 04 — Getting the prize into your hands**
- **Does a winner pay anything to receive the prize?** No. Delivery is free nationwide and the winner pays Rs 0. PakRaffle covers the courier, insurance, applicable taxes and paperwork. Any message demanding a fee before release is not from us — report it immediately.
- **How are different prizes handed over?** Phones, gadgets, jewellery and gold ship through insured couriers such as TCS or Leopard directly to your address. Cash prizes are transferred to your verified Pakistani bank account or mobile wallet. Vehicles and high-value items are handed over in person at our Lahore or Islamabad desk, or arranged for doorstep delivery with full registration documents.
- **How long does delivery take?** Insured parcels normally reach the winner within a few working days of identity verification. Vehicles and in-person ceremonies are scheduled by appointment, and cash transfers are completed within 24 hours of verification.
- **What documents must a winner provide?** A valid CNIC for identity matching against the ticket record. For vehicles you will need it for registration transfer, and we guide you through the paperwork at handover.
- **Can someone else collect my prize for me?** Yes, with a written no-objection from the registered winner plus copies of both CNICs, verified with our team in advance. We confirm these case by case because the prize must reach the person the ledger says won it.

**Topic 05 — Entry finality and money back**
- **Are raffle tickets refundable?** Once a ticket is verified it is final. A refund would silently change the odds for every other participant in a fixed-size pool, so entries cannot be cancelled, exchanged for cash, transferred to another account or moved to a different draw. Buy only the number of tickets you intend to keep.
- **When does PakRaffle refund in full?** Whenever the cancellation comes from our side: a draw that is called off, a target that is abandoned, or a duplicate debit. Refunds return to the original wallet or bank account within 24 to 48 business hours with zero deduction — the platform absorbs the gateway cost, not you.
- **How fast is a refund, and where does the money go?** Back to the same wallet or bank account you paid from — never a different one. Routing reversals to the original instrument keeps every refund auditable and makes it impossible for a refund to be redirected to a third party.
- **I have a complaint about a draw or a staff interaction.** Use the complaint form. It routes a structured report to the desk rather than the general queue, and every submission is logged and answered. For anything about your own account or a payment, the contact desk is faster.
- **Which document overrides this page?** The Terms & Conditions, the Privacy Policy and the Refund & Cancellation Policy. If anything here reads differently from those, the legal page wins — this page exists to explain them, not replace them.

**Topic 06 — Store draws (Merchant Connect from the shopper's side)**
- **I got a ticket from a shop. How do I check it is real?** Use the store ticket lookup and enter the serial exactly as issued. It returns the campaign, the prize, the draw date and the winning status, with no sign-up needed.
- **Do I pay PakRaffle for a store ticket?** No. A Merchant Connect entry is free to the shopper and is earned by meeting the shop's own rule — for example buying three or more items, or spending above an order value. The merchant pays PakRaffle per qualifying entry, which is why no fee should ever reach you.
- **How do I find free draws at stores I already shop at?** Search the store directory by name or city to see which nearby shops are running live draws, what the entry rule is, and what the prize is.
- **The draw banner did not appear on a shop's website.** That is a shop-side setup matter, not a problem with your order. If you met the shop's rule, your order still qualifies and the ticket is minted when the order is fulfilled — check it through the ticket lookup, or ask the shop to confirm the campaign is live.
- **I run a Shopify store. How do I offer draws to my customers?** Merchant Connect lets you attach a raffle to your own products, set the qualifying rule, and add one script tag to your theme. Everything else, including ticket issuance and payouts, is handled by the platform.

**Topic 07 — Login, profile and your data**
- **I cannot log in or I forgot my password.** Reset it from the login screen. If the reset email or code does not arrive, or the number on file has changed, the help desk resolves account and technical issues in around 30 minutes.
- **How do I update my phone number, address or CNIC?** From profile settings. Keep your mobile number current — it is the number we call live during the draw if one of your tickets wins.
- **What do you do with my personal information?** Your name, CNIC and contact details are used to match a payment to a ticket and to verify a winner. We do not sell participant data. The scope, retention and your rights are set out in the Privacy Policy.
- **Can I delete my account?** Yes — write to the support email from your registered address and we will remove your profile and contact data. Ticket records attached to a completed draw are retained in anonymised form, because they are the audit trail that proves a draw was fair.
- **Do you ever ask for my OTP, password or a fee?** Never. No PakRaffle representative will request an OTP or password, and no winner is ever asked to pay to release a prize. Report anything that does to the complaint form.

### 11.2 Merchant Connect FAQs
Source: `app/merchants/MerchantsLanding.tsx`.
- **When am I charged?** Only when you close a batch. Each ticket minted from a fulfilled, non-cancelled order is billed once at the locked per-ticket rate. Test tickets from the simulator are never billed.
- **What happens if an order is cancelled or refunded?** We register the order cancellation and refund webhooks when you connect Shopify, so the ticket is voided automatically — as long as the batch has not been paid yet. Voided tickets are removed from your invoice.
- **Can I get a ticket refunded?** Yes, up to the moment the draw runs. The refund is the ticket price minus the card and wallet charge we already paid on it — 2.9% plus Rs 30 per ticket. A refunded ticket is voided and its entry is withdrawn from the draw.
- **Can one order earn multiple tickets?** No. Each order earns at most one ticket per campaign. Duplicate webhook deliveries are detected and ignored, so retries from Shopify never double-bill you.
- **Who supplies the prize?** PakRaffle does. You link one of our live prizes to your campaign — we handle sourcing, the draw and delivery to the winner.
- **How do customers check their ticket?** On the public Store Ticket Lookup page, using their Shopify order number or phone number. They see the ticket, prize and draw date.

### 11.3 Seller (list-product) FAQs
Source: `app/list-product/ListProductClient.tsx`.
- **How and when will the PakRaffle team get in touch with me?** After you submit your product listing application, our review team inspects your submitted details. We will reach out directly to you using one of your provided contact channels (WhatsApp, phone call, or email) within 24 to 48 hours to confirm specifications, schedule physical verification, and discuss campaign launch timing.
- **Why must the item be shipped to PakRaffle for custody?** To protect the integrity of the platform and build 100% buyer trust, all listed items must be physically shipped or personally delivered to our authorized inspection facility (in Lahore, Islamabad, or Karachi). We perform an in-person physical inspection and hold the product securely in insured escrow custody until the raffle is either successfully completed or officially cancelled.
- **Can I cancel my raffle after it goes live? (Refunds & 8% fee rule)** Yes, you may request to cancel your raffle. However, to protect participants who purchased tickets in good faith: (1) All sold tickets will be refunded 100% to buyers immediately, and (2) The seller must pay the 8% platform fee (covering verification, payment gateway processing, and promotional costs) before the product is released and returned.
- **What is the 3-Month maximum campaign duration limit?** Every listed raffle must be completed within 3 months (90 days) from its launch date. If the required ticket threshold is not reached within 3 months, PakRaffle will cancel the raffle, issue full 100% refunds to all ticket buyers, charge/deduct the 8% platform fee, and return the item to the seller.
- **How does the 8% platform fee work on completed raffles?** Our flat 8% fee is deducted from the total raffle gross revenue upon successful completion. There are zero upfront listing fees and zero hidden charges. You receive 92% of the total revenue, covering your agreed market price directly into your bank account.
- **Why do I need to enter my full name as per CNIC?** In compliance with Pakistani anti-fraud regulations and NADRA verification protocols, all product hosts must be legal Pakistani residents holding a valid CNIC. Bank/Raast payouts and custody agreements must strictly match your verified legal name.

### 11.4 Affiliate partner FAQs
Source: `app/become-a-partner/BecomeACustomerPartnerClient.tsx`.
- **Do I need a large following or expensive camera to start?** Absolutely not! Over 60% of our successful affiliates are students, housewives, and everyday individuals who simply share links on their personal WhatsApp status or family groups. Even referring 3-5 ticket buyers a day earns you a solid passive monthly income.
- **How and when do I get paid?** You can request a withdrawal directly through your partner platform dashboard or via WhatsApp to our Affiliate Manager. Payouts are sent within 2 to 6 hours directly to your JazzCash, Easypaisa, Raast, or any Pakistani Bank Account.
- **Is there any cost, deposit, or subscription fee to join?** No! PakRaffle Affiliate Program is 100% completely free to join and will always remain free. You never have to pay a single rupee to earn commissions.
- **What if someone clicks my link today but buys a ticket 2 weeks later?** We use a 30-day tracking cookie! If someone clicks your link today and decides to purchase tickets anytime within the next 30 days, you will automatically receive full commission credit for that sale.
- **What is the minimum amount I can withdraw?** The minimum payout threshold is just Rs. 500! As soon as you earn Rs. 500 from your first few referrals, you can immediately transfer it to your mobile wallet.
- **Who handles customer support, ticket delivery, and winner verification?** PakRaffle handles 100% of the customer support, ticket issuance, random draw transparency, and winner prize courier delivery. You only share your link and collect your profits.

---

## 12. Figures at a glance (the only numbers the bot may quote)

| Fact | Value | Source |
|---|---|---|
| Age eligibility | 18+ with valid CNIC | `/terms`, `/help` |
| Entry finality | Non-refundable once verified | `/refund` |
| Refund on PakRaffle cancellation | 100%, zero deduction | `/refund`, `/help` |
| Refund processing window | 24–48 business hours | `/refund` |
| Payment / ticket matching | 5–15 minutes | `/contact`, `/help` |
| Winner contact after draw | normally within 2 hours | `/help` |
| Winner claim window | 7 days | `/raffles` board rules |
| Winner delivery cost | Rs 0 | `/help` |
| Cash prize transfer | within 24 hours of verification | `/help` |
| Ticket price floor | Rs 50 (per-draw price governs) | `/help`, seller calculator |
| Merchant setup / monthly fee | Rs 0 | `/merchants` |
| Merchant per-ticket fallback fee | Rs 250 (`MERCHANT_ENTRY_FEE_PKR`) — linked raffles bill at the raffle's own ticket price | `lib/merchants/config.ts` |
| Merchant ticket refund deduction | 2.9% + Rs 30 per ticket, before the draw only | `/merchants` FAQ |
| Tickets per order | 1 per campaign | `/merchants` FAQ |
| Invoice checkout session TTL | 30 minutes from session start | `lib/merchants/config.ts` |
| Store ticket serial prefix | `PKR-SHOPIFY-` | `lib/merchants/config.ts` |
| Seller platform fee | 8% of gross | `/list-product` |
| Seller net payout | 92% | `/list-product` |
| Seller campaign window | 90 days / 3 months | `/list-product` FAQ |
| Seller desk first response | 24–48 hours | `/list-product` FAQ |
| Inspection facilities | Lahore, Islamabad, Karachi | `/list-product` FAQ |
| Partner commission tiers | 15% / 20% / 25% | `/become-a-partner` |
| Tier thresholds | 0 / 75 / 250 tickets per month | `/become-a-partner` |
| Milestone bonuses | Rs 15,000 (Pro Growth) / Rs 50,000 (Elite VIP) | `/become-a-partner` |
| Partner attribution | 30-day cookie | `/become-a-partner` |
| Partner minimum withdrawal | Rs 500 | `/become-a-partner` |
| Partner payout speed | 2–6 hours | `/become-a-partner` |
| WhatsApp response | under 15 minutes | `/contact` |
| Email response | same working day | `/contact` |
| Account / technical support | ~30 minutes | `/contact` |
| Support hours | 24/7, 7 days a week | `/contact` |
| WhatsApp number | +92 337 7155722 | `lib/merchants/config.ts`, `/help` |
| Support email | support@pakraffle.com | `/help` |
| Draw randomness | cryptographically secure RNG, recorded seed + ledger | `/help` |
| Broadcast | YouTube + Facebook, uncut | `/help` |

---

## 13. Storefront widget and installation (for merchant support answers)

**What it is.** A single JavaScript tag (`/merchants/widget.js?store=<storeId>`) that PakRaffle loads inside a merchant's Shopify storefront. It reads the live cart through Shopify's own `/cart.js`, asks PakRaffle whether the basket qualifies, and shows the shopper their status **before checkout**. It never touches the checkout flow and never collects payment data.

**Where the card appears**
| Page | Placement |
|---|---|
| `/cart` | above the checkout button |
| `/products/*` (including collection-scoped product URLs) | directly below the product details block, as a campaign-rule card |
| Any other page where the tag is present | floating, bottom-right corner |

**What it shows.** Eligible ("draw entry unlocked"), progress ("add Rs X more"), blocked (campaign closed/cap reached), and the rule copy on product pages (e.g. "Buy 3+ items to win …"). It re-checks on every cart change and disappears when the basket stops qualifying. Post-order, a claim popup can show the ticket using a claim token.

**Theme adoption.** The widget samples the store's own canvas colours, buy-button colour, border radius and font, then renders inside a shadow root using those tokens — so it matches the host theme instead of overriding it. Because it is shadow-DOM isolated, a store's CSS cannot break it and it cannot leak styles into the theme.

**Installation notes the bot should know**
- One tag in `layout/theme.liquid` under `<head>` covers standard Shopify pages.
- **Page-builder pages are the common failure.** Pages built "without header/footer" (e.g. GemPages custom layouts such as `theme.gem-layout-none.liquid`) do not render `theme.liquid`, so the tag must also be added to that layout, or the page must be rebuilt to include the header/footer.
- The Shopify-native route for installing once per store is an **app embed block** from a theme app extension (`target: head`), which Shopify injects into every template and which works in both vintage and Online Store 2.0 themes. It is deactivated on install until enabled under Theme Settings → App embeds.
- Storefront passwords: while a store is password-protected, visitors land on `/password` and the widget cannot be observed on real pages.
- Debugging: append `?pakraffle_debug=1` to the storefront URL and view the console at **Info** level with **Preserve log** — the widget logs nothing without that flag.

**Diagnostic answers to expect from merchants**
- "Widget loads in cart but not on product pages" → check that the tag is present on the product template (page-builder layout), then that the campaign is ACTIVE and its product filter matches a real product title/SKU/handle.
- "Nothing in the console" → normal; enable `?pakraffle_debug=1`.
- "Filter typed as `my-product-slug` matches nothing" → fixed behaviour is separator-insensitive; a handle and a spaced title are now treated as the same product. Verify the campaign window and status too.

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **Draw / raffle** | A single prize campaign with a fixed ticket pool |
| **Target ticket rule** | The pool must be 100% sold before the draw runs |
| **Ticket serial** | The alphanumeric proof of entry held by a participant |
| **TID** | Transaction ID from a wallet/bank transfer receipt |
| **Ledger** | The recorded list of sold serials tied to CNIC + timestamp; the audit trail |
| **Seed** | The recorded input to the RNG that selects the winner |
| **Merchant Connect** | The Shopify programme that turns qualifying orders into free entries |
| **Campaign** | A merchant's configured rule (prize + qualifying rule + window) |
| **Batch** | A group of minted tickets closed and invoiced together |
| **Voided ticket** | A ticket cancelled because its order was cancelled/refunded; never billed |
| **Escrow custody** | Physical insured holding of a seller's item from inspection until completion or cancellation |
| **Dossier** | The seller's listing application (specs, photos, price, CNIC) |
| **Attribution** | The 30-day credit window on a partner's link |
| **Grand prize** | The single headline prize of a draw |
| **Handover desk** | Lahore or Islamabad in-person prize collection point |

---

## 15. Known conflicts and gaps — resolve before relying on them

1. **Minimum ticket price conflict.** `/help` says entries start from **Rs 50**, while `/raffles` metadata says "from Rs. 150 per ticket". Safe answer: the price is set per draw and shown on that draw's page. Reconcile the two copy blocks.
2. **Merchant "from" price.** `/merchants` shows `MERCHANT_ENTRY_FEE_PKR` as a "From rate". Because campaigns linked to a raffle bill at that raffle's ticket price, the bot should phrase it as "the linked draw's ticket price; Rs 250 applies only to campaigns not tied to a PakRaffle draw".
3. **`app/controllers/*` and `data/listing-requests.json`** are legacy: live merchant data is in Postgres, not the JSON fixture. Do not use them as sources of truth.
4. **Seller payout "Instant".** The `/list-product` stat tile says *Instant · Bank · Raast*, while the custody chain says payout follows the draw and the help text says cash transfers complete within 24 hours. Safe answer: paid after the draw completes and verification, typically within 24 hours to the verified account.
5. **Partner "lifetime commission"** applies to tickets sold through the partner's link; if a change is made to attribution rules, update both this document and `/become-a-partner`.
6. **No pricing for advertising/ads or B2B beyond the four services** — the bot must not invent any.
7. **Prize availability and draw dates are data, not policy.** They change per campaign and must be read from the specific draw page, never quoted from this document.
8. **The Tawk.to KnowMe article set is unverified.** `https://pakraffle.tawk.help/` renders client-side, so its categories and article bodies cannot be read from the codebase or by crawling the URL — only the site's existence and its title ("Pakraffle Help Center") were confirmed. Whoever owns support must export the live articles, diff them against §11, and delete or rewrite anything that predates the current policy. Until that is done, treat §11 as authoritative and the KB as unconfirmed.

---

## 16. Maintenance

**Where each fact lives**
| Domain | File to edit |
|---|---|
| Fees, ticket pricing, settlement, TID/SLA claims | `lib/merchants/config.ts`, `app/refund/page.tsx`, `app/contact/page.tsx` |
| Help topics + FAQPage JSON-LD (single array feeds both) | `app/help/page.tsx` → `TOPICS` |
| Merchant programme copy, rules, merchant FAQs | `app/merchants/MerchantsLanding.tsx` |
| Seller rules, calculator, custody chain, seller FAQs | `app/list-product/ListProductClient.tsx` |
| Tier ladder, bonuses, partner FAQs | `app/become-a-partner/BecomeACustomerPartnerClient.tsx` |
| Draw browse UX, statuses, filters | `app/raffles/RafflesClient.tsx` |
| Eligibility / privacy / legal wording | `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/refund/page.tsx` |
| Widget behaviour and placement | `public/merchants/widget.js` |
| Live-chat deployment (embed, property/widget IDs) | `app/layout.tsx` → `Scripts()` |
| Chat/article URLs used by every button and footer link | `lib/support-links.ts` |
| Chat launcher UI (opens the panel, falls back to the link) | `components/marketing/live-chat.tsx` |
| Support entry points on pages | `app/help/page.tsx` (hero + `CHANNELS`), `app/contact/page.tsx` (hero + `ROUTES`), `components/footer.tsx` |
| Public help articles (KnowMe) and AI-answer corpus | Tawk.to dashboard → Knowledgebase — content copied from §11 + §12 |

**Housekeeping noted in `app/layout.tsx` (no functional impact on chat):** the script still carries its Chatbase-era names — `id="chatbase-loader"`, `// Ai chat bot` — and `generateUUID()`, `secret` (`NEXT_PUBLIC_CODEBASE_AGENT_SECRET_KEY`), `userId` and the HMAC `hash` are computed on every render and never used. Renaming the id and deleting that dead block is safe; the Tawk loader does not use HMAC verification.

**Procedure after any policy change:** update the page → update the matching row in §12 → re-copy the FAQ text in §11 (it is quoted verbatim on purpose) → bump the date below.

**Chunking guidance for retrieval setups:** each `##` section is self-contained; §11 is one Q/A pair per paragraph, which splits cleanly; §12 is a flat table so it can be used as a numeric guardrail layer over retrieved prose.

**Document last verified against the codebase:** 2 November 2026.
