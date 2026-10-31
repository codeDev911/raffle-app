"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Bike,
  Building,
  Calculator,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Flame,
  Gamepad2,
  HelpCircle,
  Laptop,
  Layers,
  Lock,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Upload,
  Wallet,
} from "lucide-react"
import {
  CONTAINER,
  Cta,
  FaqList,
  GhostNumeral,
  Kicker,
  LiveDot,
  Marquee,
  PANEL,
  Pill,
  SectionHead,
  SHELL,
  StatTile,
} from "@/components/marketing/kit"
import { Counter, Reveal } from "@/components/marketing/motion"

const SUPPORT_WHATSAPP = "923377155722"
const pkr = (value: number) => `Rs ${Math.round(value).toLocaleString("en-PK")}`
const num = (value: number) => Math.round(value).toLocaleString("en-PK")

const PRODUCT_CATEGORIES = [
  { id: "Electronics", name: "Smartphones & Tablets (iPhone, Samsung)", icon: Smartphone },
  { id: "Vehicles", name: "Motorcycles & Scooters (Honda, Yamaha, Suzuki)", icon: Bike },
  { id: "Gaming", name: "Gaming Consoles & PCs (PS5, Xbox, Custom Rigs)", icon: Gamepad2 },
  { id: "Laptops", name: "Laptops & Computing (MacBook, Dell, HP)", icon: Laptop },
  { id: "Appliances", name: "Home Appliances & 4K TVs", icon: Layers },
  { id: "Watches", name: "Luxury Watches & Gold", icon: Sparkles },
  { id: "Other", name: "Other High-Value Assets", icon: Tag },
]

const CITIES_LIST = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Gujranwala",
  "Sialkot",
  "Quetta",
  "Other City in Pakistan",
]

const FIELD =
  "h-11 w-full rounded-xl border border-slate-900/10 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"

const FAQS = [
  {
    q: "How and when will the PakRaffle team get in touch with me?",
    a: "After you submit your product listing application, our review team inspects your submitted details. We will reach out directly to you using one of your provided contact channels (WhatsApp, phone call, or email) within 24 to 48 hours to confirm specifications, schedule physical verification, and discuss campaign launch timing.",
  },
  {
    q: "Why must the item be shipped to PakRaffle for custody?",
    a: "To protect the integrity of the platform and build 100% buyer trust, all listed items must be physically shipped or personally delivered to our authorized inspection facility (in Lahore, Islamabad, or Karachi). We perform an in-person physical inspection and hold the product securely in insured escrow custody until the raffle is either successfully completed or officially cancelled.",
  },
  {
    q: "Can I cancel my raffle after it goes live? (Refunds & 8% fee rule)",
    a: "Yes, you may request to cancel your raffle. However, to protect participants who purchased tickets in good faith: (1) All sold tickets will be refunded 100% to buyers immediately, and (2) The seller must pay the 8% platform fee (covering verification, payment gateway processing, and promotional costs) before the product is released and returned.",
  },
  {
    q: "What is the 3-Month maximum campaign duration limit?",
    a: "Every listed raffle must be completed within 3 months (90 days) from its launch date. If the required ticket threshold is not reached within 3 months, PakRaffle will cancel the raffle, issue full 100% refunds to all ticket buyers, charge/deduct the 8% platform fee, and return the item to the seller.",
  },
  {
    q: "How does the 8% platform fee work on completed raffles?",
    a: "Our flat 8% fee is deducted from the total raffle gross revenue upon successful completion. There are zero upfront listing fees and zero hidden charges. You receive 92% of the total revenue, covering your agreed market price directly into your bank account.",
  },
  {
    q: "Why do I need to enter my full name as per CNIC?",
    a: "In compliance with Pakistani anti-fraud regulations and NADRA verification protocols, all product hosts must be legal Pakistani residents holding a valid CNIC. Bank/Raast payouts and custody agreements must strictly match your verified legal name.",
  },
]

const STEPS = [
  {
    title: "Submit the asset",
    body: "Fill the dossier with your exact market price, product specs, photos and CNIC details.",
  },
  {
    title: "Verify & escrow",
    body: "Our desk checks authenticity, PTA status or vehicle documents, then takes physical custody.",
  },
  {
    title: "Campaign goes live",
    body: "Featured across PakRaffle web, Instagram and WhatsApp. Buyers purchase tickets instantly.",
  },
  {
    title: "You receive 92%",
    body: "Once the pool sells out and the draw runs, net cash is wired to your verified bank account.",
  },
]

