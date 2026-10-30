import type { Metadata } from "next"
import { Suspense } from "react"
import MerchantDashboard from "./MerchantDashboard"

export const metadata: Metadata = {
  title: "Merchant Dashboard | PakRaffle",
  robots: { index: false, follow: false },
}

export default function MerchantDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 animate-pulse" aria-label="Loading dashboard" />
      }
    >
      <MerchantDashboard />
    </Suspense>
  )
}
