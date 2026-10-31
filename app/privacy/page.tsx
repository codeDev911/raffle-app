import Link from "next/link"
import {
  ArrowRight,
  Check,
  FileText,
  Lock,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react"
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
  title: "Privacy Policy — How PakRaffle Protects Your Data | Pakistan",
  description:
    "PakRaffle's privacy policy explains how we collect, secure and use your personal data: 256-bit SSL encryption, salted password hashing, masked winner details, no sale of data — plus Merchant Connect Shopify store data handling.",
  keywords: [
    "PakRaffle privacy policy",
    "data protection Pakistan",
    "lucky draw privacy",
    "is PakRaffle safe",
    "personal data protection Pakistan",
    "Shopify order data privacy",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy - PakRaffle Pakistan",
    description:
      "How your personal, payment and prize-delivery data is collected, encrypted and protected — and why we never sell it.",
    url: "https://pakraffle.com/privacy",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | PakRaffle Pakistan",
    description: "256-bit encryption, no data selling, masked winner details — your data, guarded in full.",
  },
}

const SECTIONS = [
  { id: "collection", num: "01", short: "Data we collect" },
  { id: "usage", num: "02", short: "How we use it" },
  { id: "security", num: "03", short: "Protection & storage" },
  { id: "disclosure", num: "04", short: "Third-party sharing" },
  { id: "rights", num: "05", short: "Your rights" },
  { id: "merchant-connect", num: "06", short: "Merchant Connect" },
]

