"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gift,
  Hourglass,
  Loader2,
  MessageCircle,
  Search,
  ShieldQuestion,
  Store,
  Ticket,
  Trophy,
  XCircle,
} from "lucide-react"
import {
  CONTAINER,
  Cta,
  GhostNumeral,
  Kicker,
  LiveDot,
  Mesh,
  PANEL,
  Pill,
  SHELL,
  TicketCard,
} from "@/components/marketing/kit"

const WHATSAPP_INTL = "923377155722"

interface PublicTicket {
  ticketNumber: string
  status: "ISSUED" | "INVOICED" | "PAID" | "CANCELLED"
  /** Keep in sync with PublicTicketStage in lib/merchants/dto.ts */
  stage: "PAYMENT_PENDING" | "PAYMENT_FAILED" | "AWAITING_CONFIRMATION" | "CONFIRMED" | "VOIDED"
  orderName: string | null
  customerName: string
  customerPhone: string | null
  storeName: string
  storeUrl: string | null
  campaignTitle: string
  campaignStatus: string | null
  ruleSummary: string | null
  drawDate: string | null
  drawnAt: string | null
  isWinner: boolean
  prize: { title: string; image: string | null; prizeValuePkr: number } | null
  issuedAt: string
}

// The stage, not the raw ledger status, is what a shopper can act on.
const STAGE_TONE: Record<PublicTicket["stage"], { label: string; className: string; icon: any }> = {
  PAYMENT_PENDING: {
    label: "Awaiting store confirmation",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-800",
    icon: Clock,
  },
  PAYMENT_FAILED: {
    label: "Payment retry needed",
    className: "border-rose-500/20 bg-rose-500/10 text-rose-800",
    icon: XCircle,
  },
  AWAITING_CONFIRMATION: {
    label: "Confirming payment",
    className: "border-sky-500/20 bg-sky-500/10 text-sky-800",
    icon: Hourglass,
  },
  CONFIRMED: {
    label: "Confirmed entry",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-800",
    icon: CheckCircle2,
  },
  VOIDED: {
    label: "Voided",
    className: "border-rose-500/20 bg-rose-500/10 text-rose-800",
    icon: XCircle,
  },
}

const formatDate = (value: string | null) =>
  !value
    ? "—"
    : new Intl.DateTimeFormat("en-PK", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value))

const formatPKR = (amount: number) => `Rs. ${Math.round(amount).toLocaleString("en-PK")}`

const HOW_IT_WORKS = [
  {
    label: "Order number",
    example: "#1042",
    body: "The number on your store receipt or confirmation email.",
  },
  {
    label: "Ticket number",
    example: "PKR-SHOPIFY-7Q4K",
    body: "Printed on the ticket the store sent after shipping.",
  },
  {
    label: "Phone number",
    example: "03001234567",
    body: "The WhatsApp number you used when you placed the order.",
  },
]

