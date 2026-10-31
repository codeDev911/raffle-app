import type { Metadata } from "next"
import { Suspense } from "react"
import { JsonLd } from "@/components/marketing/kit"
import StoreCheckClient from "./StoreCheckClient"

export const metadata: Metadata = {
  title: "Does Your Shopping Win You Free Prizes? — Store Draw Checker | PakRaffle",
  description:
    "Search any Pakistani online store to see the free lucky draw it runs with PakRaffle — the exclusive prize on the line, how your order qualifies, and where to shop to win it. Checking costs nothing; entering is free with a qualifying order.",
  keywords: [
    "free lucky draw Pakistan",
    "free entry shopping draw",
    "Shopify lucky draw",
    "store draw checker",
    "Pakistani online shopping giveaway",
    "shopping win prizes Pakistan",
    "online store lucky draw list",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/lookup/store",
  },
  openGraph: {
    title: "Does your shopping win you free prizes? · PakRaffle",
    description:
      "Check any partner store for its live lucky draw and jump straight to the shop — the entry costs you nothing.",
    url: "https://pakraffle.com/lookup/store",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Store Draw Checker | PakRaffle",
    description: "Type a store you shop at — see the free lucky draw attached to your orders.",
  },
}

export default function StoreCheckPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "PakRaffle Store Draw Checker",
            url: "https://pakraffle.com/lookup/store",
            applicationCategory: "ShoppingApplication",
            operatingSystem: "Web",
            inLanguage: "en-PK",
            isAccessibleForFree: true,
            description:
              "Search a partner store to see the free lucky draw it runs — the prize, the qualifying rule, and the draw date. Shoppers enter automatically with qualifying orders.",
            featureList: ["Store draw search", "Prize preview", "Qualifying rules", "Direct link to shop"],
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Store Lookup", item: "https://pakraffle.com/lookup/store" },
            ],
          },
        ]}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#f8f9f6]" />}>
        <StoreCheckClient />
      </Suspense>
    </>
  )
}
