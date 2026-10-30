"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Check, Loader2, PartyPopper, Rocket, Store, Zap } from "lucide-react"
import { Alert, Btn, CopyField, Field, Panel, TextInput, TopicList, merchantApi } from "@/components/merchants/ui"
import { IntakeForm } from "@/components/merchants/IntakeForm"
import type { IntakeAnswers } from "@/lib/merchants/intake"
import { WEBHOOK_TOPICS } from "@/lib/merchants/webhook-topics"

type StepKey = "store" | "shopify" | "tally" | "done"

const STEP_LABELS: Array<{ key: StepKey; label: string }> = [
  { key: "store", label: "Your store" },
  { key: "shopify", label: "Connect Shopify" },
  { key: "tally", label: "Store intake" },
  { key: "done", label: "Launch" },
]

interface StoreDTO {
  id: string
  name: string
  storeUrl: string
  contactEmail: string
  contactPhone: string
  shopifyConnected: boolean
  shopifyWebhooksReady: boolean
  shopifyScriptInstalled: boolean
  onboardingCompletedAt: string | null
  /** Answers to the six intake questions; submittedAt is null until the merchant submits. */
  intake?: { answers: IntakeAnswers | null; submittedAt: string | null }
}

interface MeResponse {
  store: StoreDTO
  integration: {
    webhookUrl: string
    safepay: boolean
    topics?: string[]
    widgetUrl?: string
    widgetSnippet?: string
  }
}

interface Account {
  id?: string
  name?: string
  email?: string
  phone?: string | null
}

