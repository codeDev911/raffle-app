import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Eye,
  Gift,
  Lock,
  ShieldCheck,
  Star,
  Store,
  Ticket,
  Trophy,
  Truck,
  Zap,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import Video_Mockup from "@/components/Video_Mockup"

export const metadata: Metadata = {
  title: "PakRaffle - Win Big with Just a Few Coins!",
  description:
    "Join Pakistan's most exciting online lucky draw platform. Win iPhones, gadgets, and other amazing prizes by entering with just a few coins!",
  keywords: ["PakRaffle", "lucky draw Pakistan", "online raffle", "win iPhone", "Pak raffle coins"],
  robots: "index, follow",
  openGraph: {
    title: "PakRaffle - Win Big with Just a Few Coins!",
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
    title: "PakRaffle - Win Big with Just a Few Coins!",
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

/**
 * Same shell as the Merchant Connect pages: white panels on a slate canvas, 1px slate borders,
 * emerald for anything operational, monospace tabular figures for anything numeric. Kept local
 * to the marketing page so it does not drag the merchant console kit into the public bundle.
 */
const PANEL = "rounded-2xl border border-slate-200 bg-white shadow-sm"
const BTN_PRIMARY =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-500"
const BTN_SECONDARY =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
const ICON_TILE =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700"

const STEPS = [
  {
    icon: Gift,
    title: "Pick the prize",
    body: "Every draw publishes the exact prize, its market value and the number of tickets on sale. No mystery boxes.",
  },
  {
    icon: Ticket,
    title: "Buy your tickets",
    body: "One ticket or ten — more tickets mean more chances in that same draw, at the same listed price.",
  },
  {
    icon: CreditCard,
    title: "Pay in seconds",
    body: "Easypaisa, JazzCash or any debit and credit card on a hosted, encrypted checkout page.",
  },
  {
    icon: Trophy,
    title: "Wait for the last ticket",
    body: "The draw runs live once the target is sold out. The winner is called, texted and messaged within two hours.",
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

export default async function LandingPage() {
  const draws = await getLiveDraws()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600">
            PakRaffle <span className="text-slate-400">/</span> Verified lucky draws, Pakistan
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            A few coins. Real prizes.
            <span className="mt-1 block text-emerald-600">Drawn in public.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            iPhones, motorbikes, laptops and cash — funded before a single ticket is sold. Pick a draw, buy a
            ticket with Easypaisa, JazzCash or any card, and watch the winner get picked live.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/raffles" className="w-full sm:w-auto">
              <span className={`${BTN_PRIMARY} w-full sm:w-auto`}>
                Browse open draws <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/winners" className="w-full sm:w-auto">
              <span className={`${BTN_SECONDARY} w-full sm:w-auto`}>
                <Trophy className="h-4 w-4 text-amber-500" /> Recent winners
              </span>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            {[
              "Draw runs only when every ticket is sold",
              "Free insured delivery",
              "PTA-approved, sealed prizes",
            ].map((chip) => (
              <span key={chip} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                {chip}
              </span>
            ))}
          </div>

          <p className="mt-4 text-sm text-slate-500">
            <span className="font-mono font-semibold tabular-nums text-slate-800">Rs 2.5M+</span> paid out
            <Sep />
            50,000+ players
            <Sep />
            every draw streamed live
          </p>

          {/* Mechanics, not adjectives */}
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className={`${PANEL} p-5`}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Rule</p>
              <p className="mt-2 text-sm text-slate-800">
                Tickets sold out <span className="font-mono tabular-nums text-emerald-600">→</span> draw runs
              </p>
              <p className="mt-1 text-xs text-slate-500">No early draws, no skipped weeks</p>
            </div>
            <div className={`${PANEL} p-5`}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Randomiser</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> CSPRNG, streamed live
              </p>
              <p className="mt-1 text-xs text-slate-500">YouTube &amp; Facebook broadcast</p>
            </div>
            <div className={`${PANEL} border-emerald-200 p-5`}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Your ticket</p>
              <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-emerald-600">PKR-7Q4K-21</p>
              <p className="mt-1 text-xs text-slate-500">One ticket · one entry · same odds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Open draws */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Open draws</h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Live raffles with the prize already funded. The price on each card is per ticket — buy more tickets
                for more chances in the same draw.
              </p>
            </div>
            <Link
              href="/raffles"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
            >
              All draws <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {draws.length === 1 ? (
            <FeaturedDraw draw={draws[0]} />
          ) : draws.length > 1 ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {draws.map((draw: LiveDraw) => (
                <DrawCard key={draw.id} draw={draw} />
              ))}
            </div>
          ) : (
            <div className={`${PANEL} mt-10 px-6 py-14 text-center`}>
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                <Ticket className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-medium text-slate-800">No draws are open this minute</p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                New prizes are listed weekly. The winners gallery shows what has already been won and delivered.
              </p>
              <Link href="/winners" className={`${BTN_SECONDARY} mt-5`}>
                See past winners <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How a draw runs</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Four steps, no account gymnastics and no waiting on a moderator to confirm you.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className={`${PANEL} p-5`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-emerald-600">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-xs tabular-nums text-slate-500">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payments */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Pay the way you already do</h2>
            <p className="mt-2 max-w-xl text-slate-600">
              No foreign wallet and no currency conversion. Checkout is hosted by our Pakistani payment partner and
              settles in rupees, so the amount you approve is the amount you pay.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className={`${PANEL} flex h-16 items-center justify-center px-3`}>
                <img src="/assets/easypaisa-logo.png" alt="Easypaisa" className="h-6 w-auto object-contain" />
              </div>
              <div className={`${PANEL} flex h-16 items-center justify-center px-3`}>
                <img src="/assets/jazzcash-logo.png" alt="JazzCash" className="h-6 w-auto object-contain" />
              </div>
              <div className={`${PANEL} flex h-16 flex-col items-center justify-center gap-1`}>
                <CreditCard className="h-4 w-4 text-slate-500" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Card</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Debit and credit cards are accepted through the same checkout, secured by the gateway.
            </p>

            <div className="mt-8 space-y-4">
              {PAY_NOTES.map((note) => (
                <div key={note.title} className="flex gap-3">
                  <span className={ICON_TILE}>
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

          <div className={`${PANEL} flex flex-col self-start p-4`}>
            {/* The walkthrough is a portrait screen recording, so it gets a phone-shaped stage. */}
            <div
              className="mx-auto w-full max-w-[300px] overflow-hidden rounded-xl bg-slate-900"
              style={{ aspectRatio: "1210 / 1712" }}
            >
              <Video_Mockup />
            </div>
            <div className="mt-4 border-t border-slate-200 px-1 pt-3">
              <p className="text-sm font-semibold text-slate-900">A real ticket purchase, start to finish</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Wallet payment, confirmation and ticket issue — recorded in the live checkout, not a mock-up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust + winners */}
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why the draw is worth trusting</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            The rules are boring on purpose: funded prizes, a public randomiser and a delivery promise in writing.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TRUST.map((item) => (
              <div key={item.title} className="flex gap-4">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Played and won</h3>
              <p className="mt-1 text-sm text-slate-600">Recent winners, in their own words.</p>
            </div>
            <Link
              href="/winners"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
            >
              All winners <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {WINNERS.map((winner) => (
              <div key={winner.name} className={`${PANEL} flex flex-col p-5`}>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                  &ldquo;{winner.quote}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700">
                    {winner.initial}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{winner.name}</p>
                    <p className="text-[11px] text-slate-500">{winner.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-16 sm:px-6 md:pb-20 md:pt-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Questions</h2>
        <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {FAQ.map((item) => (
            <details key={item.q} data-faq>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200" />
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Legal */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:pb-20">
        <div className={`${PANEL} p-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">The fine print, in writing</h2>
              <p className="mt-1 text-sm text-slate-600">
                Draw rules, the refund policy and how we handle your data live on our legal pages.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <Link
                href="/terms"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Terms &amp; conditions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/refund"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Refund policy <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Privacy <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">Take a ticket — the draw does the rest.</h2>
            <p className="mt-1 text-sm text-slate-600">
              Browse the open draws, pay with the wallet already on your phone, and keep the live broadcast open.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/raffles" className={BTN_PRIMARY}>
              Browse open draws <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/merchants" className={BTN_SECONDARY}>
              <Store className="h-4 w-4" /> Merchant Connect
            </Link>
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
  const sold = draw.currentEntries || 0
  const target = draw.totalEntries || 0
  const percent = target > 0 ? Math.min(100, Math.round((sold / target) * 100)) : 0
  const remaining = Math.max(0, target - sold)

  return (
    <Link
      href={`/raffles/${draw.id}`}
      className="group mt-10 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div className="relative flex min-h-[240px] items-center justify-center border-b border-slate-100 bg-slate-50 p-6 md:border-b-0 md:border-r">
        <img
          src={image}
          alt={draw.title}
          className="max-h-[280px] w-full object-contain transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700">
          {draw.category}
        </span>
      </div>
      <div className="flex flex-col justify-center gap-5 p-6 sm:p-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Live draw</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 transition group-hover:text-emerald-700 sm:text-2xl">
            {draw.title}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Entry</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-emerald-700">
              {formatCurrency(draw.price)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Tickets left</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">
              {remaining.toLocaleString("en-PK")}
            </p>
            <p className="text-[11px] text-slate-500">of {target.toLocaleString("en-PK")}</p>
          </div>
        </div>

        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 font-mono text-[11px] tabular-nums text-slate-500">
            {sold.toLocaleString("en-PK")} / {target.toLocaleString("en-PK")} tickets sold · draw runs when the pool
            closes
          </p>
        </div>

        <span className="inline-flex min-h-[40px] w-fit items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition group-hover:bg-emerald-500">
          Enter this draw <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

/** A prize card: photo, entry price and how far the ticket pool has sold. */
function DrawCard({ draw }: { draw: LiveDraw }) {
  const image = draw.image || draw.gallery?.[0] || "/placeholder.svg"
  const sold = draw.currentEntries || 0
  const target = draw.totalEntries || 0
  const percent = target > 0 ? Math.min(100, Math.round((sold / target) * 100)) : 0

  return (
    <Link
      href={`/raffles/${draw.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-50 p-4">
        <img
          src={image}
          alt={draw.title}
          loading="lazy"
          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700 backdrop-blur">
          {draw.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition group-hover:text-emerald-700">
          {draw.title}
        </h3>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Entry</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-emerald-700">
              {formatCurrency(draw.price)}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 font-mono text-[11px] tabular-nums text-slate-500">
            {sold.toLocaleString("en-PK")} / {target.toLocaleString("en-PK")} tickets sold
          </p>
        </div>
      </div>
    </Link>
  )
}

function Sep() {
  return <span className="select-none px-1.5 text-slate-300">·</span>
}
