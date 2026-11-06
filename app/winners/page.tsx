import Image from "next/image"
import Link from "next/link"
import {
  BadgeCheck,
  Banknote,
  CalendarClock,
  ClipboardCheck,
  MapPin,
  MessageCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
  Trophy,
  Truck,
  UserCheck,
  Video,
} from "lucide-react"
import {
  CheckList,
  CONTAINER,
  Cta,
  FaqList,
  FlowRail,
  INK_PANEL,
  JsonLd,
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
import { formatCurrency, formatDate } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

/**
 * The hall of fame, rendered from the Winner table only.
 *
 * This page previously shipped a hard-coded list of six invented winners ("2,847+ winners",
 * "Rs 45.2M delivered", unsplash stock photos, written-from-scratch testimonials) whenever the
 * database had nothing to show. A page whose entire job is proving that real people won is the worst
 * possible place for made-up proof, so nothing here is decorative: every name, city, figure and quote
 * is a row, and when there are no rows the page says so and points at the draws running right now.
 */

export const revalidate = 300

const WHATSAPP_INTL = "923377155722"
const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbB0CzJ8fewyBXpXy210"

const STANDARDS = [
  "Pool locked at 100% sold",
  "Uncut live broadcast",
  "CNIC matched before handover",
  "Rs 0 fees for winners",
  "Insured doorstep delivery",
  "Registration documents on camera",
  "No staff entries",
  "Certificate issued per draw",
]

const PROOF_PASSES = [
  { icon: Target, label: "Ticket pool", value: "Locked at 100% sold" },
  { icon: Sparkles, label: "Selection", value: "Random, drawn on camera" },
  { icon: Video, label: "Broadcast", value: "Live, no cuts" },
  { icon: UserCheck, label: "Identity", value: "CNIC matched first" },
  { icon: Truck, label: "Handover", value: "Insured · Rs 0 to winner" },
] as const

type WinnerRow = {
  id: string
  name: string
  city: string
  prizeTitle: string
  prizeValue: number
  drawnAt: Date
  deliveredAt: Date | null
  testimonial: string | null
  proofImage: string | null
  raffleId: string | null
  verified: boolean
  featured: boolean
}

type LiveDraw = {
  id: string
  title: string
  image: string | null
  price: number
  realPrice: number
  currentEntries: number
  totalEntries: number
}

/** Reads never hard-fail the page: a Neon hiccup should show an empty hall, not a 500. */
async function loadWinners(): Promise<WinnerRow[]> {
  try {
    const rows = await prisma.winner.findMany({
      include: {
        user: { select: { name: true, city: true } },
        raffle: { select: { id: true, title: true, image: true, realPrice: true, price: true } },
      },
      orderBy: { drawnAt: "desc" },
    })

    return rows.map((w: any) => ({
      id: String(w.id),
      name: w.user?.name?.trim() || "Verified winner",
      city: w.user?.city?.trim() || "Pakistan",
      prizeTitle: w.raffle?.title?.trim() || "Lucky draw prize",
      // Stored in paisa everywhere, same as ticket prices, so it goes through the house formatter.
      prizeValue: w.prizeValue || w.raffle?.realPrice || 0,
      drawnAt: new Date(w.drawnAt),
      deliveredAt: w.deliveredAt ? new Date(w.deliveredAt) : null,
      testimonial: w.testimonial?.trim() ? String(w.testimonial).trim() : null,
      proofImage: w.proofImage?.trim() ? String(w.proofImage).trim() : (w.raffle?.image ?? null),
      raffleId: w.raffle?.id ? String(w.raffle.id) : null,
      verified: Boolean(w.verified),
      featured: Boolean(w.featured),
    }))
  } catch (err) {
    console.error("winners: failed to load winner rows:", err)
    return []
  }
}

async function loadLiveDraws(): Promise<LiveDraw[]> {
  try {
    const rows = await prisma.raffle.findMany({
      where: { status: "ACTIVE" },
      orderBy: { currentEntries: "desc" },
      take: 3,
      select: { id: true, title: true, image: true, price: true, realPrice: true, currentEntries: true, totalEntries: true },
    })
    return rows.map((r: any) => ({
      id: String(r.id),
      title: String(r.title),
      image: r.image ?? null,
      price: Number(r.price) || 0,
      realPrice: Number(r.realPrice) || 0,
      currentEntries: Number(r.currentEntries) || 0,
      totalEntries: Number(r.totalEntries) || 0,
    }))
  } catch (err) {
    console.error("winners: failed to load active raffles:", err)
    return []
  }
}

export const metadata = {
  title: "Verified Winners & Live Draw Results | PakRaffle",
  description:
    "The PakRaffle hall of fame: every winner is drawn live once the ticket pool is 100% sold, verified against their CNIC, and handed the prize with registration documents at Rs 0 cost. See the handovers, or check the draws running right now.",
  keywords: [
    "PakRaffle winners",
    "verified lucky draw winners Pakistan",
    "live draw results",
    "prize handover proof",
    "lucky draw certificate",
    "transparent raffle winners list",
  ],
  robots: "index, follow",
  alternates: { canonical: "https://pakraffle.com/winners" },
  openGraph: {
    title: "Verified Winners - PakRaffle",
    description:
      "Real handovers, documented. Every PakRaffle winner is drawn live at 100% pool, identity-verified and delivered free across Pakistan.",
    url: "https://pakraffle.com/winners",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Winners - PakRaffle",
    description: "Drawn live at 100% pool. CNIC-verified. Rs 0 to collect. The receipts are on this page.",
  },
}

const pkr = (paisa: number) => formatCurrency(paisa)

function soldPercent(current: number, total: number) {
  if (!total) return 0
  return Math.min(100, Math.round((current / total) * 100))
}

/** Prize photo when we have one, a branded tile when we do not — never a stock image of someone else's prize. */
function PrizeImage({ src, alt, ratio = "aspect-[16/10]" }: { src: string | null; alt: string; ratio?: string }) {
  if (src) {
    return (
      <div className={`relative w-full overflow-hidden bg-slate-100 ${ratio}`}>
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px" className="object-cover" />
      </div>
    )
  }
  return (
    <div className={`relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 ${ratio}`}>
      <div aria-hidden className="absolute inset-0 grid-veil opacity-50" />
      <Trophy className="relative h-10 w-10 text-white/70" strokeWidth={1.4} />
    </div>
  )
}

function WinnerBadge({ winner }: { winner: WinnerRow }) {
  return (
    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur">
        <CalendarClock className="h-3 w-3 text-slate-400" />
        {formatDate(winner.drawnAt)}
      </span>
      {winner.verified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
          <BadgeCheck className="h-3 w-3" strokeWidth={2.2} />
          CNIC verified
        </span>
      )}
    </div>
  )
}

