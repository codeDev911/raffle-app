"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Gift, Search, ShieldCheck, Sparkles, Star, Trophy, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  CONTAINER,
  Cta,
  INK_PANEL,
  Kicker,
  LiveDot,
  Marquee,
  PANEL,
  Pill,
  SHELL,
  TicketCard,
} from "@/components/marketing/kit"
import { Lift } from "@/components/marketing/motion"

interface RaffleItem {
  id: string
  title: string
  description: string
  image?: string | null
  price: number // in paisa
  realPrice: number // in paisa
  totalEntries: number
  currentEntries: number
  category: string
  featured: boolean
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  endDate: string | Date
  createdAt: string | Date
  _count?: {
    entries: number
  }
}

interface RafflesClientProps {
  initialRaffles: RaffleItem[]
  categories: string[]
}

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/invite/pakraffle-official"

const BAND = [
  "100% target ticket rule",
  "Uncut live broadcast",
  "Cryptographic RNG",
  "Free insured delivery",
  "PTA-approved handsets",
  "Zero winner fees",
  "Public ticket ledger",
  "7-day winner claim window",
]

const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest added" },
  { value: "price-low", label: "Entry price: low to high" },
  { value: "price-high", label: "Entry price: high to low" },
]

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
    </svg>
  )
}

/** Percentage of the target ticket pool already sold — never above 100. */
function soldPercent(raffle: RaffleItem) {
  if (!raffle.totalEntries || raffle.totalEntries <= 0) return 0
  return Math.min(100, Math.round(((raffle.currentEntries || 0) / raffle.totalEntries) * 100))
}

