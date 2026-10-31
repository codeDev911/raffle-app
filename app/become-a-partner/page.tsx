import type { Metadata } from "next"
import { JsonLd } from "@/components/marketing/kit"
import PartnerPage from "./BecomeACustomerPartnerClient"

export const metadata: Metadata = {
  title: "Become a Partner — Earn with PakRaffle's Lucky Draw Network | Pakistan",
  description:
    "Join PakRaffle as a brand, influencer or referral partner. Promote verified live-streamed lucky draws, earn commissions on ticket sales, and grow your audience with Pakistan's most transparent raffle platform. Apply in minutes.",
  keywords: [
    "PakRaffle partner program",
    "raffle affiliate Pakistan",
    "lucky draw influencer program",
    "earn commission raffle",
    "brand partnership PakRaffle",
    "referral program Pakistan",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/become-a-partner",
  },
  openGraph: {
    title: "Become a Partner | PakRaffle Pakistan",
    description:
      "Partner with Pakistan's verified lucky draw platform — commissions on ticket sales, co-branded draws, and a growing prize-obsessed audience.",
    url: "https://pakraffle.com/become-a-partner",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Become a PakRaffle Partner",
    description: "Brands, creators and referrers — earn with Pakistan's most transparent lucky draws.",
  },
}

export default function BecomeAPartnerSeoPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Become a Partner — PakRaffle",
            url: "https://pakraffle.com/become-a-partner",
            inLanguage: "en-PK",
            isPartOf: { "@type": "WebSite", name: "PakRaffle", url: "https://pakraffle.com" },
            about: { "@id": "https://pakraffle.com/#organization" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Become a Partner", item: "https://pakraffle.com/become-a-partner" },
            ],
          },
        ]}
      />
      <PartnerPage />
    </>
  )
}
