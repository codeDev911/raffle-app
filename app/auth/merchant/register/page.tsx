"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, Btn, Field, TextInput } from "@/components/merchants/ui"
import { AuthDivider, GoogleAuthButton, MerchantAuthShell } from "@/components/merchants/auth-shell"
import { ArrowRight, ChevronDown, Eye, EyeOff } from "lucide-react"

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  storeName: "",
  storeUrl: "",
}

export default function MerchantRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [showStore, setShowStore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof typeof initialForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/merchant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          storeName: form.storeName,
          storeUrl: form.storeUrl,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Could not create your account")

      // New accounts land in the welcome wizard: store details, Shopify webhooks, intake form.
      const params = new URLSearchParams()
      if (form.storeName) params.set("storeName", form.storeName)
      if (form.storeUrl) params.set("storeUrl", form.storeUrl)
      const query = params.toString()

      router.push(`/merchants/onboarding${query ? `?${query}` : ""}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <MerchantAuthShell
      title="Create a merchant account"
      subtitle="Run lucky-draw campaigns on your Shopify store. Free to connect — you only pay per ticket on orders you ship."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/merchant/login" className="font-medium text-emerald-600 hover:text-emerald-700">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert>{error}</Alert>}

        <GoogleAuthButton next="/merchants/onboarding" label="Sign up with Google" />
        <AuthDivider label="or sign up with email" />

        <form onSubmit={submit} className="space-y-4">
          <Field label="Your name">
            <TextInput
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Zubair Ahmed"
              autoComplete="name"
            />
          </Field>

          <Field label="Work email">
            <TextInput
              required
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="owner@store.pk"
              autoComplete="email"
            />
          </Field>

          <Field label="WhatsApp number" hint="Optional · used for campaign and payout updates">
            <TextInput
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="0300 1234567"
              autoComplete="tel"
            />
          </Field>

          <Field label="Password" hint="At least 8 characters">
            <div className="relative">
              <TextInput
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Create a password"
                autoComplete="new-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Field label="Confirm password">
            <TextInput
              required
              type="password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </Field>

          <div className="rounded-xl border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => setShowStore((v) => !v)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs font-medium text-slate-700"
            >
              Add your Shopify store now (optional)
              <ChevronDown className={`h-4 w-4 text-slate-500 transition ${showStore ? "rotate-180" : ""}`} />
            </button>
            {showStore && (
              <div className="space-y-4 border-t border-slate-200 px-4 py-4">
                <Field label="Store name">
                  <TextInput value={form.storeName} onChange={set("storeName")} placeholder="Zubair Apparel" />
                </Field>
                <Field label="Shopify domain">
                  <TextInput
                    value={form.storeUrl}
                    onChange={set("storeUrl")}
                    placeholder="mystore.myshopify.com"
                    className="font-mono"
                  />
                </Field>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  We&apos;ll add it right after signup — the webhook URL and widget tag are ready to paste.
                </p>
              </div>
            )}
          </div>

          <Btn type="submit" loading={loading} className="w-full">
            Create account <ArrowRight className="h-4 w-4" />
          </Btn>

          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            By creating an account you agree to the{" "}
            <Link href="/terms" className="text-slate-600 underline-offset-2 hover:text-emerald-600 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-slate-600 underline-offset-2 hover:text-emerald-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>
    </MerchantAuthShell>
  )
}
