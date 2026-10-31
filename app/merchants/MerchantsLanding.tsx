"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  Calculator,
  Check,
  CircleDollarSign,
  FileText,
  Gauge,
  LayoutDashboard,
  LogIn,
  PackageCheck,
  Percent,
  Receipt,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  Ticket,
  Trophy,
  UserPlus,
  Webhook,
  Zap,
} from "lucide-react"
import {
  CONTAINER,
  Cta,
  FaqList,
  INK_PANEL,
  Kicker,
  LiveDot,
  Marquee,
  Mesh,
  PANEL,
  Pill,
  SectionHead,
  SHELL,
  TicketCard,
} from "@/components/marketing/kit"
import { Counter, Reveal } from "@/components/marketing/motion"

const pkr = (value: number) => `Rs ${Math.round(value).toLocaleString("en-PK")}`
const num = (value: number) => Math.round(value).toLocaleString("en-PK")

const LIFECYCLE = [
  {
    icon: Store,
    title: "Connect store",
    body: "Create your merchant account and paste our webhook URL plus the storefront widget tag into your Shopify admin â€” two minutes, one time.",
  },
  {
    icon: Sparkles,
    title: "Launch campaign",
    body: "Link a live PakRaffle prize and set the rule â€” e.g. buy 3+ items or spend Rs. 5,000+.",
  },
  {
    icon: PackageCheck,
    title: "Shopper qualifies",
    body: "The cart widget tells shoppers they've unlocked a free entry before they check out.",
  },
  {
    icon: Ticket,
    title: "Tickets mint",
    body: "Qualifying orders get a PKR-SHOPIFY ticket instantly. Customers look it up by order ID or phone.",
  },
  {
    icon: FileText,
    title: "Settle invoice",
    body: "Close the batch, pay the itemised invoice via Raast or IBFT and upload your receipt.",
  },
  {
    icon: Trophy,
    title: "Draw goes live",
    body: "Once verified, the campaign is draw-ready and PakRaffle runs a cryptographically random draw.",
  },
]

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "Cart widget, before checkout",
    body: "Shoppers see the unlocked prize while they can still add another item â€” that timing is the whole point.",
  },
  {
    icon: Zap,
    title: "Zero-code install",
    body: "One webhook URL and one storefront tag. No app review queue, no theme surgery, no release window.",
  },
  {
    icon: Ticket,
    title: "Instant ticket mint",
    body: "A unique PKR-SHOPIFY ticket per qualifying order within seconds, plus an order lookup page for the shopper.",
  },
  {
    icon: RefreshCcw,
    title: "Cancel-safe billing",
    body: "Shopify cancellation and refund webhooks void the ticket automatically â€” and a voided ticket never hits your invoice.",
  },
  {
    icon: Receipt,
    title: "Itemised invoices",
    body: "Group tickets into a batch, pay by Raast or IBFT, upload the receipt. We verify and the campaign becomes draw-ready.",
  },
  {
    icon: LayoutDashboard,
    title: "One dashboard",
    body: "Entries, invoices, payments and campaign health in a fast light console â€” no spreadsheets, no WhatsApp reconciliation.",
  },
]

const RECIPES = [
  {
    icon: Tag,
    rule: "Spend Rs. 5,000+",
    title: "Raise the average order value",
    body: "Shoppers add one more item to cross the threshold instead of waiting for a discount that eats your margin.",
    metric: "Best for repeat buyers",
  },
  {
    icon: ShoppingBag,
    rule: "Buy 3+ items",
    title: "Move slow stock in bundles",
    body: "Reward basket size on the categories you want to clear, without marking a single price down.",
    metric: "Best for multi-SKU stores",
  },
  {
    icon: Percent,
    rule: "Category + minimum",
    title: "Push one product line",
    body: "Filter the rule to specific products or collections so the draw only rewards the basket you are trying to grow.",
    metric: "Best for launches",
  },
]

