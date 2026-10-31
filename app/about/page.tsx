import Link from "next/link"
import {
  BadgeCheck,
  Check,
  Eye,
  Lock,
  MessageSquare,
  Minus,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Truck,
  Wallet,
} from "lucide-react"
import {
  CheckList,
  CONTAINER,
  Cta,
  GhostNumeral,
  INK_PANEL,
  JsonLd,
  Kicker,
  LiveDot,
  Marquee,
  PANEL,
  Pill,
  SectionHead,
  SHELL,
  StatTile,
} from "@/components/marketing/kit"
import { Counter } from "@/components/marketing/motion"

export const metadata = {
  title: "About PakRaffle — Pakistan's Most Transparent Lucky Draw Platform",
  description:
    "Discover how PakRaffle runs Pakistan's verified digital lucky draws: the 100% target-ticket rule, cryptographically audited winner selection, live-streamed draws, and free nationwide prize delivery. Real prizes, real people, real proof.",
  keywords: [
    "about PakRaffle",
    "Pakistan lucky draw",
    "transparent raffle Pakistan",
    "target tickets sold draw",
    "verified prize delivery",
    "PakRaffle story",
    "trusted lucky draw platform Pakistan",
    "live stream raffle draw",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/about",
  },
  openGraph: {
    title: "About Us - PakRaffle Pakistan",
    description:
      "The story, mission and transparent draw standards behind Pakistan's verified digital lucky draw platform.",
    url: "https://pakraffle.com/about",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "About PakRaffle — Pakistan's Trusted Lucky Draw Platform",
    description: "100% target-ticket draws, live-streamed results, verified prize delivery. No fake draws, ever.",
  },
}

const STANDARDS = [
  "Physical inventory first",
  "100% target ticket rule",
  "Uncut live broadcast",
  "Free nationwide delivery",
  "No staff entries",
  "Public ticket ledger",
  "Cryptographic RNG",
  "Identity-verified handover",
]

const PASS_ROWS = [
  { label: "Prize custody", value: "In hand before launch", icon: Lock },
  { label: "Ticket pool", value: "Locked at 100% sold", icon: Target },
  { label: "Winner selection", value: "256-bit random seed", icon: Sparkles },
  { label: "Broadcast", value: "Live, no cuts", icon: Eye },
  { label: "Prize delivery", value: "Insured · Rs 0 to winner", icon: Truck },
]

const GUARANTEE = [
  <>
    <strong className="text-white">Physical inventory first.</strong> We never launch a raffle for an item that is not
    already in our secured custody.
  </>,
  <>
    <strong className="text-white">Zero premature draws.</strong> The draw executes strictly when 100% of target tickets
    are sold.
  </>,
  <>
    <strong className="text-white">Free nationwide delivery.</strong> TCS, Leopard, or an in-person ceremony handover
    with all taxes covered.
  </>,
  <>
    <strong className="text-white">Zero staff participation.</strong> Staff, directors and immediate family are barred
    from entering.
  </>,
]

const INDUSTRY = [
  {
    title: "Arbitrary delays",
    body: "Draw dates pushed repeatedly whenever ticket targets are missed.",
  },
  {
    title: "Phantom winners",
    body: "Names announced in text stories with no live video or proof of handover.",
  },
  {
    title: "Hidden courier charges",
    body: "Winners asked to transfer thousands in shipping or processing fees.",
  },
  {
    title: "No audit trail",
    body: "No public ticket ledgers and no disclosure of the random seed.",
  },
]

const OURS = [
  {
    title: "100% target ticket rule",
    body: "The draw executes only when every ticket is sold. No guesswork, no early close.",
  },
  {
    title: "Live 4K broadcast",
    body: "Uncut YouTube and Facebook stream with an on-air call to the winner.",
  },
  {
    title: "Free doorstep delivery",
    body: "Insured courier or an in-person ceremony at Rs 0 cost to the winner.",
  },
  {
    title: "Hashed public ledger",
    body: "Cryptographic random number generator with transparent ticket pool records.",
  },
]

const STEPS = [
  {
    icon: Target,
    title: "Pick your prize",
    body: "Flagship smartphones, motorbikes, luxury sedans or gold bars — entries starting from Rs 50.",
  },
  {
    icon: Wallet,
    title: "Instant local payment",
    body: "JazzCash, Easypaisa or Pakistani bank transfer. Receipts are audited within 5–15 minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Target met, then draw",
    body: "The pool locks when the final ticket sells. The draw streams live with an uncut camera and cryptographic RNG.",
  },
  {
    icon: Truck,
    title: "Insured delivery",
    body: "After identity verification the prize ships insured, or is handed over in person with full registration documents.",
  },
]