export default async function WinnersPage() {
  const [winners, liveDraws] = await Promise.all([loadWinners(), loadLiveDraws()])

  const totalDelivered = winners.reduce((sum, w) => sum + (w.prizeValue || 0), 0)
  const cities = Array.from(new Set(winners.map((w) => w.city).filter(Boolean)))
  const documented = winners.filter((w) => w.proofImage).length

  // Newest handover gets the spotlight; everything else is the ledger grid.
  const spotlight = winners[0] ?? null
  const rest = winners.slice(1)

  return (
    <div className={SHELL}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Winners", item: "https://pakraffle.com/winners" },
            ],
          },
          ...(winners.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  name: "PakRaffle verified winners",
                  numberOfItems: winners.length,
                  itemListElement: winners.slice(0, 20).map((w, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    name: `${w.name} — ${w.prizeTitle}`,
                    url: w.raffleId ? `https://pakraffle.com/raffles/${w.raffleId}/winner` : "https://pakraffle.com/winners",
                  })),
                },
              ]
            : []),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
        ]}
      />

      {/* ------------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="amber" />
        <div className={`${CONTAINER} relative pb-12 pt-20 sm:pt-24`}>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Pill className="border-amber-600/20 bg-amber-500/10 text-amber-900">
                  <LiveDot />
                  {winners.length ? `${winners.length} handover${winners.length === 1 ? "" : "s"} on record` : "Ledger open · first draw pending"}
                </Pill>
                <Pill>
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Drawn live, never on a fixed date
                </Pill>
              </div>

              <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.035em] text-slate-900 sm:text-[3.4rem]">
                Names, cities,
                <span className="block bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                  and the receipt.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
                A draw only happens when the ticket pool is 100% sold. The selection is broadcast live without camera
                cuts, the winner&apos;s CNIC is matched before anything is handed over, and the prize leaves our office
                insured — at zero cost to the person who won it.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Cta href="/raffles" arrow className="w-full sm:w-auto">
                  <Trophy className="h-4 w-4" />
                  {winners.length ? "Enter a live draw" : "See what is on the board"}
                </Cta>
                <Cta href="/knowledge-base/how-a-pakraffle-draw-works" variant="ghost" className="w-full sm:w-auto">
                  <ClipboardCheck className="h-4 w-4" />
                  How the draw actually works
                </Cta>
              </div>
            </div>

            {/* The checks a sceptic runs first, as a numbered document strip. */}
            <div className="overflow-hidden rounded-3xl border border-slate-900/10 bg-white/80 backdrop-blur">
              <div className="grid gap-px bg-slate-900/10 sm:grid-cols-2">
                {PROOF_PASSES.map((row) => (
                  <div key={row.label} className="bg-[#fdfcf8] px-4 py-4">
                    <row.icon className="h-4 w-4 text-emerald-600" />
                    <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-400">{row.label}</p>
                    <p className="mt-1 text-[12px] font-semibold leading-snug text-slate-900">{row.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-slate-900/15 bg-white/70 px-4 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Winner pays</p>
                <p className="inline-flex items-center gap-1.5 font-mono text-[11.5px] font-semibold tabular-nums text-emerald-700">
                  <Banknote className="h-3 w-3" />
                  Rs 0 · entry, tax, shipping
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Numbers */}
      {winners.length > 0 && (
        <section className={`${CONTAINER} pb-2 pt-8`}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Winners crowned"
              value={<Counter to={winners.length} />}
              hint="Rows in the draw ledger"
              accent
            />
            <StatTile
              label="Prize value handed over"
              value={<Counter to={Math.round(totalDelivered / 100)} prefix="Rs " />}
              hint={`${winners.length} completed draw${winners.length === 1 ? "" : "s"}`}
            />
            <StatTile
              label="Cities reached"
              value={<Counter to={cities.length} />}
              hint={cities.length ? cities.slice(0, 3).join(" · ") : "All provinces served"}
            />
            <StatTile
              label="Handovers photographed"
              value={<Counter to={documented} suffix={`/${winners.length}`} />}
              hint="Published only with consent"
            />
          </div>
        </section>
      )}

      <div className="border-y border-slate-900/5 bg-white/60 py-3">
        <Marquee items={STANDARDS} speed="58s" />
      </div>

      {/* ------------------------------------------------------------- Spotlight */}
      {spotlight && (
        <section className={`${CONTAINER} py-14 sm:py-16`}>
          <SectionHead
            index="01"
            kicker="Most recent handover"
            title="The last name added to the ledger."
            body="Photos, city, prize and date come straight from the draw record — nothing here is written afterwards."
          />

          <Reveal className="mt-8">
            <TicketCard className="grid overflow-hidden lg:grid-cols-[1.05fr_1fr]">
              <div className="relative">
                <PrizeImage src={spotlight.proofImage} alt={`${spotlight.name} with ${spotlight.prizeTitle}`} ratio="aspect-[16/10] lg:h-full lg:aspect-auto" />
                <WinnerBadge winner={spotlight} />
              </div>

              <div className="flex flex-col justify-between gap-5 p-6 sm:p-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-700">Draw completed</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[1.9rem]">
                    {spotlight.prizeTitle}
                  </h3>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/10 font-mono text-[12px] font-bold text-emerald-700">
                        {spotlight.name.slice(0, 1).toUpperCase()}
                      </span>
                      {spotlight.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {spotlight.city}
                    </span>
                    <span className="font-mono text-[12px] tabular-nums text-slate-500">{pkr(spotlight.prizeValue)}</span>
                  </div>

                  {spotlight.testimonial && (
                    <blockquote className="mt-5 rounded-2xl border border-emerald-600/15 bg-emerald-50/60 p-4">
                      <p className="text-[13.5px] leading-relaxed text-emerald-950">&ldquo;{spotlight.testimonial}&rdquo;</p>
                      <footer className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-700/80">
                        {spotlight.name} · {spotlight.city}
                      </footer>
                    </blockquote>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-900/10 pt-4">
                  {spotlight.raffleId ? (
                    <Cta href={`/raffles/${spotlight.raffleId}/winner`} variant="ink" arrow>
                      <ClipboardCheck className="h-4 w-4" />
                      Draw certificate
                    </Cta>
                  ) : (
                    <Cta href="/raffles" variant="ink" arrow>
                      <Trophy className="h-4 w-4" />
                      Browse draws
                    </Cta>
                  )}
                  <p className="text-[11.5px] text-slate-500">
                    {spotlight.deliveredAt ? `Delivered ${formatDate(spotlight.deliveredAt)}` : "Handover scheduled with the winner"}
                  </p>
                </div>
              </div>
            </TicketCard>
          </Reveal>
        </section>
      )}

      {/* ---------------------------------------------------------- Ledger + empty */}
      {winners.length > 0 ? (
        <section className={`${CONTAINER} pb-16 pt-4`}>
          <SectionHead index="02" kicker="Every other handover" title="The full ledger." />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((winner, i) => (
              <Reveal key={winner.id} delay={Math.min(i, 6) * 60}>
                <Lift className="h-full">
                  <TicketCard className="flex h-full flex-col border-slate-900/10 transition-colors hover:border-emerald-500/30">
                    <div className="relative">
                      <PrizeImage src={winner.proofImage} alt={`${winner.name} with ${winner.prizeTitle}`} />
                      <WinnerBadge winner={winner} />
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-[17px] font-semibold leading-snug tracking-tight text-slate-900">
                            {winner.prizeTitle}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-500">
                            <span className="font-semibold text-slate-700">{winner.name}</span>
                            <span aria-hidden className="text-slate-300">
                              ·
                            </span>
                            <MapPin className="h-3 w-3" />
                            {winner.city}
                          </p>
                        </div>
                        <p className="shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums text-emerald-700">
                          {pkr(winner.prizeValue)}
                        </p>
                      </div>

                      {winner.testimonial ? (
                        <p className="line-clamp-3 text-[12.5px] leading-relaxed text-slate-600">
                          &ldquo;{winner.testimonial}&rdquo;
                        </p>
                      ) : (
                        <p className="text-[12.5px] leading-relaxed text-slate-400">
                          {winner.deliveredAt ? `Delivered ${formatDate(winner.deliveredAt)} · winner chose not to publish a quote.` : "Handover documented by the draw team."}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-900/10 pt-3.5">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                          <Ticket className="h-3 w-3" />
                          Draw {formatDate(winner.drawnAt)}
                        </span>
                        {winner.raffleId && (
                          <Link
                            href={`/raffles/${winner.raffleId}/winner`}
                            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700 transition hover:text-emerald-800"
                          >
                            Certificate
                            <span aria-hidden>&rarr;</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </TicketCard>
                </Lift>
              </Reveal>
            ))}
          </div>
        </section>
      ) : (
        <section className={`${CONTAINER} py-14 sm:py-16`}>
          <Reveal>
            <div className={`${PANEL} p-6 sm:p-9`}>
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-600/15 bg-gradient-to-br from-emerald-50 to-white text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                    <Trophy className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <h2 className="mt-5 font-display text-[1.7rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
                    No completed draws on the ledger yet.
                  </h2>
                  <p className="mt-4 text-[14.5px] leading-relaxed text-slate-600">
                    We would rather show you an honest blank than a manufactured winner. This page fills itself the
                    moment a pool reaches 100% sold and the draw is broadcast: the name, the city, the prize and the
                    handover record appear here automatically, with a certificate you can open.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Cta href="/raffles" arrow className="w-full sm:w-auto">
                      <Radio className="h-4 w-4" />
                      Watch the pools fill live
                    </Cta>
                    <Cta href={WHATSAPP_CHANNEL_URL} variant="ghost" className="w-full sm:w-auto">
                      <MessageCircle className="h-4 w-4" />
                      Get draw alerts
                    </Cta>
                  </div>
                </div>

                {liveDraws.length > 0 ? (
                  <div className="space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">On the board right now</p>
                    {liveDraws.map((draw) => {
                      const percent = soldPercent(draw.currentEntries, draw.totalEntries)
                      return (
                        <Link
                          key={draw.id}
                          href={`/raffles/${draw.id}`}
                          className="group flex items-center gap-4 rounded-2xl border border-slate-900/10 bg-white/80 p-3 backdrop-blur transition hover:border-emerald-500/40 hover:bg-white"
                        >
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {draw.image ? (
                              <Image src={draw.image} alt={draw.title} fill sizes="96px" className="object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-800">
                                <Trophy className="h-4 w-4 text-white/80" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-semibold text-slate-900">{draw.title}</p>
                            <p className="mt-0.5 font-mono text-[11px] tabular-nums text-slate-500">
                              {draw.currentEntries.toLocaleString("en-PK")} / {draw.totalEntries.toLocaleString("en-PK")} tickets · {percent}%
                            </p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900/[0.07]">
                              <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                          <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-emerald-700">
                            {pkr(draw.price)}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-900/15 bg-white/60 p-5">
                    <p className="text-[13.5px] font-semibold text-slate-900">Nothing is on the board either.</p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                      New prizes are bought and photographed before a draw opens. Follow the WhatsApp channel and the
                      announcement lands there first.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ------------------------------------------------------------- The process */}
      <section className="border-y border-slate-900/5 bg-white/60 py-16 sm:py-20">
        <div className={CONTAINER}>
          <SectionHead
            index={winners.length ? "03" : "01"}
            kicker="From ticket to handover"
            title="How a name gets on this page."
            body="Four checkpoints, in the same order for every prize. None of them can be skipped, and the fourth is the one scammers cannot copy."
          />

          <div className="mt-10">
            <FlowRail
              cols="4"
              tone="emerald"
              steps={[
                { icon: Ticket, label: "Pool sells out", caption: "Sales close at 100% of the target, then the pool locks." },
                { icon: Video, label: "Drawn on camera", caption: "Winning ticket picked live, no cuts, replay stays up." },
                { icon: UserCheck, label: "CNIC matched", caption: "Identity, phone and address confirmed before anything ships." },
                { icon: Truck, label: "Handed over", caption: "Insured courier or a desk handover with the documents filmed." },
              ]}
            />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <h3 className="font-display text-[1.35rem] font-semibold tracking-tight text-slate-900">
                What we deliberately do not publish
              </h3>
              <ul className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-slate-600">
                <li className="flex gap-2.5">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  No stock photographs. A winner&apos;s picture appears only when they agree to it — otherwise the tile
                  shows the prize itself.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  No surname or address. Ticket ID and city are enough to prove a handover without turning a winner into
                  a target.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  No &ldquo;coming soon&rdquo; figures. Every number on this page is a row in the draw ledger at the time
                  you loaded it.
                </li>
              </ul>
              <p className="mt-5 text-[12.5px] leading-relaxed text-slate-500">
                Spot something that does not add up?{" "}
                <Link href="/make-complaint" className="font-semibold text-emerald-700 underline-offset-4 hover:underline">
                  File a complaint
                </Link>{" "}
                and it is logged with a reference number.
              </p>
            </div>

            <div className={`${INK_PANEL} relative overflow-hidden p-6 sm:p-7`}>
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">Verifying a winner yourself</h3>
                    <p className="text-[11px] text-emerald-200/60">Three minutes, no account needed</p>
                  </div>
                </div>
                <CheckList
                  tone="light"
                  className="mt-4 text-[13px]"
                  items={[
                    <>
                      <strong className="text-white">Open the certificate.</strong> Every listed winner links to the draw
                      record with the ticket ID and the broadcast.
                    </>,
                    <>
                      <strong className="text-white">Check the pool history.</strong> A draw only runs at 100% sold — the
                      progress you watched filling is the same ledger.
                    </>,
                    <>
                      <strong className="text-white">Ask before you pay.</strong> Nobody from PakRaffle can request
                      shipping, tax or release fees from a winner.
                    </>,
                  ]}
                />
                <div className="mt-5 flex flex-wrap gap-2.5 border-t border-white/10 pt-4">
                  <Cta href="/knowledge-base/if-you-win-verification-and-prize-handover" variant="light" className="min-h-[42px] px-4 text-[13px]">
                    Verification guide
                  </Cta>
                  <Cta href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent("Salam PakRaffle! I want to verify a winner handover from the winners page.")}`} variant="light" className="min-h-[42px] px-4 text-[13px]">
                    Ask our team
                  </Cta>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- FAQ */}
      <section className={`${CONTAINER} py-16 sm:py-20`}>
        <SectionHead
          index={winners.length ? "04" : "02"}
          kicker="Straight answers"
          title="Questions about the winners list."
          action={
            <Cta href="/help" variant="ghost">
              All help topics
            </Cta>
          }
        />
        <div className="mt-8">
          <FaqList items={FAQ} />
        </div>
      </section>

      {/* ------------------------------------------------------------- Closing CTA */}
      <section className={`${CONTAINER} pb-20 sm:pb-24`}>
        <div className={`${INK_PANEL} relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-14`}>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute inset-0 grid-veil opacity-40" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <Kicker className="justify-center text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Next draw
            </Kicker>
            <h2 className="mt-4 font-display text-[1.9rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-[2.6rem]">
              One of these names should be yours.
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-emerald-50/80 sm:text-base">
              Pick a prize you would actually use, buy your tickets, and watch the pool close. When it hits 100% we go
              live — and the winner&apos;s handover lands on this page.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Cta href="/raffles" arrow className="w-full sm:w-auto">
                <Trophy className="h-4 w-4" />
                Browse active raffles
              </Cta>
              <Cta href={WHATSAPP_CHANNEL_URL} variant="light" className="w-full sm:w-auto">
                <MessageCircle className="h-4 w-4" />
                Join the draw channel
              </Cta>
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/50">
              Free doorstep delivery · 100% target ticket rule · Rs 0 winner fees
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Each answer is also emitted as FAQPage structured data in the JSON-LD above. */
const FAQ = [
  {
    q: "How do I know a draw actually took place?",
    a: "Each winner on this page links to the certificate for their draw, which carries the winning ticket ID, the draw date and the broadcast record. Draws only run once the ticket pool reaches 100% of target, so the progress you watched filling is the same record we publish.",
  },
  {
    q: "Why is there no photograph for some winners?",
    a: "We publish a handover photo only with the winner's consent. Some people prefer to take the prize quietly, and their record still appears here with the ticket ID, city and certificate — the proof does not depend on their face.",
  },
  {
    q: "Does a winner pay tax, shipping or a release fee?",
    a: "No. Delivery is insured and free anywhere in Pakistan, platform taxes are covered before launch, and no PakRaffle staff member can ever ask a winner for money. If someone claims they must be paid to release a prize, it is not us — report it immediately.",
  },
  {
    q: "When is the next draw?",
    a: "Not on a calendar. A draw executes when the target ticket count for that prize is sold, and the live stream is scheduled after that. The announcement goes to our WhatsApp channel first, so that is the fastest way to know before anyone else.",
  },
]
