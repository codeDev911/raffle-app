import type { Metadata } from "next"
import { Suspense } from "react"
import { MERCHANT_ENTRY_FEE_PKR } from "@/lib/merchants/config"
import { JsonLd } from "@/components/marketing/kit"
import MerchantsLanding from "./MerchantsLanding"

export const metadata: Metadata = {
  title: "Merchant Connect — Shopify Lucky Draw App for Pakistan Stores | PakRaffle",
  description:
    "Give every qualifying Shopify order a free prize draw entry. Merchant Connect by PakRaffle auto-mints raffle tickets from fulfilled orders — boost cart size, repeat purchases and loyalty while PakRaffle supplies the prize and runs the audited draw. Pay per ticket only.",
  keywords: [
    "Shopify lucky draw app Pakistan",
    "Shopify raffle app",
    "e-commerce loyalty Pakistan",
    "prize draw for online stores",
    "increase Shopify cart value",
    "Merchant Connect PakRaffle",
    "free prize draw shopping Pakistan",
    "repeat customer app Shopify",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/merchants",
  },
  openGraph: {
    title: "Merchant Connect — Shopify Lucky Draw Loyalty Engine | PakRaffle",
    description:
      "Connect your Shopify store, set a spend rule, and every qualifying order mints a verified raffle ticket automatically. You sell more; we run the draw.",
    url: "https://pakraffle.com/merchants",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merchant Connect by PakRaffle — Shopify Lucky Draws",
    description: "Guaranteed prize draws attached to your Shopify orders. Pay per ticket, zero prize cost, bigger carts.",
  },
}

export default function MerchantsPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "PakRaffle Merchant Connect",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web, Shopify",
            url: "https://pakraffle.com/merchants",
            description:
              "Shopify loyalty app that mints verified lucky-draw tickets from qualifying orders. PakRaffle supplies the prize, runs the audited live draw and delivers prizes to winners.",
            offers: {
              "@type": "Offer",
              price: MERCHANT_ENTRY_FEE_PKR,
              priceCurrency: "PKR",
              description: "Pay-per-ticket billing — charged only for fulfilled, non-cancelled orders.",
              availability: "https://schema.org/InStock",
              areaServed: "PK",
            },
            provider: { "@id": "https://pakraffle.com/#organization" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Merchant Connect", item: "https://pakraffle.com/merchants" },
            ],
          },
        ]}
      />
      <Suspense fallback={<div className="min-h-screen bg-slate-50" aria-label="Loading" />}>
        <MerchantsLanding entryFee={MERCHANT_ENTRY_FEE_PKR} />
      </Suspense>
    </>
  )
}
