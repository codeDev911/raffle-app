"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Gift,
  Maximize2,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Truck,
  Video,
  X,
} from "lucide-react"
import { EnterRaffleModal } from "@/components/enter-raffle-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { BrandMark } from "@/components/brand"
import {
  CONTAINER,
  Cta,
  FaqList,
  INK_PANEL,
  Kicker,
  LiveDot,
  Mesh,
  PANEL,
  Pill,
  SHELL,
  SectionHead,
  StatTile,
  TicketCard,
} from "@/components/marketing/kit"
import { Lift } from "@/components/marketing/motion"

interface Raffle {
  id: string
  title: string
  description: string
  longDescription?: string
  image?: string
  gallery: string[]
  price: number
  realPrice: number
  totalEntries: number
  currentEntries: number
  category: string
  entries: any[]
  featured: boolean
  endDate: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "DRAFT" | string
  specifications: string[]
  rules: string[]
  winners?: any[]
}

interface RelatedDraw {
  id: string
  title: string
  image?: string | null
  category: string
  price: number
  totalEntries: number
  currentEntries: number
}

const WHATSAPP_COMMUNITY_URL = "https://whatsapp.com/channel/0029VbB0CzJ8fewyBXpXy210"
const WHATSAPP_PHONE_CLEAN = "923377155722"

const DATE_FMT = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Karachi",
})
const TIME_FMT = new Intl.DateTimeFormat("en-PK", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Karachi",
})

function drawDate(value?: string) {
  const date = new Date(value || "")
  return Number.isNaN(date.getTime()) ? "—" : DATE_FMT.format(date)
}

function drawTime(value?: string) {
  const date = new Date(value || "")
  return Number.isNaN(date.getTime()) ? "" : TIME_FMT.format(date)
}

/** Database ids are cuids; show only the tail so the label stays readable. */
function shortDrawId(id: string) {
  return id.length > 10 ? id.slice(-6).toUpperCase() : id
}

function statusMeta(status: string) {
  switch (status) {
    case "ACTIVE":
      return { label: "Live draw", tone: "border-emerald-600/20 bg-emerald-600/10 text-emerald-800", live: true }
    case "COMPLETED":
      return { label: "Draw completed", tone: "border-sky-600/20 bg-sky-600/10 text-sky-800", live: false }
    case "CANCELLED":
      return { label: "Draw cancelled", tone: "border-rose-500/20 bg-rose-500/10 text-rose-800", live: false }
    case "DRAFT":
      return { label: "Coming soon", tone: "border-amber-500/25 bg-amber-500/10 text-amber-900", live: false }
    default:
      return {
        label: (status || "unknown").toLowerCase().replace(/_/g, " "),
        tone: "border-slate-900/10 bg-white/70 text-slate-700",
        live: false,
      }
  }
}

const FAQS = [
  {
    q: "How is the winner picked?",
    a: "Every draw runs live on YouTube and Facebook with a cryptographic randomiser. Every issued ticket sits in the same shuffle, and the recording stays online afterwards so anyone can check it.",
  },
  {
    q: "What does a ticket cost and how do I pay?",
    a: "One ticket costs the entry price shown on this page. Choose Easypaisa, JazzCash, Raast or a card, send the amount, then upload the screenshot — your ticket is issued as soon as the receipt clears.",
  },
  {
    q: "When does the draw actually happen?",
    a: "The pool locks at 100% of the target tickets, never earlier. The live draw follows that week, and the stream link is posted to the WhatsApp channel first.",
  },
  {
    q: "Is delivery really free?",
    a: "Yes. Courier, transit insurance and doorstep delivery anywhere in Pakistan are covered by PakRaffle. Winners only share CNIC details so the parcel can be verified on arrival.",
  },
  {
    q: "Can I hold more than one ticket?",
    a: "Yes. Extra entries raise your odds and each one is a separate ticket number in the same shuffle. They all appear on your profile the moment they are verified.",
  },
]