export function RafflesClient({ initialRaffles, categories }: RafflesClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const hasActiveRaffles = initialRaffles.some((r) => r.status === "ACTIVE")
  const [selectedStatus, setSelectedStatus] = useState<"ACTIVE" | "COMPLETED" | "ALL">(
    hasActiveRaffles ? "ACTIVE" : "ALL",
  )
  const [sortBy, setSortBy] = useState("popular")

  // Filter & sort logic
  const filteredRaffles = useMemo(() => {
    return initialRaffles
      .filter((raffle) => {
        // Status filter
        if (selectedStatus !== "ALL" && raffle.status !== selectedStatus) {
          return false
        }

        // Category filter
        if (selectedCategory !== "all" && raffle.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim()
          const titleMatch = raffle.title.toLowerCase().includes(query)
          const descMatch = raffle.description.toLowerCase().includes(query)
          const catMatch = raffle.category.toLowerCase().includes(query)
          if (!titleMatch && !descMatch && !catMatch) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          return (b.currentEntries || 0) - (a.currentEntries || 0)
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === "price-low") {
          return a.price - b.price
        }
        if (sortBy === "price-high") {
          return b.price - a.price
        }
        return 0
      })
  }, [initialRaffles, selectedStatus, selectedCategory, searchQuery, sortBy])

  // Count active vs completed
  const activeCount = initialRaffles.filter((r) => r.status === "ACTIVE").length
  const completedCount = initialRaffles.filter((r) => r.status === "COMPLETED").length
  const activeRaffles = initialRaffles.filter((r) => r.status === "ACTIVE")
  const ticketsSold = initialRaffles.reduce((sum, r) => sum + (r.currentEntries || 0), 0)
  const prizeValue = activeRaffles.reduce((sum, r) => sum + (r.realPrice || 0), 0)
  const entryFloor = activeRaffles.length ? Math.min(...activeRaffles.map((r) => r.price)) : 0
  const filtersDirty = searchQuery.trim().length > 0 || selectedCategory !== "all" || sortBy !== "popular"

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedStatus("ACTIVE")
    setSortBy("popular")
  }

  return (
    <div className={SHELL}>
      {/* ------------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        {/* Two spotlights over a perforated ticket wall. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(135%_100%_at_50%_-30%,#ffffff_0%,#f8f9f6_52%,#eef4ef_100%)]" />
          <div className="absolute -left-28 top-4 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute inset-0 opacity-70 [background-image:repeating-linear-gradient(90deg,rgba(15,23,42,0.05)_0_1px,transparent_1px_104px)]" />
          <div className="absolute inset-x-0 bottom-24 h-px bg-[repeating-linear-gradient(90deg,rgba(15,23,42,0.16)_0_10px,transparent_10px_22px)]" />
        </div>

        <div className={`${CONTAINER} relative pb-12 pt-24 sm:pt-28`}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Pill className="border-emerald-600/20 bg-emerald-600/10 text-emerald-800">
                <LiveDot />
                {activeCount} live {activeCount === 1 ? "draw" : "draws"}
              </Pill>
              <Pill>
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                100% target ticket rule
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.035em] text-slate-900 sm:text-[3.4rem] lg:text-[3.7rem]">
              Every draw.
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Nothing hidden.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-600">
              Brand-new iPhones, motorcycles, consoles and cash grand prizes — each one already bought, verified and
              held. The pool locks at 100% sold, then the draw streams live and uncut.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Cta href={WHATSAPP_COMMUNITY_URL} className="sm:w-auto">
                <WhatsAppIcon className="h-4 w-4" />
                Draw alerts on WhatsApp
              </Cta>
              <Cta href="/winners" variant="ghost" arrow className="sm:w-auto">
                <Trophy className="h-4 w-4" />
                Past winners
              </Cta>
            </div>
          </div>

          {/* The board itself, right in the hero — three live stubs instead of a side card. */}
          <div className="mt-10 rounded-[28px] border border-slate-900/10 bg-white/55 p-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-1.5 pb-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">On the board now</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-700">
                {activeCount} live · {ticketsSold.toLocaleString("en-PK")} tickets issued
              </p>
            </div>

            {activeRaffles.length > 0 ? (
              <div className="flex flex-col gap-2.5 sm:flex-row">
                {activeRaffles.slice(0, 3).map((raffle) => {
                  const percent = soldPercent(raffle)

                  return (
                    <Link
                      key={raffle.id}
                      href={`/raffles/${raffle.id}`}
                      className="group flex flex-1 items-center gap-3 rounded-2xl border border-slate-900/5 bg-white px-3 py-2.5 transition hover:border-emerald-500/30"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={raffle.image || "/placeholder.jpg"}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-[12.5px] font-semibold text-slate-900 transition-colors group-hover:text-emerald-700">
                            {raffle.title}
                          </p>
                          <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-emerald-700">
                            {formatCurrency(raffle.price)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-900/[0.07]">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-slate-500">
                          {percent}% sold · {raffle.totalEntries.toLocaleString("en-PK")} ticket pool
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-emerald-600" />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="px-2 pb-1 text-[12px] text-slate-500">
                The next board opens soon — join the alerts below.
              </p>
            )}
          </div>

          {/* Market ribbon */}
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-900/10 sm:grid-cols-4">
            {[
              { label: "Live draws", value: String(activeCount), accent: false },
              { label: "Tickets issued", value: ticketsSold.toLocaleString("en-PK"), accent: false },
              { label: "Prize value", value: prizeValue ? formatCurrency(prizeValue) : "—", accent: false },
              { label: "Entry from", value: entryFloor ? formatCurrency(entryFloor) : "—", accent: true },
            ].map((cell) => (
              <div key={cell.label} className="bg-white/80 px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{cell.label}</dt>
                <dd
                  className={`mt-1 font-mono text-[13px] font-semibold tabular-nums ${
                    cell.accent ? "text-emerald-700" : "text-slate-900"
                  }`}
                >
                  {cell.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------- Live band */}
      <div className="border-b border-slate-900/5 bg-white/60 py-2.5">
        <Marquee items={BAND} speed="54s" />
      </div>

      {/* --------------------------------------------------------- Browse & filter */}
      <div className={`${CONTAINER} py-10 sm:py-12`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Kicker>Browse the board</Kicker>
            <h2 className="mt-2.5 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.9rem]">
              Pick a prize, then pick your number of entries.
            </h2>
          </div>
          <p className="shrink-0 font-mono text-[11px] tabular-nums text-slate-400">
            {filteredRaffles.length} of {initialRaffles.length} draws
          </p>
        </div>

        {/* Status tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-slate-900/10">
          {[
            { key: "ACTIVE" as const, label: `Active draws (${activeCount})` },
            { key: "COMPLETED" as const, label: `Completed (${completedCount})` },
            { key: "ALL" as const, label: "All" },
          ].map((tab) => {
            const active = selectedStatus === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`-mb-px border-b-2 pb-3 text-[13px] font-semibold transition ${
                  active
                    ? "border-emerald-600 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Filter suite */}
        <div className={`${PANEL} mt-4 p-4 sm:p-5`}>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a prize — iPhone, Honda, PS5, cash…"
                className="h-11 w-full rounded-2xl border border-slate-900/10 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative w-full shrink-0 md:w-56">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort draws"
                className="h-11 w-full cursor-pointer appearance-none rounded-2xl border border-slate-900/10 bg-white pl-4 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="no-scrollbar mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-900/10 bg-white/70 text-slate-600 hover:bg-white"
              }`}
            >
              All categories
            </button>
            {categories.map((cat) => {
              const active = selectedCategory === cat.toLowerCase()
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat.toLowerCase())}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-900/10 bg-white/70 text-slate-600 hover:bg-white"
                  }`}
                >
                  {cat}
                </button>
              )
            })}

            {filtersDirty && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSortBy("popular")
                }}
                className="ml-auto shrink-0 text-[11px] font-semibold text-emerald-700 underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Raffle cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRaffles.map((raffle) => {
            const isCompleted = raffle.status === "COMPLETED"
            const percent = soldPercent(raffle)

            return (
              <Lift key={raffle.id} className="h-full">
                <TicketCard className="group flex h-full flex-col border-slate-900/10 transition-colors hover:border-emerald-500/30">
                  {/* Image & badges */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={raffle.image || "/placeholder.jpg"}
                      alt={raffle.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                      {raffle.featured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
                          <Star className="h-3 w-3 fill-white" strokeWidth={0} />
                          Featured
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur">
                        {raffle.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur">
                          <Trophy className="h-3 w-3" />
                          Draw completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-800 backdrop-blur">
                          <LiveDot />
                          Live draw
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <Link href={`/raffles/${raffle.id}`} className="group/title">
                      <h3 className="line-clamp-1 font-display text-[15.5px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover/title:text-emerald-700 sm:text-base">
                        {raffle.title}
                      </h3>
                    </Link>
                    <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500">
                      {raffle.description}
                    </p>

                    {/* Ticket pool progress */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-400">
                          Pool sold
                        </span>
                        <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-700">
                          {(raffle.currentEntries || 0).toLocaleString("en-PK")} /{" "}
                          {(raffle.totalEntries || 0).toLocaleString("en-PK")}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-900/[0.07]">
                        <div
                          className={`h-full rounded-full ${isCompleted ? "bg-slate-400" : "bg-emerald-500"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Price row */}
                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-900/5 pt-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Entry</p>
                        <p className="font-mono text-lg font-semibold tracking-tight text-emerald-700">
                          {formatCurrency(raffle.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Value</p>
                        <p className="font-mono text-[12px] text-slate-400 line-through">
                          {formatCurrency(raffle.realPrice)}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-4">
                      {isCompleted ? (
                        <Link
                          href={`/raffles/${raffle.id}/winner`}
                          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-50 text-[13px] font-semibold text-amber-900 transition hover:-translate-y-0.5 hover:bg-amber-100"
                        >
                          <Trophy className="h-3.5 w-3.5" />
                          View winner result
                        </Link>
                      ) : (
                        <Link
                          href={`/raffles/${raffle.id}`}
                          className="group/cta inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-[0_14px_34px_-18px_rgba(5,150,105,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-500"
                        >
                          <Gift className="h-3.5 w-3.5" />
                          Enter draw · {formatCurrency(raffle.price)}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </TicketCard>
              </Lift>
            )
          })}
        </div>

        {/* Empty state */}
        {filteredRaffles.length === 0 && (
          <div className={`${PANEL} mt-6 px-6 py-14 text-center`}>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-900/10 bg-white text-slate-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-slate-900">
              No draws match those filters
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-600">
              Try a different prize keyword, or clear the category filter to see everything on the board.
            </p>
            <button
              onClick={resetFilters}
              className="mt-5 inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-900/10 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-900/20"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* WhatsApp band */}
        <div className={`${INK_PANEL} relative mt-8 overflow-hidden p-6 sm:p-8`}>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute inset-0 grid-veil opacity-30" />
          </div>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200/60">
                Draw reminder service
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Get the stream link the second a pool closes.
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-emerald-50/60">
                Over 25,000 members receive live draw links, fast receipt verification, and exclusive discount drops.
              </p>
            </div>

            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#20ba59]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Join the channel
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
