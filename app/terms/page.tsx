import Link from "next/link"
import { ArrowRight, Check, FileText, Lock, Scale, ShieldCheck, Store, Users } from "lucide-react"
import {
  CheckList,
  CONTAINER,
  Cta,
  INK_PANEL,
  JsonLd,
  Kicker,
  LiveDot,
  Mesh,
  Pill,
  SHELL,
  TicketCard,
} from "@/components/marketing/kit"
import { Reveal } from "@/components/marketing/motion"

export const metadata = {
  title: "Terms & Conditions — Official Lucky Draw Rules & Ticket Policy | PakRaffle",
  description:
    "Read PakRaffle's official terms and conditions: eligibility, ticket purchase and verification rules, 100% target-ticket draw policy, winner selection, free prize delivery, refunds and Merchant Connect terms for Shopify stores in Pakistan.",
  keywords: [
    "PakRaffle terms and conditions",
    "lucky draw rules Pakistan",
    "raffle ticket policy",
    "target ticket draw policy",
    "online raffle legal terms Pakistan",
    "Merchant Connect terms",
    "prize delivery terms",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/terms",
  },
  openGraph: {
    title: "Terms & Conditions - PakRaffle Pakistan",
    description:
      "Official lucky draw rules: 100% target-ticket draws, winner selection, free nationwide prize delivery, refunds and Merchant Connect terms.",
    url: "https://pakraffle.com/terms",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary",
    title: "Terms & Conditions | PakRaffle Pakistan",
    description: "Official rules for participation, draws, prizes, refunds and Merchant Connect — written in full.",
  },
}

const SECTIONS = [
  { id: "eligibility", num: "01", short: "Eligibility" },
  { id: "purchase", num: "02", short: "Ticket purchase" },
  { id: "draw-policy", num: "03", short: "Draw policy" },
  { id: "winner-selection", num: "04", short: "Winner selection" },
  { id: "delivery", num: "05", short: "Delivery & payouts" },
  { id: "refunds", num: "06", short: "Refunds & law" },
  { id: "listings", num: "07", short: "User listings" },
  { id: "merchant-connect", num: "08", short: "Merchant Connect" },
]

const PASS_ROWS = [
  { label: "Draw trigger", value: "100% of target tickets", icon: Lock },
  { label: "Entry finality", value: "Non-refundable once verified", icon: FileText },
  { label: "Winner window", value: "7 business days", icon: Users },
  { label: "Community raffles", value: "90 days max · 8% fee", icon: Scale },
  { label: "Merchant tickets", value: "Refundable before draw", icon: Store },
]

const BOLD = "font-semibold text-slate-900"

function Clause({
  id,
  num,
  title,
  sub,
  children,
}: {
  id: string
  num: string
  title: string
  sub: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 py-8 first:pt-0">
      <div className="flex items-start gap-3">
        <span className="mt-1 font-mono text-[11px] font-semibold tabular-nums text-emerald-700">{num}</span>
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 sm:text-[1.4rem]">
            {title}
          </h2>
          <p className="mt-1 text-[11.5px] text-slate-500">{sub}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3.5 text-[13.5px] leading-relaxed text-slate-600 sm:text-sm">{children}</div>
    </section>
  )
}

