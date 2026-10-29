import type { Metadata } from "next"
import { Suspense } from "react"
import StoreTicketLookupClient from "./LookupClient"

export const metadata: Metadata = {
  title: "Store Ticket Lookup · Check Your Shopify Lucky Draw Entry | PakRaffle",
  description:
    "Enter your order number, ticket number or phone to check your PakRaffle Merchant Connect lucky draw entry, the prize and the draw date.",
}

export default function StoreTicketLookupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <StoreTicketLookupClient />
    </Suspense>
  )
}
