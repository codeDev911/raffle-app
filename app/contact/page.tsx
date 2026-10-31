import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Headphones,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Ticket,
  Trophy,
} from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import {
  CONTAINER,
  Cta,
  FaqList,
  INK_PANEL,
  Kicker,
  LiveDot,
  Mesh,
  PANEL,
  Pill,
  SectionHead,
  SHELL,
  StatTile,
  TicketCard,
} from "@/components/marketing/kit"
import { Reveal } from "@/components/marketing/motion"

export const metadata = {
  title: "Contact Us — Official Support Desk & Inquiries | PakRaffle",
  description:
    "Reach out to PakRaffle customer support. Get assistance with ticket verification, draw schedules, prize claims, or live chat.",
  keywords: [
    "contact PakRaffle",
    "PakRaffle support",
    "lucky draw help Pakistan",
    "ticket verification help",
    "PakRaffle customer care",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Contact Us - PakRaffle Pakistan",
    description: "Get in touch with PakRaffle customer care via WhatsApp, email, or our inquiry desk.",
    url: "https://pakraffle.com/contact",
    siteName: "PakRaffle",
    type: "website",
  },
}

const WHATSAPP_URL =
  "https://wa.me/923377155722?text=Hello%20PakRaffle%20Support%2C%20I%20need%20assistance"

const ROUTES = [
  {
    icon: MessageSquare,
    label: "WhatsApp live",
    value: "Under 15 min",
    hint: "Ticket confirmation, payment slips, rapid questions",
    href: WHATSAPP_URL,
    external: true,
  },
  {
    icon: Mail,
    label: "Email desk",
    value: "Same working day",
    hint: "Disputes, audits and partnership paperwork",
    href: "mailto:support@pakraffle.com",
    external: true,
  },
  {
    icon: MapPin,
    label: "Regional desks",
    value: "By appointment",
    hint: "Lahore & Islamabad prize handovers",
  },
  {
    icon: Clock,
    label: "Desk hours",
    value: "7 days a week",
    hint: "10:00 – 18:00 PKT for in-person visits",
  },
]

const SLA = [
  { time: "05–15 min", title: "Payment & ticket approval", body: "Screenshot or TID reconciled against the institutional statement, 24 hours a day." },
  { time: "Same day", title: "Draw schedule updates", body: "Broadcast date announced the moment the 100% target ticket pool closes." },
  { time: "2 hours", title: "Prize claim & verification", body: "Winner identity validation starts within two hours of the draw ending." },
  { time: "30 min", title: "Account & technical support", body: "Password resets, profile corrections and login issues handled in half an hour." },
]

const FAQS = [
  {
    q: "When does a lucky draw take place?",
    a: "A draw takes place only when 100% of the target tickets are sold. There are no artificial countdown deadlines or premature cancellations. Once the ticket progress bar reaches 100%, the live stream date and time are published on our website and social channels.",
  },
  {
    q: "How do I verify my payment after transferring funds?",
    a: "After completing your payment via JazzCash, EasyPaisa, or Pakistani Bank Transfer, enter your Transaction ID (TID) and submit a screenshot on the checkout page. Our verification desk reconciles payments within 5 to 15 minutes, and your tickets appear in your profile entries immediately.",
  },
  {
    q: "How do winners receive their prizes?",
    a: "Prizes are delivered free of charge nationwide. Electronics and gadgets are shipped via insured couriers directly to your home. Vehicles are handed over in person with full registration paperwork at our office or arranged doorstep delivery. Cash prizes are transferred to your verified Pakistani bank account or mobile wallet.",
  },
  {
    q: "Are my entries guaranteed against fraud?",
    a: "Yes. Every verified ticket is assigned an immutable alphanumeric serial number and recorded with your CNIC and timestamp. Draws use verified cryptographically secure random number generation (CSPRNG) and are broadcast live without camera cuts.",
  },
]

