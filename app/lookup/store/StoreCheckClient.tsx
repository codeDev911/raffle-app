"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeftRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Gift,
  Hourglass,
  Loader2,
  Lock,
  MessageCircle,
  PauseCircle,
  Store,
  Ticket,
  Trophy,
  XCircle,
} from "lucide-react"
import {
  CONTAINER,
  CheckList,
  Cta,
  FaqList,
  INK_PANEL,
  LiveDot,
  Mesh,
  PANEL,
  Pill,
  SHELL,
  SectionHead,
  TicketCard,
} from "@/components/marketing/kit"
import { Lift } from "@/components/marketing/motion"

const WHATSAPP_INTL = "923377155722"

type CampaignState = "live" | "paused" | "full" | "drawing" | "ended"

interface StoreCampaign {
  id: string
  title: string
  ruleSummary: string
  state: CampaignState
  isAccepting: boolean
  entriesIssued: number
  entryCap: number | null
  startedAt: string
  closesAt: string
  prize: {
    title: string
    image: string | null
    category: string | null
    valuePkr: number
    drawDate: string | null
  } | null
  shopUrl: string
}

interface StoreCheckResult {
  success: boolean
  found: boolean
  domain: string
  store?: {
    name: string
    domain: string
    status: string
    siteUrl: string
    campaignCount: number
    liveCampaigns: number
  }
  campaigns?: StoreCampaign[]
  error?: string
}

// A campaign's lifecycle, translated into what a shopper can act on.
const STATE_TONE: Record<CampaignState, { label: string; className: string; icon: any }> = {
  live: {
    label: "Live now",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-800",
    icon: CheckCircle2,
  },
  paused: {
    label: "Paused",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-800",
    icon: PauseCircle,
  },
  full: {
    label: "Entry cap reached",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-800",
    icon: PauseCircle,
  },
  drawing: {
    label: "Draw in progress",
    className: "border-sky-500/20 bg-sky-500/10 text-sky-800",
    icon: Hourglass,
  },
  ended: {
    label: "Closed",
    className: "border-slate-900/10 bg-slate-900/5 text-slate-600",
    icon: Lock,
  },
}

const formatPKR = (amount: number) => `Rs. ${Math.round(amount).toLocaleString("en-PK")}`

const formatDate = (value: string | null) =>
  !value
    ? "—"
    : new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))

const PROMISES = [
  {
    icon: Gift,
    title: "The entry costs nothing",
    body: "The store pays for your ticket. You pay the normal price at checkout — never a rupee more.",
  },
  {
    icon: Ticket,
    title: "One ticket per order",
    body: "Every qualifying order that ships earns a single entry into that store's draw.",
  },
  {
    icon: Trophy,
    title: "Prize delivered by us",
    body: "PakRaffle runs the draw and ships the exclusive product to the winner.",
  },
]

const FAQS = [
  {
    q: "Is the lucky draw really free for me?",
    a: "Yes. On Merchant Connect the store pays for every ticket. You order and pay on the store's own website as usual, and the ticket is minted once that order is fulfilled and shipped.",
  },
  {
    q: "What if my store is not listed?",
    a: "Then it has not connected to PakRaffle yet, so there is no free draw there — try another store you shop at. New Pakistani brands join the network every month.",
  },
  {
    q: "How do you know which campaigns a store runs?",
    a: "The checker reads the store's published campaigns: the qualifying rule, the prize linked to it, how many tickets have been issued and when entries close. We never ask for your order or account details here.",
  },
  {
    q: "Where do I check the ticket I earned?",
    a: "On the Store Ticket Lookup page, using the Shopify order number from the store's receipt, the ticket number the store sent you, or the phone number used at checkout.",
  },
]

