"use client"

// Shared frame for the merchant auth screens: light workspace, emerald accents.
import type React from "react"
import Link from "next/link"
import { ShieldCheck, Store } from "lucide-react"
import { Panel, Sep } from "./ui"

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
      className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
    >
      <GoogleIcon />
      {label}
    </a>
  )
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

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
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_65%)]" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/merchants" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-emerald-600">
            <Store className="h-4 w-4" />
          </span>
          PakRaffle <span className="text-slate-500">Merchant</span>
        </Link>
        <Link href="/merchants" className="text-xs text-slate-600 transition hover:text-emerald-600">
          Back to overview
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <Panel className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </Panel>

          {footer && <div className="mt-5 text-center text-sm text-slate-600">{footer}</div>}

          <p className="mt-8 flex flex-wrap items-center justify-center gap-1 text-center text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/70" /> Signed sessions
            <Sep /> HMAC-verified webhooks <Sep /> Your credentials are never shared with Shopify
          </p>
        </div>
      </main>
    </div>
  )
}
