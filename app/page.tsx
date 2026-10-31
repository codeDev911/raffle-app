import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CreditCard,
  Eye,
  Gift,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  Truck,
  Zap,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import Video_Mockup from "@/components/Video_Mockup"
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
  TicketCard,
} from "@/components/marketing/kit"
import { Counter, Lift, Reveal } from "@/components/marketing/motion"

export const metadata: Metadata = {
  title: "PakRaffle — Real Prizes, Drawn Live in Public",
  description:
    "Pakistan's transparent lucky draw platform. Every prize is funded before a ticket is sold, every draw is streamed live, and tickets start at a few hundred rupees.",
  keywords: ["PakRaffle", "lucky draw Pakistan", "online raffle", "win iPhone", "Pak raffle coins"],
  robots: "index, follow",
  openGraph: {
    title: "PakRaffle — Real Prizes, Drawn Live in Public",
    description: "Enter lucky draws using coins and win exciting prizes daily — powered by transparency and fairness.",
    url: "https://pakraffle.com",
    siteName: "PakRaffle",
    images: [
      {
        url: "https://pakraffle.com/images/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "PakRaffle Home Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PakRaffle — Real Prizes, Drawn Live in Public",
    description: "Join exciting lucky draws and win prizes like iPhones, AirPods, and more!",
    images: ["https://pakraffle.com/images/og-home.jpg"],
  },
}

export const viewport = {
  themeColor: "#10B981",
}

// The prize wall changes whenever a draw opens or sells out, so the page is refreshed every
// minute instead of being frozen at build time.
export const revalidate = 60

const STEPS = [
  {
    icon: Gift,
    title: "Pick the prize",
    body: "Every draw publishes the exact prize, its market value and the number of tickets on sale. No mystery boxes.",
    tag: "Published",
  },
  {
    icon: Ticket,
    title: "Buy your tickets",
    body: "One ticket or ten — more tickets mean more chances in that same draw, at the same listed price.",
    tag: "Same odds",
  },
  {
    icon: CreditCard,
    title: "Pay in seconds",
    body: "Easypaisa, JazzCash or any debit and credit card on a hosted, encrypted checkout page.",
    tag: "Rupees",
  },
  {
    icon: Trophy,
    title: "Wait for the last ticket",
    body: "The draw runs live once the target is sold out. The winner is called, texted and messaged within two hours.",
    tag: "Live",
  },
]

const PAY_NOTES = [
  {
    icon: Zap,
    title: "Confirmed in seconds",
    body: "Your ticket is issued the moment the wallet or card approves the payment — no manual approval queue.",
  },
  {
    icon: Lock,
    title: "Card details never touch us",
    body: "Payments are captured on the gateway's hosted page. We store the reference, never the card.",
  },
  {
    icon: Check,
    title: "No hidden charges",
    body: "The ticket price you see is the amount that leaves your wallet. Delivery is free on physical prizes.",
  },
]

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Funded before anyone wins",
    body: "A draw cannot run before every target ticket is sold, so the prize is fully funded before a single entry is entered.",
  },
  {
    icon: Eye,
    title: "Drawn in public",
    body: "The randomiser is a certified CSPRNG and each draw is streamed unedited on YouTube and Facebook.",
  },
  {
    icon: Truck,
    title: "Delivered on us",
    body: "Physical prizes ship free by TCS or courier nationwide. Cash prizes are paid to your verified account.",
  },
]

const WINNERS = [
  {
    initial: "A",
    quote:
      "Won Rs 500,000 in my second week. The payout reached my JazzCash the same day and the draw video is still up.",
    name: "Ahmed Hassan",
    detail: "Karachi · cash prize",
  },
  {
    initial: "S",
    quote:
      "The most straightforward platform I have used in Pakistan. Every ticket, price and draw time was exactly what the page said.",
    name: "Sara Khan",
    detail: "Lahore · multiple winner",
  },
  {
    initial: "M",
    quote:
      "Won an iPhone and it arrived sealed and PTA approved. The live draw was unedited, which is why I entered again.",
    name: "Muhammad Ali",
    detail: "Islamabad · iPhone 15 Pro",
  },
]