export default function StoreCheckClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const [input, setInput] = useState(searchParams.get("store") || "")
  const [result, setResult] = useState<StoreCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const search = async (event?: React.FormEvent) => {
    event?.preventDefault()
    const domain = input.trim()
    if (domain.replace(/^https?:\/\//i, "").length < 4) {
      setError("Enter a store domain, like yourstore.myshopify.com")
      return
    }

    setLoading(true)
    setError(null)
    setCopiedId(null)
    router.replace(`/lookup/store?store=${encodeURIComponent(domain)}`, { scroll: false })

    try {
      const res = await fetch(`/api/merchants/store-check?store=${encodeURIComponent(domain)}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || "Could not check that store. Please try again.")
      setResult(data as StoreCheckResult)
      setSearched(true)
    } catch (err: any) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setInput("")
    setResult(null)
    setError(null)
    setSearched(false)
    router.replace("/lookup/store", { scroll: false })
    inputRef.current?.focus()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const copyLink = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1800)
    } catch {
      // Clipboard blocked by the browser — the query string is still visible to copy by hand.
    }
  }

  // A shared link such as /lookup/store?store=brand.myshopify.com should already show the answer.
  const booted = useRef(false)
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    if ((searchParams.get("store") || "").trim().length >= 4) void search()
    // Runs once per mount — the query string seeds the first check, it is not state afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={SHELL}>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="emerald" />
        <div className={`${CONTAINER} relative pb-12 pt-24 text-center sm:pb-16 sm:pt-28`}>
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Pill className="border-emerald-600/20 bg-emerald-600/10 text-emerald-800">
                <Store className="h-3 w-3" />
                Partner stores
              </Pill>
              <Pill>
                <Gift className="h-3 w-3 text-emerald-600" />
                Free to enter
              </Pill>
            </div>

            <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.03em] text-slate-900 sm:text-[3rem] lg:text-[3.3rem]">
              Does your shopping
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                win you free prizes?
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
              Plenty of Pakistani stores give every qualifying order a free entry into a PakRaffle draw for an
              exclusive product. Type a store you shop at to see what you could win — and where to shop to win it.
            </p>

            <div className={`${PANEL} mx-auto mt-7 max-w-xl p-4 text-left sm:p-5`}>
              <form onSubmit={search} className="flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex-1">
                  <Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="e.g. brand.myshopify.com"
                    aria-label="Store domain"
                    spellCheck={false}
                    autoComplete="off"
                    className="h-12 w-full rounded-2xl border border-slate-900/10 bg-white pl-10 pr-4 font-mono text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-[0_14px_34px_-16px_rgba(5,150,105,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check this store"}
                </button>
              </form>

              {error && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-medium text-rose-700">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}

              <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
                Paste the store domain or the full product link — both work. Nothing about you is saved here.
              </p>
            </div>

            <p className="mt-3 text-[11.5px] text-slate-500">
              No signup · no extra charge · one ticket per qualifying order
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Shopper promise */}
      <section className={`${CONTAINER} pt-10`}>
        <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-3">
          {PROMISES.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 backdrop-blur">
              <item.icon className="h-4 w-4 text-emerald-600" />
              <p className="mt-2 text-[12.5px] font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- Results */}
      {searched && (
        <section className={`${CONTAINER} pb-4 pt-10 sm:pt-12`}>
          {loading && (
            <div className="mx-auto max-w-5xl space-y-4">
              <div className={`${PANEL} h-20 animate-pulse`} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className={`${PANEL} h-64 animate-pulse`} />
                <div className={`${PANEL} h-64 animate-pulse`} />
              </div>
            </div>
          )}

          {!loading && result?.found === false && (
            <div className={`${PANEL} mx-auto max-w-2xl p-8 text-center`}>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-500">
                <Store className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold tracking-tight text-slate-900">
                No draw found for that store
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
                <span className="font-mono text-slate-900">{result.domain}</span> isn&apos;t on PakRaffle yet, so there
                is no free draw running there. Double-check the spelling, or try another store you shop at.
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                <Cta href="/raffles" variant="ghost">
                  Browse PakRaffle draws
                </Cta>
                <Cta
                  href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(`Store check: ${result.domain}`)}`}
                  variant="ghost"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask PakRaffle
                </Cta>
              </div>
              <button
                type="button"
                onClick={reset}
                className="mt-4 text-[12px] font-semibold text-emerald-700 underline-offset-4 hover:underline"
              >
                Check another store
              </button>
            </div>
          )}

          {!loading && result?.found && result.store && (
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <LiveDot />
                    {result.store.liveCampaigns > 0 ? "Partner store · draw live" : "Partner store on PakRaffle"}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.85rem]">
                    {result.store.name}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11.5px] text-slate-500">
                    <span className="truncate">{result.store.domain}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-emerald-700">{result.store.liveCampaigns} live</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-normal">
                      {result.store.campaignCount} campaign{result.store.campaignCount === 1 ? "" : "s"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={result.store.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-900/10 bg-white px-3.5 text-[12px] font-semibold text-slate-800 transition hover:border-emerald-500/30 hover:text-emerald-700"
                  >
                    Visit store <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/70 px-3.5 text-[12px] font-semibold text-slate-600 transition hover:text-slate-900"
                  >
                    <ArrowLeftRight className="h-3 w-3" />
                    Check another
                  </button>
                </div>
              </div>

              {result.campaigns && result.campaigns.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {result.campaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      copied={copiedId === campaign.id}
                      onCopy={copyLink}
                    />
                  ))}
                </div>
              ) : (
                <div className={`${PANEL} mt-6 p-8 text-center`}>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
                    <Hourglass className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-slate-900">
                    No campaign running right now
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
                    {result.store.name} works with PakRaffle but has no live draw this moment. Check back soon — or go
                    straight to the main draws, where the prizes are already waiting.
                  </p>
                  <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                    <Cta href="/raffles" variant="ghost">
                      Browse PakRaffle draws
                    </Cta>
                    <Cta href="/lookup/store-ticket" variant="ghost">
                      Check a ticket
                    </Cta>
                  </div>
                </div>
              )}

              <p className="mt-4 text-center text-[11px] text-slate-400">
                Draw details come straight from the store. Delivery, returns and order support stay with the store.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ----------------------------------------------------- Store-owner band */}
      <section className={`${CONTAINER} pb-16 pt-14 sm:pb-20`}>
        <div className={`${INK_PANEL} relative overflow-hidden px-6 py-9 sm:px-10 sm:py-11`}>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="absolute inset-0 grid-veil opacity-40" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                <span aria-hidden className="h-px w-6 bg-emerald-400/50" />
                For store owners
              </p>
              <h2 className="mt-4 font-display text-[1.7rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[2.1rem]">
                Put a free draw
                <span className="block text-emerald-300">on the orders you already ship.</span>
              </h2>
              <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-emerald-50/70">
                Connect your Shopify store, attach a prize and let PakRaffle mint one ticket per qualifying fulfilled
                order. This checker is where your shoppers land — tagged, attributed and ready to shop.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <Cta href="/merchants" variant="light" arrow>
                  See Merchant Connect
                </Cta>
                <Cta href="/contact" variant="light">
                  Talk to the team
                </Cta>
              </div>
            </div>

            <CheckList
              tone="light"
              items={[
                "One ticket per qualifying fulfilled order",
                "Prize sourced, drawn and delivered by PakRaffle",
                "Billed only on tickets that actually cost you",
                "Shoppers keep their own store checkout",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ FAQ */}
      <section className={`${CONTAINER} pb-20`}>
        <SectionHead kicker="Common questions" title="The bits shoppers ask first." />
        <FaqList items={FAQS} className="mt-6" />
        <p className="mt-6 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-400">
          Store draw checker · free for shoppers
        </p>
      </section>
    </div>
  )
}

