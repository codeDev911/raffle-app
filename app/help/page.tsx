import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  CreditCard,
  Eye,
  LifeBuoy,
  Lock,
  Mail,
  MessagesSquare,
  RotateCcw,
  Search,
  ShieldCheck,
  Store,
  Target,
  Ticket,
  Truck,
  Trophy,
  Wallet,
} from "lucide-react"
import {
  CONTAINER,
  Cta,
  FaqList,
  GhostNumeral,
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
import { KnowledgeBaseLink, LiveChatLink } from "@/components/marketing/live-chat"
import { KNOWLEDGE_BASE_URL, LIVE_CHAT_URL } from "@/lib/support-links"

export const metadata = {
  title: "Help Centre & FAQs — How PakRaffle Draws Work",
  description:
    "PakRaffle help centre: how to enter a lucky draw, verify JazzCash, Easypaisa, Raast or bank payments, understand the 100% target ticket rule, live draws, winner verification, free prize delivery, refunds and store ticket lookup.",
  keywords: [
    "PakRaffle help",
    "how to enter lucky draw Pakistan",
    "raffle ticket verification",
    "PakRaffle FAQ",
    "lucky draw refund Pakistan",
    "prize delivery Pakistan",
    "store ticket lookup",
    "JazzCash Easypaisa raffle payment",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/help",
  },
  openGraph: {
    title: "Help Centre - PakRaffle Pakistan",
    description:
      "Answers on entering draws, payments and receipts, live draw fairness, prize delivery, refunds and store tickets — in one place.",
    url: "https://pakraffle.com/help",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary",
    title: "PakRaffle Help Centre & FAQs",
    description: "How draws work, how to pay, how winners are picked and how prizes are delivered — answered.",
  },
}

/**
 * One array feeds three places: the topic rail, the accordions and the FAQPage JSON-LD.
 * Keeping it single-source means the rich result can never drift from the visible answer.
 */
const TOPICS = [
  {
    id: "started",
    num: "01",
    short: "Getting started",
    title: "Entering a draw for the first time",
    icon: Ticket,
    desc: "Accounts, entry prices, ticket quantities and what a ticket actually buys you.",
    faqs: [
      {
        q: "What is PakRaffle and how do I enter a draw?",
        a: "PakRaffle runs verified lucky draws for real prizes we already hold in custody. Browse the live draws, choose how many tickets you want, pay through a Pakistani wallet or bank transfer, submit your Transaction ID, and your ticket serials appear under Profile → My Entries once the payment is matched.",
      },
      {
        q: "Do I need an account to take part?",
        a: "Yes. An account holds your tickets, your receipts and your winning details, and it is how we reach you if a ticket of yours wins. Registration takes a phone number or email and is free.",
      },
      {
        q: "Who is allowed to enter?",
        a: "Pakistani residents aged 18 or above with a valid CNIC. PakRaffle staff, directors and their immediate families are barred from entering any draw, and sellers may not enter a raffle listed for their own product. The authoritative eligibility rules live in our Terms & Conditions.",
      },
      {
        q: "How many tickets can I buy, and does buying more help?",
        a: "As many as remain in the pool. Every ticket is one equal chance, so ten tickets genuinely gives you ten times the probability of one — with no limit on entries per person. The remaining ticket count and the live progress bar are shown on every draw page.",
      },
      {
        q: "What does one entry cost?",
        a: "The price is set per draw and shown on both the raffle card and its details page, starting from Rs 50. Bulk buying never changes the unit price, and there is no platform or service charge added at checkout.",
      },
    ],
  },
  {
    id: "payments",
    num: "02",
    short: "Payments & receipts",
    title: "Paying in, and getting your tickets",
    icon: CreditCard,
    desc: "Wallets, IBFT, Raast and cards, plus what to do if tickets are slow to appear.",
    faqs: [
      {
        q: "Which payment methods does PakRaffle accept?",
        a: "JazzCash, Easypaisa, Pakistani bank transfer and IBFT, Raast, NayaPay, Sadapay and Meezan, along with debit and credit cards through our integrated gateway where it is enabled for that draw. The payment options offered are shown on the checkout screen for the specific raffle.",
      },
      {
        q: "I paid, but my tickets are not showing. What now?",
        a: "Most payments clear in 5 to 15 minutes once your Transaction ID is matched against our statement. If 15 minutes pass with no tickets, message the help desk with your TID and a screenshot of the transfer — we cross-check the bank record and allocate your ticket serials manually. Do not pay a second time while a transfer is under review.",
      },
      {
        q: "Do I get a receipt?",
        a: "Yes. Every confirmed order produces a receipt with your ticket serials, and your entries stay listed in your profile. The alphanumeric ticket serial itself is proof of entry and is recorded in the draw ledger with your CNIC and a timestamp.",
      },
      {
        q: "How do I know a payment request is really from PakRaffle?",
        a: "Only ever pay into the account shown on the draw's own checkout page on this site. We never ask you to transfer to a personal wallet number, never request a 'release fee', 'customs fee' or 'registration fee', and never ask for your OTP or password.",
      },
      {
        q: "I was charged twice for the same order.",
        a: "Send us the statement showing both debits and we reverse the duplicate in full once it is confirmed — no questions and no deduction. This is covered in the Refund & Cancellation Policy.",
      },
    ],
  },
  {
    id: "draws",
    num: "03",
    short: "Draws & winners",
    title: "How a draw is actually run",
    icon: Trophy,
    desc: "The 100% target rule, the random seed, the live broadcast and the results.",
    faqs: [
      {
        q: "What happens if a draw does not sell out?",
        a: "The pool simply stays open until every ticket is sold — we do not move the goalposts or draw early against an unsold pool. If a campaign is cancelled instead (discontinued prize, supply failure or a compliance requirement), every participant receives a 100% refund of the ticket price.",
      },
      {
        q: "How is the winner picked?",
        a: "From a closed pool of sold ticket serials using a cryptographically secure random number generator. The seed and the ticket ledger are recorded so the selection can be audited after the fact, and no staff member or seller is eligible to be drawn.",
      },
      {
        q: "Can I watch the draw happen?",
        a: "Yes, and we would rather you did. Draws are broadcast live on YouTube and Facebook without camera cuts, including the phone call to the winner. Stream times are announced on the draw page and on our WhatsApp channel as soon as the ticket pool closes.",
      },
      {
        q: "How will I know if I won?",
        a: "Our team contacts the winning number directly, normally within two hours of the draw ending, and the result is published on the winners page. A genuine win never requires you to pay anything first — no clearance, courier, tax or processing charge.",
      },
      {
        q: "Are past winners real?",
        a: "Every published winner has a named prize, a city and handover proof, and the draws were broadcast. You can review the full gallery, and if you would like to audit a specific campaign, the help desk will walk you through its ledger and broadcast record.",
      },
    ],
  },
  {
    id: "delivery",
    num: "04",
    short: "Prize delivery",
    title: "Getting the prize into your hands",
    icon: Truck,
    desc: "Insured couriers, handover desks, identity checks and the zero-fee promise.",
    faqs: [
      {
        q: "Does a winner pay anything to receive the prize?",
        a: "No. Delivery is free nationwide and the winner pays Rs 0. PakRaffle covers the courier, insurance, applicable taxes and paperwork. Any message demanding a fee before release is not from us — report it immediately.",
      },
      {
        q: "How are different prizes handed over?",
        a: "Phones, gadgets, jewellery and gold ship through insured couriers such as TCS or Leopard directly to your address. Cash prizes are transferred to your verified Pakistani bank account or mobile wallet. Vehicles and high-value items are handed over in person at our Lahore or Islamabad desk, or arranged for doorstep delivery with full registration documents.",
      },
      {
        q: "How long does delivery take?",
        a: "Insured parcels normally reach the winner within a few working days of identity verification. Vehicles and in-person ceremonies are scheduled by appointment, and cash transfers are completed within 24 hours of verification.",
      },
      {
        q: "What documents must a winner provide?",
        a: "A valid CNIC for identity matching against the ticket record. For vehicles you will need it for registration transfer, and we guide you through the paperwork at handover.",
      },
      {
        q: "Can someone else collect my prize for me?",
        a: "Yes, with a written no-objection from the registered winner plus copies of both CNICs, verified with our team in advance. We confirm these case by case because the prize must reach the person the ledger says won it.",
      },
    ],
  },
  {
    id: "refunds",
    num: "05",
    short: "Refunds & disputes",
    title: "Entry finality and money back",
    icon: RotateCcw,
    desc: "When tickets are refundable, when they are not, and how fast money moves.",
    faqs: [
      {
        q: "Are raffle tickets refundable?",
        a: "Once a ticket is verified it is final. A refund would silently change the odds for every other participant in a fixed-size pool, so entries cannot be cancelled, exchanged for cash, transferred to another account or moved to a different draw. Buy only the number of tickets you intend to keep.",
      },
      {
        q: "When does PakRaffle refund in full?",
        a: "Whenever the cancellation comes from our side: a draw that is called off, a target that is abandoned, or a duplicate debit. Refunds return to the original wallet or bank account within 24 to 48 business hours with zero deduction — the platform absorbs the gateway cost, not you.",
      },
      {
        q: "How fast is a refund, and where does the money go?",
        a: "Back to the same wallet or bank account you paid from — never a different one. Routing reversals to the original instrument keeps every refund auditable and makes it impossible for a refund to be redirected to a third party.",
      },
      {
        q: "I have a complaint about a draw or a staff interaction.",
        a: "Use the complaint form. It routes a structured report to the desk rather than the general queue, and every submission is logged and answered. For anything about your own account or a payment, the contact desk is faster.",
      },
      {
        q: "Which document overrides this page?",
        a: "The Terms & Conditions, the Privacy Policy and the Refund & Cancellation Policy. If anything here reads differently from those, the legal page wins — this page exists to explain them, not replace them.",
      },
    ],
  },
  {
    id: "stores",
    num: "06",
    short: "Store draws",
    title: "Free entries from shops you already use",
    icon: Store,
    desc: "Merchant Connect tickets, how they are earned and how to check one.",
    faqs: [
      {
        q: "I got a ticket from a shop. How do I check it is real?",
        a: "Use the store ticket lookup and enter the serial exactly as issued. It returns the campaign, the prize, the draw date and the winning status, with no sign-up needed.",
      },
      {
        q: "Do I pay PakRaffle for a store ticket?",
        a: "No. A Merchant Connect entry is free to the shopper and is earned by meeting the shop's own rule — for example buying three or more items, or spending above an order value. The merchant pays PakRaffle per qualifying entry, which is why no fee should ever reach you.",
      },
      {
        q: "How do I find free draws at stores I already shop at?",
        a: "Search the store directory by name or city to see which nearby shops are running live draws, what the entry rule is, and what the prize is.",
      },
      {
        q: "The draw banner did not appear on a shop's website.",
        a: "That is a shop-side setup matter, not a problem with your order. If you met the shop's rule, your order still qualifies and the ticket is minted when the order is fulfilled — check it through the ticket lookup, or ask the shop to confirm the campaign is live.",
      },
      {
        q: "I run a Shopify store. How do I offer draws to my customers?",
        a: "Merchant Connect lets you attach a raffle to your own products, set the qualifying rule, and add one script tag to your theme. Everything else, including ticket issuance and payouts, is handled by the platform.",
      },
    ],
  },
  {
    id: "account",
    num: "07",
    short: "Account & privacy",
    title: "Login, profile and your data",
    icon: Lock,
    desc: "Password resets, contact details, and what happens to your information.",
    faqs: [
      {
        q: "I cannot log in or I forgot my password.",
        a: "Reset it from the login screen. If the reset email or code does not arrive, or the number on file has changed, the help desk resolves account and technical issues in around 30 minutes.",
      },
      {
        q: "How do I update my phone number, address or CNIC?",
        a: "From profile settings. Keep your mobile number current — it is the number we call live during the draw if one of your tickets wins.",
      },
      {
        q: "What do you do with my personal information?",
        a: "Your name, CNIC and contact details are used to match a payment to a ticket and to verify a winner. We do not sell participant data. The scope, retention and your rights are set out in the Privacy Policy.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes — write to the support email from your registered address and we will remove your profile and contact data. Ticket records attached to a completed draw are retained in anonymised form, because they are the audit trail that proves a draw was fair.",
      },
      {
        q: "Do you ever ask for my OTP, password or a fee?",
        a: "Never. No PakRaffle representative will request an OTP or password, and no winner is ever asked to pay to release a prize. Report anything that does to the complaint form.",
      },
    ],
  },
]

const PASS_ROWS = [
  { label: "A draw runs when", value: "100% tickets sold", icon: Target },
  { label: "Payment matched in", value: "5–15 minutes", icon: Clock },
  { label: "Winner pays", value: "Rs 0", icon: Wallet },
  { label: "Ticket refundable", value: "Only if we cancel", icon: RotateCcw },
  { label: "Draw proof", value: "Uncut live stream", icon: Eye },
]

const QUICK_LINKS = [
  { icon: Ticket, label: "Live draws", href: "/raffles", hint: "Browse open pools" },
  { icon: Trophy, label: "Winners gallery", href: "/winners", hint: "Proof and handovers" },
  { icon: Search, label: "Store ticket lookup", href: "/lookup/store-ticket", hint: "Check a shop serial" },
  { icon: Store, label: "Nearby free draws", href: "/lookup/store", hint: "Shops running campaigns" },
  { icon: Wallet, label: "My entries", href: "/profile/entries", hint: "Your tickets & receipts" },
  { icon: LifeBuoy, label: "Make a complaint", href: "/make-complaint", hint: "Logged and answered" },
]

const CHANNELS = [
  {
    icon: MessagesSquare,
    label: "Live chat",
    value: "Opens on this page",
    href: LIVE_CHAT_URL,
    hint: "The bubble in the corner, or click for the full panel",
  },
  {
    icon: BookOpen,
    label: "Help articles",
    value: "Always open",
    href: KNOWLEDGE_BASE_URL,
    hint: "Every answer on this page, searchable without an account",
  },
  {
    icon: Mail,
    label: "Email desk",
    value: "Same working day",
    href: "mailto:support@pakraffle.com",
    hint: "Audits, disputes, paperwork",
  },
  {
    icon: LifeBuoy,
    label: "Complaint form",
    value: "Logged & answered",
    href: "/make-complaint",
    hint: "Structured, routed past the queue",
  },
  {
    icon: ShieldCheck,
    label: "Contact desk",
    value: "7 days a week",
    href: "/contact",
    hint: "Everything else, 24/7",
  },
]

const PAYMENTS = [
  "JazzCash",
  "Easypaisa",
  "Raast",
  "IBFT",
  "NayaPay",
  "Sadapay",
  "Meezan Bank",
  "Debit & credit cards",
  "Bank transfer",
]

const ALL_FAQS = TOPICS.flatMap((topic) => topic.faqs.map((item) => ({ ...item, topic: topic.title })))

export default function HelpPage() {
  return (
    <div className={SHELL}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "PakRaffle Help Centre",
            url: "https://pakraffle.com/help",
            inLanguage: "en-PK",
            description:
              "Answers about entering PakRaffle lucky draws, verifying payments, draw fairness, prize delivery, refunds and store ticket lookup.",
            isPartOf: { "@type": "WebSite", name: "PakRaffle", url: "https://pakraffle.com" },
            about: { "@id": "https://pakraffle.com/#organization" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Help Centre", item: "https://pakraffle.com/help" },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: ALL_FAQS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
        ]}
      />

      {/* ------------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="sky" />
        <div
          className={`${CONTAINER} relative pb-14 pt-24 sm:pt-28 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill className="border-sky-500/25 bg-sky-500/10 text-sky-900">
                <LifeBuoy className="h-3 w-3" />
                Help centre
              </Pill>
              <Pill className="hidden sm:inline-flex">
                <LiveDot />
                Live chat replies under 15 minutes
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.5rem] lg:text-[3.9rem]">
              Answers first.
              <span className="block bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Support second.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
              Everything about entering draws, paying in Pakistani wallets, how winners are actually picked, how prizes
              reach your door, and when money goes back. If it is not answered here, the desk is one tap away.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LiveChatLink
                label="Chat with support"
                prefill="Hi PakRaffle support, I need help with a draw: "
                arrow
                className="w-full sm:w-auto"
              />
              <KnowledgeBaseLink label="Help articles" className="w-full sm:w-auto" />
            </div>

            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {TOPICS.length} topics · {ALL_FAQS.length} answers · applies across Pakistan
            </p>
          </div>

          <div className="relative mt-12 lg:mt-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-br from-sky-300/30 via-white/40 to-emerald-200/25 blur-2xl"
            />
            <TicketCard className="shadow-[0_40px_90px_-50px_rgba(4,47,34,0.5)]">
              <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-900/10 px-5 py-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">The short version</p>
                <Pill className="border-sky-500/25 bg-sky-500/10 text-sky-900">
                  <ShieldCheck className="h-3 w-3" />
                  Zero winner fees
                </Pill>
              </div>

              <dl className="divide-y divide-slate-900/5 px-5 sm:px-6">
                {PASS_ROWS.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="inline-flex items-center gap-2.5 text-[12.5px] text-slate-500">
                      <row.icon className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                      {row.label}
                    </dt>
                    <dd className="text-right font-mono text-[12px] font-semibold text-slate-900">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mx-5 border-t border-dashed border-slate-900/15 sm:mx-6" />

              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Never pay to claim
                </p>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  No clearance or courier fee
                </p>
              </div>
            </TicketCard>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Topic rail */}
      <section className={`${CONTAINER} pb-4 pt-10`}>
        <Kicker>Pick a topic</Kicker>
        <div className="no-scrollbar -mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {TOPICS.map((topic) => (
            <a
              key={topic.id}
              href={`#${topic.id}`}
              className={`${PANEL} group flex shrink-0 w-[16rem] flex-col items-start gap-2 p-4 text-left transition duration-200 hover:-translate-y-0.5 sm:w-auto sm:hover:shadow-[0_28px_70px_-46px_rgba(4,47,34,0.7)] lg:w-auto`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/10 text-sky-700">
                <topic.icon className="h-4 w-4" />
              </span>
              <p className="text-[13px] font-semibold leading-snug text-slate-900">{topic.short}</p>
              <p className="text-[11.5px] leading-relaxed text-slate-500">{topic.desc}</p>
              <span className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-sky-700">
                {topic.faqs.length} answers
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}

          <div className="flex w-[16rem] shrink-0 flex-col justify-between rounded-3xl border border-emerald-600/20 bg-emerald-600/[0.06] p-4 sm:w-auto">
            <div>
              <p className="text-[13px] font-semibold text-slate-900">Rather just ask?</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">
                The desk is live 24/7 on chat and answers in under fifteen minutes.
              </p>
            </div>
            <a
              href="/contact"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 hover:underline"
            >
              Message support
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Popular answers */}
      <section className={`${CONTAINER} py-12 sm:py-16`}>
        <SectionHead
          index="01"
          kicker="Most requested"
          title="Where people usually start."
          body="Six destinations that settle most questions before they need asking."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`${PANEL} group flex items-center gap-4 p-4 transition duration-200 hover:-translate-y-0.5`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/[0.05] text-slate-700 transition group-hover:bg-emerald-600/10 group-hover:text-emerald-700">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-slate-900">{item.label}</span>
                <span className="mt-0.5 block truncate text-[11.5px] text-slate-500">{item.hint}</span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-emerald-600" />
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- Response times */}
      <div className="border-y border-slate-900/5 bg-white/60 py-3">
        <Marquee items={PAYMENTS} speed="52s" />
      </div>

      <section className={`${CONTAINER} py-10 sm:py-12`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile label="Payment verification" value="5–15 min" hint="TID matched against the statement" accent />
          <StatTile label="Winner outreach" value="Within 2 hrs" hint="Call starts after the draw ends" />
          <StatTile label="Account & tech issues" value="~30 min" hint="Resets and profile corrections" />
        </div>
      </section>

      {/* ------------------------------------------------------------ FAQ body */}
      <section className={`${CONTAINER} py-8 sm:py-12`}>
        <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-10">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Browse by topic</p>
            <nav aria-label="Help topics" className="mt-3 hidden lg:block">
              <ul className="space-y-1">
                {TOPICS.map((topic) => (
                  <li key={topic.id}>
                    <a
                      href={`#${topic.id}`}
                      className="group flex items-baseline gap-2.5 rounded-lg py-1.5 text-[12.5px] text-slate-500 transition hover:text-sky-700"
                    >
                      <span className="font-mono text-[10px] tabular-nums text-slate-400 group-hover:text-sky-600">
                        {topic.num}
                      </span>
                      {topic.short}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
              {TOPICS.map((topic) => (
                <a
                  key={topic.id}
                  href={`#${topic.id}`}
                  className="shrink-0 rounded-full border border-slate-900/10 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600"
                >
                  <span className="mr-1 font-mono text-[10px] text-sky-600">{topic.num}</span>
                  {topic.short}
                </a>
              ))}
            </div>
          </aside>

          <div className="mt-6 space-y-12 lg:mt-0">
            {TOPICS.map((topic, i) => (
              <div key={topic.id} id={topic.id} className="scroll-mt-28">
                <div className="relative flex items-start gap-4">
                  <GhostNumeral className="opacity-45">{topic.num}</GhostNumeral>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-2xl">
                      {topic.title}
                    </h2>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{topic.desc}</p>
                  </div>
                </div>
                <FaqList items={topic.faqs} className="mt-5" />
                {i < TOPICS.length - 1 && (
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-300">
                    Next · {TOPICS[i + 1].short}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Support band */}
      <section className="border-t border-slate-900/5 bg-white/60 py-14 sm:py-20">
        <div className={CONTAINER}>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <Kicker>Still unresolved</Kicker>
              <h2 className="mt-3 font-display text-[1.8rem] font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-[2.4rem]">
                Six ways to get an answer.
              </h2>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-slate-600">
                The live chat panel and the article library resolve most of it on the spot; everything else goes to a
                named desk. No ticket queues, no bot pretending to be an agent — and except for the email desk, all of
                it is answered the same day.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {CHANNELS.map((channel) => {
                  const shell = "flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-white p-4"
                  return channel.href.startsWith("/") ? (
                    <Link key={channel.label} href={channel.href} className={`${shell} transition hover:-translate-y-0.5`}>
                      <channel.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        <span className="block text-[13px] font-semibold text-slate-900">{channel.label}</span>
                        <span className="mt-0.5 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-emerald-700">
                          {channel.value}
                        </span>
                        <span className="mt-1 block text-[11.5px] leading-snug text-slate-500">{channel.hint}</span>
                      </span>
                    </Link>
                  ) : (
                    <a
                      key={channel.label}
                      href={channel.href}
                      target={channel.href.startsWith("http") ? "_blank" : undefined}
                      rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className={`${shell} transition hover:-translate-y-0.5`}
                    >
                      <channel.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        <span className="block text-[13px] font-semibold text-slate-900">{channel.label}</span>
                        <span className="mt-0.5 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-emerald-700">
                          {channel.value}
                        </span>
                        <span className="mt-1 block text-[11.5px] leading-snug text-slate-500">{channel.hint}</span>
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>

            <div className={`${INK_PANEL} relative overflow-hidden p-6 sm:p-7`}>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl"
              />
              <div className="relative">
                <p className="font-display text-base font-semibold text-white">Write once, get it solved</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-emerald-50/70">
                  Include these and the desk can act on the first reply instead of asking follow-ups.
                </p>

                <ul className="mt-5 space-y-3.5">
                  {[
                    { title: "Transaction ID", body: "From the JazzCash, Easypaisa or bank receipt." },
                    { title: "Ticket serial", body: "Shown on every entry in your profile." },
                    { title: "Draw name", body: "Or its link, so we open the right pool." },
                    { title: "Screenshot", body: "The transfer confirmation, uncropped." },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" strokeWidth={3} />
                      <span className="text-[12.5px] leading-relaxed text-emerald-50/80">
                        <span className="font-semibold text-white">{item.title}.</span> {item.body}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <Cta href="/contact" variant="light" className="w-full flex-1 sm:w-auto">
                    Open a ticket
                  </Cta>
                  <Cta href="/make-complaint" variant="light" className="w-full flex-1 sm:w-auto">
                    Complaint form
                  </Cta>
                </div>

                <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/50">
                  Regional handover desks · Lahore &amp; Islamabad · by appointment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Legal rail */}
      <section className={`${CONTAINER} py-12`}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-900/10 bg-white/70 px-5 py-4 backdrop-blur">
          <p className="text-[12px] font-semibold text-slate-700">
            The rules behind these answers.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-semibold text-emerald-700">
            <Link href="/terms" className="hover:underline">
              Terms &amp; Conditions
            </Link>
            <Link href="/refund" className="hover:underline">
              Refunds
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/about" className="hover:underline">
              How draws are audited
            </Link>
            <Link href="/merchants" className="hover:underline">
              Merchant Connect
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
