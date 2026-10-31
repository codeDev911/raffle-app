"use client"

// Branded checkout page for merchant payments.
//
// The page you are looking at is ours: summary, references, totals, the retry path, the success
// state. The card and wallet inputs stay inside Safepay's iframe (`source=embedded`) because those
// fields are PCI scope — we must never see them. If the frame cannot be used, the same tracker is
// opened as Safepay's full page, so a payer is never stuck with a blank box.
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { BrandMark } from "@/components/brand"
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  TimerOff,
  TriangleAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ApiError, Btn, formatPKR, merchantApi } from "@/components/merchants/ui"
import type { CheckoutView } from "@/lib/merchants/services/checkout"

/** How often we ask our own records whether the payment landed (never the gateway). */
const POLL_MS = 5000
/** If the frame has not loaded by then it is unusable for this payer, so we hand over. */
const FRAME_TIMEOUT_MS = 25000

type CheckoutResponse = CheckoutView & { sync?: { status: string; reason: string | null } }

export default function MerchantCheckout({ tracker }: { tracker: string }) {
  const [view, setView] = useState<CheckoutView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [rechecking, setRechecking] = useState(false)
  const [frameReady, setFrameReady] = useState(false)
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const polling = useRef(false)

  const status = view?.status ?? null

  const load = useCallback(async () => {
    const data = await merchantApi<CheckoutView>(`/api/merchants/me/checkout/${encodeURIComponent(tracker)}`)
    setView(data)
    return data
  }, [tracker])

  useEffect(() => {
    let alive = true
    load()
      .catch((err) => {
        if (!alive) return
        setError(
          err instanceof ApiError && err.status === 401
            ? "Your session expired. Sign in again to finish this payment."
            : err instanceof ApiError && err.status === 404
              // A session that was abandoned is dropped rather than kept as a pending payment,
              // so an old link stops working instead of showing a checkout that cannot settle.
              ? "This checkout is no longer open. Start the payment again from your dashboard."
              : err?.message || "We could not load this checkout.",
        )
      })
    return () => {
      alive = false
    }
  }, [load])

  /** Re-reads the tracker on Safepay's side. The only path that can mark this paid. */
  const recheck = useCallback(async () => {
    setRechecking(true)
    setNotice(null)
    try {
      const data = await merchantApi<CheckoutResponse>(`/api/merchants/me/checkout/${encodeURIComponent(tracker)}`, {
        method: "POST",
      })
      setView(data)
      if (data.status === "pending") {
        setNotice("Safepay has not confirmed this payment yet. If money left your account, give it a moment and check again.")
      }
      if (data.sync?.status === "mismatch") {
        setNotice("The amount Safepay reports does not match this ticket, so nothing was settled. Our team will review it.")
      }
    } catch (err: any) {
      setNotice(err?.message || "Could not reach the payment gateway. Try again in a moment.")
    } finally {
      setRechecking(false)
    }
  }, [tracker])

  // While the session is open the webhook usually lands first; polling our own row picks that up
  // without spending gateway calls.
  useEffect(() => {
    if (status !== "pending") return
    const id = window.setInterval(() => {
      // A hidden tab, or a read still in flight, does not need another one.
      if (document.visibilityState === "hidden" || polling.current) return
      polling.current = true
      load()
        .catch(() => {
          /* a failed poll is not worth interrupting the payer over */
        })
        .finally(() => {
          polling.current = false
        })
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [status, load])

  useEffect(() => {
    if (status !== "pending") return
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        load().catch(() => {
          /* the next poll retries */
        })
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [status, load])

  // Auto fallback: a frame that never arrives is a dead end, so continue on Safepay's own page.
  useEffect(() => {
    if (status !== "pending" || frameReady || !view?.hostedUrl) return
    const href = view.hostedUrl
    const timer = window.setTimeout(() => window.location.assign(href), FRAME_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [status, frameReady, view?.hostedUrl])

  /**
   * Safepay's own pages are cross-origin, so reading the frame throws — that is the expected case.
   * A readable path means the frame came back to us (the callback redirects into the dashboard),
   * so we stop it from rendering a dashboard inside a 620px box and settle the state instead.
   */
  const onFrameLoad = () => {
    setFrameReady(true)
    let path = ""
    try {
      path = frameRef.current?.contentWindow?.location.pathname || ""
    } catch {
      return
    }
    if (path.startsWith("/api/payments/safepay/callback") || path.startsWith("/merchants")) {
      if (frameRef.current) frameRef.current.src = "about:blank"
      void recheck()
    }
  }

  const backHref = `/merchants/dashboard?tab=${view?.backTab ?? "entries"}`

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex items-center gap-2">
              <BrandMark className="h-7 w-7" />
              <span className="text-sm font-semibold tracking-tight text-slate-900">PakRaffle</span>
            </span>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Secure checkout
            </span>
            {view && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  view.environment === "production" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700",
                )}
              >
                {view.environment}
              </span>
            )}
          </div>
          <Link
            href={backHref}
            className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {!view && !error && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="order-2 h-96 animate-pulse rounded-2xl border border-slate-200 bg-white lg:order-1" />
            <div className="order-1 h-72 animate-pulse rounded-2xl border border-slate-200 bg-white lg:order-2" />
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <TriangleAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-base font-semibold text-slate-900">Checkout unavailable</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{error}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/merchants"
                className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </Link>
              <Link
                href={backHref}
                className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}

        {view && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            {/* Paying is the reason this page exists, so the card form takes the wide column and
                the summary sits beside it. On a narrow screen the summary still comes first, so the
                payer knows what they are paying for before typing a card number. */}
            <div className="order-2 space-y-3 lg:order-1">
              {status === "paid" && <PaidCard view={view} backHref={backHref} />}

              {status === "pending" && (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      Card and wallet
                    </p>
                    <span className="text-[11px] text-slate-400">Secured by Safepay</span>
                  </div>

                  {view.embeddedUrl ? (
                    <div className="relative bg-white">
                      {!frameReady && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white">
                          <Loader2 className="h-5 w-5 animate-spin text-slate-300" aria-hidden="true" />
                          <p className="text-xs text-slate-400">Loading the secure payment form…</p>
                        </div>
                      )}
                      <iframe
                        ref={frameRef}
                        src={view.embeddedUrl}
                        title="Safepay secure payment"
                        allow="payment"
                        onLoad={onFrameLoad}
                        className="h-[560px] w-full border-0 bg-white sm:h-[620px]"
                      />
                    </div>
                  ) : (
                    <div className="px-4 py-10 text-center">
                      <p className="text-sm text-slate-600">
                        This checkout has no open payment session. Start a fresh one from your dashboard.
                      </p>
                      <Link
                        href={backHref}
                        className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Back to dashboard
                      </Link>
                    </div>
                  )}

                  <div className="space-y-3 border-t border-slate-200 px-4 py-3">
                    <Btn variant="secondary" onClick={recheck} loading={rechecking} className="w-full">
                      <RefreshCw className={cn("h-4 w-4", rechecking && "hidden")} aria-hidden="true" />
                      I have paid — check status
                    </Btn>
                    <p className="text-center text-[11px] leading-relaxed text-slate-400">
                      Form not loading?{" "}
                      <a
                        href={view.hostedUrl || "#"}
                        className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
                      >
                        Open the secure payment page
                      </a>
                    </p>
                  </div>
                </section>
              )}

              {(status === "failed" || status === "expired" || status === "cancelled") && (
                <ClosedCard view={view} backHref={backHref} onRetry={recheck} rechecking={rechecking} />
              )}

              {notice && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800">
                  {notice}
                </p>
              )}
            </div>

            <div className="order-1 lg:order-2 lg:sticky lg:top-6">
              <SummaryCard view={view} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function SummaryCard({ view }: { view: CheckoutView }) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Payment summary</p>
        <h1 className="mt-1 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
          {view.items[0]?.label || "Payment"}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
            {view.reference}
          </span>
          <span>{view.scopeLabel}</span>
        </p>

        <ul className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
          {view.items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                {item.detail && <p className="text-xs text-slate-500">{item.detail}</p>}
                <p className="mt-1 font-mono text-xs tabular-nums text-slate-400">
                  {item.quantity} × {formatPKR(item.unitPricePaisa / 100)}
                </p>
              </div>
              <p className="shrink-0 font-mono text-sm font-semibold tabular-nums text-slate-900">
                {formatPKR(item.amountPaisa / 100)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <span className="text-sm font-medium text-slate-600">Total due</span>
          <span className="font-mono text-2xl font-semibold tabular-nums text-slate-900">
            {formatPKR(view.amountPaisa / 100)}
          </span>
        </div>

        <p className="mt-1 text-right text-[11px] text-slate-400">All amounts in {view.currency}</p>

        {view.status === "pending" && view.expiresAt && (
          <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
            <TimerOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            This payment session closes at {new Date(view.expiresAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}.
            After that the ticket is released and you can start a new one.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          How this payment works
        </p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-500">
          <li>
            Card and wallet details are typed into Safepay&apos;s PCI-DSS certified form and never reach PakRaffle&apos;s
            servers.
          </li>
          <li>Your ticket is marked paid by Safepay&apos;s own confirmation, not by anything this browser sends back.</li>
          <li>If the payment is interrupted, the session stays open for 30 minutes before the ticket is released.</li>
        </ul>
      </div>
    </section>
  )
}

function PaidCard({ view, backHref }: { view: CheckoutView; backHref: string }) {
  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Payment received</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        {formatPKR(view.amountPaisa / 100)} paid.{" "}
        {view.scope === "invoice"
          ? "Every ticket on this batch is now marked paid."
          : "Your ticket is now marked paid."}
      </p>

      <dl className="mt-4 space-y-1.5 rounded-xl bg-white/80 px-3.5 py-3 text-left text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Reference</dt>
          <dd className="font-mono text-slate-800">{view.reference}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Amount</dt>
          <dd className="font-mono text-slate-800">{formatPKR(view.amountPaisa / 100)}</dd>
        </div>
      </dl>

      <Link
        href={backHref}
        className="mt-5 inline-flex min-h-[40px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Back to dashboard
      </Link>
      <p className="mt-2 text-[11px] text-slate-500">The receipt is available under PakRaffle → Payments.</p>
    </section>
  )
}

function ClosedCard({
  view,
  backHref,
  onRetry,
  rechecking,
}: {
  view: CheckoutView
  backHref: string
  onRetry: () => void
  rechecking: boolean
}) {
  const copy = {
    failed: {
      title: "Payment did not go through",
      body: "Safepay declined or cancelled this session and no money was taken. Nothing was charged on your ticket.",
    },
    expired: {
      title: "This checkout expired",
      body: "The payment session closed before it completed and no money was taken. Start a new one from your dashboard.",
    },
    cancelled: {
      title: "This payment was closed",
      body: "This session is no longer payable. Start a new checkout from your dashboard if the ticket is still open.",
    },
  }[view.status as "failed" | "expired" | "cancelled"]

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <TriangleAlert className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{copy.title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{copy.body}</p>
      <div className="mt-5 flex flex-col gap-2">
        <Link
          href={backHref}
          className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
        <Btn variant="secondary" onClick={onRetry} loading={rechecking}>
          <RefreshCw className={cn("h-4 w-4", rechecking && "hidden")} aria-hidden="true" />
          Check again
        </Btn>
      </div>
    </section>
  )
}