const TRUST = [
  { icon: Video, title: "Live video draw", body: "Streamed uncut with a certified randomiser." },
  { icon: ShieldCheck, title: "Sealed & PTA paid", body: "Brand-new stock with official warranty." },
  { icon: Truck, title: "Free TCS courier", body: "Tracked, insured delivery to your door." },
  { icon: Award, title: "Verified winner", body: "Parcel proof published after every draw." },
]

const STEPS = [
  { title: "Pick your entries", body: "One ticket or ten — each one is a separate number." },
  { title: "Pay from your wallet", body: "Easypaisa, JazzCash, Raast or card, then upload the receipt." },
  { title: "Ticket lands in your inbox", body: "We check the receipt and email your number, usually within the hour." },
  { title: "Watch the draw live", body: "The stream link drops in the WhatsApp channel before it starts." },
]

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.12-.538.12-.158.239-.617.774-.757.933-.138.16-.279.179-.517.06-.239-.12-1.008-.372-1.92-1.185-.709-.633-1.188-1.415-1.328-1.654-.139-.239-.015-.368.105-.487.108-.107.239-.279.359-.418.119-.14.159-.239.239-.399.08-.159.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.539-.412l-.46-.008c-.159 0-.418.06-.637.299-.22.239-.837.817-.837 1.993 0 1.176.857 2.311.976 2.471.12.16 1.687 2.576 4.088 3.613.571.247 1.018.395 1.366.506.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.131.199-.557.199-1.035.139-1.135-.059-.1-.219-.16-.458-.279zM12.023 2C6.49 2 2 6.48 2 12c0 1.979.578 3.824 1.579 5.378L2.094 22l4.802-1.436C8.36 21.435 10.134 22 12.023 22c5.534 0 10.024-4.48 10.024-10S17.557 2 12.023 2zm0 18.25c-1.644 0-3.18-.49-4.475-1.332l-.321-.21-2.852.853.865-2.784-.23-.332A8.196 8.196 0 013.78 12c0-4.545 3.697-8.243 8.243-8.243 4.545 0 8.243 3.698 8.243 8.243 0 4.545-3.698 8.25-8.243 8.25z" />
    </svg>
  )
}

/** Live countdown. Renders placeholders on the server, then ticks once mounted. */
function Countdown({ endDate, variant }: { endDate: string; variant: "live" | "closed" | "pending" }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (variant !== "live") return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [endDate, variant])

  if (variant === "pending") {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3">
        <Clock className="h-4 w-4 shrink-0 text-slate-400" />
        <p className="text-[12px] text-slate-600">Entries open soon — no tickets have been issued yet.</p>
      </div>
    )
  }

  const target = new Date(endDate).getTime()
  const left = now === null || Number.isNaN(target) ? null : Math.max(target - now, 0)

  if (variant === "closed" || (left !== null && left === 0)) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3">
        <Clock className="h-4 w-4 shrink-0 text-slate-400" />
        <p className="text-[12px] text-slate-600">
          Entries closed on <span className="font-mono font-semibold text-slate-900">{drawDate(endDate)}</span>
        </p>
      </div>
    )
  }

  const units =
    left === null
      ? [
          { label: "Days", value: undefined },
          { label: "Hrs", value: undefined },
          { label: "Min", value: undefined },
          { label: "Sec", value: undefined },
        ]
      : [
          { label: "Days", value: Math.floor(left / 86_400_000) },
          { label: "Hrs", value: Math.floor((left / 3_600_000) % 24) },
          { label: "Min", value: Math.floor((left / 60_000) % 60) },
          { label: "Sec", value: Math.floor((left / 1000) % 60) },
        ]

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-400">Draw closes in</p>
        <p className="text-[10.5px] text-slate-500">
          {drawDate(endDate)}
          {drawTime(endDate) ? ` · ${drawTime(endDate)} PKT` : ""}
        </p>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div key={unit.label} className="rounded-xl border border-slate-900/5 bg-white/80 px-2 py-2 text-center">
            <p className="font-mono text-lg font-semibold leading-none tabular-nums text-slate-900">
              {unit.value === undefined ? "--" : String(unit.value).padStart(2, "0")}
            </p>
            <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">{unit.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Photo deck with thumbnails and a full-screen view. */
