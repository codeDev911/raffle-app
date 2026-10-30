import type { Metadata } from "next"
import { Suspense } from "react"
import MerchantCheckout from "./MerchantCheckout"

export const metadata: Metadata = {
  title: "Secure checkout | PakRaffle",
  robots: { index: false, follow: false },
}

export default function MerchantCheckoutPage({ params }: { params: { tracker: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" aria-label="Loading checkout" />}>
      <MerchantCheckout tracker={params.tracker} />
    </Suspense>
  )
}