function CampaignCard({
  campaign,
  copied,
  onCopy,
}: {
  campaign: StoreCampaign
  copied: boolean
  onCopy: (id: string, url: string) => void
}) {
  const tone = STATE_TONE[campaign.state] ?? STATE_TONE.paused
  const Icon = tone.icon
  const query = campaign.shopUrl.includes("?") ? `?${campaign.shopUrl.split("?")[1]}` : ""

  return (
    <Lift className="h-full">
      <TicketCard className="flex h-full flex-col border-slate-900/10">
        <div className="flex items-start gap-3 border-b border-dashed border-slate-900/10 px-5 py-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-100">
            {campaign.prize?.image ? (
              <Image
                src={campaign.prize.image}
                alt={campaign.prize.title}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <Gift className="absolute inset-0 m-auto h-5 w-5 text-emerald-600" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${tone.className}`}
            >
              <Icon className="h-3 w-3" /> {tone.label}
            </span>
            <h3 className="mt-1.5 font-display text-[15.5px] font-semibold leading-snug tracking-tight text-slate-900">
              {campaign.title}
            </h3>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{campaign.ruleSummary}</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 px-5 py-4">
          {campaign.prize && (
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-50/60 px-3 py-2.5">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-emerald-800">Prize on the line</p>
              <p className="mt-0.5 truncate text-[12.5px] font-semibold text-slate-900">{campaign.prize.title}</p>
              <p className="font-mono text-[11.5px] tabular-nums text-emerald-700">
                {formatPKR(campaign.prize.valuePkr)}
                {campaign.prize.category ? ` · ${campaign.prize.category}` : ""}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Tickets" value={campaign.entriesIssued.toLocaleString("en-PK")} />
            <MiniStat
              label="Entry cap"
              value={campaign.entryCap ? campaign.entryCap.toLocaleString("en-PK") : "Open"}
            />
            <MiniStat label="Closes" value={formatDate(campaign.closesAt)} />
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500">
            Free to enter. The store pays for every ticket you earn — one per qualifying order, no extra charge at
            checkout.
          </p>
        </div>

        <div className="space-y-2 border-t border-slate-900/5 px-5 py-4">
          <a
            href={campaign.shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-[0_14px_34px_-16px_rgba(5,150,105,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-500"
          >
            {campaign.isAccepting ? "Shop this draw" : "Visit the store"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <div className="flex items-center gap-2 rounded-xl bg-slate-900/[0.035] px-2.5 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-500">{query}</span>
            <button
              type="button"
              onClick={() => onCopy(campaign.id, campaign.shopUrl)}
              aria-label="Copy tracked store link"
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-slate-900/10 bg-white px-2 text-[10px] font-semibold text-slate-600 transition hover:text-emerald-700"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </TicketCard>
    </Lift>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-900/5 bg-white px-2.5 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[11.5px] font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  )
}