const PASS_ROWS = [
  { label: "Password storage", value: "Salted bcrypt hashes", icon: Lock },
  { label: "Data transmission", value: "256-bit SSL / TLS", icon: ShieldCheck },
  { label: "Data selling", value: "Never — zero tolerance", icon: Scale },
  { label: "Public winner data", value: "Masked phone only", icon: Users },
  { label: "Card / PIN / OTP data", value: "Never collected", icon: FileText },
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

export default function PrivacyPage() {
  return (
    <div className={SHELL}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Privacy Policy — PakRaffle",
            url: "https://pakraffle.com/privacy",
            inLanguage: "en-PK",
            isPartOf: { "@type": "WebSite", name: "PakRaffle", url: "https://pakraffle.com" },
            about: { "@id": "https://pakraffle.com/#organization" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Privacy Policy", item: "https://pakraffle.com/privacy" },
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
                Legal · data protection
              </Pill>
              <Pill className="hidden sm:inline-flex">
                <LiveDot />
                Applicable across Pakistan
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.5rem] lg:text-[3.9rem]">
              Your data,
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                guarded in full.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
              Your privacy and trust are paramount. This policy details exactly how PakRaffle collects, stores,
              protects, and handles your information when you participate in our lucky draws — in plain language,
              written in full.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Cta href="/contact" arrow className="w-full sm:w-auto">
                Contact privacy desk
              </Cta>
              <Cta href="/terms" variant="ghost" className="w-full sm:w-auto">
                Terms &amp; conditions
              </Cta>
            </div>

            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Last updated 2025 · Applicable across Pakistan · 6 sections
            </p>
          </div>

          {/* Privacy pass */}
          <div className="relative mt-12 lg:mt-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-br from-emerald-300/25 via-white/40 to-amber-200/30 blur-2xl"
            />
            <Reveal>
              <TicketCard className="shadow-[0_40px_90px_-50px_rgba(4,47,34,0.5)]">
                <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-900/10 px-5 py-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Privacy at a glance</p>
                  <Pill className="border-emerald-600/20 bg-emerald-600/10 text-emerald-800">
                    <Lock className="h-3 w-3" />
                    Protected
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
                    We never sell your data
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
            <nav aria-label="Privacy sections" className="mt-3 hidden lg:block">
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
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Document PR-PRIVACY-01</p>
                <p className="mt-1 font-display text-[15px] font-semibold text-slate-900">
                  Data protection &amp; privacy standards
                </p>
              </div>
              <Pill>
                <FileText className="h-3 w-3 text-emerald-600" />
                Version 2025.1
              </Pill>
            </div>

            <div className="divide-y divide-slate-900/10">
              <Clause
                id="collection"
                num="01"
                title="Information we collect"
                sub="Data gathered to facilitate lucky draw entries and verified prize fulfillment"
              >
                <p>
                  <span className={BOLD}>A. Account &amp; identification information:</span> When you create an account,
                  purchase tickets, or claim prizes, we collect:
                </p>
                <CheckList
                  items={[
                    "Your full name matching your government-issued identification (CNIC).",
                    "Email address for transaction receipts, draw result alerts, and ticket confirmations.",
                    "Mobile phone number associated with your mobile wallet (EasyPaisa / JazzCash) for draw alerts and cash prize disbursements.",
                    "Residential delivery city and postal address for insured TCS doorstep shipping of physical goods.",
                  ]}
                />
                <p>
                  <span className={BOLD}>B. Payment &amp; verification records:</span> To allocate entries, we log
                  payment reference numbers (Transaction IDs / TIDs), transaction timestamps, paid amounts in PKR, and
                  uploaded receipt images.
                </p>
                <Callout tone="emerald" title="What we never touch">
                  We do <strong className="font-semibold">NOT</strong> collect or store your banking PINs, OTPs, or
                  debit/credit card CVV codes — from PakRaffle checkouts or from a connected store&apos;s checkout.
                </Callout>
              </Clause>

              <Clause
                id="usage"
                num="02"
                title="How we use your information"
                sub="Purposes for processing participant data"
              >
                <p>
                  <span className={BOLD}>Ticket allocation &amp; draw management:</span> Verifying transaction proof and
                  generating uniquely numbered raffle ticket entries tied to your verified profile.
                </p>
                <p>
                  <span className={BOLD}>Live draw notification:</span> Alerting ticket holders via WhatsApp and SMS when
                  100% of target tickets are sold and the live stream draw schedule is confirmed.
                </p>
                <p>
                  <span className={BOLD}>Prize delivery &amp; handover:</span> Coordinating with courier partners (TCS,
                  Leopards) or dealership networks to ensure zero-cost delivery of motorcycles, phones, and appliances.
                </p>
                <p>
                  <span className={BOLD}>Anti-fraud &amp; integrity monitoring:</span> Detecting duplicate accounts,
                  fraudulent receipts, and maintaining institutional audit records in compliance with Pakistani
                  financial regulations.
                </p>
              </Clause>

              <Clause
                id="security"
                num="03"
                title="Data protection, encryption & storage"
                sub="How we safeguard your personal data from unauthorized access"
              >
                <p>
                  <span className={BOLD}>256-bit SSL/TLS encryption:</span> All data transmitted between your browser and
                  our servers is secured using modern TLS encryption protocols, preventing interception or unauthorized
                  eavesdropping.
                </p>
                <p>
                  <span className={BOLD}>Encrypted password storage:</span> Passwords are cryptographically hashed using
                  salted bcrypt algorithms and are never stored or accessible in plain text.
                </p>
                <p>
                  <span className={BOLD}>Strict role-based access:</span> Only authorized operations personnel have
                  supervised access to participant contact details, exclusively for prize verification and customer
                  support.
                </p>
                <Callout tone="emerald" title="No selling of personal data">
                  PakRaffle does <strong className="font-semibold">not</strong> sell, rent, or trade participant phone
                  numbers or personal records to marketing agencies or third parties — ever.
                </Callout>
              </Clause>

              <Clause
                id="disclosure"
                num="04"
                title="Third-party disclosures & courier partners"
                sub="Controlled sharing exclusively for service execution"
              >
                <p>We share limited participant details only with certified partners strictly required to deliver our service:</p>
                <CheckList
                  items={[
                    "Courier & logistics services: winner contact names, delivery addresses, and phone numbers are provided to TCS or Leopards Courier for doorstep package dispatch.",
                    "Public winner transparency: winner names, city locations, and masked phone numbers (e.g., 0300 ****123) are published in our verified Hall of Fame to prove draw legitimacy. Full CNICs and complete phone numbers are kept strictly confidential.",
                    "Legal compliance: information may be disclosed if required by law enforcement or competent Pakistani court orders to prevent financial fraud.",
                  ]}
                />
              </Clause>

              <Clause
                id="rights"
                num="05"
                title="Your data rights & account management"
                sub="Access, updates, and account control"
              >
                <p>
                  <span className={BOLD}>Profile updates:</span> You can edit your name, phone number, and city at any
                  time from your{" "}
                  <Link href="/profile/settings" className="font-semibold text-emerald-700 underline underline-offset-2">
                    Account Settings
                  </Link>
                  .
                </p>
                <p>
                  <span className={BOLD}>Data access &amp; export:</span> You can review your complete participation and
                  ticket history anytime in the{" "}
                  <Link href="/profile/entries" className="font-semibold text-emerald-700 underline underline-offset-2">
                    My Tickets
                  </Link>{" "}
                  dashboard.
                </p>
                <p>
                  <span className={BOLD}>Account deletion:</span> You may request the deletion of your account and
                  personal records by contacting support, provided there are no active, pending draw entries under your
                  name.
                </p>
              </Clause>

              <Clause
                id="merchant-connect"
                num="06"
                title="Merchant Connect — Shopify store data"
                sub="What PakRaffle receives from a connected store, and what the store receives back"
              >
                <p>
                  <span className={BOLD}>A. Order data we receive from the store:</span> When a store connects Shopify,
                  its orders are delivered to us through signed webhooks. For each qualifying order we receive the order
                  number, order value, item count, currency and order date; the customer name, email, phone number and
                  delivery city as supplied by the shopper at checkout; and fulfilment, cancellation and refund events,
                  so a ticket can be voided when an order no longer qualifies.
                </p>
                <p>
                  <span className={BOLD}>B. Why we process it:</span> To evaluate the store&apos;s campaign rule, mint
                  and void tickets, run the ticket lookup page, raise itemised invoices to the store, and screen for
                  duplicate or artificial orders. Customer contact details are used for ticket confirmation and for
                  prize delivery if that ticket wins.
                </p>
                <p>
                  <span className={BOLD}>C. Shopper accounts created on their behalf:</span> Because a Shopify customer
                  never signs in here, we create a login-less PakRaffle account keyed to their order so their entry can
                  be tracked and delivered. The shopper can claim that account at any time by signing up with the same
                  phone number or email; the entry history follows them rather than being lost.
                </p>
                <p>
                  <span className={BOLD}>D. Merchant account data:</span> Store owners sign in with Google or an email
                  and password. We store the account name, email, connected store URL and the store&apos;s webhook/API
                  secret, which is held server-side and used only to verify that incoming Shopify events really came
                  from that store. It is never shown to other users.
                </p>
                <p>
                  <span className={BOLD}>E. Retention and sharing:</span> Ticket, order and invoice records are retained
                  for as long as the draw and its settlement need them, and afterwards for the period required by
                  Pakistani tax and audit rules. Order data is not sold or rented, and is shared only with the courier
                  delivering a prize, the payment gateway processing a ticket payment, or a competent authority acting
                  under Pakistani law. A store may ask us to delete order data it no longer needs once the related draw
                  has closed and the invoice is settled.
                </p>
                <p>
                  <span className={BOLD}>F. What the store is responsible for:</span> The store warrants that it is
                  entitled to share the order details it forwards to us and that its own privacy notice covers that
                  transfer. Shopper requests about store-side order data are handled by the store; requests about a
                  ticket or a draw entry can be sent to us directly.
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
              <Kicker>Questions about your data</Kicker>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2rem]">
                Have questions about your privacy? Ask the desk first.
              </h2>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-slate-600">
                Our compliance and support desk is available 24/7 to assist with any questions regarding personal
                information security, data exports, or account deletion requests.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Cta href="/contact" arrow className="w-full sm:w-auto">
                  Contact privacy team
                </Cta>
                <Cta href="/profile/settings" variant="ghost" className="w-full sm:w-auto">
                  Manage your profile
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
                    { label: "Terms & conditions", href: "/terms" },
                    { label: "Refund & cancellation policy", href: "/refund" },
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
                  Document PR-PRIVACY-01 · version 2025.1
                </p>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            PakRaffle official transparency agreement · Pakistan&apos;s verified digital lucky draw platform
          </p>
        </div>
      </section>
    </div>
  )
}
