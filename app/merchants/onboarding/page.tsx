import type { Metadata } from "next"
import { Suspense } from "react"
import OnboardingWizard from "./OnboardingWizard"

export const metadata: Metadata = {
  title: "Merchant onboarding | PakRaffle",
  robots: { index: false, follow: false },
}

export default function MerchantOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" aria-label="Loading onboarding" />}>
      <OnboardingWizard />
    </Suspense>
  )
}
