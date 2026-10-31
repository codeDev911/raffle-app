import type { Metadata } from "next"
import { Suspense } from "react"
import { JsonLd } from "@/components/marketing/kit"
import StoreTicketLookupClient from "./LookupClient"

export const metadata: Metadata = {
  title: "Check Your Store Ticket — Did Your Order Win an Entry? | PakRaffle Lookup",
  description:
    "Enter your order number, ticket number or phone number to instantly check your PakRaffle Merchant Connect lucky draw entry — see your ticket status, the prize, the draw date and whether you won. Free lookup, no login needed.",
  keywords: [
    "check lucky draw ticket",
    "raffle ticket lookup Pakistan",
    "did I win the draw",
    "store ticket status",
    "PakRaffle ticket check",
    "Shopify order lucky draw entry",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/lookup/store-ticket",
  },
  openGraph: {
    title: "Check Your Store Ticket | PakRaffle",
    description: "Look up your lucky draw entry by order number, ticket or phone — prize, draw date and status in seconds.",
    url: "https://pakraffle.com/lookup/store-ticket",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary",
    title: "Ticket Lookup | PakRaffle",
    description: "Check your store's lucky draw entry — ticket status, prize and draw date. No login required.",
  },
}

export default function StoreTicketLookupPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "PakRaffle Store Ticket Lookup",
            url: "https://pakraffle.com/lookup/store-ticket",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Web",
            inLanguage: "en-PK",
            isAccessibleForFree: true,
            description:
              "Free ticket checker: shoppers enter their order number, ticket number or phone to see their lucky draw entry, prize, draw date and winning status.",
            featureList: ["Ticket status check", "Draw date lookup", "Prize details", "Winner confirmation"],
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Store Lookup", item: "https://pakraffle.com/lookup/store" },
              { "@type": "ListItem", position: 3, name: "Ticket Lookup", item: "https://pakraffle.com/lookup/store-ticket" },
            ],
          },
        ]}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#f8f9f6]" />}>
        <StoreTicketLookupClient />
      </Suspense>
    </>
  )
}
