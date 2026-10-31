import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  FileQuestion,
  Lock,
  RotateCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import {
  CheckList,
  CONTAINER,
  Cta,
  INK_PANEL,
  Kicker,
  LiveDot,
  Mesh,
  PANEL,
  Pill,
  SHELL,
  TicketCard,
} from "@/components/marketing/kit"
import { Reveal } from "@/components/marketing/motion"

export const metadata = {
  title: "Refund Policy — Official Cancellation & Return Terms | PakRaffle",
  description:
    "Review PakRaffle’s official refund and cancellation policy, entry finality, and 100% target sales guarantee.",
  keywords: ["PakRaffle refund", "cancellation policy", "ticket return", "Pakistan raffle refund rules"],
  robots: "index, follow",
  openGraph: {
    title: "Refund Policy - PakRaffle Pakistan",
    description: "Clear guidelines on entry finality, fair play pool funding, and raffle cancellation guarantees.",
    url: "https://pakraffle.com/refund",
    siteName: "PakRaffle",
    type: "website",
  },
}

const SECTIONS = [
  { id: "finality", num: "01", short: "Entry finality" },
  { id: "why", num: "02", short: "Why it protects you" },
  { id: "checklist", num: "03", short: "Before you pay" },
  { id: "cancelled", num: "04", short: "Cancelled draws" },
  { id: "inquiries", num: "05", short: "Payment issues" },
]