const FAQ = [
  {
    q: "When am I charged?",
    a: "Only when you close a batch. Each ticket minted from a fulfilled, non-cancelled order is billed once at the locked per-ticket rate. Test tickets from the simulator are never billed.",
  },
  {
    q: "What happens if an order is cancelled or refunded?",
    a: "We register the order cancellation and refund webhooks when you connect Shopify, so the ticket is voided automatically â€” as long as the batch has not been paid yet. Voided tickets are removed from your invoice.",
  },
  {
    q: "Can I get a ticket refunded?",
    a: "Yes, up to the moment the draw runs. The refund is the ticket price minus the card and wallet charge we already paid on it â€” 2.9% plus Rs. 30 per ticket. A refunded ticket is voided and its entry is withdrawn from the draw.",
  },
  {
    q: "Can one order earn multiple tickets?",
    a: "No. Each order earns at most one ticket per campaign. Duplicate webhook deliveries are detected and ignored, so retries from Shopify never double-bill you.",
  },
  {
    q: "Who supplies the prize?",
    a: "PakRaffle does. You link one of our live prizes to your campaign â€” we handle sourcing, the draw and delivery to the winner.",
  },
  {
    q: "How do customers check their ticket?",
    a: "On the public Store Ticket Lookup page, using their Shopify order number or phone number. They see the ticket, prize and draw date.",
  },
]

const INCLUDED = [
  "Unlimited campaigns on one connected store",
  "Cart eligibility widget for your storefront",
  "Signed Shopify webhooks with automatic voiding",
  "Customer ticket lookup page, hosted by us",
  "Prize sourcing, live draw and winner delivery",
  "Itemised invoices with Raast and IBFT receipts",
]