const FAQ = [
  {
    q: "When does a draw actually happen?",
    a: "Only when every ticket in that raffle is sold. The target ticket count is published on the draw page and no draw runs before it is reached, so the prize is fully funded and every entry has the same chance.",
  },
  {
    q: "How is the winner picked?",
    a: "A certified cryptographically secure randomiser picks the winning ticket, and the run is streamed unedited on YouTube and Facebook. Nothing about the result depends on how early or late you bought.",
  },
  {
    q: "Which payment methods can I use?",
    a: "Easypaisa, JazzCash, and any debit or credit card, all settled in Pakistani rupees on a hosted checkout page. Your card details are entered on the gateway's page, not ours.",
  },
  {
    q: "What happens if a draw is cancelled?",
    a: "If a raffle is cancelled — by us or by the seller — 100% of the ticket price is refunded to every buyer's original payment method. Community draws also close automatically if the ticket goal is not met within 90 days.",
  },
  {
    q: "How do I receive the prize?",
    a: "Winners are contacted by call, SMS and WhatsApp within two hours of the draw and have seven business days to confirm their address and CNIC. Physical prizes ship free nationwide; cash prizes are paid to your verified account.",
  },
  {
    q: "Who can enter?",
    a: "Residents of Pakistan aged 18 or over, one account per person. The full eligibility, draw and refund rules are in our terms and refund policy.",
  },
]

interface LiveDraw {
  id: string
  title: string
  category: string
  image: string | null
  gallery: string[]
  price: number
  totalEntries: number
  currentEntries: number
}

/**
 * The homepage is the shop window, so a database hiccup shows an honest empty state instead of
 * taking the whole page down with it. `prisma` is a proxy over the real client and the in-memory
 * store, so the row shape is declared here rather than inferred.
 */
async function getLiveDraws(): Promise<LiveDraw[]> {
  try {
    return await prisma.raffle.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        category: true,
        image: true,
        gallery: true,
        price: true,
        totalEntries: true,
        currentEntries: true,
      },
    })
  } catch (error) {
    console.error("Home live draws error:", error)
    return []
  }
}

function progressOf(draw: LiveDraw) {
  const sold = draw.currentEntries || 0
  const target = draw.totalEntries || 0
  return {
    sold,
    target,
    percent: target > 0 ? Math.min(100, Math.round((sold / target) * 100)) : 0,
    remaining: Math.max(0, target - sold),
  }
}

