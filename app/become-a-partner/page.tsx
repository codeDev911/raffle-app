"use client"

import React, { useState } from "react"
import {
  BadgeCheck,
  BarChart3,
  Check,
  Clock,
  ExternalLink,
  Handshake,
  Link2,
  MessageCircle,
  Minus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react"
import {
  CONTAINER,
  Cta,
  FaqList,
  GhostNumeral,
  INK_PANEL,
  Kicker,
  LiveDot,
  Marquee,
  Mesh,
  PANEL,
  Pill,
  SectionHead,
  SHELL,
  StatTile,
} from "@/components/marketing/kit"
import { Counter } from "@/components/marketing/motion"

const WHATSAPP_INTL = "923377155722"

const pkr = (value: number) => `Rs ${Math.round(value).toLocaleString("en-PK")}`
const num = (value: number) => Math.round(value).toLocaleString("en-PK")

/** The published tier ladder. The estimator below reads the same thresholds, so the two never drift. */
const TIERS = [
  {
    name: "Starter Partner",
    short: "Starter",
    rate: 15,
    requirement: 0,
    band: "0 – 74 tickets / month",
    bonus: 0,
    perks: [
      "Lifetime commission on every referred ticket",
      "30-day attribution cookie on every link",
      "Withdraw any time above Rs 500",
    ],
  },
  {
    name: "Pro Growth Partner",
    short: "Pro Growth",
    rate: 20,
    requirement: 75,
    band: "75 – 249 tickets / month",
    bonus: 15000,
    perks: [
      "Everything in Starter",
      "Rs 15,000 growth milestone bonus",
      "A named affiliate manager on WhatsApp",
    ],
  },
  {
    name: "Elite VIP Partner",
    short: "Elite VIP",
    rate: 25,
    requirement: 250,
    band: "250+ tickets / month",
    bonus: 50000,
    perks: [
      "Everything in Pro Growth",
      "Rs 50,000 milestone bonus",
      "First access to every new draw launch",
    ],
  },
]

const FAQ = [
  {
    q: "Do I need a large following or expensive camera to start?",
    a: "Absolutely not! Over 60% of our successful affiliates are students, housewives, and everyday individuals who simply share links on their personal WhatsApp status or family groups. Even referring 3-5 ticket buyers a day earns you a solid passive monthly income.",
  },
  {
    q: "How and when do I get paid?",
    a: "You can request a withdrawal directly through your partner platform dashboard or via WhatsApp to our Affiliate Manager. Payouts are sent within 2 to 6 hours directly to your JazzCash, Easypaisa, Raast, or any Pakistani Bank Account.",
  },
  {
    q: "Is there any cost, deposit, or subscription fee to join?",
    a: "No! PakRaffle Affiliate Program is 100% completely free to join and will always remain free. You never have to pay a single rupee to earn commissions.",
  },
  {
    q: "What if someone clicks my link today but buys a ticket 2 weeks later?",
    a: "We use a 30-day tracking cookie! If someone clicks your link today and decides to purchase tickets anytime within the next 30 days, you will automatically receive full commission credit for that sale.",
  },
  {
    q: "What is the minimum amount I can withdraw?",
    a: "The minimum payout threshold is just Rs. 500! As soon as you earn Rs. 500 from your first few referrals, you can immediately transfer it to your mobile wallet.",
  },
  {
    q: "Who handles customer support, ticket delivery, and winner verification?",
    a: "PakRaffle handles 100% of the customer support, ticket issuance, random draw transparency, and winner prize courier delivery. You only share your link and collect your profits.",
  },
]

const OLD_WAY = [
  {
    title: "Rs 50,000 – 200,000 upfront",
    body: "Ad spend or inventory before your first rupee comes back to you.",
  },
  {
    title: "Customer complaints at 2 AM",
    body: "Courier delays, returns and refunds all land on your phone.",
  },
  {
    title: "Bans, fees and verifications",
    body: "Blocked accounts, foreign payout friction, endless paperwork.",
  },
  {
    title: "You build the whole funnel",
    body: "Website, pixels, ad copy — all before you earn anything.",
  },
]

const NEW_WAY = [
  {
    title: "Rs 0 to start",
    body: "Free to join, free to stay. No deposit and no renewal.",
  },
  {
    title: "Zero customer handling",
    body: "We run tickets, draws, verification and prize delivery.",
  },
  {
    title: "Paid in rupees, locally",
    body: "JazzCash, Easypaisa, Raast or any Pakistani bank account.",
  },
  {
    title: "Instant portal access",
    body: "Live clicks, live commissions, withdrawals on your schedule.",
  },
]

const STORIES = [
  {
    initials: "AH",
    name: "Ahmed Hassan",
    role: "Tech reviewer · Islamabad",
    earnings: 485750,
    quote:
      "I just post 2 Instagram stories whenever an iPhone or bike draw opens. The commission comes automatically to my Meezan bank.",
    method: "Meezan Bank",
    ring: "from-emerald-500 to-teal-500",
    wash: "bg-emerald-500/10 text-emerald-800",
  },
  {
    initials: "SF",
    name: "Sarah Fatima",
    role: "University student · Karachi",
    earnings: 184200,
    quote:
      "I pay my entire semester university fee just by sharing raffle links in my university hostel WhatsApp groups. Zero stress!",
    method: "JazzCash",
    ring: "from-sky-500 to-blue-500",
    wash: "bg-sky-500/10 text-sky-800",
  },
  {
    initials: "BT",
    name: "Bilal Tariq",
    role: "TikTok creator · Lahore",
    earnings: 342000,
    quote:
      "TikTok reels get huge organic views in Pakistan. PakRaffle converts like crazy because tickets are only Rs. 100.",
    method: "Raast",
    ring: "from-violet-500 to-indigo-500",
    wash: "bg-violet-500/10 text-violet-800",
  },
  {
    initials: "AN",
    name: "Ayesha Noor",
    role: "Stay-at-home mom · Rawalpindi",
    earnings: 92500,
    quote:
      "I don't have many followers, just family WhatsApp groups. Whenever relatives buy entries, I get commission directly on Easypaisa.",
    method: "Easypaisa",
    ring: "from-amber-500 to-orange-500",
    wash: "bg-amber-500/10 text-amber-800",
  },
]

const PAYOUTS = ["JazzCash", "Easypaisa", "Raast (Instant)", "Meezan Bank", "HBL", "Bank Alfalah"]

const FACTS = [
  "Commission up to 25%",
  "Minimum payout Rs 500",
  "30-day attribution cookie",
  "Milestone bonus up to Rs 50,000",
  "Payouts in 2 – 6 hours",
  "Zero joining cost",
  "JazzCash & Easypaisa supported",
  "Live partner dashboard",
]

const STEPS = [
  {
    icon: Link2,
    title: "Grab your tracked link",
    body: "Inside the partner portal every affiliate gets a unique link. Paste it in your status, story, group or reel — that is the entire setup.",
  },
  {
    icon: Ticket,
    title: "Someone buys a ticket",
    body: "The 30-day cookie credits the sale to you even if they come back two weeks later. Commission is recorded the moment payment clears.",
  },
  {
    icon: Wallet,
    title: "Withdraw to your wallet",
    body: "Cross Rs 500 and request a payout. It lands in JazzCash, Easypaisa, Raast or your bank within 2 – 6 hours.",
  },
]

export default function PartnerPage() {
  // Partner app URL from environment
  const partnerAppUrl = process.env.NEXT_PUBLIC_PARTNER_APP_URL || ""

  // Calculator states
  const [dailyTickets, setDailyTickets] = useState<number>(25)
  const [ticketPrice, setTicketPrice] = useState<number>(300)

  // Calculations
  const monthlyTickets = dailyTickets * 30
  const grossMonthlyVolume = monthlyTickets * ticketPrice

  // Commission calculation based on volume
  let commissionRate = 0.15
  let tierName = "Starter Partner"
  let milestoneBonus = 0

  if (monthlyTickets >= 250) {
    commissionRate = 0.25
    tierName = "Elite VIP Partner"
    milestoneBonus = 50000
  } else if (monthlyTickets >= 75) {
    commissionRate = 0.20
    tierName = "Pro Growth Partner"
    milestoneBonus = 15000
  }

  const commissionEarnings = Math.round(grossMonthlyVolume * commissionRate)
  const totalEstimatedMonthly = commissionEarnings + milestoneBonus
  const dailyAverage = Math.round(totalEstimatedMonthly / 30)
  const ratePct = Math.round(commissionRate * 100)

  // Ladder helpers — the pass in the hero and the ladder section both read these.
  const nextTier = monthlyTickets < 75 ? 75 : monthlyTickets < 250 ? 250 : null
  const ticketsToNext = nextTier ? Math.max(0, nextTier - monthlyTickets) : 0
  const tierProgress = nextTier ? Math.min(100, Math.round((monthlyTickets / nextTier) * 100)) : 100

  // Fallback target for partner platform redirect
  const redirectHref =
    partnerAppUrl || `https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle!%20I%20am%20ready%20to%20access%20the%20Partner%20Platform.`

  return (
    <div className={SHELL}>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        {/* Orbit fields — the tiers radiate out from the centre of the page. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#ffffff_0%,#f8f5fd_46%,#eef7f1_100%)]" />
          <div className="absolute left-1/2 top-[-19rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full border border-violet-300/25" />
          <div className="absolute left-1/2 top-[-13rem] h-[27rem] w-[27rem] -translate-x-1/2 rounded-full border border-violet-300/40" />
          <div className="absolute left-1/2 top-[-7rem] h-[16rem] w-[16rem] -translate-x-1/2 rounded-full border border-emerald-300/45" />
          <div className="absolute -left-24 top-44 h-72 w-72 rounded-full bg-violet-300/25 blur-3xl" />
          <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
        </div>

        <div className={`${CONTAINER} relative pb-12 pt-24 sm:pt-28`}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Pill className="border-violet-600/20 bg-violet-600/10 text-violet-800">
                <LiveDot />
                Affiliate network · Pakistan
              </Pill>
              <Pill>
                <Zap className="h-3 w-3 text-emerald-600" />
                Zero cost to join
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.5rem] lg:text-[3.9rem]">
              Share a link.
              <span className="block bg-gradient-to-r from-violet-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Every ticket pays.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-600">
              Earn <span className="font-semibold text-slate-900">15 – 25% lifetime commission</span> on tickets sold
              through your link. No stock, no support tickets, no upfront cost — just your WhatsApp, your reels, and
              money that lands in your wallet.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Cta href={redirectHref} arrow className="w-full sm:w-auto">
                <Handshake className="h-4 w-4" />
                Go to Partner Platform
              </Cta>
              <Cta
                href={`https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle%20Team!%20I%20want%20to%20join%20the%20Affiliate%20Program%20and%20start%20earning%20commissions.`}
                variant="ghost"
                className="w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </Cta>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-slate-500">
              {[
                { icon: Check, label: "No registration fee" },
                { icon: Clock, label: "Payouts in 2 – 6 hours" },
                { icon: ShieldCheck, label: "30-day attribution" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* The published ladder — the estimate underneath reads the same thresholds. */}
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {TIERS.map((tier) => {
              const current = tier.rate === ratePct

              return (
                <div
                  key={tier.short}
                  className={`rounded-2xl border p-5 text-left transition ${
                    current
                      ? "border-violet-500/40 bg-white shadow-[0_30px_70px_-55px_rgba(76,29,149,0.7)]"
                      : "border-slate-900/10 bg-white/55"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{tier.short}</p>
                    {current && (
                      <span className="rounded-full bg-violet-600/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                        Your band
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-display text-[2rem] font-semibold leading-none tracking-tight text-slate-900">
                    {tier.rate}%
                  </p>
                  <p className="mt-2 font-mono text-[10.5px] text-slate-500">{tier.band}</p>
                  <p
                    className={`mt-3 text-[11.5px] font-semibold ${
                      tier.bonus > 0 ? "text-emerald-700" : "text-slate-400"
                    }`}
                  >
                    {tier.bonus > 0 ? `+ ${pkr(tier.bonus)} milestone bonus` : "No milestone bonus"}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Your numbers, at the current step of the ladder. */}
          <div className="mt-3 overflow-hidden rounded-2xl border border-violet-900/10">
            <dl className="grid grid-cols-2 gap-px bg-violet-900/10 sm:grid-cols-4">
              {[
                { label: "Your tier", value: tierName.replace(" Partner", ""), accent: false },
                { label: "Tickets / month", value: num(monthlyTickets), accent: false },
                { label: "Commission", value: pkr(commissionEarnings), accent: false },
                { label: "This month, roughly", value: pkr(totalEstimatedMonthly), accent: true },
              ].map((cell) => (
                <div
                  key={cell.label}
                  className={`px-4 py-3.5 ${cell.accent ? "bg-emerald-600" : "bg-white/85"}`}
                >
                  <dt
                    className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${
                      cell.accent ? "text-emerald-100/80" : "text-slate-400"
                    }`}
                  >
                    {cell.label}
                  </dt>
                  <dd
                    className={`mt-0.5 font-mono text-[13px] font-semibold tabular-nums ${
                      cell.accent ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {cell.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-dashed border-violet-900/15 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  {nextTier
                    ? `${num(ticketsToNext)} more tickets unlocks the next rate`
                    : "Top tier unlocked — 25% on everything"}
                </p>
                <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-700">
                  <Wallet className="h-3 w-3" />
                  Paid to JazzCash · Easypaisa · Raast
                </p>
              </div>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-900/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-[width] duration-500"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Key numbers */}
      <section className={`${CONTAINER} relative pb-4 pt-6`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Commission" value="15 – 25%" hint="Lifetime, per ticket" accent />
          <StatTile label="Minimum payout" value="Rs 500" hint="No lock-in." />
          <StatTile label="Attribution" value="30 days" hint="Cookie window" />
          <StatTile label="Payout window" value="2 – 6 h" hint="Wallet or bank" />
        </div>
      </section>

      {/* ------------------------------------------------------------- Ticker */}
      <div className="border-y border-slate-900/5 bg-white/60 py-3">
        <Marquee items={FACTS} speed="52s" />
      </div>

      {/* --------------------------------------------------------- Estimator */}
      <section id="calculator" className="relative overflow-hidden py-16 sm:py-20">
        <Mesh tone="violet" className="opacity-60" />
        <div className={`${CONTAINER} relative`}>
          <SectionHead
            index="01"
            kicker="Earnings estimator"
            title="Model a month before you commit."
            body="Move two sliders: how many tickets you expect to sell a day, and at what average price. The tier, the rate and the bonus update together."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
            {/* Controls */}
            <div className={`${PANEL} p-6 sm:p-8`}>
              <Slot
                label="Tickets sold through your link"
                display={`${dailyTickets} / day`}
                value={dailyTickets}
                min={2}
                max={100}
                step={1}
                onChange={setDailyTickets}
                left="2 — just WhatsApp status"
                right="100 — reels & TikTok"
              />

              <div className="mt-8">
                <Slot
                  label="Average ticket price"
                  display={pkr(ticketPrice)}
                  value={ticketPrice}
                  min={100}
                  max={1000}
                  step={50}
                  onChange={setTicketPrice}
                  left="Rs 100 — budget raffles"
                  right="Rs 1,000 — cars & bikes"
                />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <PreviewCell label="Tickets / month" value={`${num(monthlyTickets)}`} />
                <PreviewCell label="Ticket volume" value={pkr(grossMonthlyVolume)} />
              </div>

              <div className="mt-3 rounded-2xl border border-slate-900/10 bg-slate-50/80 px-4 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Current tier
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
                    <TrendingUp className="h-3 w-3" />
                    {tierName} · {ratePct}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-emerald-500 to-emerald-600 transition-[width] duration-500"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
                  {nextTier
                    ? `${num(ticketsToNext)} more tickets a month unlocks the next rate${milestoneBonus > 0 ? " and its milestone bonus" : ""}.`
                    : "You are at the top tier — every one of these tickets earns the maximum rate."}
                </p>
              </div>
            </div>

            {/* Result */}
            <div className={`${INK_PANEL} relative overflow-hidden p-6 sm:p-8`}>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-500/25 blur-3xl"
              />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                  Projected monthly income
                </p>
                <p className="mt-2 font-mono text-[2.4rem] font-semibold leading-none tabular-nums text-white sm:text-5xl">
                  <Counter to={totalEstimatedMonthly} prefix="Rs " />
                </p>
                <p className="mt-2 text-[13px] text-emerald-50/70">
                  Paid straight to JazzCash, Easypaisa or Raast — on your schedule, not ours.
                </p>

                <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-[13px]">
                  <div className="flex items-center justify-between gap-4 text-emerald-50/70">
                    <span>Base commission ({ratePct}%)</span>
                    <span className="font-mono font-semibold tabular-nums text-emerald-300">{pkr(commissionEarnings)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-emerald-50/70">
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      Milestone bonus
                    </span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${milestoneBonus > 0 ? "text-amber-300" : "text-slate-500"}`}
                    >
                      {milestoneBonus > 0 ? `+ ${pkr(milestoneBonus)}` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-emerald-50/70">
                    <span>Daily average</span>
                    <span className="font-mono font-semibold tabular-nums text-white">{pkr(dailyAverage)} / day</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <p className="text-[11px] leading-snug text-emerald-50/70">
                    An estimate, not a promise — it assumes every ticket is paid for and the milestone is met.
                  </p>
                </div>

                <div className="mt-6">
                  <Cta href={redirectHref} variant="primary" className="w-full">
                    <Handshake className="h-4 w-4" />
                    Open the partner platform
                  </Cta>
                  <p className="mt-2.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/50">
                    Live portal · real-time tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Tier ladder */}
      <section className="border-y border-slate-900/5 bg-white/60 py-16 sm:py-20">
        <div className={CONTAINER}>
          <SectionHead
            index="02"
            kicker="The ladder"
            title="Three tiers. One direction: up."
            body="Rates climb with the volume you move and never drop back down within the month you hit them."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TIERS.map((tier) => {
              const active = tier.name === tierName
              return (
                <div
                  key={tier.name}
                  className={`relative flex flex-col rounded-3xl border p-6 transition ${
                    active
                      ? "border-emerald-500/40 bg-white shadow-[0_30px_80px_-50px_rgba(5,120,87,0.75)]"
                      : "border-slate-900/10 bg-white/60"
                  }`}
                >
                  {active && (
                    <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                      <LiveDot className="[&>span]:bg-white" />
                      Your tier
                    </span>
                  )}
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{tier.band}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900">{tier.name}</h3>
                    <p className="font-mono text-3xl font-semibold tabular-nums text-emerald-700">{tier.rate}%</p>
                  </div>
                  <p className="mt-2 text-[12px] text-slate-500">
                    {tier.bonus > 0 ? `Includes a ${pkr(tier.bonus)} milestone bonus` : "No bonus threshold — just commission"}
                  </p>
                  <ul className="mt-5 space-y-2.5 border-t border-slate-900/5 pt-5">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-600">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={3} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- How it pays */}
      <section className={`${CONTAINER} py-16 sm:py-20`}>
        <SectionHead
          index="03"
          kicker="Nothing to maintain"
          title="Three steps, then it runs itself."
          body="PakRaffle owns the tickets, the draws, the support desk and the courier. You own the link."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className={`${PANEL} relative overflow-hidden p-6`}>
              <GhostNumeral className="absolute right-4 top-3 opacity-40">{`0${i + 1}`}</GhostNumeral>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-slate-900">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- Comparison */}
      <section className="border-y border-slate-900/5 bg-white/60 py-16 sm:py-20">
        <div className={CONTAINER}>
          <SectionHead
            index="04"
            kicker="The honest comparison"
            title="Why affiliates stay with PakRaffle."
            body="Earning online in Pakistan usually means paying to begin. This one does not."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-rose-500/15 bg-rose-50/50 p-6 sm:p-7">
              <div className="flex items-center gap-3 border-b border-rose-500/15 pb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                  <Minus className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-rose-950">Dropshipping · Amazon · Freelancing</h3>
                  <p className="text-[11px] text-rose-700/80">Capital first, headaches forever</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3.5">
                {OLD_WAY.map((item) => (
                  <li key={item.title} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-0.5 font-mono text-xs font-bold text-rose-400">✕</span>
                    <span className="text-[13px] leading-relaxed text-rose-900/90">
                      <span className="font-semibold text-rose-950">{item.title}.</span> {item.body}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-3xl border border-emerald-500/25 bg-emerald-50/50 p-6 shadow-[0_30px_80px_-60px_rgba(5,120,87,0.8)] sm:p-7">
              <span className="absolute -top-2.5 right-6 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                The easy way
              </span>
              <div className="flex items-center gap-3 border-b border-emerald-500/15 pb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-emerald-950">PakRaffle affiliate program</h3>
                  <p className="text-[11px] text-emerald-700/80">Pure commission, zero operations</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3.5">
                {NEW_WAY.map((item) => (
                  <li key={item.title} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                    <span className="text-[13px] leading-relaxed text-emerald-900/90">
                      <span className="font-semibold text-emerald-950">{item.title}.</span> {item.body}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Stories */}
      <section className={`${CONTAINER} py-16 sm:py-20`}>
        <SectionHead
          index="05"
          kicker="Partner stories"
          title="Students, creators, and one very persuasive aunt."
          body="Four partners, four completely different audiences — the same commission structure."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STORIES.map((story) => (
            <div key={story.name} className="flex flex-col rounded-3xl border border-slate-900/10 bg-white p-5">
              <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${story.ring}`} />
              <div className={`mt-4 flex h-12 w-12 items-center justify-center rounded-2xl font-display text-base font-bold ${story.wash}`}>
                {story.initials}
              </div>
              <p className="mt-3 font-display text-base font-semibold tracking-tight text-slate-900">{story.name}</p>
              <p className="text-[11px] text-slate-500">{story.role}</p>

              <div className="mt-4 rounded-2xl bg-slate-50 px-3.5 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Last month</p>
                <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-slate-900">{pkr(story.earnings)}</p>
              </div>

              <p className="mt-4 flex-1 text-[12.5px] leading-relaxed text-slate-600">“{story.quote}”</p>

              <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                {story.method}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------- Portal access + payouts */}
      <section className={`${CONTAINER} pb-16 sm:pb-20`}>
        <div className={`${INK_PANEL} relative overflow-hidden p-6 sm:p-10`}>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <Kicker className="text-emerald-300">Official partner portal</Kicker>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[2rem]">
                Your link, your clicks, your money — all in one console.
              </h2>
              <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-emerald-50/70">
                Open the portal, copy your tracked link, and watch commissions land in real time. No spreadsheets, no
                waiting on an email, no asking anyone for your balance.
              </p>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                {[
                  { icon: BarChart3, title: "Live tracking", body: "Clicks and sales as they happen." },
                  { icon: Wallet, title: "Instant withdrawal", body: "JazzCash, Easypaisa or Raast." },
                  { icon: ShieldCheck, title: "30-day credit", body: "The sale still counts later." },
                ].map((f) => (
                  <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                    <f.icon className="h-4 w-4 text-emerald-400" />
                    <p className="mt-2 text-[12px] font-semibold text-white">{f.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-emerald-50/60">{f.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Cta href={redirectHref} variant="primary" className="w-full sm:w-auto">
                  <Handshake className="h-4 w-4" />
                  Launch partner platform
                  {partnerAppUrl ? <ExternalLink className="h-3.5 w-3.5" /> : null}
                </Cta>
                <Cta
                  href={`https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle!%20I%20have%20questions%20about%20the%20Partner%20Platform.`}
                  variant="light"
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  VIP WhatsApp support
                </Cta>
              </div>
              {partnerAppUrl && (
                <p className="mt-3 truncate font-mono text-[10px] text-emerald-300/60">Destination: {partnerAppUrl}</p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                  Payout methods
                </p>
                <Pill className="border-white/15 bg-white/10 text-emerald-50">
                  <Zap className="h-3 w-3 text-amber-300" />
                  2 – 6 hours
                </Pill>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {PAYOUTS.map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[12px] font-semibold text-emerald-50/90"
                  >
                    <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} />
                    {method}
                  </span>
                ))}
              </div>

              <div className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-[12px] text-emerald-50/70">
                <div className="flex items-center justify-between gap-3">
                  <span>Minimum withdrawal</span>
                  <span className="font-mono font-semibold text-white">Rs 500</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Joining fee</span>
                  <span className="font-mono font-semibold text-white">Rs 0</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Monthly fee</span>
                  <span className="font-mono font-semibold text-white">Rs 0</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Commission cap</span>
                  <span className="font-mono font-semibold text-white">None</span>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-emerald-500/10 px-3.5 py-3">
                <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p className="text-[11px] leading-snug text-emerald-50/80">
                  Payouts are released on working hours; weekend requests land on the next business morning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- FAQ */}
      <section className="border-t border-slate-900/5 bg-white/60 py-16 sm:py-20">
        <div className={`${CONTAINER} grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14`}>
          <div>
            <SectionHead index="06" kicker="Questions" title="Everything before you start." />
            <p className="mt-4 text-[13.5px] leading-relaxed text-slate-600">
              Still unsure? Message the affiliate desk on WhatsApp — a human answers, not a bot.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:flex-col">
              <Cta
                href={`https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle!%20I%20am%20ready%20to%20start%20as%20an%20affiliate%20partner.`}
                variant="ghost"
              >
                <MessageCircle className="h-4 w-4" />
                Talk to the affiliate desk
              </Cta>
            </div>
            <p className="mt-6 max-w-sm text-[11px] leading-relaxed text-slate-500">
              Commissions are paid on completed ticket purchases only. Voided or refunded tickets earn nothing.
              Estimates shown on this page are illustrative and depend on your own audience.
            </p>
          </div>

          <FaqList items={FAQ} />
        </div>
      </section>

      {/* ----------------------------------------------------------- Final CTA */}
      <section className={`${CONTAINER} py-16 sm:py-20`}>
        <div className="relative overflow-hidden rounded-[32px] bg-[#0a1020] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="absolute inset-0 grid-veil opacity-40" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <Pill className="border-white/15 bg-white/10 text-emerald-50">
              <LiveDot />
              Start today · first payout in days
            </Pill>
            <h2 className="mt-5 font-display text-[2rem] font-semibold leading-[1.02] tracking-tight text-white sm:text-[2.9rem]">
              Your status update is
              <span className="block bg-gradient-to-r from-emerald-300 via-teal-200 to-violet-300 bg-clip-text text-transparent">
                already worth money.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-slate-300">
              Join the partners who turned screen time into a monthly payout — no capital, no inventory, no customer
              support.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Cta href={redirectHref} variant="primary" className="w-full sm:w-auto">
                <Handshake className="h-4 w-4" />
                Go to partner platform
              </Cta>
              <Cta
                href={`https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle!%20I%20am%20ready%20to%20start%20as%20an%20affiliate%20partner.`}
                variant="light"
                className="w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                Talk to VIP manager
              </Cta>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-emerald-100/70">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />
                No registration fees
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />
                Instant platform access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />
                WhatsApp payout support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- Floating WhatsApp helper */}
      <a
        href={`https://wa.me/${WHATSAPP_INTL}?text=Hi%20PakRaffle!%20I%20have%20a%20question%20about%20the%20affiliate%20partner%20program.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/20 bg-emerald-600 px-4 py-3 text-white shadow-[0_18px_40px_-16px_rgba(5,120,87,0.9)] transition hover:-translate-y-0.5 hover:bg-emerald-500"
        title="Chat with Affiliate VIP Support on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden text-xs font-semibold sm:inline">Affiliate help</span>
      </a>
    </div>
  )
}

/* -------------------------------------------------------------- helpers */

function Slot({
  label,
  display,
  value,
  min,
  max,
  step,
  onChange,
  left,
  right,
}: {
  label: string
  display: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  left: string
  right: string
}) {
  return (
    <label className="block">
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-slate-800">{label}</span>
        <span className="rounded-lg border border-slate-900/10 bg-white px-2.5 py-1 font-mono text-[13px] font-semibold tabular-nums text-slate-900">
          {display}
        </span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-900/10 accent-emerald-600"
      />
      <span className="mt-1.5 flex items-center justify-between gap-4 text-[10.5px] font-medium text-slate-400">
        <span>{left}</span>
        <span className="text-right">{right}</span>
      </span>
    </label>
  )
}

function PreviewCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white px-3.5 py-3">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  )
}