export default function ContactPage() {
  return (
    <div className={SHELL}>
      {/* ------------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="sky" />
        <div
          className={`${CONTAINER} relative pb-14 pt-24 sm:pt-24 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-28`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill className="border-emerald-600/20 bg-emerald-600/10 text-emerald-800">
                <LiveDot />
                Support desk open
              </Pill>
              <Pill className="hidden sm:inline-flex">
                <Headphones className="h-3 w-3 text-emerald-600" />
                Average reply &lt; 15 min
              </Pill>
            </div>

            <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.035em] text-slate-900 sm:text-[3.5rem] lg:text-[3.9rem]">
              Talk to a human,
              <span className="block bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                not a queue.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-lg">
              Ticket verification, the 100% target ticket draw policy, prize handover — one message reaches the desk
              that actually resolves it. No phone trees, no offshore scripts.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Cta href={WHATSAPP_URL} arrow className="w-full sm:w-auto">
                <MessageSquare className="h-4 w-4" />
                Chat on WhatsApp
              </Cta>
              <Cta href="mailto:support@pakraffle.com" variant="ghost" className="w-full sm:w-auto">
                <Mail className="h-4 w-4" />
                Email the desk
              </Cta>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-500">
              {["Lahore & Islamabad desks", "24/7 WhatsApp & email", "Officer replies, never bots"].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Routing pass */}
          <div className="relative mt-12 lg:mt-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-gradient-to-br from-sky-300/25 via-white/40 to-emerald-200/30 blur-2xl"
            />
            <Reveal>
              <TicketCard className="shadow-[0_40px_90px_-50px_rgba(4,47,34,0.5)]">
                <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-900/10 px-5 py-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Support routing</p>
                  <Pill className="border-emerald-600/20 bg-emerald-600/10 text-emerald-800">
                    <ShieldCheck className="h-3 w-3" />
                    Official desk
                  </Pill>
                </div>

                <ul className="divide-y divide-slate-900/5 px-5 sm:px-6">
                  {ROUTES.map((route) => {
                    const row = (
                      <>
                        <span className="inline-flex items-center gap-2.5 text-[12.5px] text-slate-500">
                          <route.icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          {route.label}
                        </span>
                        <span className="text-right font-mono text-[12px] font-semibold text-slate-900">
                          {route.value}
                        </span>
                      </>
                    )
                    const rowClass = "flex items-center justify-between gap-4 py-3.5"

                    return (
                      <li key={route.label}>
                        {route.href ? (
                          <a
                            href={route.href}
                            target={route.external ? "_blank" : undefined}
                            rel={route.external ? "noopener noreferrer" : undefined}
                            className={`${rowClass} transition hover:bg-emerald-50/40`}
                          >
                            {row}
                          </a>
                        ) : (
                          <div className={rowClass}>{row}</div>
                        )}
                      </li>
                    )
                  })}
                </ul>

                <div className="mx-5 border-t border-dashed border-slate-900/15 sm:mx-6" />

                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    support@pakraffle.com
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <BadgeCheck className="h-3 w-3" />
                    Never charged to reply
                  </p>
                </div>
              </TicketCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Key numbers */}
      <section className={`${CONTAINER} relative -mt-8 pb-4`}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="First reply" value="< 15 min" hint="WhatsApp, 7 days a week" accent />
          <StatTile label="Payment review" value="5–15 min" hint="TID or screenshot" />
          <StatTile label="Physical desks" value="2 cities" hint="Lahore & Islamabad" />
          <StatTile label="Prize handover" value="Rs 0" hint="Insured nationwide courier" />
        </div>
      </section>

      {/* ------------------------------------------------------- Form + channels */}
      <section className={`${CONTAINER} py-14 sm:py-16`}>
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8">
          <div className={`${PANEL} p-5 sm:p-8`}>
            <Kicker>Submit an inquiry</Kicker>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.85rem]">
              Tell us what happened. We&apos;ll route it to the right officer.
            </h2>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-slate-600">
              Include your transaction ID if the query is about payment, or your ticket serial if it is about an entry.
              Every submission is logged with a reference you can quote on WhatsApp.
            </p>

            <div className="mt-6 border-t border-slate-900/5 pt-6">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-3xl border border-emerald-500/25 bg-emerald-50/60 p-5 transition hover:border-emerald-500/40 hover:bg-emerald-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-emerald-700 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-emerald-950">WhatsApp live support</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-emerald-900/70">
                Best for instant ticket confirmation, payment slip reviews and rapid questions. Average reply under 15
                minutes.
              </p>
            </a>

            <a
              href="mailto:support@pakraffle.com"
              className="group block rounded-3xl border border-slate-900/10 bg-white/80 p-5 backdrop-blur transition hover:border-slate-900/20"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Mail className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-slate-900">Official email desk</h3>
              <p className="mt-1 font-mono text-[11.5px] text-emerald-800">support@pakraffle.com</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">
                For formal dispute reviews, partnership inquiries and account audits that need a written trail.
              </p>
            </a>

            <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-5 backdrop-blur">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <h3 className="font-display text-base font-semibold text-slate-900">Regional desks</h3>
              </div>
              <p className="mt-1.5 text-[12px] font-semibold text-slate-700">Lahore &amp; Islamabad, Pakistan</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                Physical winner ceremonies and prize collection. Mon–Sat, 10:00 AM – 6:00 PM PKT, by appointment only.
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <Clock className="h-3 w-3" />
                Appointment for handover
              </p>
            </div>

            <div className={`${INK_PANEL} relative overflow-hidden p-5`}>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/25 blur-3xl"
              />
              <div className="relative flex items-start gap-3">
                <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <div>
                  <p className="font-display text-sm font-semibold text-white">Before you write</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-emerald-50/70">
                    Have your ticket serial or transaction ID ready. It cuts the verification round trip to a single
                    message.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- SLA */}
      <section className="border-y border-slate-900/5 bg-white/60 py-14 sm:py-16">
        <div className={CONTAINER}>
          <SectionHead
            index="01"
            kicker="Resolution standards"
            title="What to expect, and by when."
            body="Published turnarounds for the four requests that make up almost every inquiry."
          />

          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SLA.map((item) => (
              <div key={item.title} className={`${PANEL} p-5`}>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  {item.time}
                </p>
                <h3 className="mt-2.5 font-display text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- FAQ */}
      <section className={`${CONTAINER} py-14 sm:py-16`}>
        <SectionHead
          index="02"
          kicker="Answered already"
          title="The four questions we get most."
          body="If your answer is here, you can skip the wait entirely."
        />
        <FaqList items={FAQS} className="mt-8" />
      </section>

      {/* ------------------------------------------------------------ Quick links */}
      <section className={`${CONTAINER} pb-16`}>
        <div className={`${PANEL} p-6 sm:p-8`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <Kicker>Looking for something faster?</Kicker>
              <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Your tickets, draws and winners — no message needed.
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                Most account questions resolve themselves the moment you look at the live record.
              </p>
            </div>
            <Cta href="/raffles" arrow className="w-full shrink-0 sm:w-auto">
              Explore active draws
            </Cta>
          </div>

          <div className="mt-6 grid gap-3 border-t border-slate-900/5 pt-6 sm:grid-cols-2">
            <Link
              href="/profile/entries"
              className="group flex items-center gap-3.5 rounded-2xl border border-slate-900/10 bg-white px-4 py-4 transition hover:border-emerald-500/30 hover:bg-emerald-50/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                <Ticket className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-slate-900">View my tickets</span>
                <span className="block text-[11.5px] text-slate-500">Serials, statuses and linked payments</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/winners"
              className="group flex items-center gap-3.5 rounded-2xl border border-slate-900/10 bg-white px-4 py-4 transition hover:border-emerald-500/30 hover:bg-emerald-50/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                <Trophy className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-slate-900">Winners gallery</span>
                <span className="block text-[11.5px] text-slate-500">Ceremony photos and draw recordings</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
          PakRaffle official support centre · verified digital lucky draws
        </p>
      </section>
    </div>
  )
}