export default function StoreTicketLookupClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [tickets, setTickets] = useState<PublicTicket[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const q = query.trim()
    if (q.length < 4) {
      setError("Enter at least 4 characters — your order number, ticket number or phone.")
      return
    }
    setLoading(true)
    setError(null)
    router.replace(`/lookup/store-ticket?q=${encodeURIComponent(q)}`, { scroll: false })
    try {
      const res = await fetch(`/api/merchants/lookup?q=${encodeURIComponent(q)}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || "Lookup failed. Please try again.")
      setTickets(data.tickets)
      setSearched(true)
    } catch (err: any) {
      setError(err.message)
      setTickets(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={SHELL}>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="sky" />
        <div className={`${CONTAINER} relative pb-10 pt-24 sm:pb-12 sm:pt-28`}>
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Pill className="border-sky-600/20 bg-sky-600/10 text-sky-800">
                <Store className="h-3 w-3" />
                Merchant Connect
              </Pill>
              <Pill>
                <Ticket className="h-3 w-3 text-emerald-600" />
                Store ticket lookup
              </Pill>
            </div>

            <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1] tracking-[-0.03em] text-slate-900 sm:text-[2.9rem]">
              Check your ticket.
              <span className="block bg-gradient-to-r from-sky-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                It came from your order.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
              Shopping with a PakRaffle Merchant Connect store? Enter your Shopify order number, ticket number, or the
              phone on the order to see your entry and the draw date.
            </p>
          </div>

          {/* Search — the whole point of the page, so it gets the weight. */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className={`${PANEL} p-4 sm:p-5`}>
              <form onSubmit={search} className="flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="#1042 · PKR-SHOPIFY-XXXX · 03001234567"
                    aria-label="Order number, ticket number or phone"
                    className="h-12 w-full rounded-2xl border border-slate-900/10 bg-white pl-10 pr-4 font-mono text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-[0_14px_34px_-16px_rgba(5,150,105,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check my ticket"}
                </button>
              </form>

              {error && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-medium text-rose-700">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}

              <p className="mt-3 text-[11.5px] text-slate-500">
                Try the order number from your store receipt (like <span className="font-mono text-slate-700">#1042</span>
                ) or the WhatsApp number you ordered with.
              </p>
            </div>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              Lookups are read-only. Nothing is charged for checking a ticket.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Three references */}
      <section className={`${CONTAINER} pb-4 pt-10`}>
        <div className="grid gap-3 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.label} className="relative overflow-hidden rounded-2xl border border-slate-900/10 bg-white/70 p-4 backdrop-blur">
              <GhostNumeral className="absolute -right-1 -top-2 text-4xl opacity-30">{`0${i + 1}`}</GhostNumeral>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
              <p className="mt-1.5 truncate font-mono text-[13px] font-semibold text-slate-900">{item.example}</p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- Results */}
      <section className={`${CONTAINER} pb-16 pt-8 sm:pb-20`}>
        {searched && !loading && tickets?.length === 0 && (
          <div className={`${PANEL} mx-auto max-w-2xl p-8 text-center`}>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-500">
              <ShieldQuestion className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold tracking-tight text-slate-900">
              No ticket found for that reference
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
              Tickets are minted when your order is <span className="font-semibold text-slate-800">fulfilled and shipped</span>,
              and only for stores running a live campaign. Check the order number again or contact the store.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Cta
                href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(`Ticket lookup: ${query}`)}`}
                variant="ghost"
              >
                <MessageCircle className="h-4 w-4" />
                Ask PakRaffle support
              </Cta>
              <Cta href="/merchants" variant="ghost">
                How Merchant Connect works
              </Cta>
            </div>
          </div>
        )}

        {tickets && tickets.length > 0 && (
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <LiveDot />
                {tickets.length} ticket{tickets.length > 1 ? "s" : ""} found
              </p>
              <p className="font-mono text-[11px] text-slate-400">ref: {query.trim()}</p>
            </div>
            {tickets.map((ticket) => (
              <TicketCardView key={ticket.ticketNumber} ticket={ticket} />
            ))}
          </div>
        )}

        {/* Helper rail — always useful, never in the way of results. */}
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-5 backdrop-blur sm:p-6">
            <Kicker>How a ticket is born</Kicker>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Store,
                  title: "You order",
                  body: "Checkout happens entirely on the store's own website.",
                },
                {
                  icon: Ticket,
                  title: "They mint",
                  body: "A qualifying fulfilled order gets one ticket — never more.",
                },
                {
                  icon: Trophy,
                  title: "You check",
                  body: "Look it up here any time until the draw runs.",
                },
              ].map((step) => (
                <div key={step.title} className="flex items-start gap-2.5">
                  <step.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-[12.5px] font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/5 pt-4">
              <p className="text-[11.5px] text-slate-500">
                Order, delivery or refund questions go to the store — not PakRaffle.
              </p>
              <Link
                href="/merchants"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 hover:underline"
              >
                Run a campaign on your store <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function TicketCardView({ ticket }: { ticket: PublicTicket }) {
  const tone = STAGE_TONE[ticket.stage] || STAGE_TONE.PAYMENT_PENDING
  const Icon = tone.icon
  const voided = ticket.stage === "VOIDED"

  return (
    <TicketCard className={voided ? "opacity-80" : ""}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-slate-900/10 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] ${tone.className}`}
            >
              <Icon className="h-3 w-3" /> {tone.label}
            </span>
            {ticket.isWinner && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-400/15 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-amber-800">
                <Trophy className="h-3 w-3" /> Winner
              </span>
            )}
          </div>

          <h3 className="mt-3 truncate font-display text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {ticket.campaignTitle}
          </h3>
          <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-600">
            <Store className="h-3.5 w-3.5 text-emerald-600" />
            {ticket.storeName}
            {ticket.orderName && <span className="text-slate-300">·</span>}
            {ticket.orderName && <span className="font-mono">{ticket.orderName}</span>}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-500">Ticket</p>
          <p className="font-mono text-base font-semibold tabular-nums text-emerald-700 sm:text-lg">
            {ticket.ticketNumber}
          </p>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Cell label="Holder" value={ticket.customerName} />
          <Cell label="Phone" value={ticket.customerPhone || "—"} mono />
          <Cell label="Entered" value={formatDate(ticket.issuedAt)} />
          <Cell label="Draw date" value={voided ? "—" : formatDate(ticket.drawDate)} />
        </div>

        <StoreDetails ticket={ticket} />

        {ticket.ruleSummary && !voided && (
          <p className="rounded-xl bg-slate-900/[0.035] px-3.5 py-2.5 text-[11.5px] text-slate-600">
            Qualified with rule: <span className="font-semibold text-slate-900">{ticket.ruleSummary}</span>
          </p>
        )}

        {ticket.prize && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/70 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-emerald-500/15 bg-white">
              {ticket.prize.image ? (
                <Image
                  src={ticket.prize.image}
                  alt={ticket.prize.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Gift className="absolute inset-0 m-auto h-5 w-5 text-emerald-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-emerald-800">Prize at stake</p>
              <p className="truncate text-[13px] font-semibold text-slate-900">{ticket.prize.title}</p>
              <p className="font-mono text-[11.5px] tabular-nums text-emerald-700">
                {formatPKR(ticket.prize.prizeValuePkr)}
              </p>
            </div>
          </div>
        )}

        {voided ? (
          <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-rose-700">
            This ticket was voided because the order was cancelled or refunded before the store settled it.
          </p>
        ) : (
          <div className="space-y-2">
            {ticket.stage === "PAYMENT_PENDING" && (
              <StatusLine tone="amber" icon={Clock}>
                Waiting for {ticket.storeName} team to confirm your entry. Your ticket is reserved — the draw entry
                activates as soon as the store settles it.
              </StatusLine>
            )}
            {ticket.stage === "AWAITING_CONFIRMATION" && (
              <StatusLine tone="sky" icon={Hourglass}>
                The store has submitted payment — PakRaffle is confirming your entry. This usually takes a few hours.
              </StatusLine>
            )}
            {ticket.stage === "PAYMENT_FAILED" && (
              <StatusLine tone="rose" icon={XCircle}>
                {ticket.storeName}&apos;s payment for this ticket didn&apos;t clear, so they have been asked to pay again.
                Your ticket stays reserved — the draw entry activates once the store&apos;s payment is confirmed.
              </StatusLine>
            )}
            {ticket.drawnAt ? (
              <p className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" /> Draw held on {formatDate(ticket.drawnAt)}.{" "}
                <Link href="/winners" className="font-semibold text-emerald-700 hover:underline">
                  See winners
                </Link>
              </p>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" />{" "}
                {ticket.stage === "CONFIRMED" ? "Your entry is live in the draw pool. " : ""}
                Results are announced on the{" "}
                <Link href="/winners" className="font-semibold text-emerald-700 hover:underline">
                  winners page
                </Link>{" "}
                and PakRaffle WhatsApp.
              </p>
            )}
          </div>
        )}
      </div>
    </TicketCard>
  )
}

function StoreDetails({ ticket }: { ticket: PublicTicket }) {
  const domain = ticket.storeUrl?.replace(/^https?:\/\//, "") || null
  return (
    <div className="rounded-2xl border border-slate-900/10 bg-slate-50/70 px-4 py-3.5">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Where this ticket came from
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex min-w-0 items-center gap-1.5 text-[13px] font-semibold text-slate-900">
          <Store className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="truncate">{ticket.storeName}</span>
        </p>
        {ticket.storeUrl && domain && (
          <a
            href={ticket.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            {domain} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11.5px] text-slate-600 sm:grid-cols-3">
        <p>
          Order <span className="font-mono font-semibold text-slate-900">{ticket.orderName || "—"}</span>
        </p>
        <p>
          Issued <span className="font-semibold text-slate-900">{formatDate(ticket.issuedAt)}</span>
        </p>
        <p className="col-span-2 truncate sm:col-span-1">
          Campaign <span className="font-semibold text-slate-900">{ticket.campaignTitle}</span>
        </p>
      </div>
      <p className="mt-2.5 border-t border-slate-900/5 pt-2.5 text-[10.5px] leading-relaxed text-slate-500">
        {ticket.storeName} raised this ticket from your fulfilled order {ticket.orderName || ""} on their own store. It is
        their lucky draw entry on PakRaffle — nothing extra was charged to you for it. Order, delivery or refund questions
        go to the store, not PakRaffle.
      </p>
    </div>
  )
}

function StatusLine({
  tone,
  icon: Icon,
  children,
}: {
  tone: "amber" | "sky" | "rose"
  icon: any
  children: React.ReactNode
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-900",
    sky: "bg-sky-50 text-sky-900",
    rose: "bg-rose-50 text-rose-800",
  }[tone]
  return (
    <p className={`inline-flex items-start gap-1.5 rounded-xl px-3 py-2 text-[11.5px] leading-relaxed ${tones}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  )
}

function Cell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-900/5 bg-white px-3 py-2">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-0.5 truncate text-[12.5px] font-semibold text-slate-900 ${mono ? "font-mono tabular-nums" : ""}`}>
        {value}
      </p>
    </div>
  )
}
