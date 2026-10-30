"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  FileText,
  KeyRound,
  LogIn,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Ticket,
  Trophy,
  UserPlus,
  Webhook,
} from "lucide-react"
import { ConnectStoreDialog } from "@/components/merchants/connect-dialogs"
import { Btn, Panel, Sep, TextInput, formatNumber, formatPKR } from "@/components/merchants/ui"

const LIFECYCLE = [
  {
    icon: Store,
    title: "Connect store",
    body: "Create your merchant account and paste our webhook URL plus the storefront widget tag into your Shopify admin — two minutes, one time.",
  },
  {
    icon: Sparkles,
    title: "Launch campaign",
    body: "Link a live PakRaffle prize and set the rule — e.g. buy 3+ items or spend Rs. 5,000+.",
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

const FAQ = [
  {
    q: "When am I charged?",
    a: "Only when you close a batch. Each ticket minted from a fulfilled, non-cancelled order is billed once at the locked per-ticket rate. Test tickets from the simulator are never billed.",
  },
  {
    q: "What happens if an order is cancelled or refunded?",
    a: "We register the order cancellation and refund webhooks when you connect Shopify, so the ticket is voided automatically — as long as the batch has not been paid yet. Voided tickets are removed from your invoice.",
  },
  {
    q: "Can one order earn multiple tickets?",
    a: "No. Each order earns at most one ticket per campaign. Duplicate webhook deliveries are detected and ignored, so retries from Shopify never double-bill you.",
  },
  {
    q: "Who supplies the prize?",
    a: "PakRaffle does. You link one of our live prizes to your campaign — we handle sourcing, the draw and delivery to the winner.",
  },
  {
    q: "How do customers check their ticket?",
    a: "On the public Store Ticket Lookup page, using their Shopify order number or phone number. They see the ticket, prize and draw date.",
  },
]

export default function MerchantsLanding({ entryFee }: { entryFee: number }) {
  const searchParams = useSearchParams()
  const [connectOpen, setConnectOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // A merchant who just signed up arrives with ?connect=1 and their store details already typed.
  const prefill = {
    name: searchParams.get("storeName") || "",
    storeUrl: searchParams.get("storeUrl") || "",
  }
  const wantsConnect = searchParams.get("connect") === "1"

  useEffect(() => {
    if (wantsConnect) setConnectOpen(true)
  }, [wantsConnect])

  // Discount-vs-draw calculator
  const [monthlyOrders, setMonthlyOrders] = useState(400)
  const [aov, setAov] = useState(4500)
  const [discountPct, setDiscountPct] = useState(10)
  const [qualifyPct, setQualifyPct] = useState(35)

  const discountCost = Math.round(monthlyOrders * aov * (discountPct / 100))
  const qualifyingOrders = Math.round(monthlyOrders * (qualifyPct / 100))
  const drawCost = qualifyingOrders * entryFee
  const savings = Math.max(0, discountCost - drawCost)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600">
            Merchant Connect <span className="text-slate-400">/</span> Shopify Lucky Draw Loyalty Engine
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Boost Cart Size with <span className="text-emerald-600">Guaranteed Prize Draws</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Replace margin-eating discounts with a reason to add one more item. Set a spend rule, and every qualifying
            Shopify order automatically mints a PakRaffle ticket for a real prize.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/merchant/register" className="w-full sm:w-auto">
              <Btn className="w-full px-6 py-3 text-base sm:w-auto">
                <UserPlus className="h-5 w-5" /> Create merchant account
              </Btn>
            </Link>
            <Link href="/auth/merchant/login" className="w-full sm:w-auto">
              <Btn variant="secondary" className="w-full px-6 py-3 text-base sm:w-auto">
                <LogIn className="h-5 w-5" /> Merchant login
              </Btn>
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Google or email &amp; password <Sep />{" "}
            <button
              type="button"
              onClick={() => setConnectOpen(true)}
              className="inline-flex items-center gap-1 text-slate-600 transition hover:text-emerald-600"
            >
              <KeyRound className="h-3 w-3" /> Connect a store with an API key
            </button>
          </p>

          <p className="mt-6 text-sm text-slate-500">
            Free to connect <Sep /> from{" "}
            <span className="font-mono tabular-nums text-slate-700">{formatPKR(entryFee)}</span> per ticket
            <Sep /> each raffle sets its own rate <Sep /> billed per qualifying order
          </p>

          {/* Live ticket illustration */}
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Panel className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Rule</p>
              <p className="mt-2 text-sm text-slate-800">
                Buy <span className="font-mono tabular-nums text-emerald-600">3+</span> items
              </p>
              <p className="mt-1 text-xs text-slate-500">Order #1042 · 4 items · Rs. 6,800</p>
            </Panel>
            <Panel className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Webhooks</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-800">
                <Webhook className="h-4 w-4 text-emerald-600" /> Paste once, done
              </p>
              <p className="mt-1 text-xs text-slate-500">orders/create · cancelled · refunds · HMAC verified</p>
            </Panel>
            <Panel className="border-emerald-200 p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Ticket minted</p>
              <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-emerald-600">PKR-SHOPIFY-7Q4K</p>
              <p className="mt-1 text-xs text-slate-500">Entries minted · <span className="font-mono tabular-nums">42/100</span></p>
            </Panel>
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
        <p className="mt-2 max-w-2xl text-slate-600">Six steps from install to winner. No app to install, no code to ship.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIFECYCLE.map((step, i) => (
            <Panel key={step.title} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-emerald-600">
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-500">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </Panel>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Discount vs. draw</h2>
            <p className="mt-2 text-slate-600">
              A flat discount costs you on every order. A draw only costs a fixed ticket fee on orders that hit your rule.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <CalcInput label="Monthly orders" value={monthlyOrders} onChange={setMonthlyOrders} min={1} />
              <CalcInput label="Avg. order value (Rs.)" value={aov} onChange={setAov} min={1} />
              <CalcInput label="Discount you'd give (%)" value={discountPct} onChange={setDiscountPct} min={0} max={90} />
              <CalcInput label="Orders hitting the rule (%)" value={qualifyPct} onChange={setQualifyPct} min={0} max={100} />
            </div>
          </div>

          <Panel className="flex flex-col justify-between p-6">
            <div className="space-y-4">
              <Row label="Discount cost / month" value={formatPKR(discountCost)} tone="text-rose-700" />
              <Row
                label={`Draw cost / month · ${formatNumber(qualifyingOrders)} tickets × ${formatPKR(entryFee)}`}
                value={formatPKR(drawCost)}
                tone="text-slate-900"
              />
              <div className="border-t border-slate-200 pt-4">
                <Row label="You keep" value={formatPKR(savings)} tone="text-emerald-600" large />
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              Estimate only. Prize sourcing and delivery are covered by PakRaffle.
            </p>
          </Panel>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Signed webhooks", body: "Every Shopify delivery is HMAC-SHA256 verified against your store secret before anything is minted." },
            { icon: BadgeCheck, title: "Idempotent by design", body: "One ticket per order per campaign. Shopify retries and duplicate events never double-bill." },
            { icon: ShoppingBag, title: "Pay per fulfilled order", body: "Tickets are minted on fulfilment, voided on cancellation, and billed only when you close a batch." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 md:pb-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Questions</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {FAQ.map((item, i) => (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-900"
              >
                {item.q}
                <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">Ready to turn orders into entries?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Already a customer? <Link href="/lookup/store-ticket" className="inline-flex items-center gap-1 text-emerald-600 hover:underline"><Search className="h-3.5 w-3.5" />Look up your store ticket</Link>
            </p>
          </div>
          <Link href="/auth/merchant/register">
            <Btn className="px-6 py-3">
              Create merchant account <ArrowRight className="h-4 w-4" />
            </Btn>
          </Link>
        </div>
      </section>

      <ConnectStoreDialog open={connectOpen} onOpenChange={setConnectOpen} initial={prefill} />
    </div>
  )
}

function CalcInput({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <TextInput
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => {
          const n = Number(e.target.value)
          const clamped = Math.min(max ?? Infinity, Math.max(min ?? 0, Number.isFinite(n) ? n : 0))
          onChange(clamped)
        }}
        className="font-mono tabular-nums"
      />
    </label>
  )
}

function Row({ label, value, tone, large = false }: { label: string; value: string; tone: string; large?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-mono font-semibold tabular-nums ${large ? "text-3xl" : "text-lg"} ${tone}`}>{value}</span>
    </div>
  )
}
