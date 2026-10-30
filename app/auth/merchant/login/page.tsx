"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, Btn, Field, TextInput } from "@/components/merchants/ui"
import { AuthDivider, GoogleAuthButton, MerchantAuthShell } from "@/components/merchants/auth-shell"
import { ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react"

export default function MerchantLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") || ""
  const oauthError = searchParams.get("error")

  const [mode, setMode] = useState<"password" | "apikey">(
    searchParams.get("mode") === "apikey" ? "apikey" : "password",
  )
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(oauthError)

  // Without a store — or with an unfinished wizard — the merchant resumes onboarding.
  const destination = (hasStore: boolean, onboardingCompleted: boolean) =>
    nextPath || (!hasStore || !onboardingCompleted ? "/merchants/onboarding" : "/merchants/dashboard")

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/merchant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Login failed")

      router.push(destination(Boolean(data.hasStore), Boolean(data.onboardingCompleted)))
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const submitApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/merchants/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error(data.error || "Invalid API key")

      router.push("/merchants/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <MerchantAuthShell
      title="Merchant sign in"
      subtitle="Access your lucky-draw dashboard with the email and password you signed up with."
      footer={
        <>
          New to Merchant Connect?{" "}
          <Link href="/auth/merchant/register" className="font-medium text-emerald-600 hover:text-emerald-700">
            Create a merchant account
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert>{error}</Alert>}

        {mode === "password" ? (
          <>
            <GoogleAuthButton next={nextPath || "/merchants"} label="Continue with Google" />
            <AuthDivider label="or sign in with email" />

            <form onSubmit={submitPassword} className="space-y-4">
              <Field label="Work email">
                <TextInput
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@store.pk"
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <TextInput
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <Btn type="submit" loading={loading} className="w-full">
                Sign in <ArrowRight className="h-4 w-4" />
              </Btn>
            </form>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
              Already connected a store before? Use the API key you saved at onboarding.
            </div>

            <form onSubmit={submitApiKey} className="space-y-4">
              <Field label="API key">
                <TextInput
                  required
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="prk_live_…"
                  className="font-mono"
                />
              </Field>
              <Btn type="submit" loading={loading} className="w-full">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Btn>
            </form>
          </>
        )}

        <div className="border-t border-slate-200 pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "password" ? "apikey" : "password"))
              setError(null)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:text-emerald-600"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {mode === "password" ? "Sign in with an API key instead" : "Sign in with email and password"}
          </button>
        </div>
      </div>
    </MerchantAuthShell>
  )
}
