"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Gift,
  Hourglass,
  Loader2,
  Search,
  ShieldQuestion,
  Store,
  Ticket,
  Trophy,
  XCircle,
} from "lucide-react"
import Image from "next/image"

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
  PAYMENT_PENDING: { label: "Awaiting store confirmation", className: "bg-amber-100 text-amber-900", icon: Clock },
  PAYMENT_FAILED: { label: "Payment retry needed", className: "bg-rose-100 text-rose-900", icon: XCircle },
  AWAITING_CONFIRMATION: { label: "Confirming payment", className: "bg-sky-100 text-sky-800", icon: Hourglass },
  CONFIRMED: { label: "Confirmed entry", className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  VOIDED: { label: "Voided", className: "bg-rose-100 text-rose-800", icon: XCircle },
}

const formatDate = (value: string | null) =>
  !value
    ? "—"
    : new Intl.DateTimeFormat("en-PK", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value))

const formatPKR = (amount: number) => `Rs. ${Math.round(amount).toLocaleString("en-PK")}`

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
    <div className="min-h-screen bg-gray-50 py-8 px-3 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Ticket className="w-3.5 h-3.5 text-emerald-600" /> Store Ticket Lookup
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Did your order win a <span className="text-emerald-600">lucky draw entry?</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Shopping with a PakRaffle Merchant Connect store? Enter your Shopify order number, ticket number or the phone
            number on your order to check your entry and the draw date.
          </p>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <form onSubmit={search} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="#1042 · PKR-SHOPIFY-XXXX · 03001234567"
                  className="pl-9 h-11 rounded-xl border-gray-300 focus-visible:ring-emerald-500 font-mono text-sm"
                  aria-label="Order number, ticket number or phone"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check my ticket"}
              </Button>
            </form>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <p className="text-xs text-gray-500">
              Try the order number from your store receipt (like <span className="font-mono">#1042</span>) or the WhatsApp
              number you ordered with.
            </p>
          </CardContent>
        </Card>

        {searched && !loading && tickets?.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center space-y-3">
              <ShieldQuestion className="w-8 h-8 mx-auto text-gray-400" />
              <p className="font-semibold">No ticket found for that reference</p>
              <p className="text-sm text-gray-600">
                Tickets are minted when your order is <span className="font-medium">fulfilled and shipped</span>, and only for
                stores running a live campaign. Check the order number again or contact the store.
              </p>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold"
              >
                <a href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(`Ticket lookup: ${query}`)}`} target="_blank" rel="noopener noreferrer">
                  Ask PakRaffle support <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {tickets?.map((ticket) => <TicketCard key={ticket.ticketNumber} ticket={ticket} />)}
      </div>
    </div>
  )
}

function TicketCard({ ticket }: { ticket: PublicTicket }) {
  const tone = STAGE_TONE[ticket.stage] || STAGE_TONE.PAYMENT_PENDING
  const Icon = tone.icon
  const voided = ticket.stage === "VOIDED"

  return (
    <Card className={`border-gray-200 shadow-sm overflow-hidden ${voided ? "opacity-80" : ""}`}>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant="secondary" className={`rounded-full font-bold ${tone.className}`}>
              <Icon className="w-3 h-3 mr-1" /> {tone.label}
            </Badge>
            {ticket.isWinner && (
              <Badge className="ml-2 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100 font-bold">
                <Trophy className="w-3 h-3 mr-1" /> Winner
              </Badge>
            )}
            <p className="mt-3 text-lg sm:text-xl font-extrabold tracking-tight truncate">
              {ticket.campaignTitle}
            </p>
            <p className="text-sm text-gray-600 inline-flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-600" /> {ticket.storeName}
              {ticket.orderName && <span className="text-gray-400">·</span>}
              {ticket.orderName && <span className="font-mono">{ticket.orderName}</span>}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Ticket</p>
            <p className="font-mono text-base sm:text-lg font-extrabold text-emerald-700 tabular-nums">
              {ticket.ticketNumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Cell label="Holder" value={ticket.customerName} />
          <Cell label="Phone" value={ticket.customerPhone || "—"} mono />
          <Cell label="Entered" value={formatDate(ticket.issuedAt)} />
          <Cell label="Draw date" value={voided ? "—" : formatDate(ticket.drawDate)} />
        </div>

        {ticket.ruleSummary && !voided && (
          <p className="text-xs text-gray-600 bg-gray-100 rounded-lg px-3 py-2">
            Qualified with rule: <span className="font-medium text-gray-900">{ticket.ruleSummary}</span>
          </p>
        )}

        {ticket.prize && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white border border-emerald-100">
              {ticket.prize.image ? (
                <Image src={ticket.prize.image} alt={ticket.prize.title} fill sizes="56px" className="object-cover" unoptimized />
              ) : (
                <Gift className="absolute inset-0 m-auto h-5 w-5 text-emerald-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">Prize at stake</p>
              <p className="text-sm font-semibold truncate">{ticket.prize.title}</p>
              <p className="text-xs text-emerald-700 font-mono tabular-nums">{formatPKR(ticket.prize.prizeValuePkr)}</p>
            </div>
          </div>
        )}

        {voided ? (
          <p className="text-xs text-rose-700">
            This ticket was voided because the order was cancelled or refunded before the store settled it.
          </p>
        ) : (
          <div className="space-y-1.5">
            {ticket.stage === "PAYMENT_PENDING" && (
              <p className="text-xs text-amber-800 inline-flex items-start gap-1.5">
                <Clock className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                Waiting for {ticket.storeName} team to confirm your entry. Your ticket is reserved — the draw entry activates
                as soon as the store settles it.
              </p>
            )}
            {ticket.stage === "AWAITING_CONFIRMATION" && (
              <p className="text-xs text-sky-800 inline-flex items-start gap-1.5">
                <Hourglass className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                The store has submitted payment — PakRaffle is confirming your entry. This usually takes a few hours.
              </p>
            )}
            {ticket.stage === "PAYMENT_FAILED" && (
              <p className="text-xs text-rose-800 inline-flex items-start gap-1.5">
                <XCircle className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                {ticket.storeName}&apos;s payment for this ticket didn&apos;t clear, so they have been asked to pay again. Your
                ticket stays reserved — the draw entry activates once the store&apos;s payment is confirmed.
              </p>
            )}
            {ticket.drawnAt ? (
              <p className="text-xs text-gray-600 inline-flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Draw held on {formatDate(ticket.drawnAt)}.{" "}
                <Link href="/winners" className="text-emerald-700 font-semibold hover:underline">
                  See winners
                </Link>
              </p>
            ) : (
              <p className="text-xs text-gray-600 inline-flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />{" "}
                {ticket.stage === "CONFIRMED" ? "Your entry is live in the draw pool. " : ""}
                Results are announced on the{" "}
                <Link href="/winners" className="text-emerald-700 font-semibold hover:underline">
                  winners page
                </Link>{" "}
                and PakRaffle WhatsApp.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Cell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">{label}</p>
      <p className={`truncate text-sm font-semibold ${mono ? "font-mono tabular-nums" : ""}`}>{value}</p>
    </div>
  )
}
