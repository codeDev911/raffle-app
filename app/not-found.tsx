import Link from "next/link"
import { ArrowLeft, Compass, Home, LifeBuoy, Search, Trophy, Store, Handshake, Ticket } from "lucide-react"
import { CONTAINER, Cta, LiveDot, Mesh, Pill, SHELL, TicketCard } from "@/components/marketing/kit"

const DESTINATIONS = [
  { href: "/raffles", label: "Active draws", body: "Live prizes with tickets still open.", icon: Ticket },
  { href: "/winners", label: "Winners", body: "Every draw we have settled, on record.", icon: Trophy },
  { href: "/lookup/store-ticket", label: "Ticket lookup", body: "Check an order from a partner store.", icon: Search },
  { href: "/merchants", label: "For merchants", body: "Turn baskets into free entries.", icon: Store },
  { href: "/become-a-partner", label: "Affiliates", body: "Earn commission sharing draws.", icon: Handshake },
  { href: "/contact", label: "Contact us", body: "A human answers within the hour.", icon: LifeBuoy },
]

export default function NotFound() {
  return (
    <div className={SHELL}>
      <section className="relative overflow-hidden">
        <Mesh tone="emerald" />

        <div className={`${CONTAINER} relative py-14 sm:py-20`}>
          <div className="mx-auto max-w-xl">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Pill className="border-rose-500/20 bg-rose-500/10 text-rose-700">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
                Error 404
              </Pill>
              <Pill>
                <LiveDot />
                Nothing else broke
              </Pill>
            </div>

            {/* The stub of a ticket that was never issued. */}
            <TicketCard className="mt-7 shadow-[0_40px_90px_-56px_rgba(4,47,34,0.55)]">
              <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-900/10 px-5 py-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  PakRaffle · Entry stub
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">ERR · 404</p>
              </div>

              <div className="px-5 py-7 text-center sm:px-8 sm:py-9">
                <div className="relative mx-auto w-fit">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-2 -top-4 select-none font-display text-[6.5rem] font-bold leading-none text-outline opacity-60 sm:text-[8rem]"
                  >
                    404
                  </span>
                  <p className="relative pt-2 font-display text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.03em] text-slate-900 sm:text-[2.6rem]">
                    This ticket
                    <span className="block bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-600 bg-clip-text text-transparent">
                      was never minted.
                    </span>
                  </p>
                </div>

                <p className="mx-auto mt-4 max-w-sm text-[13.5px] leading-relaxed text-slate-600">
                  The page you asked for isn&apos;t in the draw pool — it may have been renamed, settled, or the link was
                  mistyped.
                </p>

                <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                  <Cta href="/" variant="primary" className="w-full sm:w-auto">
                    <Home className="h-4 w-4" />
                    Back to home
                  </Cta>
                  <Cta href="/raffles" variant="ghost" arrow className="w-full sm:w-auto">
                    <Compass className="h-4 w-4" />
                    Browse open draws
                  </Cta>
                </div>
              </div>

              <div className="mx-5 border-t border-dashed border-slate-900/15 sm:mx-8" />

              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 sm:px-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  Requested route · not found
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  Report a broken link <ArrowLeft className="h-3 w-3 rotate-180" />
                </Link>
              </div>
            </TicketCard>
          </div>
        </div>
      </section>

      {/* Where to go instead — six real destinations, not filler links. */}
      <section className={`${CONTAINER} pb-16 sm:pb-20`}>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Instead, try</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              The rest of PakRaffle, still open.
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-white/70 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-white"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-slate-900 group-hover:text-emerald-800">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-slate-500">{item.body}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
