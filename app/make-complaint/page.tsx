import type { Metadata } from "next"
import { Suspense } from "react"
import { JsonLd } from "@/components/marketing/kit"
import MakeComplaintClient from "./MakeComplaintClient"

export const metadata: Metadata = {
  title: "Report a Seller — File a Complaint | PakRaffle",
  description:
    "Report a PakRaffle Merchant Connect seller: prize not delivered, draw not honoured, misleading campaign or payment issues. Tell us what happened and our trust & safety team reviews every complaint.",
  keywords: [
    "report seller pakistan",
    "prize not delivered",
    "lucky draw complaint",
    "report raffle scam",
    "PakRaffle complaint form",
    "fake giveaway report",
  ],
  // A utility form with nothing to index — kept out of search results on purpose.
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://pakraffle.com/make-complaint",
  },
  openGraph: {
    title: "Report a Seller | PakRaffle",
    description:
      "Confidential complaint form for Merchant Connect sellers — prize, draw and payment conduct reviewed by PakRaffle trust & safety.",
    url: "https://pakraffle.com/make-complaint",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary",
    title: "Report a Seller | PakRaffle",
    description: "Something wrong with a Merchant Connect store? File a confidential complaint.",
  },
}

export default function MakeComplaintPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Report a Seller",
            url: "https://pakraffle.com/make-complaint",
            description:
              "Confidential complaint form for reporting a Merchant Connect seller to PakRaffle trust & safety.",
            isPartOf: { "@type": "WebSite", name: "PakRaffle", url: "https://pakraffle.com" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Ticket Lookup", item: "https://pakraffle.com/lookup/store-ticket" },
              { "@type": "ListItem", position: 3, name: "Report a Seller", item: "https://pakraffle.com/make-complaint" },
            ],
          },
        ]}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#f8f9f6]" />}>
        <MakeComplaintClient />
      </Suspense>
    </>
  )
}