function Gallery({ images, title, category, featured }: { images: string[]; title: string; category: string; featured: boolean }) {
  const list = images.length > 0 ? images : ["/placeholder.jpg"]
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const safeIndex = Math.min(index, list.length - 1)
  const current = list[safeIndex]
  const multiple = list.length > 1

  const step = (direction: number) => setIndex((prev) => (prev + direction + list.length) % list.length)

  useEffect(() => {
    if (!zoomed) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false)
      if (event.key === "ArrowRight" && multiple) step(1)
      if (event.key === "ArrowLeft" && multiple) step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed, multiple, list.length])

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-5 -z-10 rounded-[40px] bg-gradient-to-br from-emerald-300/25 via-white/40 to-teal-200/25 blur-2xl"
      />

      <TicketCard className="overflow-hidden shadow-[0_40px_90px_-55px_rgba(4,47,34,0.55)]">
        <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-white via-slate-50 to-slate-100 sm:aspect-[16/11]">
          <Image
            src={current}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 640px"
            className="object-contain"
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
                  <Sparkles className="h-3 w-3 fill-white" strokeWidth={0} />
                  Featured
                </span>
              )}
              <span className="rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur">
                {category}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-label="Open photo full screen"
              className="rounded-xl border border-white/50 bg-white/90 p-2 text-slate-700 backdrop-blur transition hover:bg-white"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {multiple && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/85 text-slate-800 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/85 text-slate-800 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/80 px-2.5 py-1 font-mono text-[10.5px] tabular-nums text-white backdrop-blur">
                {safeIndex + 1} / {list.length}
              </span>
            </>
          )}
        </div>

        {multiple && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-dashed border-slate-900/10 bg-white/70 p-3">
            {list.map((image, position) => (
              <button
                key={`${image}-${position}`}
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Photo ${position + 1}`}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border transition ${
                  position === safeIndex
                    ? "border-emerald-600 ring-2 ring-emerald-500/15"
                    : "border-slate-900/10 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={image} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </TicketCard>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — full photo`}
          className="fixed inset-0 z-[70] flex flex-col bg-slate-950/95 p-4 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <div className="flex items-center justify-between gap-3 text-white">
            <p className="truncate text-[12px] font-medium text-white/80">
              {title} · {safeIndex + 1} of {list.length}
            </p>
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label="Close photo"
              className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mt-3 flex-1" onClick={(event) => event.stopPropagation()}>
            <Image src={current} alt={title} fill sizes="100vw" className="object-contain" />
            {multiple && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function RelatedCard({ draw }: { draw: RelatedDraw }) {
  const percent =
    draw.totalEntries > 0 ? Math.min(100, Math.round(((draw.currentEntries || 0) / draw.totalEntries) * 100)) : 0

  return (
    <Lift className="h-full">
      <TicketCard className="group flex h-full flex-col transition-colors hover:border-emerald-500/30">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Image
            src={draw.image || "/placeholder.jpg"}
            alt={draw.title}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur">
            {draw.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <Link
            href={`/raffles/${draw.id}`}
            className="line-clamp-2 font-display text-[15px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors hover:text-emerald-700"
          >
            {draw.title}
          </Link>

          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">Pool</span>
              <span className="font-mono text-[10.5px] tabular-nums text-slate-600">
                {(draw.currentEntries || 0).toLocaleString("en-PK")} / {draw.totalEntries.toLocaleString("en-PK")}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-900/[0.07]">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-900/5 pt-3.5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Entry</p>
              <p className="font-mono text-[15px] font-semibold text-emerald-700">{formatCurrency(draw.price)}</p>
            </div>
            <Link
              href={`/raffles/${draw.id}`}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-700 transition hover:text-emerald-700"
            >
              View draw <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </TicketCard>
    </Lift>
  )
}

const ClientSide = ({ raffle, related = [] }: { raffle: Raffle; related?: RelatedDraw[] }) => {
  const searchParams = useSearchParams()
  const openEnModal = searchParams.get("openEnModal") || 0
  const referralLinkId = searchParams.get("lnk") || false

  const [user, setUser] = useState<any>(null)
  const [isUserPurchased, setIsUserPurchased] = useState(false)
  const [showModal, setShowModal] = useState(openEnModal === "1")
  const [paymentUnderReview, setPaymentUnderReview] = useState<any>()
  const [copiedLink, setCopiedLink] = useState(false)

  // Reading-room warmth: a small, believable live counter that drifts slowly.
  const [watchingNow, setWatchingNow] = useState(4)

  useEffect(() => {
    setWatchingNow(Math.floor(Math.random() * 5) + 3)

    const interval = setInterval(() => {
      setWatchingNow((prev) => {
        const next = prev + (Math.random() > 0.5 ? 1 : -1)
        return next < 3 ? 3 : next > 12 ? 9 : next
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getMe = async () => {
    try {
      const userResponse = await fetch("/api/auth/me")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)

        const pending = Array.isArray(userData?.payments)
          ? userData.payments.find(
              (payment: any) =>
                payment.metadata?.raffleId === raffle?.id || payment.metadata?.["raffleId"] === raffle?.id,
            )
          : undefined

        setPaymentUnderReview(pending)

        const hasPurchased = Array.isArray(raffle?.entries)
          ? raffle.entries.some((entry: any) => entry.userId === userData.id)
          : false
        setIsUserPurchased(hasPurchased)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    }
  }

  useEffect(() => {
    if (referralLinkId && typeof window !== "undefined") {
      const client_browse_id = localStorage.getItem("client_browse_id")
      if (process.env.NEXT_PUBLIC_PARTNER_APP_URL) {
        fetch(`${process.env.NEXT_PUBLIC_PARTNER_APP_URL}/api/partner/links/click-event`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.NEXT_PUBLIC_API_KEY_TO_PARTNER || "",
          },
          body: JSON.stringify({ referralLinkId, client_browse_id }),
        }).catch((error) => console.log(error))
      }
    }
    getMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raffle?.id, referralLinkId])

  const handleEnterRaffle = () => {
    if (!user) {
      location.assign(`/auth/login?comback=/raffles/${raffle.id}&openEnModal=1&lnk=${referralLinkId || ""}`)
      return
    }
    setShowModal(true)
  }

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  if (!raffle) {
    return (
      <div className={SHELL}>
        <div className={`${CONTAINER} flex min-h-[60vh] items-center justify-center py-24`}>
          <div className={`${PANEL} max-w-md p-6 text-center sm:p-8`}>
            <h1 className="font-display text-xl font-semibold text-slate-900">This draw has moved on</h1>
            <p className="mt-2 text-sm text-slate-600">The draw you were looking for no longer exists or has expired.</p>
            <Cta href="/raffles" className="mt-6 w-full" arrow>
              Browse live draws
            </Cta>
          </div>
        </div>
      </div>
    )
  }

  const allImages = [raffle.image, ...(raffle.gallery || [])].filter(Boolean) as string[]
  const totalEntries = raffle.totalEntries || 0
  const currentEntries = Math.min(raffle.currentEntries || 0, totalEntries || Number.POSITIVE_INFINITY)
  const remainingEntries = Math.max(totalEntries - currentEntries, 0)
  const percentFilled = totalEntries > 0 ? Math.min(100, Math.round((currentEntries / totalEntries) * 100)) : 0
  const savings = raffle.realPrice > 0 ? Math.max(0, Math.round((1 - raffle.price / raffle.realPrice) * 100)) : 0

  const status = statusMeta(raffle.status)
  const winner = raffle.winners?.[0]
  const waInquiryUrl = `https://wa.me/${WHATSAPP_PHONE_CLEAN}?text=${encodeURIComponent(
    `Salam PakRaffle! I have an inquiry about the "${raffle.title}" draw (Ticket: ${formatCurrency(raffle.price)}). Please guide me.`,
  )}`

  return (
    <div className={SHELL}>
      {/* ------------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="emerald" />
        <div className={`${CONTAINER} relative pb-12 pt-24 sm:pb-14 sm:pt-28`}>
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/raffles"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All draws
            </Link>

            <div className="flex items-center gap-2">
              <Pill className="hidden sm:inline-flex">
                <Eye className="h-3 w-3 text-emerald-600" />
                {watchingNow} watching now
              </Pill>
              <button
                type="button"
                onClick={copyShareLink}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/70 px-3 text-[11.5px] font-semibold text-slate-700 backdrop-blur transition hover:bg-white"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
                {copiedLink ? "Link copied" : "Share"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-12">
            <Gallery images={allImages} title={raffle.title} category={raffle.category} featured={raffle.featured} />

            {/* Ticket counter */}
            <div className={`${PANEL} p-5 sm:p-6 lg:sticky lg:top-24`}>
              <div className="flex flex-wrap items-center gap-2">
                <Pill className={status.tone}>
                  {status.live ? <LiveDot /> : <Clock className="h-3 w-3" />}
                  {status.label}
                </Pill>
                <Pill className="font-mono text-[10px] uppercase tracking-[0.12em]">Draw #{shortDrawId(raffle.id)}</Pill>
                <Pill>{raffle.category}</Pill>
              </div>

              <h1 className="mt-4 font-display text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.025em] text-slate-900 sm:text-[2.15rem]">
                {raffle.title}
              </h1>
              <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-slate-600">{raffle.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-900/5 bg-white/80 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Entry fee</p>
                  <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-emerald-700">
                    {formatCurrency(raffle.price)}
                  </p>
                  <p className="text-[10.5px] text-slate-400">per ticket</p>
                </div>
                <div className="rounded-2xl border border-slate-900/5 bg-white/80 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Prize value</p>
                  <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-slate-400 line-through decoration-slate-300">
                    {formatCurrency(raffle.realPrice)}
                  </p>
                  <p className="text-[10.5px] font-semibold text-emerald-700">
                    {savings >= 95 ? "a fraction of retail" : savings > 0 ? `${savings}% under retail` : "brand-new prize"}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-400">Pool sold</p>
                  <p className="font-mono text-[11.5px] font-semibold tabular-nums text-slate-700">
                    {currentEntries.toLocaleString("en-PK")} / {totalEntries.toLocaleString("en-PK")} · {percentFilled}%
                  </p>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {remainingEntries.toLocaleString("en-PK")} tickets left · the pool locks at 100% sold
                </p>
              </div>

              <div className="mt-5">
                <Countdown
                  endDate={raffle.endDate}
                  variant={raffle.status === "ACTIVE" ? "live" : raffle.status === "DRAFT" ? "pending" : "closed"}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-900/5 pt-4 text-[11.5px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                  {watchingNow} watching now
                </span>
                <span className="font-mono tabular-nums">{currentEntries.toLocaleString("en-PK")} entries issued</span>
              </div>

              <div className="mt-5">
                {raffle.status === "ACTIVE" ? (
                  isUserPurchased ? (
                    <div className="rounded-2xl border border-emerald-600/20 bg-emerald-600/[0.07] p-4 text-center">
                      <p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        You are in this draw
                      </p>
                      <button
                        type="button"
                        onClick={handleEnterRaffle}
                        className="mt-1.5 text-[11.5px] font-semibold text-emerald-700 underline underline-offset-4"
                      >
                        Buy more entries
                      </button>
                    </div>
                  ) : paymentUnderReview ? (
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-center">
                      <p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-amber-900">
                        <Clock className="h-4 w-4" />
                        Receipt under review
                      </p>
                      <p className="mt-1 text-[11px] text-amber-800/80">
                        We email your ticket number as soon as it clears.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnterRaffle}
                      className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-[14px] font-semibold text-white shadow-[0_18px_40px_-18px_rgba(5,150,105,0.95)] transition hover:-translate-y-0.5 hover:bg-emerald-500"
                    >
                      <Gift className="h-4 w-4" />
                      Enter draw · {formatCurrency(raffle.price)}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )
                ) : raffle.status === "COMPLETED" ? (
                  <div className="space-y-3">
                    <Cta href={`/raffles/${raffle.id}/winner`} variant="ink" arrow className="w-full">
                      <Trophy className="h-4 w-4" />
                      See the winning ticket
                    </Cta>
                    {winner && (
                      <div className="rounded-2xl border border-amber-500/25 bg-amber-50/80 p-4">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">
                          <Trophy className="h-3.5 w-3.5" />
                          Official winner
                        </p>
                        <p className="mt-1.5 text-[13px] font-semibold text-slate-900">
                          {winner.user?.name || "Verified winner"}
                          {winner.user?.city ? ` · ${winner.user.city}` : ""}
                        </p>
                        {winner.testimonial && (
                          <p className="mt-1 line-clamp-2 text-[11.5px] italic leading-relaxed text-slate-600">
                            “{winner.testimonial}”
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : raffle.status === "CANCELLED" ? (
                  <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-center">
                    <p className="text-[12.5px] font-semibold text-rose-800">This draw was cancelled by administration.</p>
                    <p className="mt-1 text-[11px] text-rose-700/80">No further tickets can be issued.</p>
                  </div>
                ) : raffle.status === "DRAFT" ? (
                  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-center">
                    <p className="text-[12.5px] font-semibold text-amber-900">Entries open soon</p>
                    <p className="mt-1 text-[11px] text-amber-800/80">Join the WhatsApp channel to hear first.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4 text-center">
                    <p className="text-[12.5px] font-semibold capitalize text-slate-700">{status.label}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-900/5 pt-4 text-center">
                {[
                  { icon: ShieldCheck, label: "100% target" },
                  { icon: Video, label: "Live & uncut" },
                  { icon: Truck, label: "Free delivery" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1">
                    <item.icon className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-center text-[10.5px] text-slate-400">
                Easypaisa · JazzCash · Raast · card — ticket issued after receipt check
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Draw facts */}
      <section className={`${CONTAINER} pt-8`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Entry fee" value={formatCurrency(raffle.price)} accent hint="one ticket, one number" />
          <StatTile
            label="Tickets issued"
            value={currentEntries.toLocaleString("en-PK")}
            hint={`${percentFilled}% of the ${totalEntries.toLocaleString("en-PK")} pool`}
          />
          <StatTile label="Prize value" value={formatCurrency(raffle.realPrice)} hint="brand-new and sealed" />
          <StatTile label="Draw closes" value={drawDate(raffle.endDate)} hint={drawTime(raffle.endDate) ? `${drawTime(raffle.endDate)} PKT` : "date to be announced"} />
        </div>
      </section>

      {/* --------------------------------------------------------------- Details */}
      <section className={`${CONTAINER} mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8`}>
        <div className="space-y-6">
          <div className={`${PANEL} p-5 sm:p-6`}>
            <Kicker>The prize</Kicker>
            <h2 className="mt-2.5 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.9rem]">
              Everything that arrives at your door.
            </h2>

            <Tabs defaultValue="overview" className="mt-5 w-full">
              <TabsList className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-slate-900/5 bg-slate-900/[0.04] p-1">
                {[
                  { value: "overview", label: "Overview" },
                  { value: "specs", label: "Specs & box" },
                  { value: "rules", label: "Draw rules" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-xl px-2 py-2 text-[12px] font-semibold text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="mt-5 space-y-4">
                <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-600">
                  {raffle.longDescription || raffle.description}
                </p>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-900/5 bg-white/70 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-[12.5px] font-semibold text-slate-900">Genuine, official stock</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                      100% brand new and sealed with the manufacturer warranty. Phones ship PTA-approved, and the
                      parcel travels insured.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-5">
                {raffle.specifications && raffle.specifications.length > 0 ? (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {raffle.specifications.map((spec, index) => (
                      <div
                        key={`${spec}-${index}`}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-900/5 bg-white/70 px-3 py-2.5"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="text-[12px] font-medium leading-snug text-slate-700">{spec}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12.5px] leading-relaxed text-slate-500">
                    Standard factory specifications and the official warranty apply. Message us on WhatsApp if you want
                    the full box contents before entering.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="rules" className="mt-5">
                {raffle.rules && raffle.rules.length > 0 ? (
                  <ol className="space-y-2.5">
                    {raffle.rules.map((rule, index) => (
                      <li key={`${rule}-${index}`} className="flex items-start gap-3">
                        <span className="mt-0.5 font-mono text-[11px] tabular-nums text-emerald-700">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[12.5px] leading-relaxed text-slate-600">{rule}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className="space-y-2.5">
                    {[
                      "Every draw is broadcast live on YouTube and Facebook, uncut.",
                      "A valid Pakistani CNIC is required for delivery verification.",
                      "Courier delivery is free nationwide, insured while in transit.",
                    ].map((rule, index) => (
                      <li key={rule} className="flex items-start gap-3">
                        <span className="mt-0.5 font-mono text-[11px] tabular-nums text-emerald-700">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[12.5px] leading-relaxed text-slate-600">{rule}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className={`${PANEL} p-5 sm:p-6`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">PakRaffle guarantees</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TRUST.map((item) => (
                <div key={item.title} className="flex items-start gap-2.5 rounded-2xl bg-white/70 px-3.5 py-3">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-[12px] font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Kicker>Before you enter</Kicker>
            <h2 className="mt-2.5 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.9rem]">
              Straight answers.
            </h2>
            <FaqList items={FAQS} className="mt-5 bg-white/70" />
          </div>
        </div>

        <div className="space-y-5">
          <div className={`${PANEL} p-5`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">How it works</p>
            <ol className="mt-4 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-0.5 font-mono text-[11px] tabular-nums text-emerald-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${PANEL} p-5`}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#128C4B]">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-slate-900">Draw alerts on WhatsApp</p>
                <p className="text-[11px] text-slate-500">Live links, winner calls and payment help.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Cta href={WHATSAPP_COMMUNITY_URL} className="w-full">
                Join the channel
              </Cta>
              <Cta href={waInquiryUrl} variant="ghost" className="w-full">
                Ask about this draw
              </Cta>
            </div>
          </div>

          <div className={`${PANEL} p-5`}>
            <div className="flex items-center gap-2">
              <BrandMark className="h-7 w-7" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Listed by PakRaffle</p>
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
              This prize is bought, checked and held before the draw opens. Tickets, entries and the winner list stay
              online after the stream ends — nothing is deleted.
            </p>
            <Link
              href="/winners"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              See past winners <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- More live draws */}
      {related.length > 0 && (
        <section className={`${CONTAINER} mt-14`}>
          <SectionHead
            kicker="Still deciding"
            title="Other draws open today"
            body="Same rules, same live stream — pick the prize you would actually keep."
            action={
              <Cta href="/raffles" variant="ghost" arrow>
                All draws
              </Cta>
            }
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((draw) => (
              <RelatedCard key={draw.id} draw={draw} />
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- Closing band */}
      <section className={`${CONTAINER} mt-14 pb-16`}>
        <div className={`${INK_PANEL} relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12`}>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="flex items-center gap-2">
                <BrandMark className="h-6 w-6" />
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-300/90">
                  PakRaffle · draw #{shortDrawId(raffle.id)}
                </span>
              </p>
              <p className="mt-3 font-display text-2xl font-semibold leading-tight text-white sm:text-[1.8rem]">
                Every ticket is public. Every draw is streamed.
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-emerald-50/70">
                Ticket numbers, entry counts and the winner list stay online after the broadcast ends.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
              <Cta href="/winners" variant="light">
                Past winners
              </Cta>
              <Cta href="/raffles" variant="primary" arrow>
                Browse draws
              </Cta>
            </div>
          </div>
        </div>
      </section>

      {raffle && (
        <EnterRaffleModal
          raffle={raffle}
          referralLinkId={referralLinkId}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default ClientSide
