"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, ExternalLink, KeyRound, LayoutDashboard, Receipt, RefreshCw, Settings, Ticket, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { ApiError, Alert, Btn, Panel, Sep, StatusText, formatNumber, merchantApi } from "@/components/merchants/ui"
import { CampaignsTab } from "@/components/merchants/dashboard/campaigns"
import { EntriesTab } from "@/components/merchants/dashboard/entries"
import { InvoicesTab } from "@/components/merchants/dashboard/invoices"
import { OverviewTab } from "@/components/merchants/dashboard/overview"
import { SettingsTab } from "@/components/merchants/dashboard/settings"
import { SimulatorTab } from "@/components/merchants/dashboard/simulator"
import type { CampaignDTO, InvoiceDTO, MeResponse, StoreDTO } from "@/components/merchants/dashboard/types"

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "campaigns", label: "Campaigns", icon: Zap },
  { key: "entries", label: "Entries", icon: Ticket },
  { key: "invoices", label: "Invoices", icon: Receipt },
  { key: "simulator", label: "Simulator", icon: RefreshCw },
  { key: "settings", label: "Settings", icon: Settings },
] as const

type TabKey = (typeof TABS)[number]["key"]

export default function MerchantDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramTab = searchParams.get("tab") as TabKey | null
  const [tab, setTab] = useState<TabKey>("overview")

  const [me, setMe] = useState<MeResponse | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignDTO[]>([])
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedKey, setFeedKey] = useState(0)
  const [openInvoiceId, setOpenInvoiceId] = useState<string | null>(null)

  useEffect(() => {
    if (paramTab && TABS.some((t) => t.key === paramTab)) setTab(paramTab)
  }, [paramTab])

  const changeTab = (key: TabKey) => {
    setTab(key)
    router.replace(key === "overview" ? "/merchants/dashboard" : `/merchants/dashboard?tab=${key}`, { scroll: false })
  }

  const loadAll = useCallback(async () => {
    const [campaignsRes, invoicesRes] = await Promise.all([
      merchantApi<{ campaigns: CampaignDTO[] }>("/api/merchants/me/campaigns"),
      merchantApi<{ invoices: InvoiceDTO[] }>("/api/merchants/me/invoices"),
    ])
    setCampaigns(campaignsRes.campaigns)
    setInvoices(invoicesRes.invoices)
  }, [])

  useEffect(() => {
    let cancelled = false
    merchantApi<MeResponse>("/api/merchants/me")
      .then(async (data) => {
        if (cancelled) return
        setMe(data)
        try {
          await loadAll()
        } catch (err: any) {
          if (!cancelled) setError(err.message)
        }
      })
      .catch((err: any) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) return router.replace("/merchants")
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [router, loadAll])

  const refresh = useCallback(async () => {
    setError(null)
    try {
      await loadAll()
      setFeedKey((k) => k + 1)
    } catch (err: any) {
      setError(err.message)
    }
  }, [loadAll])

  const logout = async () => {
    try {
      await merchantApi("/api/merchants/logout", { method: "POST" })
    } catch {
      // session is cleared server-side regardless; always leave the dashboard
    }
    router.replace("/merchants")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
        <div className="space-y-3 text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-400" />
          <p className="text-sm text-slate-500">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-4">
        <Panel className="max-w-md space-y-4 p-8 text-center">
          <KeyRound className="mx-auto h-6 w-6 text-emerald-400" />
          <h1 className="text-lg font-semibold text-slate-100">Session required</h1>
          <p className="text-sm text-slate-400">{error || "Log in with the API key issued when you connected your store."}</p>
          <div className="flex justify-center gap-2">
            <Btn onClick={() => router.replace("/merchants")}>Back to Merchant Connect</Btn>
            <Btn variant="secondary" onClick={() => { setLoading(true); window.location.reload() }}>
              Retry
            </Btn>
          </div>
        </Panel>
      </div>
    )
  }

  const store = me.store
  const minting = campaigns.filter((c) => c.isAcceptingEntries).length
  const openInvoices = invoices.filter((i) => i.status !== "PAID").length

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B0F19]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/merchants/dashboard" className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-base font-bold tracking-tight text-slate-100">PakRaffle</span>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">Merchant</span>
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium text-slate-100">{store.name}</p>
              <p className="truncate font-mono text-[11px] text-slate-500">
                <a href={`https://${store.storeUrl}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
                  {store.storeUrl} <ExternalLink className="inline h-3 w-3" />
                </a>
              </p>
            </div>
            <StatusText status={store.status} />
            <button
              type="button"
              onClick={logout}
              className="text-xs text-slate-500 transition hover:text-rose-300"
              title="Log out"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2 sm:px-5" aria-label="Dashboard sections">
          {TABS.map((item) => {
            const badge = item.key === "campaigns" ? minting : item.key === "invoices" ? openInvoices : null
            const active = tab === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => changeTab(item.key)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition",
                  active ? "bg-emerald-500/10 text-emerald-300" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {badge ? <span className="font-mono text-xs tabular-nums text-slate-500">{formatNumber(badge)}</span> : null}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">
        {error && <Alert>{error}</Alert>}
        {store.status === "PAUSED" && (
          <Alert tone="error">
            <span className="inline-flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              PakRaffle has paused incoming webhooks for this store. Existing tickets and invoices stay intact — contact support
              to reactivate.
            </span>
          </Alert>
        )}

        {tab === "overview" && (
          <OverviewTab
            me={me}
            campaigns={campaigns}
            invoices={invoices}
            onOpenCampaigns={() => changeTab("campaigns")}
            onOpenInvoices={() => changeTab("invoices")}
          />
        )}
        {tab === "campaigns" && (
          <CampaignsTab
            campaigns={campaigns}
            entryFee={me.integration.entryFee}
            storeActive={store.status === "ACTIVE"}
            onChanged={refresh}
            onInvoiceCreated={(invoice) => {
              // generateInvoice returns a bare DTO — stamp the campaign title for the list row.
              const title = campaigns.find((c) => c.id === invoice.campaignId)?.title
              setInvoices((list) => [{ ...invoice, campaignTitle: invoice.campaignTitle || title || null }, ...list])
              setOpenInvoiceId(invoice.id)
              changeTab("invoices")
            }}
            onOpenInvoices={() => changeTab("invoices")}
          />
        )}
        {tab === "entries" && (
          <EntriesTab
            campaigns={campaigns}
            settlementAccounts={me.settlementAccounts}
            entryFee={me.integration.entryFee}
            refreshKey={feedKey}
            onSettled={refresh}
          />
        )}
        {tab === "invoices" && (
          <InvoicesTab
            invoices={invoices}
            openInvoiceId={openInvoiceId}
            onOpenHandled={() => setOpenInvoiceId(null)}
            onChanged={refresh}
          />
        )}
        {tab === "simulator" && <SimulatorTab campaigns={campaigns} onSimulated={refresh} />}
        {tab === "settings" && (
          <SettingsTab
            me={me}
            onStoreChanged={(updated: StoreDTO) => setMe((prev) => (prev ? { ...prev, store: updated } : prev))}
            onLogout={logout}
          />
        )}

        <p className="pt-2 text-center text-[11px] text-slate-600">
          PakRaffle Merchant Connect
          <Sep />
          storage <span className="font-mono">{me.integration.storage}</span>
          <Sep />
          <Link href="/merchants" className="hover:text-slate-400">
            Landing
          </Link>
          <Sep />
          <Link href="/lookup/store-ticket" className="hover:text-slate-400">
            Ticket lookup
          </Link>
        </p>
      </main>
    </div>
  )
}