const PASS_ROWS = [
  { label: "Verified entries", value: "Non-refundable", icon: Lock },
  { label: "Cancelled draws", value: "100% returned", icon: RotateCcw },
  { label: "Processing window", value: "24–48 business hours", icon: Clock },
  { label: "Duplicate charges", value: "Reversed on proof", icon: Wallet },
  { label: "Merchant tickets", value: "Before the draw only", icon: FileQuestion },
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
        <span className="mt-1 font-mono text-[11px] font-semibold tabular-nums text-amber-600">{num}</span>
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

export default function RefundPage() {
  return (
    <div className={SHELL}>
      {/* ------------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="amber" />
        <div
          className={`${CONTAINER} relative pb-14 pt-24 sm:pt-24 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-28`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill className="border-amber-500/25 bg-amber-500/10 text-amber-900">
                <Wallet className="h-3 w-3" />
                Cancellation &amp; return terms
              </Pill>
              <Pill className="hidden sm:inline-flex">
                <LiveDot />
                Applies across Pakistan
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.5rem] lg:text-[3.9rem]">
              Where refunds
              <span className="block bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
                actually apply.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
              Transparent guidelines regarding ticket entry finality, fair play guarantees, and full refund protocols in
              cases of platform-canceled draws.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Cta href="/contact" arrow className="w-full sm:w-auto">
                Contact support desk
              </Cta>
              <Cta href="/terms" variant="ghost" className="w-full sm:w-auto">
                Read full terms
              </Cta>
            </div>

            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Last updated 2025 · Applicable across Pakistan · 5 sections
            </p>
          </div>

          {/* Refund pass */}
          <div className="relative mt-12 lg:mt-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-br from-amber-300/30 via-white/40 to-rose-200/25 blur-2xl"
            />
            <Reveal>
              <TicketCard className="shadow-[0_40px_90px_-50px_rgba(4,47,34,0.5)]">
                <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-900/10 px-5 py-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Refund rules</p>
                  <Pill className="border-amber-500/25 bg-amber-500/10 text-amber-900">
                    <ShieldCheck className="h-3 w-3" />
                    Zero deductions
                  </Pill>
                </div>

                <dl className="divide-y divide-slate-900/5 px-5 sm:px-6">
                  {PASS_ROWS.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                      <dt className="inline-flex items-center gap-2.5 text-[12.5px] text-slate-500">
                        <row.icon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        {row.label}
                      </dt>
                      <dd className="text-right font-mono text-[12px] font-semibold text-slate-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mx-5 border-t border-dashed border-slate-900/15 sm:mx-6" />

                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Read before you pay
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    No processing fees kept
                  </p>
                </div>
              </TicketCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Quick verdict */}
      <section className={`${CONTAINER} relative -mt-8 pb-4`}>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className={`${PANEL} px-5 py-4`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Entry refunds</p>
            <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-rose-700">Not available</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Once verification is complete</p>
          </div>
          <div className={`${PANEL} px-5 py-4`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Cancelled by us</p>
            <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-emerald-700">100% back</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Original wallet or bank account</p>
          </div>
          <div className={`${PANEL} px-5 py-4`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Duplicate charge</p>
            <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-slate-900">Reversed</p>
            <p className="mt-0.5 text-[11px] text-slate-500">On statement proof, no questions</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Document */}
      <section className={`${CONTAINER} py-12 sm:py-16`}>
        <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-10">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Contents</p>
            <nav aria-label="Refund sections" className="mt-3 hidden lg:block">
              <ul className="space-y-1">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex items-baseline gap-2.5 rounded-lg py-1.5 text-[12.5px] text-slate-500 transition hover:text-amber-700"
                    >
                      <span className="font-mono text-[10px] tabular-nums text-slate-400 group-hover:text-amber-600">
                        {section.num}
                      </span>
                      {section.short}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="shrink-0 rounded-full border border-slate-900/10 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600"
                >
                  <span className="mr-1 font-mono text-[10px] text-amber-600">{section.num}</span>
                  {section.short}
                </a>
              ))}
            </div>
          </aside>

          <div className="mt-6 rounded-[32px] border border-slate-900/10 bg-white/80 p-5 shadow-[0_24px_70px_-52px_rgba(4,47,34,0.6)] backdrop-blur-xl sm:p-8 lg:mt-0 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-slate-900/10 pb-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Document PR-REFUND-01</p>
                <p className="mt-1 font-display text-[15px] font-semibold text-slate-900">
                  Cancellation, returns &amp; payment disputes
                </p>
              </div>
              <Pill>
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                Version 2025.1
              </Pill>
            </div>

            <div className="divide-y divide-slate-900/10">
              <Clause
                id="finality"
                num="01"
                title="Finality of lucky draw entries"
                sub="Why purchased raffle tickets are strictly non-refundable"
              >
                <p>
                  <span className={BOLD}>Immediate entry allocation:</span> Once payment verification is completed
                  through EasyPaisa, JazzCash, or bank transfer, all raffle ticket purchases are final. We do not
                  provide refunds, charge reversals, or entry cancellations.
                </p>
                <p>
                  <span className={BOLD}>Non-transferable entries:</span> Purchased tickets cannot be transferred to
                  another user&apos;s account, exchanged for cash, or migrated to a different lucky draw.
                </p>
                <p>
                  <span className={BOLD}>Personal circumstances:</span> Requests for refunds due to accidental ticket
                  purchase, change of mind, or misreading prize specifications cannot be entertained once tickets have
                  been issued.
                </p>
              </Clause>

              <Clause
                id="why"
                num="02"
                title="Why this policy protects all participants"
                sub="Maintaining fair odds and 100% target pool integrity"
              >
                <p>
                  <span className={BOLD}>Mathematical odds protection:</span> In a transparent raffle with a fixed
                  target ticket count (e.g. 1,000 total tickets), every purchased ticket directly secures an exact,
                  verifiable probability of winning. Allowing ticket cancellations or refunds after purchase would
                  alter the odds for all other participants and jeopardize fair play.
                </p>
                <p>
                  <span className={BOLD}>100% target ticket sell-out policy:</span> PakRaffle conducts each live draw
                  only when 100% of target tickets are sold. Strict entry finality guarantees that the prize fund is
                  fully locked, verified, and secured prior to the certified draw.
                </p>
                <p>
                  <span className={BOLD}>Prevention of market manipulation:</span> Entry finality stops bad actors from
                  buying blocks of tickets and canceling them right before the draw, keeping the platform clean, fair,
                  and reliable.
                </p>
              </Clause>

              <Clause
                id="checklist"
                num="03"
                title="Pre-purchase verification checklist"
                sub="Recommended steps before confirming your ticket purchase"
              >
                <p>To avoid any misunderstandings, please ensure you review the following before completing your transfer:</p>
                <CheckList
                  items={[
                    "Verify the exact prize title, model, and item description shown on the raffle details page.",
                    "Confirm your selected ticket quantity and the total payable PKR amount before submitting payment.",
                    "Ensure your registered mobile number is accurate so you can receive draw alerts and verification calls.",
                  ]}
                />
                <p className="rounded-2xl border border-amber-300/70 bg-amber-50/70 p-4 text-[12.5px] leading-relaxed text-amber-950">
                  <span className="font-semibold">Still unsure?</span> Message the desk with the raffle link and the
                  ticket quantity before you transfer. We would rather answer a question than process a dispute.
                </p>
              </Clause>

              <Clause
                id="cancelled"
                num="04"
                title="Full refund guarantee for canceled raffles"
                sub="Our 100% money-back guarantee in extraordinary circumstances"
              >
                <p>
                  <span className={BOLD}>100% refund on canceled draws:</span> In the rare circumstance that an active
                  raffle is officially canceled by PakRaffle due to product discontinuation, severe supply chain
                  disruption, or regulatory compliance mandates, 100% of the ticket purchase price will be promptly
                  refunded to each participant.
                </p>
                <p>
                  <span className={BOLD}>Refund processing timeline:</span> Canceled draw refunds are processed directly
                  back to the participant&apos;s original payment method (EasyPaisa, JazzCash, or bank account) within 24
                  to 48 business hours with zero deduction of processing fees.
                </p>
                <p>
                  <span className={BOLD}>Duplicate charge adjustments:</span> If a technical glitch causes a user to be
                  billed multiple times for a single ticket order, our finance team will promptly reverse the duplicate
                  payment upon receiving statement proof.
                </p>
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-50/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">Written guarantee</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-emerald-950">
                    A canceled draw never keeps a rupee of ticket money. Refunds go back with zero deductions — the
                    platform absorbs the gateway cost, not the participant.
                  </p>
                </div>
              </Clause>

              <Clause
                id="inquiries"
                num="05"
                title="Payment inquiries & receipt verification support"
                sub="What to do if your payment screenshot requires manual matching"
              >
                <p>
                  If your payment was completed but your tickets have not reflected in your account within 15 minutes,
                  please do not worry. Simply reach out to our dedicated support desk with your Transaction ID (TID)
                  and receipt screenshot.
                </p>
                <p>
                  Our support team will cross-check the institutional bank statement and manually allocate your official
                  ticket numbers without any delay.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href="/contact"
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-slate-800"
                  >
                    Open the support desk
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/lookup/store-ticket"
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-900/10 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 transition hover:bg-white/70"
                  >
                    Look up a store ticket
                  </Link>
                </div>
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
              <Kicker>Still need clarity</Kicker>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2rem]">
                A transaction question deserves an answer, not a form letter.
              </h2>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-slate-600">
                Our customer care team is available 24/7 on WhatsApp and email to resolve any transaction queries or
                ticket confirmation questions.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Cta href="/contact" arrow className="w-full sm:w-auto">
                  Contact support desk
                </Cta>
                <Cta href="/terms" variant="ghost" className="w-full sm:w-auto">
                  Read full terms &amp; conditions
                </Cta>
              </div>
            </div>

            <div className={`${INK_PANEL} relative overflow-hidden p-6`}>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-14 -bottom-14 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl"
              />
              <div className="relative">
                <p className="font-display text-sm font-semibold text-white">Before you write to us</p>
                <ul className="mt-3 space-y-3">
                  {[
                    { title: "Transaction ID", body: "From your JazzCash, EasyPaisa or bank receipt." },
                    { title: "Ticket serial", body: "Shown on every entry in your profile record." },
                    { title: "Screenshot", body: "A clear image of the transfer confirmation." },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" strokeWidth={3} />
                      <span className="text-[12.5px] leading-relaxed text-emerald-50/80">
                        <span className="font-semibold text-white">{item.title}.</span> {item.body}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/50">
                  Document PR-REFUND-01 · version 2025.1
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