export default function ListProductPage() {
  // Calculator State (strings for natural typing and erasing)
  const [calcMarketPrice, setCalcMarketPrice] = useState<string>("350000")
  const [calcTargetTickets, setCalcTargetTickets] = useState<string>("300")
  const [calcTicketPrice, setCalcTicketPrice] = useState<string>("1200")

  // Form State (strictly independent inputs so typing never overwrites user's other fields)
  const [formData, setFormData] = useState({
    fullNameCnic: "",
    cnicNumber: "",
    phone: "",
    email: "",
    city: "Lahore",
    productType: "Electronics",
    productName: "",
    condition: "Brand New (Sealed)",
    description: "",
    marketPrice: "350000",
    targetTickets: "300",
    ticketPrice: "1200",
    imageUrl: "",
    agreeTerms: false,
  })

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successData, setSuccessData] = useState<any>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyLink = (url: string) => {
    if (typeof window !== "undefined") {
      const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`
      navigator.clipboard.writeText(fullUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  // Calculations for Calculator (purely derived from whatever the user typed)
  const cMarket = Math.max(0, parseInt(calcMarketPrice) || 0)
  const cTickets = Math.max(0, parseInt(calcTargetTickets) || 0)
  const cPrice = Math.max(0, parseInt(calcTicketPrice) || 0)
  const calcActualGross = cTickets * cPrice
  const calcPlatformFee = Math.round(calcActualGross * 0.08)
  const calcSellerPayout = calcActualGross - calcPlatformFee
  const calcGrossNeeded = Math.round(cMarket / 0.92)
  const suggestedTicketPriceForCalc = cTickets > 0 ? Math.max(50, Math.ceil(calcGrossNeeded / cTickets)) : 50

  // Optional manual helper: only when seller clicks suggest button
  const handleAutoSuggestCalcTicketPrice = () => {
    if (cTickets > 0 && cMarket > 0) {
      setCalcTicketPrice(suggestedTicketPriceForCalc.toString())
    }
  }

  // Calculations for Form (purely derived from whatever the user entered)
  const formMarket = Math.max(0, parseInt(formData.marketPrice) || 0)
  const formTickets = Math.max(0, parseInt(formData.targetTickets) || 0)
  const formTicket = Math.max(0, parseInt(formData.ticketPrice) || 0)
  const formActualGross = formTickets * formTicket
  const formPlatformFee = Math.round(formActualGross * 0.08)
  const formSellerPayout = formActualGross - formPlatformFee
  const formGrossNeeded = Math.round(formMarket / 0.92)
  const suggestedTicketPriceForForm = formTickets > 0 ? Math.max(50, Math.ceil(formGrossNeeded / formTickets)) : 50

  // Optional manual helper for form
  const handleAutoSuggestFormTicketPrice = () => {
    if (formTickets > 0 && formMarket > 0) {
      setFormData((prev) => ({
        ...prev,
        ticketPrice: suggestedTicketPriceForForm.toString(),
      }))
    }
  }

  const handleApplyCalculatorToForm = () => {
    setFormData((prev) => ({
      ...prev,
      marketPrice: calcMarketPrice,
      targetTickets: calcTargetTickets,
      ticketPrice: calcTicketPrice,
    }))
    const formEl = document.getElementById("listing-form-section")
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!formData.fullNameCnic.trim()) {
      setErrorMsg("Please enter your full legal name as it appears on your CNIC.")
      return
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Please provide a valid WhatsApp phone number for verification.")
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.")
      return
    }
    if (!formData.productName.trim()) {
      setErrorMsg("Please provide your product title/name.")
      return
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      setErrorMsg("Please provide a detailed description (specs, warranty, PTA status, etc. - min 20 chars).")
      return
    }
    if (formMarket < 1000) {
      setErrorMsg("Market price must be at least PKR 1,000.")
      return
    }
    if (formTickets < 1) {
      setErrorMsg("Please enter your desired target tickets to be sold out (e.g. 300, 400).")
      return
    }
    if (formTicket < 1) {
      setErrorMsg("Please enter your ticket price per entry.")
      return
    }
    if (!formData.agreeTerms) {
      setErrorMsg("Please certify that you legally own this asset and all details are truthful.")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        fullNameCnic: formData.fullNameCnic.trim(),
        cnicNumber: formData.cnicNumber.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city: formData.city,
        productType: formData.productType,
        productName: formData.productName.trim(),
        condition: formData.condition,
        description: formData.description.trim(),
        marketPrice: formMarket,
        targetTickets: formTickets,
        totalTickets: formTickets,
        ticketPrice: formTicket,
        images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
      }

      const res = await fetch("/api/listing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        const token = data.secureToken || data.request?.secureToken || ""
        const statusUrl = data.statusUrl || `/application/status/${data.request.id}?token=${token}`
        const detailsUrl = data.detailsUrl || `/application/details/${data.request.id}?token=${token}`
        const savedApp = {
          ...data.request,
          secureToken: token,
          statusUrl,
          detailsUrl,
        }
        setSuccessData(savedApp)

        // Store client-side copy as safety backup across tabs/reloads
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`pakraffle_app_${data.request.id}`, JSON.stringify(savedApp))
            const raw = localStorage.getItem("pakraffle_my_submissions")
            const existing = raw ? JSON.parse(raw) : []
            const updated = [savedApp, ...existing.filter((item: any) => item.id !== data.request.id)].slice(0, 25)
            localStorage.setItem("pakraffle_my_submissions", JSON.stringify(updated))
          } catch (e) {
            console.warn("Could not save application to localStorage:", e)
          }
        }

        // reset fields
        setFormData({
          fullNameCnic: "",
          cnicNumber: "",
          phone: "",
          email: "",
          city: "Lahore",
          productType: "Electronics",
          productName: "",
          condition: "Brand New (Sealed)",
          description: "",
          marketPrice: "350000",
          targetTickets: "300",
          ticketPrice: "1269",
          imageUrl: "",
          agreeTerms: false,
        })
      } else {
        setErrorMsg(data.error || "Failed to submit request. Please try again.")
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Network error occurred. Please check your internet connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={SHELL}>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        {/* Ledger paper — warm stock, ruled lines, one red margin rule. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#fdfaf3_0%,#fbf7ec_55%,#ffffff_100%)]" />
          <div className="absolute -right-32 -top-28 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
          <div className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(180deg,rgba(120,53,15,0.06)_0_1px,transparent_1px_38px)]" />
          <div className="absolute inset-y-0 left-[6%] hidden w-px bg-rose-300/50 lg:block" />
        </div>

        <div className={`${CONTAINER} relative pb-12 pt-24 sm:pt-28`}>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill className="border-amber-500/25 bg-amber-500/10 text-amber-900">
                <LiveDot />
                Asset listings · Pakistan
              </Pill>
              <Pill className="hidden sm:inline-flex">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                Escrow custody
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.6rem] lg:text-[4.05rem]">
              Sell at full price.
              <span className="block bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                In tickets, not bargains.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
              Stop negotiating with lowballers. List your phone, bike, console or watch as a verified public draw — you
              keep <span className="font-semibold text-slate-900">92% of gross</span>, and the money is collected before
              the draw ever runs.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Cta href="#listing-form-section" arrow className="w-full sm:w-auto">
                Start a listing
              </Cta>
              <Cta href="#calculator-section" variant="ghost" className="w-full sm:w-auto">
                <Calculator className="h-4 w-4 text-emerald-600" /> Model the payout
              </Cta>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-500">
              {["8% flat fee", "Rs 0 upfront", "CNIC-verified sellers"].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* A horizontal statement across the page — not a floating side card. */}
          <div className="relative mt-10">
            <div className="overflow-hidden rounded-2xl border border-amber-900/10 bg-white/85 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-amber-900/15 px-4 py-2.5 sm:px-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-900/60">
                  Listing statement · live preview
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Sample · sealed smartphone
                </p>
              </div>

              <div className="grid gap-px bg-amber-900/10 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.05fr]">
                <div className="flex items-center gap-3 bg-white px-4 py-4 sm:px-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-900/10 bg-gradient-to-br from-amber-50 to-white text-amber-700">
                    <Smartphone className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Your asset</p>
                    <p className="truncate text-[13px] font-semibold text-slate-900">iPhone · sealed</p>
                    <p className="font-mono text-[11px] tabular-nums text-slate-500">{pkr(cMarket)} market</p>
                  </div>
                </div>

                {[
                  { label: "Sold as", value: `${num(cTickets)} tickets`, hint: `${pkr(cPrice)} each` },
                  { label: "Gross collected", value: pkr(calcActualGross), hint: `fee ${pkr(calcPlatformFee)}` },
                ].map((cell) => (
                  <div key={cell.label} className="flex flex-col justify-center bg-white px-4 py-4 sm:px-6">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">{cell.label}</p>
                    <p className="mt-0.5 font-mono text-[13.5px] font-semibold tabular-nums text-slate-900">
                      {cell.value}
                    </p>
                    <p className="font-mono text-[10.5px] text-slate-500">{cell.hint}</p>
                  </div>
                ))}

                <div className="flex flex-col justify-center bg-emerald-600 px-4 py-4 text-white sm:px-6">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-100/80">You keep</p>
                  <p className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums">{pkr(calcSellerPayout)}</p>
                  <p className="font-mono text-[10.5px] text-emerald-100/75">wired on draw completion</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-1">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                Escrow custody — the asset is inspected and held before the draw goes live
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Figures follow the calculator below
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Platform fee" value="8%" hint="Flat, from gross" accent />
            <StatTile label="Upfront cost" value="Rs 0" hint="Pay when sold" />
            <StatTile label="Identity" value="CNIC" hint="NADRA verified" />
            <StatTile label="Payout" value="Instant" hint="Bank · Raast" />
          </div>
        </div>

        <div className="relative border-t border-slate-900/5 bg-white/50 py-3 backdrop-blur">
          <Marquee
            items={[
              "8% flat platform fee",
              "92% net payout",
              "No upfront listing cost",
              "Physical verification before launch",
              "3-month maximum campaign",
              "100% buyer refunds on cancellation",
            ]}
          />
        </div>
      </section>

      {/* --------------------------------------------------------- Comparison */}
      <section className="border-b border-slate-900/5 bg-white">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="01"
              kicker="Why a draw"
              title="Classifieds reward the lowest bidder"
              body="A private sale is a negotiation against people who do this for a living. A public draw is a fixed price that thousands of buyers can afford."
              align="center"
            />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-rose-200/70 bg-rose-50/50 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 font-bold text-rose-600">
                    ✕
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">Classifieds / OLX</h3>
                    <p className="text-xs text-rose-700">High friction, slow turnaround</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {[
                    "Buyers demand 20–35% below genuine market value.",
                    "Dozens of spam calls, fake screenshots, no-show meetings.",
                    "Weeks or months to find one buyer with cash in hand.",
                    "Counterfeit currency and unverified transfer risk.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0 font-bold text-rose-500">✕</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="relative h-full overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 p-6 shadow-[0_30px_80px_-60px_rgba(4,120,87,0.7)] sm:p-8">
                <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  The different way
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
                    ✓
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">PakRaffle listing</h3>
                    <p className="text-xs font-semibold text-emerald-800">Full market price, escrow custody</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {[
                    "You set the market price and receive 92% of gross.",
                    "Affordable tickets sell fast across thousands of buyers.",
                    "Funds are collected in escrow before the draw runs.",
                    "One transparent 8% fee covers marketing and processing.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- Steps */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_58%)]" />
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="02"
              kicker="The process"
              title="Four steps, then a bank transfer"
              body="From dossier to payout in as little as three to seven days once the pool closes."
            />
          </Reveal>

          <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div
              aria-hidden
              className="absolute left-7 right-0 top-7 hidden h-px bg-gradient-to-r from-amber-500/50 via-emerald-500/25 to-transparent lg:block"
            />
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 90}>
                <div className="relative">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-white font-display text-sm font-semibold text-amber-700 shadow-[0_18px_40px_-28px_rgba(4,47,34,0.7)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <GhostNumeral className="mt-5">{`0${i + 1}`}</GhostNumeral>
                  <h3 className="mt-3 font-display text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Calculator */}
      <section id="calculator-section" className="border-b border-slate-900/5 bg-white">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="03"
              kicker="Payout planner"
              title="Start from the cash you want"
              body="Tell us what you expect in hand and how many tickets you want to sell, and the ticket price works itself out."
            />
          </Reveal>

          <Reveal delay={80}>
            <div className={`${PANEL} mt-10 overflow-hidden`}>
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="border-b border-slate-900/5 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    <Calculator className="h-3.5 w-3.5" /> Your numbers
                  </div>

                  <div className="mt-7 space-y-7">
                    <div>
                      <div className="flex items-baseline justify-between gap-3">
                        <label htmlFor="calc-market" className="text-[13px] font-medium text-slate-700">
                          1. Market price you want to receive
                        </label>
                        <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                          {pkr(cMarket)}
                        </span>
                      </div>
                      <div className="relative mt-2">
                        <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-semibold text-slate-400">
                          Rs
                        </span>
                        <input
                          id="calc-market"
                          type="number"
                          min="1000"
                          max="50000000"
                          step="5000"
                          value={calcMarketPrice}
                          onChange={(e) => setCalcMarketPrice(e.target.value)}
                          className={`${FIELD} pl-10 font-mono tabular-nums`}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          { label: "Console · 75k", val: 75000 },
                          { label: "Laptop · 185k", val: 185000 },
                          { label: "iPhone · 350k", val: 350000 },
                          { label: "Bike · 490k", val: 490000 },
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => setCalcMarketPrice(preset.val.toString())}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                              calcMarketPrice === preset.val.toString()
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-slate-900/10 bg-white text-slate-600 hover:border-emerald-300"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between gap-3">
                        <label htmlFor="calc-tickets" className="text-[13px] font-medium text-slate-700">
                          2. Tickets you want sold out
                        </label>
                        <span className="font-mono text-sm font-semibold tabular-nums text-emerald-700">
                          {num(cTickets)} tickets
                        </span>
                      </div>
                      <input
                        id="calc-tickets"
                        type="number"
                        min="1"
                        max="50000"
                        value={calcTargetTickets}
                        onChange={(e) => setCalcTargetTickets(e.target.value)}
                        className={`${FIELD} mt-2 font-mono tabular-nums`}
                      />
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {[100, 250, 300, 400, 500, 1000].map((tickets) => (
                          <button
                            key={tickets}
                            type="button"
                            onClick={() => setCalcTargetTickets(tickets.toString())}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                              calcTargetTickets === tickets.toString()
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-slate-900/10 bg-white text-slate-600 hover:border-emerald-300"
                            }`}
                          >
                            {tickets}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <label htmlFor="calc-price" className="text-[13px] font-medium text-slate-700">
                          3. Ticket price per entry
                        </label>
                        <span className="font-mono text-sm font-semibold tabular-nums text-amber-600">
                          {pkr(cPrice)}
                        </span>
                      </div>
                      <div className="relative mt-2">
                        <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-semibold text-slate-400">
                          Rs
                        </span>
                        <input
                          id="calc-price"
                          type="number"
                          min="1"
                          step="50"
                          value={calcTicketPrice}
                          onChange={(e) => setCalcTicketPrice(e.target.value)}
                          className={`${FIELD} pl-10 font-mono tabular-nums`}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {[250, 500, 1000, 1200].map((price) => (
                          <button
                            key={price}
                            type="button"
                            onClick={() => setCalcTicketPrice(price.toString())}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                              calcTicketPrice === price.toString()
                                ? "border-amber-500 bg-amber-500 text-slate-950"
                                : "border-slate-900/10 bg-white text-slate-600 hover:border-amber-300"
                            }`}
                          >
                            Rs {price}
                          </button>
                        ))}
                        {cTickets > 0 && cMarket > 0 && (
                          <button
                            type="button"
                            onClick={handleAutoSuggestCalcTicketPrice}
                            className="rounded-lg border border-emerald-600/30 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
                          >
                            Suggest {pkr(suggestedTicketPriceForCalc)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result */}
                <div className="bg-slate-50/60 p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Campaign summary
                    </span>
                    <span className="rounded-full border border-emerald-600/20 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      8% flat
                    </span>
                  </div>

                  <div className="mt-5 space-y-2.5 text-sm">
                    {[
                      ["Sell-out gross", pkr(calcActualGross)],
                      ["PakRaffle fee · 8%", `- ${pkr(calcPlatformFee)}`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <span className="text-slate-600">{label}</span>
                        <span className="font-mono font-semibold tabular-nums text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#07130f] p-5 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                      Net payout · 92%
                    </p>
                    <p className="mt-1 font-mono text-[1.9rem] font-semibold leading-none tabular-nums">
                      {pkr(calcSellerPayout)}
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-emerald-100/60">
                      {num(cTickets)} tickets at {pkr(cPrice)} must sell out to reach this figure.
                    </p>
                  </div>

                  {calcSellerPayout < cMarket && cMarket > 0 && (
                    <p className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
                      This is {pkr(cMarket - calcSellerPayout)} short of your target. Raise the ticket price or the
                      ticket count.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleApplyCalculatorToForm}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-emerald-500"
                  >
                    Use these values in the listing form
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
                    <HelpCircle className="mt-0.5 h-3 w-3 shrink-0" />
                    Estimate only. The fee is deducted from gross revenue once the raffle completes.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- Form */}
      <section id="listing-form-section" className="relative overflow-hidden border-b border-slate-900/5">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.07),transparent_60%)]" />
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="04"
              kicker="Listing dossier"
              title="Tell us exactly what you are listing"
              body="The more precise the dossier, the faster the verification desk can approve it. Nothing is published until we have physically inspected the item."
            />
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.55fr_0.85fr] lg:items-start">
            <div className={`${PANEL} overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                    <Tag className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">Product listing application</h3>
                    <p className="text-[11px] text-emerald-100">Reviewed within 24–48 hours on WhatsApp</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                  Step {successData ? "complete" : "1 of 1"}
                </span>
              </div>

              <div className="p-6 sm:p-8">
                {errorMsg && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <div>
                      <p className="font-semibold">Please check your inputs</p>
                      <p className="mt-0.5 text-rose-700">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {successData ? (
                  <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-600/20 bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <div>
                      <Pill className="border-emerald-600/20 bg-emerald-50 text-emerald-800">
                        Application logged
                      </Pill>
                      <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                        Submitted for verification
                      </h3>
                      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
                        Your reference is{" "}
                        <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-emerald-800">
                          #{successData.id}
                        </span>
                        . The verification team reviews the specs and contacts your WhatsApp within 24–48 hours.
                      </p>
                    </div>

                    <div className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 p-6 text-left">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                          <Lock className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="font-display text-base font-semibold text-slate-900">
                            Your private status page
                          </h4>
                          <p className="text-xs text-slate-600">
                            Track desk verification, custody hold and the raffle schedule.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                          Tracking URL
                        </span>
                        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                          <div className="w-full overflow-x-auto whitespace-nowrap rounded-xl border border-emerald-300/70 bg-white px-3.5 py-2.5 font-mono text-[11px] text-slate-700">
                            {typeof window !== "undefined"
                              ? `${window.location.origin}/application/status/${successData.id}?token=${successData.secureToken || ""}`
                              : `/application/status/${successData.id}?token=${successData.secureToken || ""}`}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyLink(
                                `/application/status/${successData.id}?token=${successData.secureToken || ""}`,
                              )
                            }
                            className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold transition ${
                              copiedLink ? "bg-emerald-700 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                          >
                            {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedLink ? "Copied" : "Copy link"}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Link
                          href={`/application/status/${successData.id}?token=${successData.secureToken || ""}`}
                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          View status &amp; timeline <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/application/details/${successData.id}?token=${successData.secureToken || ""}`}
                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
                        >
                          <Sparkles className="h-3.5 w-3.5" /> Revenue dashboard
                        </Link>
                      </div>

                      <p className="rounded-xl bg-emerald-100/60 p-2.5 text-[11px] leading-relaxed text-emerald-900">
                        <strong>Bookmark this link.</strong> Anyone holding it can check verification progress and
                        custody updates for this product.
                      </p>
                    </div>

                    <div className="mx-auto max-w-2xl space-y-2.5 rounded-2xl border border-slate-900/5 bg-slate-50 p-5 text-left text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                          Submitted snapshot
                        </span>
                        <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                          Pending review
                        </span>
                      </div>
                      {[
                        ["Product", successData.productName],
                        ["Legal name", successData.fullNameCnic],
                        ["Declared market price", pkr(successData.marketPrice)],
                        ["Target tickets", `${num(successData.totalTickets || formTickets)} tickets`],
                        ["Ticket price", pkr(successData.ticketPrice)],
                        ["Platform fee · 8%", pkr(successData.platformFee)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">{label}</span>
                          <span className="text-right font-medium text-slate-900">{value}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2">
                        <span className="font-semibold text-emerald-800">Net payout · 92%</span>
                        <span className="font-mono text-sm font-semibold tabular-nums text-emerald-700">
                          {pkr(successData.sellerPayout)}
                        </span>
                      </div>
                    </div>

                    <div className="mx-auto max-w-2xl space-y-1.5 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-left text-[11px] text-amber-900">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-950">
                        <Clock className="h-3.5 w-3.5" /> Next steps
                      </p>
                      <p>1. Verification desk confirms identity on WhatsApp within 24–48 hours.</p>
                      <p>2. You receive handover instructions for physical escrow custody.</p>
                      <p>3. Campaign runs for at most 90 days; cancellation means full buyer refunds plus the 8% fee.</p>
                    </div>

                    <div className="mx-auto flex max-w-2xl flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setSuccessData(null)}
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        Submit another product
                      </button>
                      <a
                        href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
                          `Assalam o Alaikum PakRaffle, I submitted Product Listing Application #${successData.id} for "${successData.productName}".`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Inquire on WhatsApp
                      </a>
                      <Link
                        href="/raffles"
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-900/10 bg-white px-5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Browse draws
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 1. Identity */}
                    <fieldset className="space-y-4">
                      <legend className="flex w-full items-center gap-2.5 border-b border-slate-900/5 pb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 font-mono text-[11px] font-bold text-white">
                          1
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                          Seller identity &amp; contact
                        </span>
                      </legend>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full legal name (as per CNIC)" htmlFor="fullNameCnic" required hint="Must match your payout account.">
                          <input
                            id="fullNameCnic"
                            required
                            placeholder="e.g. Muhammad Usman Nadeem"
                            value={formData.fullNameCnic}
                            onChange={(e) => setFormData({ ...formData, fullNameCnic: e.target.value })}
                            className={FIELD}
                          />
                        </Field>

                        <Field label="CNIC number" htmlFor="cnicNumber" hint="Verified before campaign launch.">
                          <input
                            id="cnicNumber"
                            placeholder="e.g. 35201-1234567-1"
                            value={formData.cnicNumber}
                            onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
                            className={`${FIELD} font-mono`}
                          />
                        </Field>

                        <Field label="WhatsApp number" htmlFor="phone" required hint="The desk contacts you here.">
                          <input
                            id="phone"
                            required
                            placeholder="e.g. +92 300 1234567"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`${FIELD} font-mono`}
                          />
                        </Field>

                        <Field label="Email address" htmlFor="email" required>
                          <input
                            id="email"
                            type="email"
                            required
                            placeholder="e.g. yourname@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={FIELD}
                          />
                        </Field>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="city" className="text-[12px] font-semibold text-slate-800">
                            City / inspection desk <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={FIELD}
                          >
                            {CITIES_LIST.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </fieldset>

                    {/* 2. Product */}
                    <fieldset className="space-y-4">
                      <legend className="flex w-full items-center gap-2.5 border-b border-slate-900/5 pb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 font-mono text-[11px] font-bold text-white">
                          2
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                          Product specifications
                        </span>
                      </legend>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label htmlFor="productType" className="text-[12px] font-semibold text-slate-800">
                            Category <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="productType"
                            value={formData.productType}
                            onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                            className={FIELD}
                          >
                            {PRODUCT_CATEGORIES.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="condition" className="text-[12px] font-semibold text-slate-800">
                            Physical condition <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="condition"
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            className={FIELD}
                          >
                            <option value="Brand New (Sealed)">Brand New (Factory Sealed)</option>
                            <option value="Brand New (Zero Meter)">Brand New (Zero Meter / Vehicle)</option>
                            <option value="Open Box - Like New">Open Box - 10/10 Mint Condition</option>
                            <option value="Gently Used (With Box)">Gently Used (With Box &amp; Accessories)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="productName" className="text-[12px] font-semibold text-slate-800">
                            Product title &amp; exact model <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="productName"
                            required
                            placeholder="e.g. Apple iPhone 16 Pro Max 256GB Desert Titanium (PTA Approved)"
                            value={formData.productName}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                            className={FIELD}
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="description" className="text-[12px] font-semibold text-slate-800">
                            Description &amp; included accessories <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            id="description"
                            required
                            rows={4}
                            placeholder="Storage, colour, warranty remaining, PTA status, original receipt, box and charger condition…"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label htmlFor="imageUrl" className="text-[12px] font-semibold text-slate-800">
                            Photo or verification image URL
                          </label>
                          <input
                            id="imageUrl"
                            placeholder="https://images.unsplash.com/… or a Drive link"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className={`${FIELD} font-mono text-xs`}
                          />
                          <span className="block text-[11px] text-slate-500">
                            You can also share high-resolution photos directly on WhatsApp after submitting.
                          </span>
                        </div>
                      </div>
                    </fieldset>

                    {/* 3. Money */}
                    <fieldset className="space-y-4">
                      <legend className="flex w-full items-center gap-2.5 border-b border-slate-900/5 pb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 font-mono text-[11px] font-bold text-white">
                          3
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                          Pricing &amp; 8% fee
                        </span>
                      </legend>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <label htmlFor="formMarketPrice" className="text-[12px] font-semibold text-slate-800">
                            Market price (PKR) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-semibold text-slate-400">
                              Rs
                            </span>
                            <input
                              id="formMarketPrice"
                              type="number"
                              required
                              min="1000"
                              step="1000"
                              value={formData.marketPrice}
                              onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                              className={`${FIELD} pl-10 font-mono tabular-nums`}
                            />
                          </div>
                          <span className="block text-[11px] text-slate-500">The net amount you expect.</span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <label htmlFor="formTargetTickets" className="text-[12px] font-semibold text-slate-800">
                              Target tickets <span className="text-rose-500">*</span>
                            </label>
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                              {num(formTickets)}
                            </span>
                          </div>
                          <input
                            id="formTargetTickets"
                            type="number"
                            required
                            min="1"
                            max="50000"
                            placeholder="e.g. 300, 400"
                            value={formData.targetTickets}
                            onChange={(e) => setFormData({ ...formData, targetTickets: e.target.value })}
                            className={`${FIELD} border-emerald-300 bg-emerald-50/40 font-mono tabular-nums text-emerald-800`}
                          />
                          <div className="flex flex-wrap gap-1">
                            {[100, 250, 300, 400, 500, 1000].map((tVal) => (
                              <button
                                key={tVal}
                                type="button"
                                onClick={() => setFormData({ ...formData, targetTickets: tVal.toString() })}
                                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold transition ${
                                  formData.targetTickets === tVal.toString()
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : "border-slate-900/10 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {tVal}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <label htmlFor="formTicketPrice" className="text-[12px] font-semibold text-slate-800">
                              Ticket price <span className="text-rose-500">*</span>
                            </label>
                            {formTickets > 0 && formMarket > 0 && (
                              <button
                                type="button"
                                onClick={handleAutoSuggestFormTicketPrice}
                                className="text-[10px] font-semibold text-emerald-700 underline decoration-emerald-300 hover:text-emerald-800"
                              >
                                Suggest {pkr(suggestedTicketPriceForForm)}
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-semibold text-slate-400">
                              Rs
                            </span>
                            <input
                              id="formTicketPrice"
                              type="number"
                              required
                              min="1"
                              step="50"
                              placeholder="e.g. 1200"
                              value={formData.ticketPrice}
                              onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                              className={`${FIELD} pl-10 font-mono tabular-nums text-amber-700`}
                            />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {[250, 500, 1000, 1200].map((pVal) => (
                              <button
                                key={pVal}
                                type="button"
                                onClick={() => setFormData({ ...formData, ticketPrice: pVal.toString() })}
                                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold transition ${
                                  formData.ticketPrice === pVal.toString()
                                    ? "border-amber-500 bg-amber-500 text-slate-950"
                                    : "border-slate-900/10 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                Rs {pVal}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-emerald-600/15 bg-emerald-50/60 p-4 sm:grid-cols-4">
                        {[
                          { label: "Gross", value: pkr(formActualGross), tone: "text-slate-900" },
                          { label: "Fee · 8%", value: pkr(formPlatformFee), tone: "text-rose-600" },
                          { label: "Net · 92%", value: pkr(formSellerPayout), tone: "text-emerald-700" },
                          { label: "Tickets", value: num(formTickets), tone: "text-slate-900" },
                        ].map((cell) => (
                          <div key={cell.label}>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              {cell.label}
                            </p>
                            <p className={`mt-0.5 font-mono text-[13px] font-semibold tabular-nums ${cell.tone}`}>
                              {cell.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </fieldset>

                    {/* 4. Terms */}
                    <div className="space-y-4 rounded-2xl border border-slate-900/5 bg-slate-50/80 p-5">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Seller agreement &amp; escrow
                      </p>
                      <ul className="space-y-2 text-[12px] leading-relaxed text-slate-600">
                        {[
                          "Our desk contacts you on WhatsApp within 24–48 hours to review the details.",
                          "The product is shipped to PakRaffle for physical verification and held in insured escrow.",
                          "Cancelling after launch refunds every buyer in full; the 8% platform fee is then payable.",
                          "The raffle must complete within 90 days or it is cancelled and the item returned.",
                        ].map((line) => (
                          <li key={line} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            {line}
                          </li>
                        ))}
                      </ul>
                      <label className="flex cursor-pointer items-start gap-3 border-t border-slate-900/5 pt-3">
                        <input
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-[12px] font-medium leading-relaxed text-slate-800">
                          I have read and accept the custody hold, the 100% buyer refund plus 8% fee on cancellation,
                          and the 90-day completion limit.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(5,150,105,0.9)] transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          Submit for raffle listing <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-500">
                      Zero upfront cost · response within 24 hours on WhatsApp
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* Sticky summary */}
            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className={`${PANEL} p-5`}>
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Wallet className="h-3.5 w-3.5 text-emerald-600" /> Live payout
                </p>
                <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-slate-900">
                  {pkr(formSellerPayout)}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">if all {num(formTickets)} tickets sell</p>

                <div className="mt-4 space-y-2 border-t border-slate-900/5 pt-3 text-[12px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Gross</span>
                    <span className="font-mono tabular-nums text-slate-900">{pkr(formActualGross)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Fee · 8%</span>
                    <span className="font-mono tabular-nums text-rose-600">- {pkr(formPlatformFee)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Target</span>
                    <span className="font-mono tabular-nums text-slate-900">{pkr(formMarket)}</span>
                  </div>
                </div>

                {formSellerPayout >= formMarket && formMarket > 0 ? (
                  <p className="mt-4 rounded-xl bg-emerald-600/10 px-3 py-2 text-[11px] font-medium leading-relaxed text-emerald-800">
                    Hitting the target. Every ticket sold at {pkr(formTicket)} covers your market price.
                  </p>
                ) : formMarket > 0 ? (
                  <p className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] font-medium leading-relaxed text-amber-900">
                    {pkr(Math.max(0, formMarket - formSellerPayout))} short of target — adjust the ticket price or
                    count.
                  </p>
                ) : null}
              </div>

              <div className={`${PANEL} p-5`}>
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Upload className="h-3.5 w-3.5 text-emerald-600" /> Before you submit
                </p>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-600">
                  {[
                    "Name matches your CNIC and payout account.",
                    "Description covers storage, warranty and PTA status.",
                    "You can deliver the item for physical custody.",
                    "The target ticket count is realistic for 90 days.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={3} />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-900/5 bg-[#07130f] p-5 text-white">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  <MessageCircle className="h-3.5 w-3.5" /> Talk to a human
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-emerald-50/70">
                  Not sure the item qualifies or how to price it? The listing desk answers on WhatsApp.
                </p>
                <a
                  href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
                    "Hi PakRaffle, I want to list a product for a raffle. Can you help me price it?",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-50"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp the listing desk
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- FAQ */}
      <section className="bg-white">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="05"
              kicker="Seller questions"
              title="The rules sellers ask about most"
              body="Custody, cancellation and the 8% fee — answered the same way the contract states them."
              align="center"
            />
          </Reveal>
          <Reveal delay={80} className="mx-auto mt-10 max-w-3xl">
            <FaqList items={FAQS} />
          </Reveal>

          <Reveal delay={120}>
            <div className={`${PANEL} mx-auto mt-8 flex max-w-3xl flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                  <Building className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-semibold text-slate-900">Inspection desks</h3>
                  <p className="mt-0.5 text-xs text-slate-600">Lahore · Islamabad · Karachi</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-700 transition hover:border-emerald-300"
                >
                  Seller terms <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/refund"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-700 transition hover:border-emerald-300"
                >
                  Refund policy <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-emerald-700 to-[#052e23] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl animate-drift" />
          <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-emerald-300/15 blur-3xl animate-drift [animation-delay:-9s]" />
        </div>
        <div className={`${CONTAINER} relative flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center md:py-16`}>
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
              <Flame className="h-3.5 w-3.5" /> Full market value, no haggling
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-4xl">
              Your asset deserves a price, not a negotiation.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50/80 sm:text-base">
              Submit the dossier now — verification replies within 48 hours with custody instructions.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Cta
              href="#listing-form-section"
              variant="light"
              arrow
              className="w-full border-white/30 bg-white text-emerald-900 hover:bg-emerald-50 sm:w-auto"
            >
              Start a listing
            </Cta>
            <Cta href="#calculator-section" variant="light" className="w-full sm:w-auto">
              <Calculator className="h-4 w-4" /> Model the payout
            </Cta>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  required = false,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-[12px] font-semibold text-slate-800">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
    </div>
  )
}
