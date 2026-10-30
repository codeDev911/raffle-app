import type { Metadata } from "next"
import { Suspense } from "react"
import { MERCHANT_ENTRY_FEE_PKR } from "@/lib/merchants/config"
import MerchantsLanding from "./MerchantsLanding"

export const metadata: Metadata = {
  title: "Merchant Connect · Shopify Lucky Draw Loyalty Engine | PakRaffle",
  description:
    "Boost cart size with guaranteed prize draws. Connect your Shopify store, set a spend rule, and every qualifying fulfilled order mints a PakRaffle ticket automatically.",
}

export default function MerchantsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" aria-label="Loading" />}>
      <MerchantsLanding entryFee={MERCHANT_ENTRY_FEE_PKR} />
    </Suspense>
  )
}