export default async function LandingPage() {
  const draws = await getLiveDraws()
  const heroDraw = draws[0]
  const ticketsSold = draws.reduce((sum, d) => sum + (d.currentEntries || 0), 0)
  const ticker = [
    ...draws.map((d) => d.title),
    "Fully funded before launch",
    "Certified CSPRNG draw",
    "Streamed live on YouTube",
    "Free insured TCS delivery",
    "Easypaisa · JazzCash · Card",
  ].slice(0, 8)

  return (
    <div className={SHELL}>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="emerald" />
        <div className={`${CONTAINER} relative pb-14 pt-24 sm:pt-24 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-28`}>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill className="border-emerald-600/20 bg-emerald-600/10 text-emerald-800">
                <LiveDot />
                Pakistan&apos;s verified draw platform
              </Pill>
              <Pill className="hidden sm:inline-flex">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Draws open now
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.6rem] lg:text-[4.1rem]">
              A few coins.
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 bg-clip-text text-transparent">
                Real prizes.
              </span>
              <span className="block text-slate-400">Drawn in public.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
              iPhones, motorbikes, laptops and cash — funded before a single ticket is sold. Pick a draw, buy a ticket
              with the wallet already on your phone, then watch the winner get picked live.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Cta href="/raffles" arrow className="w-full sm:w-auto">
                Browse open draws
              </Cta>
              <Cta href="/winners" variant="ghost" className="w-full sm:w-auto">
                <Trophy className="h-4 w-4 text-amber-500" /> Recent winners
              </Cta>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-500">
              {[
                "Draw runs only when every ticket is sold",
                "Free insured delivery",
                "PTA-approved, sealed prizes",
              ].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-slate-900/10 pt-6">
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-slate-900 sm:text-2xl">
                  <Counter to={2.5} decimals={1} prefix="Rs " suffix="M+" />
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">Paid out to winners</p>
              </div>
              <div className="hidden h-9 w-px bg-slate-200 sm:block" />
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-slate-900 sm:text-2xl">
                  <Counter to={50} suffix="k+" />
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">Players registered</p>
              </div>
              <div className="hidden h-9 w-px bg-slate-200 sm:block" />
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-emerald-700 sm:text-2xl">100%</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">Draws filmed live</p>
              </div>
            </div>
          </div>

          {/* Prize deck — real draws when the database has any, an illustrated stub otherwise. */}
          <div className="relative mt-12 lg:mt-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[48px] bg-gradient-to-br from-emerald-200/50 via-white/0 to-amber-100/50 blur-2xl"
            />
            <Lift>
              <TicketCard className="animate-floaty shadow-[0_40px_90px_-50px_rgba(4,47,34,0.55)] lg:rotate-[1.2deg]">
                <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-200 px-5 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {heroDraw ? `Draw · ${heroDraw.category}` : "Ticket · PKR-7Q4K-21"}
                  </span>
                  <Pill className="border-emerald-600/20 bg-emerald-50 text-emerald-700">
                    <LiveDot /> Live
                  </Pill>
                </div>

                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 p-6">
                  <div aria-hidden className="absolute inset-0 grid-veil opacity-60" />
                  {heroDraw ? (
                    <img
                      src={heroDraw.image || heroDraw.gallery?.[0] || "/placeholder.svg"}
                      alt={heroDraw.title}
                      className="relative z-10 max-h-full w-auto max-w-full object-contain drop-shadow-[0_18px_30px_rgba(2,44,34,0.18)]"
                    />
                  ) : (
                    <div className="relative z-10 flex flex-col items-center gap-3 text-emerald-700">
                      <Ticket className="h-16 w-16" strokeWidth={1.2} />
                      <span className="font-mono text-xs tracking-[0.3em] text-slate-400">PKR-7Q4K-21</span>
                    </div>
                  )}
                  <span className="absolute bottom-3 right-4 z-10 font-mono text-[10px] tabular-nums text-slate-400">
                    {heroDraw ? `${progressOf(heroDraw).sold.toLocaleString("en-PK")} tickets sold` : "one entry"}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-slate-900">
                      {heroDraw ? heroDraw.title : "Your next prize is already funded"}
                    </h2>
                    <span className="shrink-0 rounded-xl bg-slate-900 px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-white">
                      {heroDraw ? formatCurrency(heroDraw.price) : "Rs 500"}
                    </span>
                  </div>

                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${heroDraw ? Math.max(4, progressOf(heroDraw).percent) : 34}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[11px] tabular-nums text-slate-500">
                    {heroDraw
                      ? `${progressOf(heroDraw).percent}% sold · ${progressOf(heroDraw).remaining.toLocaleString("en-PK")} tickets left`
                      : "Illustrative ticket · open draws appear here"}
                  </p>
                </div>
              </TicketCard>
            </Lift>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              <StatTile
                label="Tickets sold"
                value={<Counter to={ticketsSold} />}
                hint="across every open draw"
                className="bg-white/70"
              />
              <StatTile
                label="Draws open"
                value={draws.length.toString().padStart(2, "0")}
                hint="each prize fully funded"
                accent
                className="bg-white/70"
              />
            </div>
          </div>
        </div>

        <div className="relative border-t border-slate-900/5 bg-white/50 py-3 backdrop-blur">
          <Marquee items={ticker} />
        </div>
      </section>

      {/* ------------------------------------------------------- Open draws */}
      <section className="relative border-b border-slate-900/5 bg-white">
        <div className={`${CONTAINER} py-16 md:py-20`}>
          <Reveal>
            <SectionHead
              index="01"
              kicker="Open draws"
              title="Pick a prize. Count the odds."
              body="Every card below is a live raffle with the prize already funded. The price is for one ticket — buy more tickets for more chances in the same draw."
              action={
                <Cta href="/raffles" variant="ghost" arrow>
                  All draws
                </Cta>
              }
            />
          </Reveal>

          {draws.length === 1 ? (
            <Reveal delay={80}>
              <FeaturedDraw draw={draws[0]} />
            </Reveal>
          ) : draws.length > 1 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {draws.map((draw, i) => (
                <Reveal key={draw.id} delay={i * 70}>
                  <DrawCard draw={draw} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal delay={80}>
              <div className={`${PANEL} mt-12 flex flex-col items-center px-6 py-16 text-center`}>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-600/15 bg-emerald-50 text-emerald-600">
                  <Ticket className="h-6 w-6" />
                </span>
                <p className="mt-4 font-display text-lg font-semibold text-slate-900">No draws are open this minute</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  New prizes are listed weekly. The winners gallery shows what has already been won and delivered.
                </p>
                <Cta href="/winners" variant="ghost" arrow className="mt-6">
                  See past winners
                </Cta>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* --------------------------------------------------- How a draw runs */}
      <section id="how-it-works" className="relative scroll-mt-24 overflow-hidden border-b border-slate-900/5">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.09),transparent_58%)]" />
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="02"
              kicker="The mechanics"
              title="How a draw actually runs"
              body="Four steps, no moderator approval queue and no quiet rule changes halfway through. The target is published before the first ticket is sold."
            />
          </Reveal>

          <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div
              aria-hidden
              className="absolute left-7 right-0 top-7 hidden h-px bg-gradient-to-r from-emerald-500/50 via-emerald-500/20 to-transparent lg:block"
            />
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 90}>
                <div className="relative">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-600/15 bg-white text-emerald-700 shadow-[0_18px_40px_-28px_rgba(4,47,34,0.7)]">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <GhostNumeral className="mt-5">{`0${i + 1}`}</GhostNumeral>
                  <div className="mt-3 flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-slate-900">{step.title}</h3>
                    <span className="rounded-full border border-slate-900/10 bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {step.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Payments */}
      <section className="relative border-b border-slate-900/5 bg-white">
        <div className={`${CONTAINER} grid gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center`}>
          <Reveal>
            <div>
              <Kicker>Checkout</Kicker>
              <h2 className="mt-3 font-display text-[1.75rem] font-semibold leading-[1.06] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
                Pay the way you <span className="text-emerald-600">already do</span>
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
                No foreign wallet and no currency conversion. Checkout is hosted by our Pakistani payment partner and
                settles in rupees, so the amount you approve is the amount you pay.
              </p>

              <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
                <div className={`${PANEL} flex h-[68px] items-center justify-center px-3`}>
                  <img src="/assets/easypaisa-logo.png" alt="Easypaisa" className="h-7 w-auto object-contain" />
                </div>
                <div className={`${PANEL} flex h-[68px] items-center justify-center px-3`}>
                  <img src="/assets/jazzcash-logo.png" alt="JazzCash" className="h-7 w-auto object-contain" />
                </div>
                <div className={`${PANEL} flex h-[68px] flex-col items-center justify-center gap-1`}>
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Card</span>
                </div>
              </div>

              <div className="mt-9 space-y-5">
                {PAY_NOTES.map((note) => (
                  <div key={note.title} className="flex gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-600/15 bg-emerald-50 text-emerald-700">
                      <note.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{note.title}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{note.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[44px] bg-gradient-to-tr from-emerald-200/40 via-transparent to-teal-100/50 blur-2xl"
              />
              <div className={INK_PANEL}>
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
                  <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                    <LiveDot /> Screen recording
                  </span>
                  <span className="font-mono text-[10px] text-emerald-100/50">1210 × 1712</span>
                </div>
                <div className="p-5">
                  <div
                    className="mx-auto w-full max-w-[288px] overflow-hidden rounded-2xl bg-black ring-1 ring-white/10"
                    style={{ aspectRatio: "1210 / 1712" }}
                  >
                    <Video_Mockup />
                  </div>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="font-display text-base font-semibold text-white">
                      A real ticket purchase, start to finish
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-100/60">
                      Wallet payment, confirmation and ticket issue — recorded in the live checkout, not a mock-up.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- Trust */}
      <section className="relative overflow-hidden bg-[#07130f] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-drift" />
          <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl animate-drift [animation-delay:-8s]" />
          <div className="absolute inset-0 grid-veil opacity-[0.18]" />
        </div>
        <div className={`${CONTAINER} relative py-16 md:py-24`}>
          <Reveal>
            <div className="max-w-2xl">
              <Kicker className="text-emerald-400">Trust, in writing</Kicker>
              <h2 className="mt-3 font-display text-[1.75rem] font-semibold leading-[1.06] tracking-tight sm:text-4xl lg:text-[2.6rem]">
                The rules are boring <span className="text-emerald-400">on purpose</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-emerald-50/60">
                Funded prizes, a public randomiser and a delivery promise that ships on us. Nothing about the outcome
                depends on how early you bought.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-3">
            {TRUST.map((item, i) => (
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

          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { value: <Counter to={2.5} decimals={1} prefix="Rs " suffix="M+" />, label: "Paid to winners" },
              { value: <Counter to={50} suffix="k+" />, label: "Registered players" },
              { value: "100%", label: "Prizes funded first" },
              { value: "Rs 0", label: "Hidden charges" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#07130f] px-5 py-6">
                <p className="font-mono text-2xl font-semibold tabular-nums text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100/45">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Winners */}
      <section className="relative border-b border-slate-900/5 bg-[#f8f9f6]">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="03"
              kicker="Proof"
              title="Played and won"
              body="Recent winners, in their own words — with the draw video still online for anyone to re-watch."
              action={
                <Cta href="/winners" variant="ghost" arrow>
                  All winners
                </Cta>
              }
            />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {WINNERS.map((winner, i) => (
              <Reveal key={winner.name} delay={i * 90}>
                <div className={`${PANEL} flex h-full flex-col p-6`}>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                    &ldquo;{winner.quote}&rdquo;
                  </blockquote>
                  <div className="mt-5 flex items-center gap-3 border-t border-slate-900/5 pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/10 font-display text-sm font-semibold text-emerald-800">
                      {winner.initial}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{winner.name}</p>
                      <p className="text-[11px] text-slate-500">{winner.detail}</p>
                    </div>
                    <BadgeCheck className="ml-auto h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- FAQ */}
      <section className="bg-white">
        <div className={`${CONTAINER} py-16 md:py-24`}>
          <Reveal>
            <SectionHead
              index="04"
              kicker="Questions"
              title="Asked before every first ticket"
              body="If something here is still unclear, the support team answers on WhatsApp during business hours."
              align="center"
              className="max-w-3xl"
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
                  Draw rules, the refund policy and how we handle your data live on our legal pages.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {[
                  { href: "/terms", label: "Terms" },
                  { href: "/refund", label: "Refunds" },
                  { href: "/privacy", label: "Privacy" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
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

      {/* ------------------------------------------------------------- CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-[#052e23] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/25 blur-3xl animate-drift" />
          <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-teal-300/15 blur-3xl animate-drift [animation-delay:-9s]" />
        </div>
        <div className={`${CONTAINER} relative flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center md:py-16`}>
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
              <Ticket className="h-3.5 w-3.5" /> Next draw closes when the pool sells out
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-4xl">
              Take a ticket — the draw does the rest.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50/70 sm:text-base">
              Browse the open draws, pay with the wallet already on your phone, and keep the live broadcast open.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Cta href="/raffles" variant="light" arrow className="w-full border-white/30 bg-white text-emerald-900 hover:bg-emerald-50 sm:w-auto">
              Browse open draws
            </Cta>
            <Cta href="/merchants" variant="light" className="w-full sm:w-auto">
              Merchant Connect
            </Cta>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * One live draw gets a full-width feature panel instead of a lonely third of a grid — that is the
 * common case when the calendar is between launches.
 */
function FeaturedDraw({ draw }: { draw: LiveDraw }) {
  const image = draw.image || draw.gallery?.[0] || "/placeholder.svg"
  const { sold, target, percent, remaining } = progressOf(draw)

  return (
    <Lift className="mt-12">
      <Link
        href={`/raffles/${draw.id}`}
        className="group grid overflow-hidden rounded-[28px] border border-slate-900/10 bg-white shadow-[0_30px_80px_-60px_rgba(4,47,34,0.7)] transition hover:border-emerald-300 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      >
        <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden border-b border-slate-900/5 bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 p-8 md:border-b-0 md:border-r">
          <div aria-hidden className="absolute inset-0 grid-veil opacity-60" />
          <img
            src={image}
            alt={draw.title}
            className="relative z-10 max-h-[300px] w-full object-contain drop-shadow-[0_20px_35px_rgba(2,44,34,0.16)] transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-5 top-5 z-10 rounded-full border border-slate-900/10 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
            {draw.category}
          </span>
        </div>
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-9">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <LiveDot /> Live draw · featured
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-emerald-700 sm:text-2xl">
              {draw.title}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Entry</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-emerald-700">
                {formatCurrency(draw.price)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tickets left</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">
                {remaining.toLocaleString("en-PK")}
              </p>
              <p className="text-[11px] text-slate-500">of {target.toLocaleString("en-PK")}</p>
            </div>
          </div>

          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${Math.max(4, percent)}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-[11px] tabular-nums text-slate-500">
              {sold.toLocaleString("en-PK")} / {target.toLocaleString("en-PK")} sold · draw runs when the pool closes
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-emerald-600">
            Enter this draw <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Lift>
  )
}

/** A prize card: photo, entry price and how far the ticket pool has sold. */
function DrawCard({ draw }: { draw: LiveDraw }) {
  const image = draw.image || draw.gallery?.[0] || "/placeholder.svg"
  const { sold, target, percent, remaining } = progressOf(draw)

  return (
    <Lift className="h-full">
      <Link
        href={`/raffles/${draw.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-900/10 bg-white shadow-[0_24px_60px_-52px_rgba(4,47,34,0.7)] transition hover:border-emerald-300"
      >
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-slate-900/5 bg-gradient-to-br from-slate-50 via-white to-emerald-50/50 p-5">
          <div aria-hidden className="absolute inset-0 grid-veil opacity-50" />
          <img
            src={image}
            alt={draw.title}
            loading="lazy"
            className="relative z-10 h-full w-full object-contain drop-shadow-[0_16px_26px_rgba(2,44,34,0.14)] transition duration-500 group-hover:scale-[1.04]"
          />
          <span className="absolute left-4 top-4 z-10 rounded-full border border-slate-900/10 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 backdrop-blur">
            {draw.category}
          </span>
          {percent >= 70 && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow-sm">
              {remaining} left
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-slate-900 transition group-hover:text-emerald-700">
            {draw.title}
          </h3>

          <div className="mt-auto pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Entry</span>
              <span className="font-mono text-base font-semibold tabular-nums text-emerald-700">
                {formatCurrency(draw.price)}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${Math.max(3, percent)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[11px] tabular-nums text-slate-500">
              <span>
                {sold.toLocaleString("en-PK")} / {target.toLocaleString("en-PK")} sold
              </span>
              <span className="inline-flex items-center gap-1 font-sans font-semibold text-slate-700 transition group-hover:text-emerald-700">
                Enter <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Lift>
  )
}
