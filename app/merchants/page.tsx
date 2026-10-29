import type { Metadata } from "next"
import { MERCHANT_ENTRY_FEE_PKR } from "@/lib/merchants/config"
import MerchantsLanding from "./MerchantsLanding"

export const metadata: Metadata = {
  title: "Merchant Connect · Shopify Lucky Draw Loyalty Engine | PakRaffle",
  description:
    "Boost cart size with guaranteed prize draws. Connect your Shopify store, set a spend rule, and every qualifying fulfilled order mints a PakRaffle ticket automatically.",
}

export default function MerchantsPage() {
  return <MerchantsLanding entryFee={MERCHANT_ENTRY_FEE_PKR} />
}
