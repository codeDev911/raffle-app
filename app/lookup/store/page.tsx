import type { Metadata } from "next"
import { Suspense } from "react"
import StoreCheckClient from "./StoreCheckClient"

export const metadata: Metadata = {
  title: "Does Your Shopping Win You Free Prizes? · Store Draw Checker | PakRaffle",
  description:
    "Type a store you shop at and see the free lucky draw it runs — the exclusive product on the line, how to qualify, and where to shop to win it.",
  keywords: [
    "free lucky draw Pakistan",
    "free entry shopping draw",
    "Shopify lucky draw",
    "store draw checker",
    "Pakistani online shopping giveaway",
  ],
  alternates: { canonical: "/lookup/store" },
  openGraph: {
    title: "Does your shopping win you free prizes? · PakRaffle",
    description:
      "Check any partner store for its live lucky draw and jump straight to the shop — the entry costs you nothing.",
    type: "website",
  },
}

export default function StoreCheckPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9f6]" />}>
      <StoreCheckClient />
    </Suspense>
  )
}