export default function MerchantsLanding({ entryFee }: { entryFee: number }) {
  // Spend-rule builder. The model is deliberately small: one rule, one ticket per qualifying
  // order, and a discount comparison â€” enough to argue the case without pretending to predict.
  const [monthlyOrders, setMonthlyOrders] = useState(400)
  const [aov, setAov] = useState(4500)
  const [threshold, setThreshold] = useState(5000)
  const [reachPct, setReachPct] = useState(30)
  const [extraSpend, setExtraSpend] = useState(900)
  const [discountPct, setDiscountPct] = useState(10)

  const qualifyingOrders = Math.round((monthlyOrders * reachPct) / 100)
  const ticketCost = qualifyingOrders * entryFee
  const addedRevenue = qualifyingOrders * extraSpend
  const discountCost = Math.round(monthlyOrders * aov * (discountPct / 100))
  const advantage = Math.max(0, discountCost - ticketCost)
  const costOfAddedRevenue = addedRevenue > 0 ? Math.round((ticketCost / addedRevenue) * 100) : 0
  const barMax = Math.max(1, discountCost, ticketCost)
  const ruleIsBelowAov = threshold <= aov

  return (
    <div className={SHELL}>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="sky" />
        <div
          className={`${CONTAINER} relative pb-14 pt-24 sm:pt-24 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-28`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill className="border-sky-600/20 bg-sky-600/10 text-sky-800">
                <LiveDot />
                Merchant Connect Â· Shopify
              </Pill>
              <Pill className="hidden sm:inline-flex">
                <Webhook className="h-3 w-3 text-emerald-600" />
                Zero-code install
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.6rem] lg:text-[4.05rem]">
              Make the basket
              <span className="block bg-gradient-to-r from-sky-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                worth one more item.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
              Replace margin-eating discounts with a reason to add something else. Set a spend rule once â€” every
              qualifying Shopify order automatically mints a ticket into a real, fully funded PakRaffle draw.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Cta href="/auth/merchant/register" arrow className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4" /> Create merchant account
              </Cta>
              <Cta href="/auth/merchant/login" variant="ghost" className="w-full sm:w-auto">
                <LogIn className="h-4 w-4" /> Merchant login
              </Cta>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-500">
              {["Free to connect", "No monthly fee", "Pay only per qualifying order"].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-slate-900/10 pt-6">
              <div>
                <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900">
                  {pkr(entryFee)}
                  <span className="ml-1 font-sans text-xs font-medium text-slate-500">/ ticket</span>
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">From rate</p>
              </div>
              <div className="hidden h-9 w-px bg-slate-200 sm:block" />
              <div>
                <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900">Rs 0</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">Setup &amp; monthly</p>
              </div>
              <div className="hidden h-9 w-px bg-slate-200 sm:block" />
              <div>
                <p className="font-mono text-2xl font-semibold tabular-nums text-emerald-700">1</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">Ticket per order</p>
              </div>
            </div>
          </div>

          {/* Storefront composition: the cart widget is the product, so it leads the visual. */}
          <div className="relative mt-12 lg:mt-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[48px] bg-gradient-to-br from-sky-200/50 via-white/0 to-emerald-100/60 blur-2xl"
            />
            <div className="relative">
              <div className="overflow-hidden rounded-[26px] border border-slate-900/10 bg-white shadow-[0_40px_100px_-60px_rgba(4,47,34,0.7)]">
                <div className="flex items-center gap-2 border-b border-slate-900/5 bg-slate-50/80 px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="ml-2 truncate font-mono text-[10px] text-slate-400">
                    khanstore.myshopify.com/cart
                  </span>
                  <span className="ml-auto rounded-full bg-emerald-600/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-700">
                    Widget live
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-900/5 bg-slate-50/60 p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 text-slate-500">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-900">Linen kurta Â· Medium</p>
                      <p className="font-mono text-[11px] tabular-nums text-slate-500">Qty 2 Â· Rs 4,000</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-600/20 bg-gradient-to-br from-emerald-50 to-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
                        <Ticket className="h-3.5 w-3.5" /> Draw entry unlocked
                      </span>
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 font-mono text-[9px] font-bold text-white">
                        1 TICKET
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-snug text-slate-700">
                      Add <span className="font-semibold text-emerald-800">Rs 1,000</span> more to enter the{" "}
                      <span className="font-semibold">iPhone 16 Pro</span> draw.
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-emerald-600/10">
                      <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                    </div>
                    <div className="mt-1.5 flex justify-between font-mono text-[10px] tabular-nums text-slate-500">
                      <span>Rs 4,000</span>
                      <span>Rs 5,000</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-900/5 px-4 py-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Subtotal</span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">Rs 4,000</span>
                  </div>
                </div>
              </div>

              {/* Floating proof card */}
              <div className="absolute -bottom-8 -right-3 w-[210px] rotate-[-2deg] rounded-2xl border border-slate-900/10 bg-white p-3.5 shadow-[0_30px_60px_-30px_rgba(4,47,34,0.55)] sm:-right-6">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> Webhook verified
                </div>
                <p className="mt-2 font-mono text-[13px] font-semibold tabular-nums text-slate-900">
                  PKR-SHOPIFY-7Q4K
                </p>
                <p className="mt-1 text-[10px] leading-snug text-slate-500">Order #1042 Â· 4 items Â· Rs 6,800</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-slate-900/5 bg-white/50 py-3 backdrop-blur">
          <Marquee
            items={[
              "One ticket per fulfilled order",
              "HMAC-SHA256 verified webhooks",
              "Voided automatically on refund",
              "Prize sourced and delivered by us",
              "Pay per qualifying order",
              "No monthly fee",
            ]}
          />
        </div>
      </section>

      {/* ------------------------------------------------------- Feature grid */}
      <section className="relative border-b border-slate-900/5 bg-white">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="01"
              kicker="What you get"
              title="Not a coupon with a logo on it"
              body="A draw engine wired into the orders you already fulfil â€” and a dashboard that tells you exactly what it cost."
              action={
                <Cta href="#rule-builder" variant="ghost" arrow>
                  Try the rule builder
                </Cta>
              }
            />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 60}>
                <div className={`${PANEL} group h-full p-6 transition hover:-translate-y-1 hover:border-sky-200`}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-600/15 bg-sky-50 text-sky-700 transition group-hover:bg-sky-100">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{feature.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Lifecycle */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.08),transparent_58%)]" />
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="02"
              kicker="Lifecycle"
              title="Install once. Then it runs itself."
              body="Six steps from pasting the tag to a live draw â€” no app review, no theme surgery, no release window."
            />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LIFECYCLE.map((step, i) => (
              <Reveal key={step.title} delay={i * 60}>
                <div className="relative h-full rounded-3xl border border-slate-900/5 bg-white/70 p-6 backdrop-blur transition hover:border-sky-200">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-900/5 bg-slate-50 text-emerald-700">
                      <step.icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-slate-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Spend-rule builder */}
      <section id="rule-builder" className="relative border-b border-slate-900/5 bg-white">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="03"
              kicker="Spend-rule builder"
              title="Build the rule. See the bill."
              body="Move the sliders to model the exact campaign you would launch. Ticket cost, added revenue and the discount you would have given up â€” all in rupees."
            />
          </Reveal>

          <Reveal delay={80}>
            <div className={`${INK_PANEL} mt-10 overflow-hidden`}>
              <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
                {/* Sliders */}
                <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Your rule
                  </div>

                  <div className="mt-7 space-y-7">
                    <Slider
                      label="Monthly orders"
                      value={monthlyOrders}
                      min={50}
                      max={5000}
                      step={50}
                      onChange={setMonthlyOrders}
                      display={num(monthlyOrders)}
                    />
                    <Slider
                      label="Average order value"
                      value={aov}
                      min={500}
                      max={20000}
                      step={250}
                      onChange={setAov}
                      display={pkr(aov)}
                    />
                    <div>
                      <Slider
                        label="Spend rule"
                        value={threshold}
                        min={1000}
                        max={25000}
                        step={500}
                        onChange={setThreshold}
                        display={`${pkr(threshold)}+`}
                        accent
                      />
                      <p className="mt-2 text-[11px] leading-relaxed text-amber-200/70">
                        {ruleIsBelowAov
                          ? "This sits below your average order, so most orders already qualify. Raise it to reward a bigger basket."
                          : "Shoppers see how much more to add before checkout â€” that is where the extra item comes from."}
                      </p>
                    </div>
                    <Slider
                      label="Orders expected to reach the rule"
                      value={reachPct}
                      min={5}
                      max={80}
                      step={1}
                      onChange={setReachPct}
                      display={`${reachPct}% Â· ${num(qualifyingOrders)} orders`}
                    />
                    <Slider
                      label="Extra spend per qualifying order"
                      value={extraSpend}
                      min={0}
                      max={5000}
                      step={100}
                      onChange={setExtraSpend}
                      display={pkr(extraSpend)}
                    />
                    <Slider
                      label="Discount you would otherwise run"
                      value={discountPct}
                      min={0}
                      max={30}
                      step={1}
                      onChange={setDiscountPct}
                      display={`${discountPct}% off`}
                    />
                  </div>
                </div>

                {/* Result + live widget preview */}
                <div className="bg-white/[0.03] p-6 sm:p-8">
                  <div className="rounded-2xl border border-white/10 bg-[#0a1a14] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                        <ShoppingCart className="h-3.5 w-3.5" /> Cart widget preview
                      </span>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-300">
                        LIVE RULE
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-snug text-emerald-50/85">
                      Spend <span className="font-semibold text-white">{pkr(threshold)}</span> or more in one order and
                      unlock <span className="font-semibold text-white">1 draw entry</span> for the iPhone 16 Pro.
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-[width] duration-300"
                        style={{ width: `${Math.min(100, ruleIsBelowAov ? 100 : 72)}%` }}
                      />
                    </div>
                    <p className="mt-2 font-mono text-[10px] tabular-nums text-emerald-100/50">
                      {ruleIsBelowAov ? "Unlocked at this basket size" : `Rs ${num(Math.round(threshold * 0.28))} to go`}
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <MiniStat label="Tickets minted / mo" value={num(qualifyingOrders)} />
                    <MiniStat label="Draw cost / mo" value={pkr(ticketCost)} />
                    <MiniStat label="Added basket revenue" value={pkr(addedRevenue)} accent />
                    <MiniStat label="Cost of that revenue" value={`${costOfAddedRevenue}%`} />
                  </div>

                  <div className="mt-6 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Cost of the same behaviour
                    </p>
                    <CostBar
                      label={`Flat ${discountPct}% discount on every order`}
                      value={discountCost}
                      max={barMax}
                      tone="rose"
                    />
                    <CostBar
                      label={`Draw tickets Â· ${num(qualifyingOrders)} Ã— ${pkr(entryFee)}`}
                      value={ticketCost}
                      max={barMax}
                      tone="emerald"
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80">
                      Monthly difference
                    </p>
                    <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-white">
                      <Counter to={advantage} prefix="Rs " />
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/60">
                      {advantage > 0
                        ? "kept versus discounting every order. Prize sourcing and delivery are on us."
                        : "This rule costs more than the discount at these numbers â€” widen the gap or lower the expected reach."}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Cta href="/auth/merchant/register" arrow className="w-full sm:w-auto">
                      Launch this rule
                    </Cta>
                    <Cta href="#pricing" variant="light" className="w-full sm:w-auto">
                      See pricing
                    </Cta>
                  </div>

                  <p className="mt-4 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
                    <Calculator className="mt-0.5 h-3 w-3 shrink-0" />
                    Estimate only â€” it assumes one ticket per qualifying order and your per-ticket rate of{" "}
                    {pkr(entryFee)}. Actual reach depends on your catalogue and traffic.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- Campaign recipes */}
      <section className="relative border-b border-slate-900/5">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="04"
              kicker="Recipes"
              title="Three rules that sell"
              body="Every campaign is one rule plus one prize. Pick the behaviour you want to reward and leave the rest alone."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {RECIPES.map((recipe, i) => (
              <Reveal key={recipe.title} delay={i * 80}>
                <div className={`${PANEL} flex h-full flex-col p-6`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-900/5 bg-slate-50 text-sky-700">
                      <recipe.icon className="h-4 w-4" />
                    </span>
                    <span className="rounded-full border border-sky-600/20 bg-sky-50 px-2.5 py-1 font-mono text-[10px] font-semibold text-sky-800">
                      {recipe.rule}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold text-slate-900">{recipe.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{recipe.body}</p>
                  <p className="mt-5 border-t border-slate-900/5 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {recipe.metric}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Pricing */}
      <section id="pricing" className="relative border-b border-slate-900/5 bg-white">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="05"
              kicker="Pricing"
              title="No surprise line on the invoice"
              body="You pay for tickets that turn into real, fulfilled orders. Nothing for connecting, nothing monthly, and nothing for a ticket that gets voided before invoicing."
            />
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              <div className={`${PANEL} h-full p-6 sm:p-8`}>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" /> Included on every store
                </div>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-900/5 pt-6">
                  <div>
                    <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900">Rs 0</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">Setup</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900">Rs 0</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">Monthly</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl font-semibold tabular-nums text-emerald-700">Rs 0</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">Voided tickets</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="flex h-full flex-col gap-4">
                <TicketCard className="p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Per ticket</p>
                  <p className="mt-2 font-mono text-4xl font-semibold tabular-nums text-slate-900">{pkr(entryFee)}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    From rate. Each raffle publishes its own ticket price, locked the moment you launch.
                  </p>
                  <div className="mt-5 space-y-2.5 border-t border-dashed border-slate-200 pt-4 text-sm">
                    {[
                      ["Charged when", "A batch closes"],
                      ["One order", "One ticket"],
                      ["Cancelled order", "Voided, not billed"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3">
                        <span className="text-slate-600">{k}</span>
                        <span className="font-medium text-slate-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </TicketCard>

                <div className="rounded-3xl border border-amber-300/60 bg-amber-50/70 p-5">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-900">
                    <RefreshCcw className="h-3.5 w-3.5" /> Ticket refunds
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-amber-950">
                    Refundable any time before the draw runs, minus the card and wallet charge already paid on it â€”{" "}
                    <strong>2.9% + Rs. 30</strong> per ticket. The ticket is voided and its entry withdrawn.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Trust */}
      <section className="relative overflow-hidden bg-[#07130f] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl animate-drift" />
          <div className="absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl animate-drift [animation-delay:-8s]" />
          <div className="absolute inset-0 grid-veil opacity-[0.16]" />
        </div>
        <div className={`${CONTAINER} relative py-16 md:py-24`}>
          <Reveal>
            <div className="max-w-2xl">
              <Kicker className="text-sky-300">Engineering, not promises</Kicker>
              <h2 className="mt-3 font-display text-[1.75rem] font-semibold leading-[1.06] tracking-tight sm:text-4xl lg:text-[2.6rem]">
                Nothing mints until <span className="text-emerald-400">Shopify says so</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-emerald-50/60">
                Webhooks are signed, deliveries are idempotent and billing only ever touches a fulfilled order.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Signed webhooks",
                body: "Every Shopify delivery is HMAC-SHA256 verified against your store secret before anything is minted.",
              },
              {
                icon: BadgeCheck,
                title: "Idempotent by design",
                body: "One ticket per order per campaign. Shopify retries and duplicate events never double-bill.",
              },
              {
                icon: CircleDollarSign,
                title: "Pay per fulfilled order",
                body: "Tickets are minted on fulfilment, voided on cancellation, and billed only when you close a batch.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-emerald-50/55">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- FAQ */}
      <section className="bg-white">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="06"
              kicker="Questions"
              title="The things merchants ask first"
              body="If something is still unclear, the merchant team answers on WhatsApp â€” and the lookup page lets you test a ticket before you launch."
              align="center"
            />
          </Reveal>
          <Reveal delay={80} className="mx-auto mt-10 max-w-3xl">
            <FaqList items={FAQ} />
          </Reveal>

          <Reveal delay={120}>
            <div className={`${PANEL} mx-auto mt-8 flex max-w-3xl flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between`}>
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900">The fine print, in writing</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Merchant Connect terms, Shopify data handling and the refund policy live on our legal pages.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {[
                  { href: "/terms#merchant-connect", label: "Merchant terms" },
                  { href: "/privacy#merchant-connect", label: "Merchant privacy" },
                  { href: "/lookup/store-ticket", label: "Ticket lookup" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-[#052e23] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/25 blur-3xl animate-drift" />
          <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-sky-300/15 blur-3xl animate-drift [animation-delay:-9s]" />
        </div>
        <div className={`${CONTAINER} relative flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center md:py-16`}>
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
              <Gauge className="h-3.5 w-3.5" /> Two minutes to install
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-4xl">
              Turn orders into entries this week.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50/70 sm:text-base">
              Create an account, connect Shopify once, and launch your first draw today.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Cta
              href="/auth/merchant/register"
              variant="light"
              arrow
              className="w-full border-white/30 bg-white text-emerald-900 hover:bg-emerald-50 sm:w-auto"
            >
              Create merchant account
            </Cta>
            <Cta href="/lookup/store-ticket" variant="light" className="w-full sm:w-auto">
              <Search className="h-4 w-4" /> Ticket lookup
            </Cta>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ pieces */

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  accent = false,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  display: string
  accent?: boolean
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-emerald-50/75">{label}</span>
        <span
          className={`font-mono text-[12px] font-semibold tabular-nums ${accent ? "text-amber-300" : "text-white"}`}
        >
          {display}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-emerald-500"
        aria-label={label}
      />
    </label>
  )
}

function MiniStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p
        className={`mt-1 font-mono text-sm font-semibold tabular-nums ${accent ? "text-emerald-300" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  )
}

function CostBar({
  label,
  value,
  max,
  tone,
}: {
  label: string
  value: number
  max: number
  tone: "rose" | "emerald"
}) {
  const width = Math.max(3, Math.round((value / max) * 100))
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className={`font-mono text-[11px] font-semibold tabular-nums ${tone === "rose" ? "text-rose-300" : "text-emerald-300"}`}>
          {pkr(value)}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${
            tone === "rose" ? "bg-rose-400/80" : "bg-gradient-to-r from-emerald-400 to-teal-300"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
