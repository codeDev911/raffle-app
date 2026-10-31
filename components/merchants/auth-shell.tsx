"use client"

// Shared frame for the merchant auth screens: porcelain canvas, a light form column and a
// dark "workspace" panel that explains the programme while the form is being filled in.
import type React from "react"
import Link from "next/link"
import { ArrowRight, Check, ShieldCheck } from "lucide-react"
import { BrandMark } from "@/components/brand"

export function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

export function GoogleAuthButton({ next, label }: { next: string; label: string }) {
  const href = `/api/auth/google/login?mode=merchant&next=${encodeURIComponent(next)}`
  return (
    <a
      href={href}
      className="inline-flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:bg-white"
    >
      <GoogleIcon />
      {label}
    </a>
  )
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-900/10" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="h-px flex-1 bg-slate-900/10" />
    </div>
  )
}

const STEPS = [
  { title: "Connect your store", body: "Paste the webhook secret and install the widget snippet in Shopify." },
  { title: "Attach a campaign", body: "Pick a live PakRaffle prize and the order value that mints a ticket." },
  { title: "Pay per ticket", body: "Billed only on fulfilled orders. Close a batch, pay by Raast or IBFT." },
]

const LEDGER = [
  { label: "Ticket minted", value: "ORD-1042 · 1 ticket" },
  { label: "Invoice period", value: "October 2026" },
  { label: "Draw status", value: "Awaiting target" },
]

export function MerchantAuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#f8f9f6] text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.16),transparent_65%)]"
      />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
        <Link href="/merchants" className="inline-flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            PakRaffle <span className="font-normal text-slate-400">/</span> Merchant
          </span>
        </Link>
        <div className="flex items-center gap-5 text-xs font-semibold text-slate-500">
          <Link href="/" className="transition hover:text-slate-900">
            Storefront
          </Link>
          <Link href="/contact" className="hidden transition hover:text-slate-900 sm:inline">
            Support
          </Link>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-2 sm:px-6 lg:px-8 lg:pb-24 lg:pt-6">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-14">
          {/* Form column */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-600/10 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Merchant Connect
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-600 backdrop-blur">
                Shopify store programme
              </span>
            </div>

            <h1 className="mt-5 font-display text-[2.05rem] font-semibold leading-[1.02] tracking-[-0.03em] text-slate-900 sm:text-[2.6rem]">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-slate-600">{subtitle}</p>

            <div className="mt-7 rounded-[28px] border border-slate-900/10 bg-white/85 p-5 shadow-[0_30px_80px_-60px_rgba(4,47,34,0.65)] backdrop-blur-xl sm:p-7">
              {children}
            </div>

            {footer && <div className="mt-5 text-center text-[13px] text-slate-600">{footer}</div>}

            <p className="mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/70" />
              Signed sessions
              <span aria-hidden className="text-slate-300">
                ·
              </span>
              HMAC-verified webhooks
              <span aria-hidden className="text-slate-300">
                ·
              </span>
              Credentials never shared with Shopify
            </p>
          </div>

          {/* Workspace column — desktop only; the form stays the whole task on a phone. */}
          <aside className="relative hidden lg:block">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-br from-emerald-300/25 via-white/30 to-violet-200/25 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[32px] bg-[#07130f] p-7 text-white shadow-[0_40px_120px_-60px_rgba(4,120,87,0.9)]">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl" />
                <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
                <div className="absolute inset-0 grid-veil opacity-30" />
              </div>

              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200/60">
                  Merchant workspace
                </p>
                <h2 className="mt-4 font-display text-[1.7rem] font-semibold leading-[1.08] tracking-tight text-white">
                  Tickets minted from orders you already ship.
                </h2>

                <ol className="mt-6 space-y-4">
                  {STEPS.map((step, i) => (
                    <li key={step.title} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 font-mono text-[10px] font-semibold text-emerald-300">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{step.title}</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-emerald-50/60">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/50">
                      Sample ledger
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      Live
                    </span>
                  </div>
                  <dl className="mt-3 space-y-2.5">
                    {LEDGER.map((row) => (
                      <div key={row.label} className="flex items-baseline justify-between gap-3">
                        <dt className="text-[11.5px] text-emerald-50/50">{row.label}</dt>
                        <dd className="font-mono text-[11.5px] font-semibold tabular-nums text-white">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <p className="mt-5 flex items-center gap-1.5 text-[11px] text-emerald-200/60">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  Free to connect — billed only on fulfilled orders
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-emerald-300/60" />
                </p>
              </div>
            </div>

            <p className="mt-5 px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              PakRaffle merchant operations · Lahore
            </p>
          </aside>
        </div>
      </main>
    </div>
  )
}