function Callout({
  tone = "amber",
  title,
  children,
}: {
  tone?: "amber" | "emerald"
  title: string
  children: React.ReactNode
}) {
  const styles =
    tone === "amber"
      ? "border-amber-300/70 bg-amber-50/70 text-amber-950"
      : "border-emerald-500/25 bg-emerald-50/60 text-emerald-950"
  const label = tone === "amber" ? "text-amber-900" : "text-emerald-800"
  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${label}`}>{title}</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed">{children}</p>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className={SHELL}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Terms & Conditions — PakRaffle",
            url: "https://pakraffle.com/terms",
            inLanguage: "en-PK",
            isPartOf: { "@type": "WebSite", name: "PakRaffle", url: "https://pakraffle.com" },
            about: { "@id": "https://pakraffle.com/#organization" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Terms & Conditions", item: "https://pakraffle.com/terms" },
            ],
          },
        ]}
      />
      {/* ------------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="emerald" />
        <div
          className={`${CONTAINER} relative pb-14 pt-24 sm:pt-24 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-28`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill className="border-emerald-600/20 bg-emerald-600/10 text-emerald-800">
                <ShieldCheck className="h-3 w-3" />
                Legal · effective 2025
              </Pill>
              <Pill className="hidden sm:inline-flex">
                <LiveDot />
                Applies across Pakistan
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.5rem] lg:text-[3.9rem]">
              The rules,
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                written in full.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
              Please read these terms carefully before participating in any lucky draws on PakRaffle. All draws are
              conducted with full transparency, verified prize procurement, and strict audit compliance.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Cta href="/contact" arrow className="w-full sm:w-auto">
                Contact support desk
              </Cta>
              <Cta href="/refund" variant="ghost" className="w-full sm:w-auto">
                Refund policy
              </Cta>
            </div>

            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Last updated 2025 · Applicable across Pakistan · 8 sections
            </p>
          </div>

          {/* Terms pass */}
          <div className="relative mt-12 lg:mt-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-br from-emerald-300/25 via-white/40 to-amber-200/30 blur-2xl"
            />
            <Reveal>
              <TicketCard className="shadow-[0_40px_90px_-50px_rgba(4,47,34,0.5)]">
                <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-900/10 px-5 py-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Terms at a glance</p>
                  <Pill className="border-emerald-600/20 bg-emerald-600/10 text-emerald-800">
                    <Scale className="h-3 w-3" />
                    Binding
                  </Pill>
                </div>

                <dl className="divide-y divide-slate-900/5 px-5 sm:px-6">
                  {PASS_ROWS.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                      <dt className="inline-flex items-center gap-2.5 text-[12.5px] text-slate-500">
                        <row.icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        {row.label}
                      </dt>
                      <dd className="text-right font-mono text-[12px] font-semibold text-slate-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mx-5 border-t border-dashed border-slate-900/15 sm:mx-6" />

                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Governing law · Pakistan
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    No hidden clauses
                  </p>
                </div>
              </TicketCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Document body */}
      <section className={`${CONTAINER} py-12 sm:py-16`}>
        <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-10">
          {/* Contents rail */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Contents</p>
            <nav aria-label="Terms sections" className="mt-3 hidden lg:block">
              <ul className="space-y-1">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex items-baseline gap-2.5 rounded-lg py-1.5 text-[12.5px] text-slate-500 transition hover:text-emerald-700"
                    >
                      <span className="font-mono text-[10px] tabular-nums text-slate-400 group-hover:text-emerald-600">
                        {section.num}
                      </span>
                      {section.short}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile: horizontal jump chips */}
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="shrink-0 rounded-full border border-slate-900/10 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600"
                >
                  <span className="mr-1 font-mono text-[10px] text-emerald-700">{section.num}</span>
                  {section.short}
                </a>
              ))}
            </div>
          </aside>

          {/* Clauses */}
          <div className="mt-6 rounded-[32px] border border-slate-900/10 bg-white/80 p-5 shadow-[0_24px_70px_-52px_rgba(4,47,34,0.6)] backdrop-blur-xl sm:p-8 lg:mt-0 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-slate-900/10 pb-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Document PR-TERMS-01</p>
                <p className="mt-1 font-display text-[15px] font-semibold text-slate-900">
                  Participation agreement &amp; draw rules
                </p>
              </div>
              <Pill>
                <FileText className="h-3 w-3 text-emerald-600" />
                Version 2025.1
              </Pill>
            </div>

            <div className="divide-y divide-slate-900/10">
              <Clause
                id="eligibility"
                num="01"
                title="Eligibility & participant requirements"
                sub="Who is legally permitted to participate on PakRaffle"
              >
                <p>
                  To register an account and purchase lucky draw tickets on PakRaffle, you must meet all of the
                  following requirements:
                </p>
                <CheckList
                  items={[
                    "You must be at least 18 years of age at the time of entry purchase.",
                    "You must be a citizen or resident of Pakistan with valid government-issued identification (CNIC or Passport).",
                    "You must possess an active Pakistani mobile wallet or bank account (JazzCash, EasyPaisa, or Pakistani Bank Account) registered in your name for ticket verification and potential cash prize payouts.",
                    "Employees, officers, or immediate family members of PakRaffle staff cannot enter lucky draws to ensure uncompromised impartiality.",
                  ]}
                />
              </Clause>

              <Clause
                id="purchase"
                num="02"
                title="Ticket purchasing & verification protocol"
                sub="How entries are validated and allocated to users"
              >
                <p>
                  <span className={BOLD}>Single-ticket &amp; bundle pricing:</span> Each raffle has an officially
                  published price per ticket in Pakistani Rupees (PKR). Users can purchase one or multiple tickets in a
                  single checkout session, up to the maximum permitted per user for that raffle.
                </p>
                <p>
                  <span className={BOLD}>Manual &amp; automated transaction proof:</span> To complete entry allocation,
                  users must submit their transaction ID (TID) or upload a genuine screenshot of the payment receipt.
                  Our compliance team verifies transaction records directly against institutional statements within 5
                  to 15 minutes.
                </p>
                <p>
                  <span className={BOLD}>Disqualification of fake receipts:</span> Submitting altered, fabricated, or
                  duplicate transaction receipts is strictly prohibited and will result in permanent account
                  termination, forfeiture of tickets, and reporting to relevant anti-fraud authorities.
                </p>
              </Clause>

              <Clause
                id="draw-policy"
                num="03"
                title="Raffle draw execution when target tickets sold"
                sub="Official draw trigger and ticket pool completion rule"
              >
                <p>
                  <span className={BOLD}>Target ticket threshold:</span> Every raffle hosted on PakRaffle is tied to an
                  explicit target number of total entries (e.g. 500, 1,000, or 2,500 tickets). The official lucky draw
                  will take place when all the target tickets for that specific raffle have been sold.
                </p>
                <p>
                  <span className={BOLD}>No premature draws:</span> A draw will not take place before the designated
                  target ticket count is reached. This ensures 100% complete prize funding, fair equal odds for all
                  participants, and complete transparency.
                </p>
                <p>
                  <span className={BOLD}>Draw scheduling:</span> As soon as all target tickets are sold, ticket
                  purchasing is closed and all ticket holders are notified with the confirmed date and time of the live
                  draw.
                </p>
              </Clause>

              <Clause
                id="winner-selection"
                num="04"
                title="Winner selection & transparency audit"
                sub="Our mathematically verifiable random draw procedures"
              >
                <p>
                  <span className={BOLD}>Cryptographic random number generation (RNG):</span> The winning ticket number
                  is selected using mathematically audited, unbiased pseudo-random number generator algorithms,
                  ensuring every purchased ticket has an identical mathematical probability of winning.
                </p>
                <p>
                  <span className={BOLD}>Live stream broadcast:</span> Whenever feasible, draws are broadcasted live to
                  participants via YouTube / Facebook Live / official WhatsApp community feeds. Complete uncut video
                  recordings are permanently archived in our public{" "}
                  <Link href="/winners" className="font-semibold text-emerald-700 underline underline-offset-2">
                    Winners Hall of Fame
                  </Link>
                  .
                </p>
                <p>
                  <span className={BOLD}>Winner notification protocol:</span> The verified winner is immediately
                  contacted via phone call, SMS, and WhatsApp message within 2 hours of draw conclusion. Winners are
                  granted 7 business days to confirm their delivery address and provide CNIC verification.
                </p>
              </Clause>

              <Clause
                id="delivery"
                num="05"
                title="Free doorstep prize delivery & cash payouts"
                sub="Nationwide courier delivery with zero hidden delivery charges"
              >
                <p>
                  <span className={BOLD}>100% free nationwide delivery:</span> All physical prizes (including mobile
                  phones, motorbikes, electronics, and home appliances) are shipped free of charge directly to the
                  winner&rsquo;s doorstep anywhere in Pakistan via TCS, Leopards Courier, or authorized dealership
                  handover.
                </p>
                <p>
                  <span className={BOLD}>Zero winner fees:</span> PakRaffle will <strong>NEVER</strong> demand shipping
                  fees, tax clearance fees, courier charges, or service charges from a winner to release their prize.
                  Any third party requesting payment on our behalf is a scammer and must be reported immediately.
                </p>
                <p>
                  <span className={BOLD}>Cash prize transfers:</span> Cash prize draws are disbursed directly to the
                  winner&apos;s verified EasyPaisa, JazzCash, or Pakistani bank account within 15 to 30 minutes following
                  identity confirmation.
                </p>
              </Clause>

              <Clause
                id="refunds"
                num="06"
                title="Refunds, modifications & legal jurisdiction"
                sub="Terms regarding entry finality and legal governance"
              >
                <p>
                  <span className={BOLD}>Finality of entry purchases:</span> Because ticket allocations directly alter
                  the remaining pool and odds for other participants, purchased tickets are strictly non-refundable and
                  non-exchangeable once payment verification is completed.
                </p>
                <p>
                  <span className={BOLD}>Raffle cancellation guarantee:</span> In the rare event that an active raffle
                  is canceled by PakRaffle due to force majeure, unresolvable technical issues, or inventory supply
                  discontinuation, 100% of the ticket purchase price will be promptly refunded to each participant&apos;s
                  original payment method or wallet.
                </p>
                <p>
                  <span className={BOLD}>Governing law:</span> These terms are governed and construed in accordance with
                  the applicable laws of the Islamic Republic of Pakistan. Any legal disputes are subject to the
                  exclusive jurisdiction of the competent courts in Pakistan.
                </p>
              </Clause>

              <Clause
                id="listings"
                num="07"
                title="User product listings, physical custody & cancellation"
                sub="Mandatory operational terms for users listing products for public draw campaigns"
              >
                <p>
                  <span className={BOLD}>Review &amp; verified outreach:</span> After submitting a product listing
                  application, our verification desk will review the documentation and contact the applicant directly
                  through one of their provided and verified contact channels (WhatsApp, phone call, or email) to confirm
                  asset authenticity and CNIC legal identity.
                </p>
                <p>
                  <span className={BOLD}>Physical verification &amp; escrow custody:</span> Before ticket sales
                  commence, the physical item must be shipped or delivered to an authorized PakRaffle custody facility in
                  Lahore, Islamabad, or Karachi. PakRaffle will hold the verified item in secure, insured custody until
                  the raffle is either successfully completed or officially cancelled.
                </p>
                <Callout title="Voluntary cancellation & 8% platform fee clause">
                  If a seller requests to cancel their live raffle after tickets have been made available for purchase,{" "}
                  <strong className="font-semibold">100% of all sold ticket amounts will be immediately refunded to participants</strong>.
                  The seller is required to pay PakRaffle the <strong className="font-semibold">8% platform fee</strong>{" "}
                  (covering payment gateway transaction charges, verification labor, and marketing expenses) before the
                  item will be released and returned to the seller.
                </Callout>
                <Callout title="3-month maximum duration limit">
                  All community product raffles must be completed within{" "}
                  <strong className="font-semibold">3 months (90 days)</strong> from their official launch date. If the
                  required ticket goal is not met within 3 months, PakRaffle will automatically cancel the raffle,
                  process full 100% refunds to all ticket buyers, charge/deduct the 8% platform fee, and securely return
                  the physical item to the verified owner.
                </Callout>
              </Clause>

              <Clause
                id="merchant-connect"
                num="08"
                title="Merchant Connect — Shopify store programme"
                sub="Terms for businesses that reward their customers with PakRaffle draw entries"
              >
                <p>
                  <span className={BOLD}>What the programme is:</span> Merchant Connect lets a Shopify store attach a
                  PakRaffle campaign to its own orders. Qualifying orders mint a ticket for the shopper, and PakRaffle —
                  not the store — acts as the raffle operator, supplies the prize, runs the draw and delivers to the
                  winner. The store is a promoter of the draw, never the organiser of a lottery.
                </p>
                <p>
                  <span className={BOLD}>Eligibility &amp; account security:</span> You must be authorised to act for the
                  store you connect and able to fulfil the orders that generate tickets. You are responsible for keeping
                  your store credentials and webhook signing secret private; any event signed with your secret is
                  treated as originating from your store.
                </p>
                <p>
                  <span className={BOLD}>Ticket pricing &amp; billing:</span> Each raffle publishes a per-ticket price,
                  which is locked for your campaign at launch. You are billed once per ticket minted from a fulfilled,
                  non-cancelled order. Test tickets created in the simulator are never billed. Batches are closed by
                  you, invoiced item by item, and paid by Raast or IBFT with an uploaded payment receipt. An unpaid or
                  unverifiable invoice keeps its campaign out of the draw.
                </p>
                <p>
                  <span className={BOLD}>Webhooks &amp; order data:</span> The programme depends on the order-created,
                  order-cancelled and order-refunded webhooks registered in your Shopify admin. If you remove or break
                  those webhooks, we cannot void tickets or detect cancellations, and billing will follow the last state
                  we received.
                </p>
                <Callout title="Ticket refunds — 2.9% + Rs. 30 gateway charge">
                  A ticket may be refunded at your request at any time{" "}
                  <strong className="font-semibold">before its draw has been run</strong>. The refund equals the ticket
                  price minus the card and wallet charge already incurred on that transaction —{" "}
                  <strong className="font-semibold">2.9% of the ticket price plus Rs. 30</strong> per ticket. Refunding a
                  ticket voids it, withdraws the shopper&apos;s entry from the draw, and reverses the ticket on your
                  invoice. Refunded tickets are never re-billed, and no refund is possible once the draw has taken
                  place.
                </Callout>
                <p>
                  <span className={BOLD}>Your shoppers:</span> A ticket bought through your store must be free to the
                  shopper — you may not charge for it, sell it separately, or describe it as a product. You are
                  responsible for the accuracy of the customer details your Shopify order supplies, and for displaying
                  your own store policies alongside the draw promotion.
                </p>
                <p>
                  <span className={BOLD}>Fair use:</span> Artificial orders, self-orders, refund loops, or campaigns
                  structured to convert tickets into cash equivalents are prohibited. We may pause a campaign, withhold
                  a draw, void tickets or close an account that breaches these terms, and unpaid invoices remain due.
                </p>
                <p>
                  <span className={BOLD}>Suspension &amp; termination:</span> You may disconnect your store at any time;
                  tickets already minted stay valid for their draw and outstanding invoices stay payable. We may
                  suspend the programme for a store if billing repeatedly fails, if a prize cannot be delivered because
                  of information held by the store, or if these terms are breached.
                </p>
              </Clause>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Support band */}
      <section className="border-t border-slate-900/5 bg-white/60 py-14 sm:py-16">
        <div className={CONTAINER}>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <Kicker>Questions about the rules</Kicker>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2rem]">
                If a clause is unclear, ask before you enter — not after.
              </h2>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-slate-600">
                Our support desk is active 24/7 on WhatsApp and email to assist you with any questions regarding draw
                schedules, target ticket counts, or winner verification.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Cta href="/contact" arrow className="w-full sm:w-auto">
                  Contact support desk
                </Cta>
                <Cta href="/raffles" variant="ghost" className="w-full sm:w-auto">
                  Explore active raffles
                </Cta>
              </div>
            </div>

            <div className={`${INK_PANEL} relative overflow-hidden p-6`}>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-emerald-500/25 blur-3xl"
              />
              <div className="relative">
                <p className="font-display text-sm font-semibold text-white">Related documents</p>
                <ul className="mt-3 space-y-2.5">
                  {[
                    { label: "Refund & cancellation policy", href: "/refund" },
                    { label: "Privacy policy", href: "/privacy" },
                    { label: "About PakRaffle", href: "/about" },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex items-center justify-between gap-3 text-[12.5px] text-emerald-50/80 transition hover:text-white"
                      >
                        {item.label}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-300/60 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/50">
                  Document PR-TERMS-01 · version 2025.1
                </p>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            PakRaffle official transparency agreement · verified digital lucky draws
          </p>
        </div>
      </section>
    </div>
  )
}