const WINNERS = [
  {
    quote:
      "I entered with 2 tickets for Rs. 300 while having tea in Saddar, Rawalpindi. When they phoned me live during the YouTube stream, I couldn't believe it. 3 days later, my iPhone 16 Pro arrived via TCS without paying a single rupee for shipping.",
    name: "Daniyal Khan",
    place: "Rawalpindi, Punjab",
    prize: "iPhone 16 Pro",
  },
  {
    quote:
      "The 100% target ticket rule gives complete peace of mind. The progress bar is public, the live draw is totally uncut, and Rs. 500,000 cash was transferred directly into my Meezan bank account within 24 hours of verification.",
    name: "Fatima Zahra",
    place: "Gulshan-e-Iqbal, Karachi",
    prize: "Rs 500,000 cash",
  },
  {
    quote:
      "Visited their regional office in Lahore to collect my Yamaha YBR 125G. The team handed over all registration paperwork, keys, and warranty card on camera. Professional, polite, and completely genuine.",
    name: "Usman Tariq",
    place: "Faisalabad, Punjab",
    prize: "Yamaha YBR 125G",
  },
]

export default function AboutPage() {
  return (
    <div className={SHELL}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://pakraffle.com/#organization",
            name: "PakRaffle",
            url: "https://pakraffle.com",
            description:
              "PakRaffle is Pakistan's verified digital lucky draw platform — 100% target-ticket draws, cryptographically audited winner selection, live-streamed results and free nationwide prize delivery.",
            areaServed: { "@type": "Country", name: "Pakistan" },
            knowsAbout: ["lucky draws", "raffles", "prize giveaways", "Merchant Connect Shopify draws"],
          },
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About PakRaffle",
            url: "https://pakraffle.com/about",
            inLanguage: "en-PK",
            mainEntity: { "@id": "https://pakraffle.com/#organization" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "About", item: "https://pakraffle.com/about" },
            ],
          },
        ]}
      />
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        {/* Editorial paper — hairline column rules and outlined seals. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#fbfaf6_0%,#f7f8f4_58%,#ffffff_100%)]" />
          <div className="absolute -right-40 top-4 h-[30rem] w-[30rem] rounded-full border border-slate-900/[0.07]" />
          <div className="absolute -right-24 top-24 h-[20rem] w-[20rem] rounded-full border border-slate-900/[0.05]" />
          <div className="absolute right-14 top-44 h-[9rem] w-[9rem] rounded-full border border-emerald-600/15" />
          <div className="absolute inset-y-0 left-[26%] hidden w-px bg-slate-900/[0.06] lg:block" />
          <div className="absolute inset-y-0 right-[22%] hidden w-px bg-slate-900/[0.04] lg:block" />
        </div>

        <div className={`${CONTAINER} relative pb-12 pt-24 sm:pt-28`}>
          <div className="grid gap-8 lg:grid-cols-[9rem_1fr] lg:gap-12">
            {/* Masthead rail: the facts a reader checks first. */}
            <aside className="flex flex-wrap items-start gap-x-8 gap-y-4 lg:flex-col lg:gap-6 lg:border-r lg:border-slate-900/10 lg:pr-6">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-400">Established</p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-slate-900">2024</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-400">Coverage</p>
                <p className="mt-1 text-[11.5px] font-semibold leading-snug text-slate-900">
                  4 provinces · AJK · GB
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-400">Winner fees</p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-emerald-700">Rs 0</p>
              </div>
              <div className="hidden pt-1 lg:block">
                <div className="-rotate-[7deg] rounded-lg border border-emerald-800/40 px-3 py-1.5 text-center">
                  <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-emerald-800/60">No</p>
                  <p className="font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-emerald-800">
                    exceptions
                  </p>
                </div>
              </div>
            </aside>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Pill className="border-emerald-600/20 bg-emerald-600/10 text-emerald-800">
                  <LiveDot />
                  Pakistan&apos;s lucky draw platform
                </Pill>
                <Pill>
                  <BadgeCheck className="h-3 w-3 text-emerald-600" />
                  Established 2024
                </Pill>
              </div>

              <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.5rem] lg:text-[3.9rem]">
                A raffle you can
                <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  actually audit.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
                PakRaffle was built on one conviction: every Pakistani deserves an honest, mathematically fair shot at
                a luxury prize — backed by inventory we already hold, broadcasts with no camera cuts, and zero hidden
                costs for winners.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Cta href="/raffles" arrow className="w-full sm:w-auto">
                  <Trophy className="h-4 w-4" />
                  Explore active draws
                </Cta>
                <Cta href="/winners" variant="ghost" className="w-full sm:w-auto">
                  <BadgeCheck className="h-4 w-4" />
                  Winners &amp; proof
                </Cta>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-500">
                {["All 4 provinces, AJK & GB", "100% target ticket rule", "No winner fees, ever"].map((chip) => (
                  <span key={chip} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* The integrity pass, laid out as a five-column document. */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-900/10">
            <div className="grid gap-px bg-slate-900/10 sm:grid-cols-2 lg:grid-cols-5">
              {PASS_ROWS.map((row) => (
                <div key={row.label} className="bg-[#fdfcf8] px-4 py-4">
                  <row.icon className="h-4 w-4 text-emerald-600" />
                  <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-400">
                    {row.label}
                  </p>
                  <p className="mt-1 text-[12px] font-semibold leading-snug text-slate-900">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-slate-900/15 bg-white/70 px-4 py-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Every draw · same rules
              </p>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <Lock className="h-3 w-3" />
                Verified before launch
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Key numbers */}
      <section className={`${CONTAINER} relative pb-4 pt-6`}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Prizes distributed"
            value={<Counter to={25} prefix="Rs " suffix=" M+" />}
            hint="Phones, bikes, gold & cash"
            accent
          />
          <StatTile label="Target ticket rule" value={<Counter to={100} suffix="%" />} hint="Zero premature draws" />
          <StatTile
            label="Active participants"
            value={<Counter to={65000} suffix="+" />}
            hint="Across 120+ cities"
          />
          <StatTile label="Winner fees" value={<Counter to={0} prefix="Rs " />} hint="Free delivery nationwide" />
        </div>
      </section>

      {/* ------------------------------------------------------------- Ticker */}
      <div className="border-y border-slate-900/5 bg-white/60 py-3">
        <Marquee items={STANDARDS} speed="56s" />
      </div>

      {/* --------------------------------------------------------------- Story */}
      <section className={`${CONTAINER} py-16 sm:py-20`}>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <Kicker>Our purpose</Kicker>
            <h2 className="mt-3 font-display text-[1.9rem] font-semibold leading-[1.04] tracking-tight text-slate-900 sm:text-[2.6rem]">
              Rebuilding trust in Pakistani giveaways through radical transparency.
            </h2>

            <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed text-slate-600">
              <p>
                For years, online giveaways in Pakistan were plagued by empty promises: social pages that never drew
                winners, arbitrary deadline extensions when ticket sales fell short, and surprise
                &ldquo;customs clearance&rdquo; or &ldquo;delivery&rdquo; fees demanded from winners.
              </p>
              <p>
                PakRaffle was engineered to remove that doubt. Every prize is physically procured and verified before a
                campaign opens, every entry carries an immutable alphanumeric ID, draws happen only at 100% of target
                tickets, and the selection is broadcast live without camera cuts.
              </p>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Eye, label: "Uncut broadcast" },
                { icon: Lock, label: "Locked ticket pool" },
                { icon: Truck, label: "Insured delivery" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 rounded-2xl border border-slate-900/10 bg-white px-3.5 py-3">
                  <item.icon className="h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-[12px] font-semibold text-slate-700">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${INK_PANEL} relative overflow-hidden p-6 sm:p-7`}>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/25 blur-3xl"
            />
            <div className="relative">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-white">The PakRaffle guarantee</h3>
                  <p className="text-[11px] text-emerald-200/60">Unbroken platform standards</p>
                </div>
              </div>
              <CheckList items={GUARANTEE} tone="light" className="mt-4 text-[13px]" />
              <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/50">
                Written into the platform · not the marketing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Comparison */}
      <section className="border-y border-slate-900/5 bg-white/60 py-16 sm:py-20">
        <div className={CONTAINER}>
          <SectionHead
            index="01"
            kicker="Honest comparison"
            title="Why Pakistan trusts PakRaffle."
            body="A transparent look at how our institutional model compares to unregulated social giveaways."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-rose-500/15 bg-rose-50/50 p-6 sm:p-7">
              <div className="flex items-center gap-3 border-b border-rose-500/15 pb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                  <Minus className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-rose-950">Unregulated social schemes</h3>
                  <p className="text-[11px] text-rose-700/80">High risk, no recourse</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3.5">
                {INDUSTRY.map((item) => (
                  <li key={item.title} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-0.5 font-mono text-xs font-bold text-rose-400">
                      ✕
                    </span>
                    <span className="text-[13px] leading-relaxed text-rose-900/90">
                      <span className="font-semibold text-rose-950">{item.title}.</span> {item.body}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-3xl border border-emerald-500/25 bg-emerald-50/50 p-6 shadow-[0_30px_80px_-60px_rgba(5,120,87,0.8)] sm:p-7">
              <span className="absolute -top-2.5 right-6 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                100% verified
              </span>
              <div className="flex items-center gap-3 border-b border-emerald-500/15 pb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-emerald-950">The PakRaffle standard</h3>
                  <p className="text-[11px] text-emerald-700/80">Rules published, rules kept</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3.5">
                {OURS.map((item) => (
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

      {/* -------------------------------------------------------- Architecture */}
      <section className={`${CONTAINER} py-16 sm:py-20`}>
        <SectionHead
          index="02"
          kicker="Draw architecture"
          title="How a campaign actually operates."
          body="Four steps from a prize we already hold to a winner who holds it."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className={`${PANEL} relative overflow-hidden p-5 sm:p-6`}>
              <GhostNumeral className="absolute right-4 top-2 opacity-40">{`0${i + 1}`}</GhostNumeral>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- Winners */}
      <section className="border-y border-slate-900/5 bg-white/60 py-16 sm:py-20">
        <div className={CONTAINER}>
          <SectionHead
            index="03"
            kicker="Real experiences"
            title="Winners, with their prizes, on camera."
            body="Authentic feedback from participants across Pakistan — and the item each one actually received."
            action={
              <Cta href="/winners" variant="ghost" arrow>
                See all winners
              </Cta>
            }
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {WINNERS.map((w) => (
              <figure key={w.name} className="flex flex-col rounded-3xl border border-slate-900/10 bg-white p-6">
                <div className="flex gap-0.5 text-amber-400" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Sparkles key={i} className="h-3.5 w-3.5 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[13px] leading-relaxed text-slate-600">“{w.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-slate-900/5 pt-4">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">{w.name}</p>
                    <p className="text-[11px] text-slate-500">{w.place}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-600/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-800">
                    {w.prize}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Final CTA */}
      <section className={`${CONTAINER} py-16 sm:py-20`}>
        <div className="relative overflow-hidden rounded-[32px] bg-[#07130f] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="absolute inset-0 grid-veil opacity-40" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <Pill className="border-white/15 bg-white/10 text-emerald-50">
              <LiveDot />
              Entries from Rs 50
            </Pill>
            <h2 className="mt-5 font-display text-[2rem] font-semibold leading-[1.02] tracking-tight text-white sm:text-[2.9rem]">
              Ready to claim
              <span className="block bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                your lucky entry?
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-slate-300">
              Browse live draws, pay with JazzCash or Easypaisa, and watch the stream when the ticket pool closes.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Cta href="/raffles" variant="primary" className="w-full sm:w-auto">
                <Trophy className="h-4 w-4" />
                Explore active raffles
              </Cta>
              <Cta
                href="https://wa.me/923377155722?text=Hello%20PakRaffle%20Support%2C%20I%20have%20a%20question%20about%20a%20draw"
                variant="light"
                className="w-full sm:w-auto"
              >
                <MessageSquare className="h-4 w-4" />
                Chat on WhatsApp
              </Cta>
            </div>

            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200/50">
              PakRaffle institutional profile · verified digital lucky draws
            </p>
          </div>
        </div>
      </section>

      {/* Quiet internal links — useful, not decorative. */}
      <section className={`${CONTAINER} pb-16`}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-900/10 bg-white/70 px-5 py-4 backdrop-blur">
          <p className="text-[12px] font-semibold text-slate-700">Still reading? These answer the rest.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-semibold text-emerald-700">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/refund" className="hover:underline">
              Refunds
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/lookup/store-ticket" className="hover:underline">
              Store ticket lookup
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