export default function OnboardingWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [me, setMe] = useState<MeResponse | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<StepKey>("store")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [storeForm, setStoreForm] = useState({ name: "", storeUrl: "", contactEmail: "", contactPhone: "" })
  const [secretInput, setSecretInput] = useState("")
  const [secretSaved, setSecretSaved] = useState(false)

  const shopifyConnected = Boolean(me?.store.shopifyConnected)
  const widgetTag =
    me?.integration.widgetSnippet ||
    (me?.integration.widgetUrl ? `<script async src="${me.integration.widgetUrl}"></script>` : "")

  const load = useCallback(async () => {
    const [meRes, accountRes] = await Promise.all([
      fetch("/api/merchants/me", { cache: "no-store", credentials: "same-origin" }).then((res) => (res.ok ? res.json() : null)),
      fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" }).then((res) => (res.ok ? res.json() : null)),
    ])
    const nextMe: MeResponse | null = meRes?.store ? meRes : null
    setMe(nextMe)
    setAccount(accountRes || null)

    setStoreForm((form) => ({
      name: form.name || nextMe?.store.name || "",
      storeUrl: form.storeUrl || nextMe?.store.storeUrl || String(searchParams.get("storeUrl") || ""),
      contactEmail: form.contactEmail || nextMe?.store.contactEmail || accountRes?.email || "",
      contactPhone: form.contactPhone || nextMe?.store.contactPhone || accountRes?.phone || "",
    }))

    const requested = searchParams.get("step") as StepKey | null
    if (requested && STEP_LABELS.some((s) => s.key === requested)) {
      setStep(requested)
    } else if (!nextMe) {
      setStep("store")
    } else if (!nextMe.store.shopifyConnected) {
      setStep("shopify")
    } else if (!nextMe.store.onboardingCompletedAt) {
      setStep("tally")
    } else {
      setStep("done")
    }

    const connectError = searchParams.get("error")
    if (connectError) setError(connectError)
    setLoading(false)
  }, [searchParams])

  useEffect(() => {
    load().catch(() => setLoading(false))
  }, [load])

  const advance = async (next: StepKey, patch: Record<string, unknown> = {}) => {
    setStep(next)
    setError(null)
    if (!me) return
    const persisted: Record<StepKey, string> = {
      store: "STORE",
      shopify: "SHOPIFY_CONNECTED",
      tally: "TALLY",
      done: "DONE",
    }
    try {
      await merchantApi("/api/merchants/me/onboarding", {
        method: "PATCH",
        json: { step: persisted[next], ...patch },
      })
    } catch {
      // Progress persistence is best-effort; the wizard still moves forward.
    }
  }

  const createStore = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await merchantApi("/api/merchants/connect", {
        method: "POST",
        json: {
          name: storeForm.name,
          storeUrl: storeForm.storeUrl,
          contactEmail: storeForm.contactEmail,
          contactPhone: storeForm.contactPhone,
        },
      })
      await load()
      setStep("shopify")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const saveSecret = async () => {
    const secret = secretInput.trim()
    if (!secret) return
    setBusy(true)
    setError(null)
    try {
      await merchantApi("/api/merchants/me/settings", { method: "PATCH", json: { webhookSecret: secret } })
      setSecretInput("")
      setSecretSaved(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const confirmShopifySetup = async () => {
    setBusy(true)
    setError(null)
    try {
      const data = await merchantApi<{ store: StoreDTO }>("/api/merchants/me/shopify", {
        method: "POST",
        json: { action: "confirm" },
      })
      setMe((current) => (current ? { ...current, store: data.store } : current))
      await advance("tally")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const finishOnboarding = async () => {
    setBusy(true)
    try {
      await merchantApi("/api/merchants/me/onboarding", { method: "PATCH", json: { completed: true } })
      setStep("done")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  /** Saves the intake answers, then closes the wizard in one go. */
  const submitIntake = async (answers: IntakeAnswers) => {
    setBusy(true)
    setError(null)
    try {
      await merchantApi("/api/merchants/me/intake", { method: "POST", json: answers })
      await merchantApi("/api/merchants/me/onboarding", { method: "PATCH", json: { completed: true } })
      setStep("done")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Setting up your account…</p>
        </div>
      </div>
    )
  }

  const activeIndex = Math.max(0, STEP_LABELS.findIndex((s) => s.key === step))
  const storeName = me?.store.name || storeForm.name || "your store"

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(16,185,129,0.16),transparent)]" />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/merchants" className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900">PakRaffle</span>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600">Merchant</span>
          </Link>
          <Link href="/merchants/dashboard" className="text-xs text-slate-500 hover:text-slate-700">
            Skip to dashboard
          </Link>
        </div>

        <header className="mb-8 space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {step === "done" ? `You're all set, ${account?.name?.split(" ")[0] || "merchant"}!` : "Welcome to PakRaffle"}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600">
            {step === "done"
              ? "Your store is connected and your lucky-draw widget is live. Create a campaign to start issuing free tickets on qualifying orders."
              : "Three short steps: connect your Shopify store, tell us a little about it, and we'll switch on the lucky-draw widget for your shoppers."}
          </p>
        </header>

        {/* Progress */}
        <ol className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEP_LABELS.map((item, index) => {
            const complete = index < activeIndex
            const active = index === activeIndex
            return (
              <li
                key={item.key}
                className={`rounded-xl border px-3 py-2.5 text-xs transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : complete
                      ? "border-slate-200 bg-white text-slate-600"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                      complete ? "border-emerald-300 bg-emerald-100 text-emerald-700" : "border-current"
                    }`}
                  >
                    {complete ? <Check className="h-3 w-3" /> : index + 1}
                  </span>
                  {item.label}
                </span>
              </li>
            )
          })}
        </ol>

        {error && (
          <div className="mb-4">
            <Alert>{error}</Alert>
          </div>
        )}
        {notice && (
          <div className="mb-4">
            <Alert tone="success">{notice}</Alert>
          </div>
        )}

        {step === "store" && (
          <Panel className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Store className="h-4 w-4 text-emerald-600" /> Add your Shopify store
              </h2>
              <p className="mt-1 text-xs text-slate-600">This is the store we'll watch for qualifying orders.</p>
            </div>
            <form onSubmit={createStore} className="space-y-4 p-5">
              <Field label="Store name">
                <TextInput
                  required
                  minLength={2}
                  maxLength={80}
                  value={storeForm.name}
                  onChange={(e) => setStoreForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Zubair Apparel"
                />
              </Field>
              <Field label="Shopify domain" hint="Use the .myshopify.com domain, e.g. zubair-apparel.myshopify.com">
                <TextInput
                  required
                  value={storeForm.storeUrl}
                  onChange={(e) => setStoreForm((f) => ({ ...f, storeUrl: e.target.value }))}
                  placeholder="zubair-apparel.myshopify.com"
                  className="font-mono"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contact email">
                  <TextInput
                    required
                    type="email"
                    value={storeForm.contactEmail}
                    onChange={(e) => setStoreForm((f) => ({ ...f, contactEmail: e.target.value }))}
                    placeholder="owner@store.pk"
                  />
                </Field>
                <Field label="WhatsApp number">
                  <TextInput
                    required
                    value={storeForm.contactPhone}
                    onChange={(e) => setStoreForm((f) => ({ ...f, contactPhone: e.target.value }))}
                    placeholder="0300 1234567"
                    className="font-mono"
                  />
                </Field>
              </div>
              <Btn type="submit" loading={busy} className="w-full sm:w-auto">
                Continue <ArrowRight className="h-4 w-4" />
              </Btn>
            </form>
          </Panel>
        )}

        {step === "shopify" && (
          <Panel className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Zap className="h-4 w-4 text-emerald-600" /> Connect Shopify
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Three copy-paste steps in your Shopify admin. We verify every order by signature — no keys are shared.
              </p>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-800">{storeName}</p>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  {me?.store.storeUrl || "your-store.myshopify.com"}
                </p>
              </div>

              {shopifyConnected && <Alert tone="success">Shopify setup confirmed — orders will start minting tickets.</Alert>}

              <CopyField label="1 · Webhook URL" value={me?.integration.webhookUrl || ""} />
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-700">
                  Create one webhook per event · Settings → Notifications → Webhooks · JSON format
                </span>
                <TopicList topics={WEBHOOK_TOPICS} />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  The dropdown calls the event <span className="font-medium text-slate-700">Order creation</span>; Shopify
                  sends it as <span className="font-mono text-slate-600">orders/create</span>, which mints the ticket and
                  fires the congratulations popup. Cancellations and refunds void it.
                </p>
              </div>

              <CopyField label="2 · Storefront widget" value={widgetTag} wrap />
              <p className="text-[11px] leading-relaxed text-slate-500">
                Online Store → Themes → Edit code → <span className="font-mono text-slate-600">theme.liquid</span> — paste it
                just before <span className="font-mono text-slate-600">&lt;/head&gt;</span>.
              </p>

              <div className="space-y-2 border-t border-slate-200 pt-4">
                <Field
                  label="3 · Shopify signing secret"
                  hint="Copy it from the webhook you just created in Shopify"
                >
                  <TextInput
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    placeholder="Paste from Shopify"
                    className="font-mono"
                    autoComplete="off"
                  />
                </Field>
                {secretSaved && <Alert tone="success">Secret saved — Shopify deliveries will verify.</Alert>}
              </div>

              <div className="flex flex-wrap gap-2">
                {secretInput.trim() && !secretSaved && (
                  <Btn variant="secondary" loading={busy} onClick={saveSecret}>
                    Save secret
                  </Btn>
                )}
                {shopifyConnected ? (
                  <Btn onClick={() => advance("tally")}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Btn>
                ) : (
                  <>
                    <Btn loading={busy} onClick={confirmShopifySetup}>
                      I&apos;ve added both <ArrowRight className="h-4 w-4" />
                    </Btn>
                    <Btn variant="ghost" onClick={() => advance("tally")} disabled={busy}>
                      Skip for now
                    </Btn>
                  </>
                )}
              </div>
            </div>
          </Panel>
        )}

        {step === "tally" && (
          <Panel className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Tell us about your store</h2>
              <p className="mt-1 text-xs text-slate-600">
                Six quick questions so we can tune your campaigns, prizes and payouts.
              </p>
            </div>
            <div className="p-5">
              <IntakeForm
                initial={me?.store.intake?.answers || null}
                defaultStoreName={me?.store.name}
                busy={busy}
                onSubmit={submitIntake}
                onSkip={finishOnboarding}
              />
            </div>
          </Panel>
        )}

        {step === "done" && (
          <Panel className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <PartyPopper className="h-4 w-4 text-emerald-600" /> You&apos;re ready to launch
              </h2>
              <p className="mt-1 text-xs text-slate-600">Create a campaign and the widget starts working right away.</p>
            </div>
            <div className="space-y-4 p-5">
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Store added: {storeName}
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    className={`h-3.5 w-3.5 ${shopifyConnected ? "text-emerald-600" : "text-slate-400"}`}
                  />{" "}
                  Shopify {shopifyConnected ? "connected" : "not connected yet"}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Intake form{" "}
                  {me?.store.intake?.submittedAt ? "submitted" : "pending"}
                </li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <Btn onClick={() => router.push("/merchants/dashboard?tab=campaigns")}>
                  <Rocket className="h-4 w-4" /> Create your first campaign
                </Btn>
                <Btn variant="secondary" onClick={() => router.push("/merchants/dashboard")}>
                  Go to dashboard
                </Btn>
              </div>
            </div>
          </Panel>
        )}

        <p className="mt-6 text-center text-[11px] text-slate-400">
          Need help? WhatsApp <span className="text-slate-600">+92 337 7155722</span>
        </p>
      </div>
    </div>
  )
}
